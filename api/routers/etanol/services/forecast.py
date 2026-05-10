"""Serviços de previsão para as séries históricas de etanol.

Este módulo concentra a preparação das séries temporais e a execução dos
modelos preditivos expostos pela API.
"""

from __future__ import annotations

from collections import defaultdict
from functools import lru_cache
from typing import Literal

import numpy as np
import pandas as pd
from fastapi import HTTPException
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing

from .base import format_period_label, future_periods, parse_number, sorted_periods, sum_capacity
from .loaders import load_capacity_all_rows, load_feedstock_all_rows, load_production_all_rows

TargetType = Literal[
    "production_total",
    "production_hydrated",
    "production_anhydrous",
    "capacity_total",
    "capacity_hydrated",
    "capacity_anhydrous",
    "feedstock_total",
]
ScopeType = Literal["brasil", "regiao", "estado"]
TrendType = Literal["add", "mul", "none"]
SeasonalType = Literal["add", "mul", "none"]


@lru_cache(maxsize=1)
def get_etanol_previsao_opcoes() -> dict:
    """Lista opções disponíveis para a tela de previsão.

    Returns:
        dict: catálogo com modelos, séries alvo, regiões e estados aceitos
        pelos endpoints de previsão.
    """

    production_rows = load_production_all_rows()
    capacity_rows = load_capacity_all_rows()
    feedstock_rows = load_feedstock_all_rows()

    states = sorted(
        {
            *(row["Estado"] for row in production_rows),
            *(row["Estado"] for row in capacity_rows),
            *(row["Estado"] for row in feedstock_rows),
        }
    )
    regions = sorted(
        {
            *(row["Região"] for row in production_rows),
            *(row["Região"] for row in capacity_rows),
            *(row["Região"] for row in feedstock_rows),
        }
    )

    return {
        "models": [
            {
                "id": "media-movel",
                "label": "Média móvel",
                "parameters": ["window", "horizon"],
            },
            {
                "id": "regressao-linear",
                "label": "Regressão linear",
                "parameters": ["horizon"],
            },
            {
                "id": "sazonal-ingenua",
                "label": "Sazonal ingênuo",
                "parameters": ["season_length", "horizon"],
            },
            {
                "id": "holt-winters",
                "label": "Holt-Winters",
                "parameters": ["season_length", "trend", "seasonal", "horizon"],
            },
            {
                "id": "prophet",
                "label": "Prophet",
                "parameters": ["horizon"],
            },
        ],
        "targets": [
            {"id": "production_total", "label": "Produção total", "unit": "m³"},
            {"id": "production_hydrated", "label": "Produção hidratado", "unit": "m³"},
            {"id": "production_anhydrous", "label": "Produção anidro", "unit": "m³"},
            {"id": "capacity_total", "label": "Capacidade total", "unit": "m³/dia"},
            {"id": "capacity_hydrated", "label": "Capacidade hidratado", "unit": "m³/dia"},
            {"id": "capacity_anhydrous", "label": "Capacidade anidro", "unit": "m³/dia"},
            {"id": "feedstock_total", "label": "Matéria-prima total", "unit": "t"},
        ],
        "regions": regions,
        "states": states,
    }


def _filter_scope(
    rows: list[dict[str, str]], scope_type: ScopeType, scope_value: str | None
) -> list[dict[str, str]]:
    """Filtra linhas de acordo com o recorte geográfico pedido.

    Args:
        rows: linhas brutas do dataset.
        scope_type: tipo do recorte (`brasil`, `regiao` ou `estado`).
        scope_value: valor do recorte quando aplicável.

    Returns:
        list[dict[str, str]]: subconjunto filtrado das linhas originais.
    """

    if scope_type == "brasil":
        return rows
    if not scope_value:
        return rows

    key = "Região" if scope_type == "regiao" else "Estado"
    return [row for row in rows if row[key] == scope_value]


