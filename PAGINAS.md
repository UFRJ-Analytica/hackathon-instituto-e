# Páginas da Plataforma

Este documento descreve, de forma objetiva, o que cada página da aplicação faz hoje.

## Visão geral

A navegação principal do front está organizada em módulos voltados para descarbonização, energia, biocombustíveis, emissões, mercado de carbono e planejamento territorial.

As rotas principais estão definidas em [front/src/App.tsx](/home/claudio-almeida/ufrj/analytica/hackathon-instituto-e/front/src/App.tsx:1).

## Páginas ativas

### Início

- Rota: `/`
- Função: página inicial institucional da plataforma.
- O que mostra:
  - hero principal da plataforma;
  - indicadores-resumo;
  - cards de destaque para navegação entre módulos;
  - créditos e fonte dos dados.
- Objetivo: apresentar o produto e direcionar o usuário para as áreas analíticas.

### Biocombustível

- Rota: `/etanol`
- Função: dashboard principal de etanol.
- O que mostra:
  - mapa com dados espaciais do setor;
  - resumo geral;
  - estados com maior capacidade;
  - capacidade por região;
  - matérias-primas processadas;
  - usinas com maior capacidade.
- Extras:
  - possui um chat contextual com IA focado em etanol.
- Objetivo: oferecer uma leitura consolidada e exploratória do setor de etanol.

### Biocombustível - Análise temporal

- Rota: `/etanol/analise-temporal`
- Função: análise histórica das séries de etanol.
- O que mostra:
  - evolução da produção;
  - evolução da capacidade instalada;
  - matérias-primas ao longo do tempo;
  - estados líderes no período mais recente;
  - resumo temporal.
- Objetivo: permitir leitura de tendência, sazonalidade e mudança estrutural ao longo do tempo.

### Biocombustível - Previsão

- Rota: `/etanol/previsao`
- Função: tela de previsão estatística para séries de etanol.
- O que permite:
  - escolher o modelo preditivo;
  - escolher a variável alvo;
  - escolher recorte geográfico;
  - configurar horizonte e parâmetros do modelo.
- Modelos disponíveis:
  - média móvel;
  - regressão linear;
  - sazonal ingênuo;
  - Holt-Winters;
  - Prophet.
- Objetivo: projetar comportamento futuro das séries com base no histórico observado.

### Emissões

- Rota: `/emissoes`
- Função: painel de emissões de gases de efeito estufa por estado.
- O que mostra:
  - KPIs de emissões;
  - ranking de descarbonização;
  - emissões por setor;
  - série temporal das emissões;
  - narrativas analíticas por estado.
- Extras:
  - possui geração de narrativa com IA por estado.
- Objetivo: apoiar leitura comparativa do perfil emissor e da dificuldade de descarbonização no Brasil.

### Mercado de Carbono

- Rota: `/mercado`
- Função: módulo de acompanhamento do mercado de CBIO.
- O que mostra:
  - resumo do mercado;
  - histórico de preço médio do CBIO;
  - volume de emissores por período;
  - previsão de preço com Prophet.
- Objetivo: acompanhar dinâmica de mercado, comportamento histórico e tendência futura do crédito de descarbonização.

### Infraestrutura

- Rota: `/infraestrutura`
- Função: área reservada para infraestrutura estratégica.
- Estado atual:
  - página placeholder.
- Escopo previsto:
  - hubs de descarbonização;
  - instalações portuárias;
  - demais infraestruturas mapeadas no território nacional.
- Objetivo: concentrar a camada de leitura logística e territorial da transição energética.

### Indústrias

- Rota: `/industrias`
- Função: área conceitual para análise industrial.
- Estado atual:
  - página orientadora, ainda sem dashboard final implementado.
- O que comunica:
  - a leitura de ativos energéticos foi deslocada para a tela `Energia`;
  - a evolução futura ideal é cruzar dados industriais, território, infraestrutura e abatimento.
- Objetivo: servir de base para futura análise de polos industriais e descarbonização produtiva.

### Energia

- Rota: `/energia`
- Função: mapa interativo de ativos de geração energética.
- O que permite:
  - filtrar por perfil de descarbonização;
  - filtrar por tipo de fonte;
  - filtrar por fase;
  - filtrar por estado;
  - alternar mapa-base.
- O que mostra:
  - ativos energéticos georreferenciados;
  - recortes de fontes renováveis, transição e visão total.
- Objetivo: visualizar a matriz energética e os ativos alinhados à descarbonização.

### PID

- Rota: `/pid`
- Função: mapa interativo de planejamento.
- O que permite:
  - navegar sobre o território;
  - adicionar pins industriais;
  - marcar oportunidades;
  - marcar riscos;
  - inserir rótulos;
  - desenhar polígonos;
  - exportar o planejamento.
- Objetivo: apoiar leitura espacial e construção de cenários de planejamento territorial.

### Saiba mais

- Rota: `/saiba-mais`
- Função: área de documentação e contexto.
- Estado atual:
  - página placeholder.
- Escopo previsto:
  - metodologia;
  - fontes de dados;
  - explicações adicionais sobre a plataforma.
- Objetivo: registrar a base metodológica e documental do sistema.

### Chat IA

- Rota: `/chat-ai`
- Função: chat geral da plataforma.
- O que faz:
  - recebe perguntas em linguagem natural;
  - consulta a API da plataforma;
  - responde com base nos dados disponíveis.
- Objetivo: facilitar acesso conversacional às informações da aplicação.

## Observações

- Existem páginas antigas ou de apoio no código que não fazem parte da navegação principal atual.
- Algumas páginas já estão operacionais com dados reais, enquanto outras ainda funcionam como placeholders para evolução futura.
- Os nomes exibidos no menu podem variar conforme a evolução do produto, mas as rotas acima representam o estado atual da aplicação.
