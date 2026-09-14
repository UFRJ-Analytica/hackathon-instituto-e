<h1 align="center">
  Plataforma de Descarbonização Industrial
</h1>

<p align="center">
  Projeto desenvolvido durante o <a href="https://hackathonbrasil.com.br/hackathon-emais/">Hackathon E+</a> pela <strong>Equipe 451</strong>.
</p>

## 👥 Equipe

- **Arick Jurdan dos Reis** – Planejamento Energético (arickjurdan.20221@poli.ufrj.br)
- **Claudio Almeida Santos Junior** – Designer e Desenvolvedor Frontend (cla.junior21@gmail.com)
- **Gustavo Felicidade da Costa** – Engenheiro de Dados (gustavofelicidadedacosta@gmail.com)
- **João Pedro de Sousa Torres Costa** – Cientista de Dados (joaocosta29@poli.ufrj.br)

---

## 🎯 Sobre o Projeto

A plataforma é uma aplicação analítica e exploratória focada em **Descarbonização Industrial**, abrangendo módulos de energia, biocombustíveis (com foco especial no Etanol), emissões, mercado de carbono e planejamento territorial.

Seu objetivo principal é fornecer visualizações interativas, análises históricas e projeções estatísticas/modelos de _Machine Learning_ que auxiliem na leitura de dados espaciais e no planejamento da transição energética brasileira.

## 🚀 Principais Funcionalidades e Módulos

As páginas e ferramentas disponíveis na plataforma incluem:

- **Dashboard Principal (`/`)**: Visão geral com indicadores-resumo, navegação entre módulos e créditos de fontes.
- **Biocombustíveis - Etanol (`/etanol`)**:
  - Mapa com dados espaciais do setor sucroenergético.
  - **Análise Temporal**: Evolução de produção, capacidade instalada e matérias-primas ao longo do tempo.
  - **Previsão**: Modelos preditivos para séries temporais (Média Móvel, Regressão Linear, Sazonal Ingênuo, Holt-Winters e Prophet).
  - Chat contextualizado com IA.
- **Emissões (`/emissoes`)**: Painel de emissões de GEE (Gases de Efeito Estufa) por estado, ranking de descarbonização e análises setoriais (narrativas geradas via IA).
- **Mercado de Carbono (`/mercado`)**: Acompanhamento do mercado de CBIOs, histórico de preços, emissores e previsões.
- **Energia (`/energia`)**: Mapa interativo de ativos de geração energética (filtros por descarbonização, fonte, fase e estado).
- **PID - Planejamento Territorial (`/pid`)**: Mapa interativo para marcação de oportunidades, riscos e pins industriais.
- **Assistente IA (`/chat-ai`)**: Chat em linguagem natural que consulta os dados disponíveis na API.

## 🛠️ Stack Tecnológica

O projeto é dividido em duas aplicações principais: uma API e um Frontend.

### Frontend (`/front`)

- **Framework**: React 19 com Vite e TypeScript.
- **Estilização**: Tailwind CSS + Shadcn UI.
- **Mapas**: Leaflet / React-Leaflet.
- **Gráficos**: Recharts.

### Backend / API (`/api`)

- **Framework**: FastAPI (Python 3.11+).
- **Manipulação de Dados e Séries Temporais**: Pandas, NumPy.
- **Modelos de Previsão**: Scikit-Learn, Statsmodels (Holt-Winters), Prophet.
- **Integração de IA**: Google GenAI.

### Infraestrutura

- **Containers**: Docker e Docker Compose.
- **Roteamento**: Traefik.

---

## ⚙️ Como Executar o Projeto

Você pode rodar toda a aplicação utilizando o **Docker Compose**.

### Rodando com Docker (Recomendado)

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. Crie um arquivo `.env` na raiz do projeto (ou dentro de `api/`, dependendo da configuração) com as chaves necessárias (como de APIs de IA, se aplicável).
3. Execute o comando na raiz do projeto:

```bash
docker-compose up --build -d
```

A aplicação estará disponível em `http://localhost` (ou pela URL configurada no Traefik).

### Rodando Localmente (Desenvolvimento)

#### Backend (API)

```bash
cd api
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

A API iniciará em: `http://localhost:8000`
_Documentação do Swagger acessível em: `http://localhost:8000/docs`_

#### Frontend

```bash
cd front
npm install
npm run dev
```

O Frontend iniciará em: `http://localhost:5173` (ou a porta padrão do Vite).

---

## 📊 Fontes de Dados

Os dados processados na plataforma vêm de instituições governamentais e painéis setoriais consolidados, incluindo, mas não limitados a:

- **IBGE**: BDiA, PEVS, PAM, SIDRA e Atlas Nacional.
- **MapBiomas e Terrabrasilis (INPE)**.
- **EPE**: Webmap Interativo e Balanço Energético Nacional (BEN).
- **ANP**: Painéis Dinâmicos de Etanol, Biodiesel e Biometano.
- **ANEEL**: SIGA (Sistema de Informações de Geração).
- **Outras entidades**: Conab, IBÁ, Observatório do Código Florestal, Sebrae, Banco Mundial, IRENA, entre outros.
