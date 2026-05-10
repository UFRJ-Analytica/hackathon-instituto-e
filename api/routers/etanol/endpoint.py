"""Endpoints HTTP do módulo de etanol."""

from fastapi import APIRouter, Query

from .service import (
    SeasonalType,
    TrendType,
    get_etanol_card_estados,
    get_etanol_card_mapa,
    get_etanol_card_materias_primas,
    get_etanol_card_regioes,
    get_etanol_card_resumo,
    get_etanol_card_usinas,
    get_etanol_temporal_capacidade,
    get_etanol_temporal_estados,
    get_etanol_temporal_materias_primas,
    get_etanol_temporal_producao,
    get_etanol_temporal_resumo,
    get_etanol_previsao_holt_winters,
    get_etanol_previsao_media_movel,
    get_etanol_previsao_opcoes,
    get_etanol_previsao_prophet,
    get_etanol_previsao_regressao_linear,
    get_etanol_previsao_sazonal_ingenua,
)

router = APIRouter(tags=["etanol"])


@router.get("/etanol/card-resumo")
def etanol_card_resumo():
    """Retorna o resumo executivo do dashboard de etanol."""
    return get_etanol_card_resumo()


@router.get("/etanol/card-estados")
def etanol_card_estados():
    """Retorna o ranking de estados por capacidade."""
    return get_etanol_card_estados()


@router.get("/etanol/card-mapa")
def etanol_card_mapa():
    """Retorna os dados agregados usados pelo mapa por estado."""
    return get_etanol_card_mapa()


@router.get("/etanol/card-regioes")
def etanol_card_regioes():
    """Retorna os agregados regionais do dashboard."""
    return get_etanol_card_regioes()


@router.get("/etanol/card-materias-primas")
def etanol_card_materias_primas():
    """Retorna o ranking atual de matérias-primas processadas."""
    return get_etanol_card_materias_primas()


@router.get("/etanol/card-usinas")
def etanol_card_usinas():
    """Retorna as usinas com maior capacidade no período mais recente."""
    return get_etanol_card_usinas()


@router.get("/etanol/temporal/resumo")
def etanol_temporal_resumo():
    """Retorna cobertura temporal e último ponto das séries históricas."""
    return get_etanol_temporal_resumo()


@router.get("/etanol/temporal/producao")
def etanol_temporal_producao():
    """Retorna a série histórica de produção agregada."""
    return get_etanol_temporal_producao()


@router.get("/etanol/temporal/capacidade")
def etanol_temporal_capacidade():
    """Retorna a série histórica de capacidade instalada agregada."""
    return get_etanol_temporal_capacidade()


@router.get("/etanol/temporal/materias-primas")
def etanol_temporal_materias_primas():
    """Retorna a evolução temporal e a composição recente das matérias-primas."""
    return get_etanol_temporal_materias_primas()


@router.get("/etanol/temporal/estados")
def etanol_temporal_estados():
    """Retorna os estados líderes no último período de produção."""
    return get_etanol_temporal_estados()


@router.get("/etanol/previsao/opcoes")
def etanol_previsao_opcoes():
    """Retorna catálogo de modelos, alvos e recortes para previsão."""
    return get_etanol_previsao_opcoes()


@router.get("/etanol/previsao/media-movel")
def etanol_previsao_media_movel(
    target: str = Query("production_total"),
    scope_type: str = Query("brasil"),
    scope_value: str | None = Query(None),
    horizon: int = Query(6, ge=1, le=24),
    window: int = Query(6, ge=2, le=24),
):
    """Executa previsão usando média móvel.

    Query params:
        target: série a ser prevista.
        scope_type: nível geográfico (`brasil`, `regiao`, `estado`).
        scope_value: valor do recorte quando aplicável.
        horizon: quantidade de períodos futuros.
        window: tamanho da janela móvel.
    """

    return get_etanol_previsao_media_movel(
        target=target,  # type: ignore[arg-type]
        scope_type=scope_type,  # type: ignore[arg-type]
        scope_value=scope_value,
        horizon=horizon,
        window=window,
    )


@router.get("/etanol/previsao/regressao-linear")
def etanol_previsao_regressao_linear(
    target: str = Query("production_total"),
    scope_type: str = Query("brasil"),
    scope_value: str | None = Query(None),
    horizon: int = Query(6, ge=1, le=24),
):
    """Executa previsão usando regressão linear simples no eixo temporal."""
    return get_etanol_previsao_regressao_linear(
        target=target,  # type: ignore[arg-type]
        scope_type=scope_type,  # type: ignore[arg-type]
        scope_value=scope_value,
        horizon=horizon,
    )


@router.get("/etanol/previsao/sazonal-ingenua")
def etanol_previsao_sazonal_ingenua(
    target: str = Query("production_total"),
    scope_type: str = Query("brasil"),
    scope_value: str | None = Query(None),
    horizon: int = Query(6, ge=1, le=24),
    season_length: int = Query(12, ge=2, le=24),
):
    """Executa previsão repetindo o último ciclo sazonal observado."""
    return get_etanol_previsao_sazonal_ingenua(
        target=target,  # type: ignore[arg-type]
        scope_type=scope_type,  # type: ignore[arg-type]
        scope_value=scope_value,
        horizon=horizon,
        season_length=season_length,
    )


@router.get("/etanol/previsao/prophet")
def etanol_previsao_prophet(
    target: str = Query("production_total"),
    scope_type: str = Query("brasil"),
    scope_value: str | None = Query(None),
    horizon: int = Query(6, ge=1, le=24),
):
    """Executa previsão com Prophet (Meta/Facebook).

    Query params:
        target: série a ser prevista.
        scope_type: nível geográfico (`brasil`, `regiao`, `estado`).
        scope_value: valor do recorte quando aplicável.
        horizon: quantidade de períodos futuros.
    """
    return get_etanol_previsao_prophet(
        target=target,  # type: ignore[arg-type]
        scope_type=scope_type,  # type: ignore[arg-type]
        scope_value=scope_value,
        horizon=horizon,
    )


@router.get("/etanol/previsao/holt-winters")
def etanol_previsao_holt_winters(
    target: str = Query("production_total"),
    scope_type: str = Query("brasil"),
    scope_value: str | None = Query(None),
    horizon: int = Query(6, ge=1, le=24),
    season_length: int = Query(12, ge=2, le=24),
    trend: TrendType = Query("add"),
    seasonal: SeasonalType = Query("add"),
):
    """Executa previsão usando Holt-Winters com tendência e sazonalidade.

    Query params:
        target: série a ser prevista.
        scope_type: nível geográfico (`brasil`, `regiao`, `estado`).
        scope_value: valor do recorte quando aplicável.
        horizon: quantidade de períodos futuros.
        season_length: tamanho da sazonalidade mensal.
        trend: componente de tendência (`add`, `mul`, `none`).
        seasonal: componente sazonal (`add`, `mul`, `none`).
    """

    return get_etanol_previsao_holt_winters(
        target=target,  # type: ignore[arg-type]
        scope_type=scope_type,  # type: ignore[arg-type]
        scope_value=scope_value,
        horizon=horizon,
        season_length=season_length,
        trend=trend,
        seasonal=seasonal,
    )