def _series_meta(target: TargetType) -> dict[str, str]:
    """Retorna rótulo e unidade da série selecionada.

    Args:
        target: identificador interno da série histórica.

    Returns:
        dict[str, str]: metadados usados pela API e pela UI.
    """

    meta = {
        "production_total": {"label": "Produção total", "unit": "m³"},
        "production_hydrated": {"label": "Produção hidratado", "unit": "m³"},
        "production_anhydrous": {"label": "Produção anidro", "unit": "m³"},
        "capacity_total": {"label": "Capacidade total", "unit": "m³/dia"},
        "capacity_hydrated": {"label": "Capacidade hidratado", "unit": "m³/dia"},
        "capacity_anhydrous": {"label": "Capacidade anidro", "unit": "m³/dia"},
        "feedstock_total": {"label": "Matéria-prima total", "unit": "t"},
    }
    return meta[target]


def _build_prediction_series(
    target: TargetType, scope_type: ScopeType, scope_value: str | None
) -> dict:
    """Monta a série temporal agregada para um alvo e recorte.

    Args:
        target: variável que será prevista.
        scope_type: nível geográfico do recorte.
        scope_value: estado ou região, quando necessário.

    Returns:
        dict: contém metadados da série, lista de pontos para a API e um
        `pandas.Series` pronto para modelagem.

    Raises:
        HTTPException: quando o recorte solicitado não possui observações.
    """

    if target.startswith("production_"):
        rows = _filter_scope(load_production_all_rows(), scope_type, scope_value)
        by_period: dict[str, float] = defaultdict(float)
        for row in rows:
            if target == "production_total":
                value = parse_number(row["Produção Etanol Hidratado(m³)"]) + parse_number(
                    row["Produção Etanol Anidro (m³)"]
                )
            elif target == "production_hydrated":
                value = parse_number(row["Produção Etanol Hidratado(m³)"])
            else:
                value = parse_number(row["Produção Etanol Anidro (m³)"])
            by_period[row["Mês/Ano"]] += value
    elif target.startswith("capacity_"):
        rows = _filter_scope(load_capacity_all_rows(), scope_type, scope_value)
        by_period = defaultdict(float)
        for row in rows:
            anhydrous, hydrated, total = sum_capacity(row)
            if target == "capacity_total":
                value = total
            elif target == "capacity_hydrated":
                value = hydrated
            else:
                value = anhydrous
            by_period[row["Mês/Ano"]] += value
    else:
        rows = _filter_scope(load_feedstock_all_rows(), scope_type, scope_value)
        by_period = defaultdict(float)
        for row in rows:
            by_period[row["Mês/Ano"]] += parse_number(row["Quantidade Processada (t)"])

    periods = sorted_periods(set(by_period))
    points = [
        {
            "period": period,
            "label": format_period_label(period),
            "value": round(by_period[period], 2),
        }
        for period in periods
    ]

    if not points:
        raise HTTPException(
            status_code=404,
            detail="Nao ha dados para o recorte selecionado.",
        )

    frame = pd.DataFrame(points)
    frame["date"] = pd.to_datetime(frame["period"], format="%m/%Y")
    frame = frame.sort_values("date").reset_index(drop=True)
    series = pd.Series(
        frame["value"].to_numpy(dtype=float),
        index=pd.DatetimeIndex(frame["date"]),
        name=target,
    )

    return {
        "meta": _series_meta(target),
        "points": frame[["period", "label", "value"]].to_dict(orient="records"),
        "series": series,
    }


def _forecast_moving_average(values: pd.Series, horizon: int, window: int) -> list[float]:
    """Gera previsão por média móvel recursiva.

    Args:
        values: série histórica ordenada no tempo.
        horizon: quantidade de períodos a prever.
        window: tamanho da janela móvel.

    Returns:
        list[float]: valores previstos para os próximos períodos.
    """

    history = values.copy()
    forecast: list[float] = []
    effective_window = max(1, min(window, len(history)))

    for _ in range(horizon):
        predicted = float(history.tail(effective_window).mean())
        forecast.append(round(predicted, 2))
        history = pd.concat([history, pd.Series([predicted])], ignore_index=True)

    return forecast


def _forecast_linear_regression(values: pd.Series, horizon: int) -> list[float]:
    """Projeta a série com regressão linear sobre o índice temporal.

    Args:
        values: série histórica ordenada no tempo.
        horizon: quantidade de períodos futuros.

    Returns:
        list[float]: projeção linear para os próximos períodos.
    """

    y = values.to_numpy(dtype=float)
    x = np.arange(len(y), dtype=float).reshape(-1, 1)
    future_x = np.arange(len(y), len(y) + horizon, dtype=float).reshape(-1, 1)

    model = LinearRegression()
    model.fit(x, y)
    forecast = model.predict(future_x)
    return [round(float(value), 2) for value in forecast]


