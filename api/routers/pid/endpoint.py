"""Endpoints HTTP da PID."""

from fastapi import APIRouter

from .service import get_pid_industrial_map

router = APIRouter(tags=["pid"])


@router.get("/pid/industrializacao/mapa")
def pid_industrializacao_mapa():
    """Retorna a malha municipal com métricas reais de industrialização."""
    return get_pid_industrial_map()
