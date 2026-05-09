from fastapi import APIRouter

router = APIRouter()

_PRODUCAO_ETANOL = [
    {"ano": 2019, "producao_bi_litros": 33.3, "exportacao_bi_litros": 3.1, "usinas_ativas": 348},
    {"ano": 2020, "producao_bi_litros": 29.8, "exportacao_bi_litros": 1.8, "usinas_ativas": 340},
    {"ano": 2021, "producao_bi_litros": 32.1, "exportacao_bi_litros": 2.5, "usinas_ativas": 345},
    {"ano": 2022, "producao_bi_litros": 34.7, "exportacao_bi_litros": 4.2, "usinas_ativas": 352},
    {"ano": 2023, "producao_bi_litros": 36.9, "exportacao_bi_litros": 5.1, "usinas_ativas": 361},
]

_PRODUCAO_BIODIESEL = [
    {"ano": 2019, "producao_bi_litros": 5.9, "blend_pct": 11, "materia_prima_principal": "Soja"},
    {"ano": 2020, "producao_bi_litros": 6.0, "blend_pct": 12, "materia_prima_principal": "Soja"},
    {"ano": 2021, "producao_bi_litros": 5.8, "blend_pct": 13, "materia_prima_principal": "Soja"},
    {"ano": 2022, "producao_bi_litros": 6.4, "blend_pct": 14, "materia_prima_principal": "Soja"},
    {"ano": 2023, "producao_bi_litros": 7.1, "blend_pct": 14, "materia_prima_principal": "Soja"},
]

_BIOMETANO_PLANTAS = [
    {"estado": "SP", "plantas_ativas": 14, "capacidade_mm3_dia": 0.48, "origem_principal": "Aterro sanitário"},
    {"estado": "MG", "plantas_ativas": 8, "capacidade_mm3_dia": 0.22, "origem_principal": "Suinocultura"},
    {"estado": "RS", "plantas_ativas": 6, "capacidade_mm3_dia": 0.18, "origem_principal": "Suinocultura"},
    {"estado": "PR", "plantas_ativas": 5, "capacidade_mm3_dia": 0.14, "origem_principal": "Frigorífico"},
    {"estado": "GO", "plantas_ativas": 4, "capacidade_mm3_dia": 0.11, "origem_principal": "Vinhaça"},
    {"estado": "Outros", "plantas_ativas": 9, "capacidade_mm3_dia": 0.19, "origem_principal": "Variada"},
]


@router.get("/etanol")
def producao_etanol():
    """Série histórica de produção e exportação de etanol no Brasil."""
    return _PRODUCAO_ETANOL


@router.get("/biodiesel")
def producao_biodiesel():
    """Série histórica de produção de biodiesel e percentual de mistura (blend)."""
    return _PRODUCAO_BIODIESEL


@router.get("/biometano")
def plantas_biometano():
    """Distribuição de plantas de biometano por estado (dados ANP)."""
    return _BIOMETANO_PLANTAS
