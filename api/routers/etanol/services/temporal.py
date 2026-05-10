"""Serviços de análise temporal para o domínio de etanol."""

from __future__ import annotations

from collections import defaultdict
from functools import lru_cache

from .base import format_period_label, latest_rows, parse_number, sorted_periods, sum_capacity
from .loaders import load_capacity_all_rows, load_feedstock_all_rows, load_production_all_rows


@lru_cache(maxsize=1)
def get_etanol_temporal_resumo() -> dict:
    """Retorna cobertura temporal e último valor das séries principais."""
    capacity_rows = load_capacity_all_rows()
    production_rows = load_production_all_rows()
    feedstock_rows = load_feedstock_all_rows()

    latest_capacity, latest_capacity_rows = latest_rows(capacity_rows)
    latest_production, latest_production_rows = latest_rows(production_rows)
    latest_feedstock, latest_feedstock_rows = latest_rows(feedstock_rows)

    latest_capacity_total = sum(sum_capacity(row)[2] for row in latest_capacity_rows)
    latest_production_total = sum(
        parse_number(row["Produção Etanol Hidratado(m³)"])
        + parse_number(row["Produção Etanol Anidro (m³)"])
        for row in latest_production_rows
    )
    latest_feedstock_total = sum(
        parse_number(row["Quantidade Processada (t)"]) for row in latest_feedstock_rows
    )

    return {
        "coverage": {
            "capacity": {
                "start": sorted_periods({row["Mês/Ano"] for row in capacity_rows})[0],
                "end": latest_capacity,
            },
            "production": {
                "start": sorted_periods({row["Mês/Ano"] for row in production_rows})[0],
                "end": latest_production,
            },
            "feedstocks": {
                "start": sorted_periods({row["Mês/Ano"] for row in feedstock_rows})[0],
                "end": latest_feedstock,
            },
        },
        "latest": {
            "capacityPeriod": latest_capacity,
            "productionPeriod": latest_production,
            "feedstocksPeriod": latest_feedstock,
            "capacityTotal": round(latest_capacity_total, 2),
            "productionTotal": round(latest_production_total, 2),
            "feedstocksTotal": round(latest_feedstock_total, 2),
        },
    }


@lru_cache(maxsize=1)
def get_etanol_temporal_producao() -> dict:
    """Retorna a série histórica agregada de produção de etanol."""
    production_rows = load_production_all_rows()
    by_period: dict[str, dict[str, float]] = defaultdict(
        lambda: {"hydrated": 0.0, "anhydrous": 0.0}
    )

    for row in production_rows:
        period = row["Mês/Ano"]
        by_period[period]["hydrated"] += parse_number(row["Produção Etanol Hidratado(m³)"])
        by_period[period]["anhydrous"] += parse_number(row["Produção Etanol Anidro (m³)"])

    points = []
    for period in sorted_periods(set(by_period)):
        hydrated = by_period[period]["hydrated"]
        anhydrous = by_period[period]["anhydrous"]
        points.append(
            {
                "period": period,
                "label": format_period_label(period),
                "hydrated": round(hydrated, 2),
                "anhydrous": round(anhydrous, 2),
                "total": round(hydrated + anhydrous, 2),
            }
        )

    return {
        "title": "Evolução da produção",
        "unit": "m³",
        "points": points,
    }


@lru_cache(maxsize=1)
def get_etanol_temporal_capacidade() -> dict:
    """Retorna a série histórica agregada de capacidade instalada."""
    capacity_rows = load_capacity_all_rows()
    by_period: dict[str, dict[str, float]] = defaultdict(
        lambda: {"hydrated": 0.0, "anhydrous": 0.0}
    )

    for row in capacity_rows:
        period = row["Mês/Ano"]
        anhydrous, hydrated, _ = sum_capacity(row)
        by_period[period]["hydrated"] += hydrated
        by_period[period]["anhydrous"] += anhydrous

    points = []
    for period in sorted_periods(set(by_period)):
        hydrated = by_period[period]["hydrated"]
        anhydrous = by_period[period]["anhydrous"]
        points.append(
            {
                "period": period,
                "label": format_period_label(period),
                "hydrated": round(hydrated, 2),
                "anhydrous": round(anhydrous, 2),
                "total": round(hydrated + anhydrous, 2),
            }
        )

    return {
        "title": "Evolução da capacidade instalada",
        "unit": "m³/dia",
        "points": points,
    }


@lru_cache(maxsize=1)
def get_etanol_temporal_materias_primas() -> dict:
    """Retorna a evolução temporal da matéria-prima e a quebra do último período."""
    feedstock_rows = load_feedstock_all_rows()
    by_period_total: dict[str, float] = defaultdict(float)

    for row in feedstock_rows:
        by_period_total[row["Mês/Ano"]] += parse_number(row["Quantidade Processada (t)"])

    latest_period, latest_rows_for_period = latest_rows(feedstock_rows)
    latest_items: dict[str, float] = defaultdict(float)
    for row in latest_rows_for_period:
        latest_items[row["Produto"]] += parse_number(row["Quantidade Processada (t)"])

    points = [
        {
            "period": period,
            "label": format_period_label(period),
            "total": round(by_period_total[period], 2),
        }
        for period in sorted_periods(set(by_period_total))
    ]

    latest_breakdown = [
        {"product": product, "amount": round(amount, 2)}
        for product, amount in sorted(
            latest_items.items(), key=lambda item: item[1], reverse=True
        )
    ]

    return {
        "title": "Matérias-primas ao longo do tempo",
        "unit": "t",
        "latestPeriod": latest_period,
        "points": points,
        "latestBreakdown": latest_breakdown,
    }


@lru_cache(maxsize=1)
def get_etanol_temporal_estados() -> dict:
    """Retorna o ranking dos estados líderes no período mais recente."""
    production_rows = load_production_all_rows()
    latest_period, latest_rows_for_period = latest_rows(production_rows)
    ranked = []

    for row in latest_rows_for_period:
        hydrated = parse_number(row["Produção Etanol Hidratado(m³)"])
        anhydrous = parse_number(row["Produção Etanol Anidro (m³)"])
        ranked.append(
            {
                "state": row["Estado"],
                "region": row["Região"],
                "hydrated": round(hydrated, 2),
                "anhydrous": round(anhydrous, 2),
                "total": round(hydrated + anhydrous, 2),
            }
        )

    ranked.sort(key=lambda item: item["total"], reverse=True)

    return {
        "title": "Estados líderes no período mais recente",
        "period": latest_period,
        "unit": "m³",
        "items": ranked,
    }
