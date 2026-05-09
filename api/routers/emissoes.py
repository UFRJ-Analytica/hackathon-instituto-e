from fastapi import APIRouter
from typing import Literal

router = APIRouter()

_EMISSOES_POR_SETOR = [
    {"setor": "Energia", "ano": 2020, "emissoes_mt_co2e": 418.3, "variacao_pct": -3.1},
    {"setor": "Agropecuária", "ano": 2020, "emissoes_mt_co2e": 574.2, "variacao_pct": 1.4},
    {"setor": "Mudança de Uso da Terra", "ano": 2020, "emissoes_mt_co2e": 924.0, "variacao_pct": 9.5},
    {"setor": "Processos Industriais", "ano": 2020, "emissoes_mt_co2e": 108.7, "variacao_pct": -6.2},
    {"setor": "Resíduos", "ano": 2020, "emissoes_mt_co2e": 92.1, "variacao_pct": 0.8},
    {"setor": "Energia", "ano": 2021, "emissoes_mt_co2e": 431.0, "variacao_pct": 3.0},
    {"setor": "Agropecuária", "ano": 2021, "emissoes_mt_co2e": 589.4, "variacao_pct": 2.6},
    {"setor": "Mudança de Uso da Terra", "ano": 2021, "emissoes_mt_co2e": 969.0, "variacao_pct": 4.9},
    {"setor": "Processos Industriais", "ano": 2021, "emissoes_mt_co2e": 119.3, "variacao_pct": 9.7},
    {"setor": "Resíduos", "ano": 2021, "emissoes_mt_co2e": 94.8, "variacao_pct": 2.9},
    {"setor": "Energia", "ano": 2022, "emissoes_mt_co2e": 426.1, "variacao_pct": -1.1},
    {"setor": "Agropecuária", "ano": 2022, "emissoes_mt_co2e": 601.0, "variacao_pct": 2.0},
    {"setor": "Mudança de Uso da Terra", "ano": 2022, "emissoes_mt_co2e": 932.0, "variacao_pct": -3.8},
    {"setor": "Processos Industriais", "ano": 2022, "emissoes_mt_co2e": 122.5, "variacao_pct": 2.7},
    {"setor": "Resíduos", "ano": 2022, "emissoes_mt_co2e": 97.2, "variacao_pct": 2.5},
]

_SERIE_ANUAL = [
    {"ano": 2015, "total_mt_co2e": 2375},
    {"ano": 2016, "total_mt_co2e": 2280},
    {"ano": 2017, "total_mt_co2e": 2264},
    {"ano": 2018, "total_mt_co2e": 2269},
    {"ano": 2019, "total_mt_co2e": 2350},
    {"ano": 2020, "total_mt_co2e": 2117},
    {"ano": 2021, "total_mt_co2e": 2204},
    {"ano": 2022, "total_mt_co2e": 2179},
]


@router.get("/por-setor")
def emissoes_por_setor(ano: int | None = None):
    """Emissões de GEE por setor econômico (Mt CO₂e)."""
    data = _EMISSOES_POR_SETOR
    if ano:
        data = [row for row in data if row["ano"] == ano]
    return data


@router.get("/serie-anual")
def emissoes_serie_anual():
    """Série histórica de emissões totais do Brasil (Mt CO₂e)."""
    return _SERIE_ANUAL
