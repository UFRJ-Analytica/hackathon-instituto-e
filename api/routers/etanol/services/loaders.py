"""Rotinas de carregamento dos datasets de etanol."""

from __future__ import annotations

from .base import DATASETS_DIR, latest_rows, read_csv


def load_capacity_rows() -> tuple[str, list[dict[str, str]]]:
    """Lê todos os CSVs de capacidade e devolve apenas o período mais recente."""
    all_rows: list[dict[str, str]] = []
    for path in sorted(DATASETS_DIR.glob("Etanol_Capacidade *.csv")):
        all_rows.extend(read_csv(path))
    return latest_rows(all_rows)


def load_capacity_all_rows() -> list[dict[str, str]]:
    """Lê todos os CSVs históricos de capacidade."""
    all_rows: list[dict[str, str]] = []
    for path in sorted(DATASETS_DIR.glob("Etanol_Capacidade *.csv")):
        all_rows.extend(read_csv(path))
    return all_rows


def load_production_rows() -> tuple[str, list[dict[str, str]]]:
    """Lê o CSV de produção e devolve apenas o período mais recente."""
    production_path = next(DATASETS_DIR.glob("Etanol_Produ*.csv"))
    return latest_rows(read_csv(production_path))


def load_production_all_rows() -> list[dict[str, str]]:
    """Lê o histórico completo de produção."""
    production_path = next(DATASETS_DIR.glob("Etanol_Produ*.csv"))
    return read_csv(production_path)


def load_feedstock_rows() -> tuple[str, list[dict[str, str]]]:
    """Lê o CSV de matéria-prima e devolve apenas o período mais recente."""
    return latest_rows(read_csv(DATASETS_DIR / "Etanol_MatériaPrima.csv"))


def load_feedstock_all_rows() -> list[dict[str, str]]:
    """Lê o histórico completo de matéria-prima processada."""
    return read_csv(DATASETS_DIR / "Etanol_MatériaPrima.csv")
