from fastapi import APIRouter

router = APIRouter()

_MATRIZ_ELETRICA = [
    {"fonte": "Hidráulica", "capacidade_gw": 109.4, "participacao_pct": 56.8, "tipo": "Renovável"},
    {"fonte": "Eólica", "capacidade_gw": 29.1, "participacao_pct": 15.1, "tipo": "Renovável"},
    {"fonte": "Solar", "capacidade_gw": 36.2, "participacao_pct": 18.8, "tipo": "Renovável"},
    {"fonte": "Biomassa", "capacidade_gw": 16.7, "participacao_pct": 8.7, "tipo": "Renovável"},
    {"fonte": "Gás Natural", "capacidade_gw": 10.3, "participacao_pct": 5.4, "tipo": "Fóssil"},
    {"fonte": "Petróleo e Diesel", "capacidade_gw": 3.8, "participacao_pct": 2.0, "tipo": "Fóssil"},
    {"fonte": "Carvão", "capacidade_gw": 3.0, "participacao_pct": 1.6, "tipo": "Fóssil"},
    {"fonte": "Nuclear", "capacidade_gw": 1.9, "participacao_pct": 1.0, "tipo": "Baixo Carbono"},
]

_INVESTIMENTOS_RENOVAVEIS = [
    {"ano": 2019, "fonte": "Solar", "investimento_bi_usd": 4.2},
    {"ano": 2019, "fonte": "Eólica", "investimento_bi_usd": 6.1},
    {"ano": 2020, "fonte": "Solar", "investimento_bi_usd": 5.8},
    {"ano": 2020, "fonte": "Eólica", "investimento_bi_usd": 5.4},
    {"ano": 2021, "fonte": "Solar", "investimento_bi_usd": 8.9},
    {"ano": 2021, "fonte": "Eólica", "investimento_bi_usd": 7.2},
    {"ano": 2022, "fonte": "Solar", "investimento_bi_usd": 12.3},
    {"ano": 2022, "fonte": "Eólica", "investimento_bi_usd": 8.7},
    {"ano": 2023, "fonte": "Solar", "investimento_bi_usd": 15.1},
    {"ano": 2023, "fonte": "Eólica", "investimento_bi_usd": 9.5},
]


@router.get("/matriz-eletrica")
def matriz_eletrica():
    """Composição da capacidade instalada de geração elétrica no Brasil (GW)."""
    return _MATRIZ_ELETRICA


@router.get("/investimentos-renovaveis")
def investimentos_renovaveis(ano: int | None = None):
    """Investimentos anuais em energia renovável no Brasil (bi USD)."""
    data = _INVESTIMENTOS_RENOVAVEIS
    if ano:
        data = [row for row in data if row["ano"] == ano]
    return data
