# API – Descarbonização Industrial

API de dados sobre o setor de etanol brasileiro, construída com [FastAPI](https://fastapi.tiangolo.com/).

## Pré-requisitos

- Python 3.11+

## Instalação

```bash
# entre na pasta
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

| Interface  | URL                            |
|------------|-------------------------------|
| Swagger UI | http://localhost:8000/docs    |
| ReDoc      | http://localhost:8000/redoc   |

---

## Endpoints

### Dashboard (snapshot do período mais recente)

| Método | Rota                            | Retorna                                                                 |
|--------|---------------------------------|-------------------------------------------------------------------------|
| GET    | `/etanol/card-resumo`           | KPIs gerais: número de usinas, capacidade total, produção total, etc.   |
| GET    | `/etanol/card-estados`          | Ranking dos 8 estados com maior capacidade instalada                    |
| GET    | `/etanol/card-mapa`             | Dados agregados por estado para o mapa de calor                         |
| GET    | `/etanol/card-regioes`          | Agregados por região (Centro-Oeste, Nordeste, etc.)                     |
| GET    | `/etanol/card-materias-primas`  | Ranking das matérias-primas processadas (cana, milho, etc.)             |
| GET    | `/etanol/card-usinas`           | As 8 usinas com maior capacidade instalada                              |

### Análise temporal (séries históricas)

| Método | Rota                                | Retorna                                                         |
|--------|-------------------------------------|-----------------------------------------------------------------|
| GET    | `/etanol/temporal/resumo`           | Cobertura temporal e último valor das três séries principais    |
| GET    | `/etanol/temporal/producao`         | Série mensal de produção total, hidratado e anidro (m³)        |
| GET    | `/etanol/temporal/capacidade`       | Série mensal de capacidade instalada total, hidratado e anidro |
| GET    | `/etanol/temporal/materias-primas`  | Série total de matéria-prima + quebra do último período         |
| GET    | `/etanol/temporal/estados`          | Ranking dos 10 estados líderes no período mais recente          |

### Previsão (modelos preditivos)

Todos os endpoints de previsão aceitam os query params comuns:

| Param         | Tipo   | Padrão             | Descrição                                          |
|---------------|--------|--------------------|----------------------------------------------------|
| `target`      | string | `production_total` | Série a prever — ver opções em `/etanol/previsao/opcoes` |
| `scope_type`  | string | `brasil`           | Nível geográfico: `brasil`, `regiao` ou `estado`   |
| `scope_value` | string | —                  | Valor do recorte quando `scope_type ≠ brasil`      |
| `horizon`     | int    | `6`                | Meses a projetar (1–24)                            |

#### GET `/etanol/previsao/opcoes`

Lista todos os modelos disponíveis, séries alvo, regiões e estados aceitos.
Útil para popular selects na UI sem hardcodar valores.

#### GET `/etanol/previsao/media-movel`

**Média Móvel** — calcula a média dos últimos `window` pontos e repete recursivamente.

| Param    | Tipo | Padrão | Descrição               |
|----------|------|--------|-------------------------|
| `window` | int  | `6`    | Tamanho da janela (2–24) |

#### GET `/etanol/previsao/regressao-linear`

**Regressão Linear** — ajusta uma reta sobre o índice temporal usando `sklearn.LinearRegression`
e extrapola para os próximos `horizon` períodos.
Bom para séries com tendência clara e sem sazonalidade marcada.

#### GET `/etanol/previsao/sazonal-ingenua`

**Sazonal Ingênuo** — repete o último ciclo observado de comprimento `season_length`.
Simples, mas eficaz para séries com sazonalidade estável.

| Param           | Tipo | Padrão | Descrição                   |
|-----------------|------|--------|-----------------------------|
| `season_length` | int  | `12`   | Comprimento do ciclo (2–24) |

#### GET `/etanol/previsao/holt-winters`

**Holt-Winters (suavização exponencial tripla)** — modelo clássico de séries temporais
com componentes de nível, tendência e sazonalidade. Usa `statsmodels.ExponentialSmoothing`.
Recomendado para séries longas com tendência e sazonalidade anual.

| Param           | Tipo   | Padrão | Descrição                                           |
|-----------------|--------|--------|-----------------------------------------------------|
| `season_length` | int    | `12`   | Comprimento do ciclo (2–24)                         |
| `trend`         | string | `add`  | Componente de tendência: `add`, `mul` ou `none`     |
| `seasonal`      | string | `add`  | Componente sazonal: `add`, `mul` ou `none`          |

> **Nota:** o modelo precisa de pelo menos dois ciclos completos na série histórica
> para ajuste com sazonalidade. Caso contrário, retorna HTTP 400.

---

## Estrutura

```
api/
├── main.py                          # app FastAPI, CORS e registro do router
├── requirements.txt                 # dependências: fastapi, pandas, numpy, sklearn, statsmodels
├── README.md
└── routers/
    └── etanol/
        ├── __init__.py
        ├── endpoint.py              # definição das rotas HTTP
        ├── service.py               # re-exporta as funções públicas
        ├── datasets/
        │   └── pb-da-etanol/        # CSVs de capacidade, produção e matéria-prima
        └── services/
            ├── __init__.py          # re-exporta tudo para o endpoint
            ├── base.py              # helpers: parse_number, sorted_periods, etc.
            ├── loaders.py           # leitura dos CSVs do dataset
            ├── dashboard.py         # snapshot do período mais recente
            ├── temporal.py          # séries históricas
            └── forecast.py          # modelos preditivos (MM, RL, Sazonal, HW)
```

## Stack de ciência de dados

| Biblioteca     | Uso                                              |
|----------------|--------------------------------------------------|
| `pandas`       | Manipulação de séries temporais                  |
| `numpy`        | Operações numéricas e índices para regressão     |
| `scikit-learn` | Regressão linear (`LinearRegression`)            |
| `statsmodels`  | Holt-Winters (`ExponentialSmoothing`)            |
