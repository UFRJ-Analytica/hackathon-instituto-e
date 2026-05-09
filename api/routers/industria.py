from fastapi import APIRouter

router = APIRouter()

_SETORES_INDUSTRIAIS = [
    {
        "setor": "Siderurgia",
        "emissoes_mt_co2e": 72.4,
        "intensidade_t_co2_por_t_produto": 1.87,
        "meta_reducao_2030_pct": 20,
        "status_transicao": "Em andamento",
        "principais_alavancas": ["Hidrogênio verde", "Sucata reciclada", "Forno elétrico"],
    },
    {
        "setor": "Cimento",
        "emissoes_mt_co2e": 43.1,
        "intensidade_t_co2_por_t_produto": 0.62,
        "meta_reducao_2030_pct": 15,
        "status_transicao": "Incipiente",
        "principais_alavancas": ["Clínquer alternativo", "CCS", "Eficiência energética"],
    },
    {
        "setor": "Papel e Celulose",
        "emissoes_mt_co2e": 18.3,
        "intensidade_t_co2_por_t_produto": 0.31,
        "meta_reducao_2030_pct": 35,
        "status_transicao": "Avançado",
        "principais_alavancas": ["Biomassa renovável", "Cogeração", "Florestas plantadas"],
    },
    {
        "setor": "Química",
        "emissoes_mt_co2e": 27.8,
        "intensidade_t_co2_por_t_produto": 0.94,
        "meta_reducao_2030_pct": 18,
        "status_transicao": "Em andamento",
        "principais_alavancas": ["Matérias-primas verdes", "Eficiência processos", "Eletrificação"],
    },
    {
        "setor": "Alumínio",
        "emissoes_mt_co2e": 12.6,
        "intensidade_t_co2_por_t_produto": 4.10,
        "meta_reducao_2030_pct": 25,
        "status_transicao": "Em andamento",
        "principais_alavancas": ["Energia renovável", "Reciclagem", "Tecnologia inerte"],
    },
]

_KPIS_DESCARBONIZACAO = {
    "emissoes_industria_total_mt_co2e": 174.2,
    "reducao_vs_2015_pct": 8.3,
    "investimento_limpo_bi_brl": 34.7,
    "empresas_com_meta_net_zero": 127,
    "empregos_economia_verde_mil": 892,
}


@router.get("/setores")
def setores_industriais():
    """Tabela de setores industriais com emissões e status de transição energética."""
    return _SETORES_INDUSTRIAIS


@router.get("/kpis")
def kpis_descarbonizacao():
    """KPIs consolidados de descarbonização da indústria brasileira."""
    return _KPIS_DESCARBONIZACAO