def _forecast_seasonal_naive(
    values: pd.Series, horizon: int, season_length: int
) -> list[float]:
    """Repete o último ciclo observado para prever os períodos futuros.

    Args:
        values: série histórica ordenada no tempo.
        horizon: quantidade de períodos previstos.
        season_length: comprimento do ciclo sazonal.

    Returns:
        list[float]: valores previstos por repetição sazonal.
    """

    cycle = max(1, min(season_length, len(values)))
    last_cycle = values.tail(cycle).to_numpy(dtype=float)
    return [round(float(last_cycle[index % cycle]), 2) for index in range(horizon)]


def _forecast_holt_winters(
    values: pd.Series,
    horizon: int,
    season_length: int,
    trend: TrendType,
    seasonal: SeasonalType,
) -> list[float]:
    """Executa o modelo Holt-Winters sobre a série temporal.

    Args:
        values: série histórica ordenada no tempo.
        horizon: quantidade de períodos previstos.
        season_length: tamanho da sazonalidade mensal.
        trend: tipo de tendência (`add`, `mul` ou `none`).
        seasonal: tipo de sazonalidade (`add`, `mul` ou `none`).

    Returns:
        list[float]: valores previstos pelo modelo ajustado.

    Raises:
        HTTPException: quando a série é curta demais para o ajuste solicitado.
    """

    trend_component = None if trend == "none" else trend
    seasonal_component = None if seasonal == "none" else seasonal

    if seasonal_component is not None and len(values) < max(4, season_length * 2):
        raise HTTPException(
            status_code=400,
            detail="A série precisa de pelo menos dois ciclos sazonais para Holt-Winters.",
        )

    model = ExponentialSmoothing(
        values.astype(float),
        trend=trend_component,
        seasonal=seasonal_component,
        seasonal_periods=season_length if seasonal_component is not None else None,
        initialization_method="estimated",
    ).fit(optimized=True)

    forecast = model.forecast(horizon)
    return [round(float(value), 2) for value in forecast.tolist()]


def _prediction_response(
    model_id: str,
    model_label: str,
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
    parameters: dict[str, str | int | float],
    forecast_values: list[float],
) -> dict:
    """Padroniza a resposta JSON de qualquer modelo de previsão.

    Args:
        model_id: identificador interno do modelo.
        model_label: nome amigável exibido no front.
        target: série prevista.
        scope_type: nível geográfico do recorte.
        scope_value: valor do recorte geográfico.
        horizon: quantidade de períodos futuros.
        parameters: parâmetros efetivamente usados no ajuste.
        forecast_values: lista numérica já prevista pelo modelo.

    Returns:
        dict: payload com metadados, histórico e previsão futura.
    """

    series = _build_prediction_series(target, scope_type, scope_value)
    history = series["points"]
    last_period = history[-1]["period"]
    predicted_periods = future_periods(last_period, horizon)

    return {
        "model": {"id": model_id, "label": model_label},
        "target": {
            "id": target,
            "label": series["meta"]["label"],
            "unit": series["meta"]["unit"],
        },
        "scope": {
            "type": scope_type,
            "value": scope_value or "Brasil",
        },
        "parameters": parameters,
        "history": history,
        "forecast": [
            {
                "period": period,
                "label": format_period_label(period),
                "value": value,
            }
            for period, value in zip(predicted_periods, forecast_values)
        ],
    }


def get_etanol_previsao_media_movel(
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
    window: int,
) -> dict:
    """Executa previsão por média móvel.

    Args:
        target: série alvo.
        scope_type: recorte geográfico.
        scope_value: valor do recorte.
        horizon: meses a projetar.
        window: tamanho da janela móvel.

    Returns:
        dict: resposta padronizada da API com histórico e previsão.
    """

    series_data = _build_prediction_series(target, scope_type, scope_value)
    forecast_values = _forecast_moving_average(series_data["series"], horizon, window)

    return _prediction_response(
        "media-movel",
        "Média móvel",
        target,
        scope_type,
        scope_value,
        horizon,
        {"window": window, "horizon": horizon},
        forecast_values,
    )


