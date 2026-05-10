"""Endpoints do chatbot IA — dois modos: contexto injetado e tool calling."""

from __future__ import annotations

import json
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from routers.etanol.services import (
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

router = APIRouter(tags=["chat"])

GEMINI_MODEL = "gemini-2.5-flash"

SITE_CONTEXT = """Você é um assistente da Plataforma Interativa de Descarbonização (PID),
desenvolvida pelo Instituto E em parceria com pesquisadores brasileiros.

A plataforma apresenta dados sobre o setor de etanol no Brasil:
- Dashboard: panorama atual com mapa por estado, ranking de usinas, regiões e matérias-primas
- Análise temporal: séries históricas de produção, capacidade instalada e matéria-prima processada
- Previsão: modelos estatísticos (Média Móvel, Regressão Linear, Sazonal Ingênuo, Holt-Winters, Prophet)
  que estimam o comportamento futuro das séries com base no histórico

Os dados vêm de fontes públicas oficiais (ANEEL, EPE, MME, IBGE) e cobrem usinas de etanol
distribuídas por todo o Brasil.

Responda sempre em português brasileiro. Seja direto, claro e acessível para pessoas
que não têm formação técnica em estatística ou ciência de dados.
Quando não souber algo, diga que não tem esse dado disponível."""


class ChatMessage(BaseModel):
    role: str  # "user" ou "model"
    text: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


def _get_client():
    """Cria cliente Gemini a partir da variável de ambiente GEMINI_API_KEY."""
    from google import genai

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY não configurada no ambiente.",
        )
    return genai.Client(api_key=api_key)


# ── Opção 1: contexto injetado (para o dialog do etanol) ──────────────────────

@router.post("/chat/etanol")
def chat_etanol(request: ChatRequest):
    """Chat com contexto dos dados atuais de etanol injetado no prompt.

    Os dados mais recentes (resumo, estados, regiões, usinas, matérias-primas)
    são buscados da API e enviados ao Gemini junto com cada mensagem.

    Args:
        request: histórico de mensagens do usuário.

    Returns:
        dict: resposta de texto do modelo.
    """
    from google.genai import types

    client = _get_client()

    resumo = get_etanol_card_resumo()
    estados = get_etanol_card_estados()
    regioes = get_etanol_card_regioes()
    usinas = get_etanol_card_usinas()
    materias = get_etanol_card_materias_primas()

    dados_snapshot = json.dumps(
        {
            "resumo": resumo,
            "estados": estados,
            "regioes": regioes,
            "usinas_top": usinas,
            "materias_primas": materias,
        },
        ensure_ascii=False,
        indent=2,
    )

    system = (
        SITE_CONTEXT
        + "\n\nDados atuais da plataforma (snapshot):\n"
        + dados_snapshot
    )

    history = [
        types.Content(role=msg.role, parts=[types.Part(text=msg.text)])
        for msg in request.messages[:-1]
    ]
    last_message = request.messages[-1].text

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=history + [types.Content(role="user", parts=[types.Part(text=last_message)])],
        config=types.GenerateContentConfig(system_instruction=system),
    )

    return {"text": response.text}


# ── Opção 2: tool calling (para a página ChatAI) ──────────────────────────────

def _call_previsao(fn, args: dict) -> dict:
    """Chama uma função de previsão com os parâmetros fornecidos pelo Gemini."""
    return fn(
        target=args.get("target", "production_total"),
        scope_type=args.get("scope_type", "brasil"),
        scope_value=args.get("scope_value") or None,
        horizon=int(args.get("horizon", 6)),
        **{k: v for k, v in args.items() if k in ("window", "season_length", "trend", "seasonal")},
    )


_TOOL_FUNCTIONS = {
    # Dashboard
    "get_resumo_etanol": lambda _: get_etanol_card_resumo(),
    "get_estados_etanol": lambda _: get_etanol_card_estados(),
    "get_todos_estados_etanol": lambda _: get_etanol_card_mapa(),
    "get_regioes_etanol": lambda _: get_etanol_card_regioes(),
    "get_usinas_etanol": lambda _: get_etanol_card_usinas(),
    "get_materias_primas_etanol": lambda _: get_etanol_card_materias_primas(),
    # Séries temporais
    "get_temporal_resumo": lambda _: get_etanol_temporal_resumo(),
    "get_temporal_producao": lambda _: get_etanol_temporal_producao(),
    "get_temporal_capacidade": lambda _: get_etanol_temporal_capacidade(),
    "get_temporal_materias_primas": lambda _: get_etanol_temporal_materias_primas(),
    "get_temporal_estados": lambda _: get_etanol_temporal_estados(),
    # Opções de previsão
    "get_previsao_opcoes": lambda _: get_etanol_previsao_opcoes(),
    # Previsão
    "get_previsao_media_movel": lambda args: _call_previsao(get_etanol_previsao_media_movel, {**args, **{"window": int(args.get("window", 6))}}),
    "get_previsao_regressao_linear": lambda args: _call_previsao(get_etanol_previsao_regressao_linear, args),
    "get_previsao_sazonal_ingenua": lambda args: _call_previsao(get_etanol_previsao_sazonal_ingenua, {**args, **{"season_length": int(args.get("season_length", 12))}}),
    "get_previsao_holt_winters": lambda args: _call_previsao(get_etanol_previsao_holt_winters, {**args, **{"season_length": int(args.get("season_length", 12)), "trend": args.get("trend", "add"), "seasonal": args.get("seasonal", "add")}}),
    "get_previsao_prophet": lambda args: _call_previsao(get_etanol_previsao_prophet, args),
}

