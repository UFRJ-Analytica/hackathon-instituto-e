"""Endpoints HTTP do módulo de mercado de descarbonização (CBIO)."""

from __future__ import annotations

from fastapi import APIRouter, Query

from .service import get_mercado_resumo, get_previsao, get_serie_historica

router = APIRouter(prefix="/mercado", tags=["mercado"])


@router.get("/resumo")
def mercado_resumo():
    """KPIs do mercado: preço atual, variações e volume de emissores."""
    return get_mercado_resumo()


@router.get("/serie-historica")
def mercado_serie_historica():
    """Série histórica completa de preço médio e quantidade de emissores (CBIO)."""
    return get_serie_historica()


@router.get("/previsao")
def mercado_previsao(h: int = Query(default=180, ge=30, le=730)):
    """Previsão de preço via modelo Prophet. Parâmetro h = horizonte em dias (30–365)."""
    return get_previsao(h=h)