def get_etanol_previsao_regressao_linear(
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
) -> dict:
    """Executa previsão por regressão linear.

    Args:
        target: série alvo.
        scope_type: recorte geográfico.
        scope_value: valor do recorte.
        horizon: meses a projetar.

    Returns:
        dict: resposta padronizada da API com histórico e previsão.
    """

    series_data = _build_prediction_series(target, scope_type, scope_value)
    forecast_values = _forecast_linear_regression(series_data["series"], horizon)

    return _prediction_response(
        "regressao-linear",
        "Regressão linear",
        target,
        scope_type,
        scope_value,
        horizon,
        {"horizon": horizon},
        forecast_values,
    )


def get_etanol_previsao_sazonal_ingenua(
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
    season_length: int,
) -> dict:
    """Executa previsão por repetição do último ciclo sazonal observado.

    Args:
        target: série alvo.
        scope_type: recorte geográfico.
        scope_value: valor do recorte.
        horizon: meses a projetar.
        season_length: tamanho do ciclo sazonal.

    Returns:
        dict: resposta padronizada da API com histórico e previsão.
    """

    series_data = _build_prediction_series(target, scope_type, scope_value)
    forecast_values = _forecast_seasonal_naive(
        series_data["series"], horizon, season_length
    )

    return _prediction_response(
        "sazonal-ingenua",
        "Sazonal ingênuo",
        target,
        scope_type,
        scope_value,
        horizon,
        {"season_length": season_length, "horizon": horizon},
        forecast_values,
    )


def get_etanol_previsao_holt_winters(
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
    season_length: int,
    trend: TrendType,
    seasonal: SeasonalType,
) -> dict:
    """Executa previsão por Holt-Winters.

    Args:
        target: série alvo.
        scope_type: recorte geográfico.
        scope_value: valor do recorte.
        horizon: meses a projetar.
        season_length: tamanho do ciclo sazonal.
        trend: componente de tendência do modelo.
        seasonal: componente sazonal do modelo.

    Returns:
        dict: resposta padronizada da API com histórico e previsão.
    """

    series_data = _build_prediction_series(target, scope_type, scope_value)
    forecast_values = _forecast_holt_winters(
        series_data["series"],
        horizon,
        season_length,
        trend,
        seasonal,
    )

    return _prediction_response(
        "holt-winters",
        "Holt-Winters",
        target,
        scope_type,
        scope_value,
        horizon,
        {
            "season_length": season_length,
            "trend": trend,
            "seasonal": seasonal,
            "horizon": horizon,
        },
        forecast_values,
    )


def _forecast_prophet(values: pd.Series, horizon: int) -> list[float]:
    """Executa previsão com o modelo Prophet (Meta).

    Prophet decompõe a série em tendência, sazonalidade e feriados e ajusta
    cada componente separadamente antes de recombinar. É robusto a dados
    faltantes e mudanças de tendência.

    Args:
        values: série histórica com DatetimeIndex mensal.
        horizon: quantidade de períodos futuros a prever.

    Returns:
        list[float]: valores previstos (coluna `yhat` do Prophet).
    """
    import logging

    from prophet import Prophet

    logging.getLogger("prophet").setLevel(logging.WARNING)
    logging.getLogger("cmdstanpy").setLevel(logging.WARNING)

    frame = pd.DataFrame({"ds": values.index, "y": values.to_numpy(dtype=float)})

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
    )
    model.fit(frame)

    future = model.make_future_dataframe(periods=horizon, freq="MS")
    forecast = model.predict(future)

    predicted = forecast.tail(horizon)["yhat"].tolist()
    return [round(float(v), 2) for v in predicted]


def get_etanol_previsao_prophet(
    target: TargetType,
    scope_type: ScopeType,
    scope_value: str | None,
    horizon: int,
) -> dict:
    """Executa previsão com Prophet (Meta/Facebook).

    Args:
        target: série alvo.
        scope_type: recorte geográfico.
        scope_value: valor do recorte.
        horizon: meses a projetar.

    Returns:
        dict: resposta padronizada da API com histórico e previsão.
    """
    series_data = _build_prediction_series(target, scope_type, scope_value)
    forecast_values = _forecast_prophet(series_data["series"], horizon)

    return _prediction_response(
        "prophet",
        "Prophet",
        target,
        scope_type,
        scope_value,
        horizon,
        {"horizon": horizon},
        forecast_values,
    )
