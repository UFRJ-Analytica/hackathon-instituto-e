"""Helpers básicos compartilhados pelos serviços de etanol."""

from __future__ import annotations

import csv
from pathlib import Path

DATASETS_DIR = Path(__file__).resolve().parent.parent / "datasets" / "pb-da-etanol"


def parse_month_year(value: str) -> tuple[int, int]:
    """Converte uma string `MM/AAAA` em tupla ordenável `(ano, mes)`."""
    month, year = value.split("/")
    return int(year), int(month)


def parse_number(value: str) -> float:
    """Converte número no padrão brasileiro para `float`."""
    normalized = value.strip().replace(".", "").replace(",", ".")
    return float(normalized) if normalized else 0.0


def read_csv(path: Path) -> list[dict[str, str]]:
    """Lê um CSV e retorna cada linha como dicionário."""
    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        return list(csv.DictReader(csv_file))


def latest_rows(rows: list[dict[str, str]]) -> tuple[str, list[dict[str, str]]]:
    """Seleciona o mês mais recente disponível e suas respectivas linhas."""
    latest_month = max((row["Mês/Ano"] for row in rows), key=parse_month_year)
    return latest_month, [row for row in rows if row["Mês/Ano"] == latest_month]


def sum_capacity(row: dict[str, str]) -> tuple[float, float, float]:
    """Retorna capacidade de anidro, hidratado e total para uma linha."""
    anhydrous = parse_number(row["Capacidade Produção Etanol Anidro (m³/d)"])
    hydrated = parse_number(row["Capacidade Produção Etanol Hidratado (m³/d)"])
    return anhydrous, hydrated, anhydrous + hydrated


def sorted_periods(periods: set[str] | list[str]) -> list[str]:
    """Ordena períodos no formato `MM/AAAA` em ordem cronológica."""
    return sorted(periods, key=parse_month_year)


def format_period_label(period: str) -> str:
    """Converte `MM/AAAA` em rótulo `AAAA-MM` para consumo no front."""
    month, year = period.split("/")
    return f"{year}-{month}"


def next_period(period: str) -> str:
    """Retorna o próximo mês no formato `MM/AAAA`."""
    month, year = map(int, period.split("/"))
    month += 1
    if month > 12:
        month = 1
        year += 1
    return f"{month:02d}/{year}"


def future_periods(last_period: str, horizon: int) -> list[str]:
    """Gera uma lista de meses futuros a partir do último período conhecido."""
    periods = []
    current = last_period
    for _ in range(horizon):
        current = next_period(current)
        periods.append(current)
    return periods
