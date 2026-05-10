"""Endpoints HTTP do módulo de emissões e descarbonização."""

from __future__ import annotations

import json
import os

from fastapi import APIRouter, HTTPException

from .service import (
    get_dados_estado,
    get_emissoes_crescimento,
    get_emissoes_dashboard_estados,
    get_emissoes_intensidade,
    get_emissoes_indices,
    get_emissoes_por_setor,
    get_emissoes_ranking,
    get_emissoes_serie_temporal,
    get_emissoes_storytelling,
)

router = APIRouter(prefix="/emissoes", tags=["emissoes"])


@router.get("/dashboard/estados")
def emissoes_dashboard_estados():
    """Estado + setor dominante + IDD. Fonte principal da home de emissões."""
    return get_emissoes_dashboard_estados()


@router.get("/dashboard/storytelling")
def emissoes_storytelling():
    """Narrativas textuais automáticas por estado (tipologia + dificuldade)."""
    return get_emissoes_storytelling()


@router.get("/indices")
def emissoes_indices():
    """Índice de Dificuldade de Descarbonização (IDD) completo por estado."""
    return get_emissoes_indices()


@router.get("/intensidade")
def emissoes_intensidade():
    """Intensidade das emissões de energia por estado."""
    return get_emissoes_intensidade()


@router.get("/ranking")
def emissoes_ranking():
    """Ranking agregado de estados por emissão total."""
    return get_emissoes_ranking()


@router.get("/serie-temporal")
def emissoes_serie_temporal():
    """Série temporal consolidada de emissões por estado e ano."""
    return get_emissoes_serie_temporal()


@router.get("/crescimento")
def emissoes_crescimento():
    """Comparação de emissões entre 1990 e 2023 por estado."""
    return get_emissoes_crescimento()


@router.get("/setores")
def emissoes_setores():
    """Total de emissões por setor no Brasil."""
    return get_emissoes_por_setor()


@router.get("/narrativa/{estado}")
def emissoes_narrativa_ia(estado: str):
    """Gera uma narrativa analítica com IA (Gemini) para o estado informado."""
    from google import genai
    from google.genai import types

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY não configurada.")

    dados = get_dados_estado(estado)
    if not dados["dashboard"]:
        raise HTTPException(status_code=404, detail=f"Estado '{estado}' não encontrado.")

    dados_json = json.dumps(dados, ensure_ascii=False, indent=2)

    prompt = f"""Analise os dados de emissões de gases de efeito estufa do estado {estado} e escreva uma narrativa analítica.

Dados disponíveis:
{dados_json}

Escreva 2 a 3 parágrafos que:
1. Contextualizem o estado no cenário nacional de descarbonização, mencionando o IDD (Índice de Dificuldade de Descarbonização) e o que ele significa na prática
2. Expliquem a evolução histórica das emissões (crescimento ou redução desde 1990), qual setor é o principal responsável e se a intensidade de emissões de Energia é alta ou baixa no contexto estadual
3. Apontem brevemente os principais desafios e caminhos de política pública para a transição do estado

Use linguagem clara e acessível ao público geral. Seja direto e baseado nos dados. Não invente informações além das fornecidas."""

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Você é um analista especialista em descarbonização e política climática no Brasil. "
                "Escreva análises claras, em português brasileiro, baseadas estritamente nos dados fornecidos."
            )
        ),
    )

    return {"estado": estado, "narrativa": response.text}