_SCOPE_PARAMS = {
    "scope_type": {
        "type": "string",
        "description": "Nível geográfico: 'brasil', 'regiao' ou 'estado'.",
        "enum": ["brasil", "regiao", "estado"],
    },
    "scope_value": {
        "type": "string",
        "description": "Nome da região ou estado quando scope_type não for 'brasil'.",
    },
    "target": {
        "type": "string",
        "description": "Série a prever: 'production_total', 'production_hydrated', 'production_anhydrous', 'capacity_total', 'capacity_hydrated', 'capacity_anhydrous' ou 'feedstock_total'.",
    },
    "horizon": {
        "type": "integer",
        "description": "Quantidade de meses futuros a prever (1–24).",
    },
}

_TOOLS_SCHEMA = [
    # Dashboard
    {"name": "get_resumo_etanol", "description": "KPIs gerais: usinas, capacidade total e produção total do período mais recente.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_estados_etanol", "description": "Top 8 estados com maior capacidade instalada de etanol.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_todos_estados_etanol", "description": "Lista COMPLETA de todos os estados com capacidade e produção de etanol. Use quando precisar ranquear ou listar todos os estados, não só os maiores.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_regioes_etanol", "description": "Dados agregados por região do Brasil.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_usinas_etanol", "description": "Ranking das usinas com maior capacidade instalada.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_materias_primas_etanol", "description": "Matérias-primas processadas (cana, milho, etc.) e seus volumes.", "parameters": {"type": "object", "properties": {}}},
    # Temporais
    {"name": "get_temporal_resumo", "description": "Cobertura temporal e último valor das séries de produção, capacidade e matéria-prima.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_temporal_producao", "description": "Série histórica mensal de produção de etanol (hidratado, anidro e total).", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_temporal_capacidade", "description": "Série histórica mensal de capacidade instalada de etanol.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_temporal_materias_primas", "description": "Evolução histórica das matérias-primas processadas e quebra do último período.", "parameters": {"type": "object", "properties": {}}},
    {"name": "get_temporal_estados", "description": "Lista completa de todos os estados ordenados por produção no período mais recente, com volume de etanol hidratado, anidro e total.", "parameters": {"type": "object", "properties": {}}},
    # Opções
    {"name": "get_previsao_opcoes", "description": "Lista todos os alvos, regiões e estados disponíveis para previsão.", "parameters": {"type": "object", "properties": {}}},
    # Previsão
    {
        "name": "get_previsao_media_movel",
        "description": "Previsão por média móvel: projeta a média dos últimos 'window' meses.",
        "parameters": {"type": "object", "properties": {**_SCOPE_PARAMS, "window": {"type": "integer", "description": "Tamanho da janela móvel (2–24)."}}},
    },
    {
        "name": "get_previsao_regressao_linear",
        "description": "Previsão por regressão linear: extrapola a tendência de crescimento ou queda.",
        "parameters": {"type": "object", "properties": _SCOPE_PARAMS},
    },
    {
        "name": "get_previsao_sazonal_ingenua",
        "description": "Previsão sazonal ingênua: repete o padrão do último ciclo anual.",
        "parameters": {"type": "object", "properties": {**_SCOPE_PARAMS, "season_length": {"type": "integer", "description": "Comprimento do ciclo sazonal em meses (padrão 12)."}}},
    },
    {
        "name": "get_previsao_holt_winters",
        "description": "Previsão Holt-Winters: modelo estatístico com tendência e sazonalidade.",
        "parameters": {"type": "object", "properties": {**_SCOPE_PARAMS, "season_length": {"type": "integer"}, "trend": {"type": "string", "enum": ["add", "mul", "none"]}, "seasonal": {"type": "string", "enum": ["add", "mul", "none"]}}},
    },
    {
        "name": "get_previsao_prophet",
        "description": "Previsão com Prophet (Meta): detecta automaticamente tendência e sazonalidade anual. Mais lento, mas robusto.",
        "parameters": {"type": "object", "properties": _SCOPE_PARAMS},
    },
]


@router.post("/chat/ai")
def chat_ai(request: ChatRequest):
    """Chat com tool calling — o Gemini decide quais dados buscar para responder.

    O modelo recebe a lista de ferramentas disponíveis e, quando precisa de
    dados específicos, chama a função correspondente automaticamente.

    Args:
        request: histórico de mensagens do usuário.

    Returns:
        dict: resposta de texto do modelo após executar as ferramentas necessárias.
    """
    from google.genai import types

    client = _get_client()

    tools = types.Tool(
        function_declarations=[
            types.FunctionDeclaration(**tool) for tool in _TOOLS_SCHEMA
        ]
    )

    history = [
        types.Content(role=msg.role, parts=[types.Part(text=msg.text)])
        for msg in request.messages[:-1]
    ]
    last_message = request.messages[-1].text
    contents = history + [types.Content(role="user", parts=[types.Part(text=last_message)])]

    # Loop de tool calling: executa até o modelo retornar texto final
    for _ in range(5):
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SITE_CONTEXT,
                tools=[tools],
            ),
        )

        candidate = response.candidates[0]
        has_tool_call = any(
            part.function_call is not None
            for part in candidate.content.parts
        )

        if not has_tool_call:
            return {"text": response.text}

        # Executa as ferramentas pedidas pelo modelo
        contents.append(candidate.content)
        tool_results = []
        for part in candidate.content.parts:
            if part.function_call is None:
                continue
            fn = _TOOL_FUNCTIONS.get(part.function_call.name)
            result = fn(part.function_call.args) if fn else {"error": "função desconhecida"}
            tool_results.append(
                types.Part(
                    function_response=types.FunctionResponse(
                        name=part.function_call.name,
                        response={"result": result},
                    )
                )
            )

        contents.append(types.Content(role="user", parts=tool_results))

    return {"text": response.text}
