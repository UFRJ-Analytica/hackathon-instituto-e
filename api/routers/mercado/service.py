"""Serviços de leitura e análise dos dados do mercado de descarbonização (CBIO)."""

from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import pandas as pd

DATASETS = Path(__file__).parent / "datasets"
CSV_PATH = DATASETS / "credito_descarbonizacao.csv"
MODEL_PATH = DATASETS / "prophet_best_model_cbio.pkl"


def _load_df() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH, parse_dates=["Data"])
    df = df.sort_values("Data").reset_index(drop=True)
    return df


def get_mercado_resumo() -> dict:
    df = _load_df()
    ultimo = df.iloc[-1]

    def preco_n_dias_atras(n: int) -> float | None:
        ref = df[df["Data"] <= ultimo["Data"] - pd.Timedelta(days=n)]
        if ref.empty:
            return None
        return float(ref.iloc[-1]["Preço Médio"])

    preco_atual = float(ultimo["Preço Médio"])
    emissor_atual = int(ultimo["Emissor"])

    def variacao(anterior: float | None) -> float | None:
        if anterior is None or anterior == 0:
            return None
        return round((preco_atual - anterior) / anterior * 100, 2)

    p1d = preco_n_dias_atras(1)
    p7d = preco_n_dias_atras(7)
    p30d = preco_n_dias_atras(30)
    p365d = preco_n_dias_atras(365)

    return {
        "preco_atual": preco_atual,
        "data_atualizacao": ultimo["Data"].strftime("%Y-%m-%d"),
        "variacao_1d": variacao(p1d),
        "variacao_7d": variacao(p7d),
        "variacao_30d": variacao(p30d),
        "variacao_365d": variacao(p365d),
        "emissor_atual": emissor_atual,
        "preco_minimo_historico": float(df["Preço Médio"].min()),
        "preco_maximo_historico": float(df["Preço Médio"].max()),
        "preco_medio_historico": round(float(df["Preço Médio"].mean()), 2),
        "total_registros": len(df),
    }


def get_serie_historica() -> list[dict]:
    df = _load_df()
    df = df.rename(columns={"Preço Médio": "preco", "Emissor": "emissor", "Data": "data"})
    df["data"] = df["data"].dt.strftime("%Y-%m-%d")
    return df.to_dict(orient="records")


def get_previsao(h: int = 180) -> list[dict]:
    df = _load_df()

    # Prepara o dataframe para o modelo Prophet (logístico)
    cap_value = float(df["Preço Médio"].max()) * 6
    prophet_df = pd.DataFrame({
        "ds": df["Data"],
        "y": df["Preço Médio"],
        "cap": cap_value,
        "floor": 15.0,
    })

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    future = model.make_future_dataframe(periods=h, freq="D")
    future["floor"] = 15.0
    future["cap"] = cap_value

    forecast = model.predict(future)
    forecast["yhat"] = np.maximum(0, forecast["yhat"])
    forecast["yhat_lower"] = np.maximum(0, forecast["yhat_lower"])
    forecast["yhat_upper"] = np.maximum(0, forecast["yhat_upper"])

    future_only = forecast.tail(h)[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
    future_only = future_only.rename(columns={
        "ds": "data",
        "yhat": "pred",
        "yhat_lower": "min",
        "yhat_upper": "max",
    })
    future_only["data"] = future_only["data"].dt.strftime("%Y-%m-%d")
    future_only["pred"] = future_only["pred"].round(2)
    future_only["min"] = future_only["min"].round(2)
    future_only["max"] = future_only["max"].round(2)

    return future_only.to_dict(orient="records")
