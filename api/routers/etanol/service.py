"""Fachada de serviços do domínio de etanol.

Este arquivo existe para manter a API de imports estável enquanto a
implementação interna fica organizada em módulos menores.
"""

from .services import (
    ScopeType,
    SeasonalType,
    TargetType,
    TrendType,
    get_etanol_card_estados,
    get_etanol_card_mapa,
    get_etanol_card_materias_primas,
    get_etanol_card_regioes,
    get_etanol_card_resumo,
    get_etanol_card_usinas,
    get_etanol_previsao_holt_winters,
    get_etanol_previsao_media_movel,
    get_etanol_previsao_opcoes,
    get_etanol_previsao_prophet,
    get_etanol_previsao_regressao_linear,
    get_etanol_previsao_sazonal_ingenua,
    get_etanol_temporal_capacidade,
    get_etanol_temporal_estados,
    get_etanol_temporal_materias_primas,
    get_etanol_temporal_producao,
    get_etanol_temporal_resumo,
)

__all__ = [
    "ScopeType",
    "SeasonalType",
    "TargetType",
    "TrendType",
    "get_etanol_card_estados",
    "get_etanol_card_mapa",
    "get_etanol_card_materias_primas",
    "get_etanol_card_regioes",
    "get_etanol_card_resumo",
    "get_etanol_card_usinas",
    "get_etanol_previsao_holt_winters",
    "get_etanol_previsao_media_movel",
    "get_etanol_previsao_opcoes",
    "get_etanol_previsao_prophet",
    "get_etanol_previsao_regressao_linear",
    "get_etanol_previsao_sazonal_ingenua",
    "get_etanol_temporal_capacidade",
    "get_etanol_temporal_estados",
    "get_etanol_temporal_materias_primas",
    "get_etanol_temporal_producao",
    "get_etanol_temporal_resumo",
]
