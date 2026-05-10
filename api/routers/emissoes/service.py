"""Serviços de leitura e transformação dos dados de emissões (SEEG)."""

import json
from pathlib import Path

import pandas as pd

DATASETS = Path(__file__).parent / "datasets"


def _read_parquet(relative: str) -> pd.DataFrame:
    return pd.read_parquet(DATASETS / relative)


def _read_json(relative: str) -> list:
    with open(DATASETS / relative, encoding="utf-8") as f:
        return json.load(f)


def get_emissoes_dashboard_estados() -> list[dict]:
    return _read_json("dashboard/estados.json")


def get_emissoes_storytelling() -> list[dict]:
    return _read_json("dashboard/storytelling.json")


def get_emissoes_indices() -> list[dict]:
    df = _read_parquet("indexes/indexes_descarbonizacao.parquet")
    return df.to_dict(orient="records")


def get_emissoes_ranking() -> list[dict]:
    df = _read_parquet("analytics/ranking_estados.parquet")
    return df.to_dict(orient="records")


def get_emissoes_serie_temporal() -> list[dict]:
    df = _read_parquet("analytics/serie_temporal.parquet")
    return df.to_dict(orient="records")


def get_emissoes_crescimento() -> list[dict]:
    df = _read_parquet("analytics/crescimento_estados.parquet")
    return df.to_dict(orient="records")


def get_emissoes_por_setor() -> list[dict]:
    df = _read_parquet("analytics/analytics_setor.parquet")
    return df.to_dict(orient="records")


def get_dados_estado(estado: str) -> dict:
    """Consolida todos os dados disponíveis para um estado específico."""
    dashboard = {e["estado"]: e for e in get_emissoes_dashboard_estados()}
    stories = {s["estado"]: s for s in get_emissoes_storytelling()}
    crescimento = {c["estado"]: c for c in get_emissoes_crescimento()}

    serie_df = _read_parquet("analytics/serie_temporal.parquet")
    serie = serie_df[serie_df["estado"] == estado].to_dict(orient="records")

    setor_df = _read_parquet("analytics/analytics_estado_setor.parquet")
    setores_estado = setor_df[setor_df["estado"] == estado].to_dict(orient="records")

    return {
        "estado": estado,
        "dashboard": dashboard.get(estado),
        "storytelling_estatico": stories.get(estado),
        "crescimento": crescimento.get(estado),
        "serie_temporal": serie,
        "emissoes_por_setor": setores_estado,
    }
