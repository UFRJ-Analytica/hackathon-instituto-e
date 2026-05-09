# API – Descarbonização Industrial

API de dados de exemplo sobre a indústria de descarbonização brasileira, construída com [FastAPI](https://fastapi.tiangolo.com/).

## Pré-requisitos

- Python 3.11+

## Instalação

```bash
# clone o repo e entre na pasta
cd api

# crie e ative o ambiente virtual
python -m venv .venv
source .venv/bin/activate      # Linux / macOS
# .venv\Scripts\activate       # Windows

# instale as dependências
pip install -r requirements.txt
```

## Rodando localmente

```bash
uvicorn main:app --reload
```

A API sobe em `http://localhost:8000`.

## Documentação interativa

| Interface | URL |
|-----------|-----|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

## Endpoints

### Emissões de GEE

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/emissoes/por-setor` | Emissões por setor econômico (Mt CO₂e). Aceita `?ano=2022` |
| GET | `/emissoes/serie-anual` | Série histórica de emissões totais do Brasil |

### Matriz Energética

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/energia/matriz-eletrica` | Capacidade instalada por fonte geradora (GW) |
| GET | `/energia/investimentos-renovaveis` | Investimentos anuais em renováveis (bi USD). Aceita `?ano=2023` |

### Indústria

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/industria/setores` | Setores industriais com emissões e status de transição |
| GET | `/industria/kpis` | KPIs consolidados para cards do dashboard |

### Biocombustíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/biocombustiveis/etanol` | Produção e exportação de etanol (série anual) |
| GET | `/biocombustiveis/biodiesel` | Produção de biodiesel e percentual de blend |
| GET | `/biocombustiveis/biometano` | Plantas de biometano ativas por estado |

## Estrutura

```
api/
├── main.py                  # app, CORS e registro dos routers
├── routers/
│   ├── emissoes.py
│   ├── energia.py
│   ├── industria.py
│   └── biocombustiveis.py
├── requirements.txt
└── README.md
```
