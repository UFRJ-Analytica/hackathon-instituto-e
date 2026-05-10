"""Serviços do dashboard estático de etanol."""

from __future__ import annotations

from collections import defaultdict
from functools import lru_cache

from .base import parse_number, sum_capacity
from .loaders import load_capacity_rows, load_feedstock_rows, load_production_rows


@lru_cache(maxsize=1)
def _get_etanol_dashboard() -> dict:
    """Consolida o snapshot mais recente dos datasets para o dashboard.

    Returns:
        dict: payload completo com resumo, estados, regiões, usinas e
        matérias-primas do último período disponível.
    """

    capacity_period, capacity_rows = load_capacity_rows()
    production_period, production_rows = load_production_rows()
    feedstock_period, feedstock_rows = load_feedstock_rows()

    states: dict[str, dict] = {}
    municipalities: dict[tuple[str, str], dict] = {}
    regions: dict[str, dict] = {}

    total_capacity_anhydrous = 0.0
    total_capacity_hydrated = 0.0

    for row in capacity_rows:
        state_name = row["Estado"]
        region_name = row["Região"]
        city_name = row["Município"]
        anhydrous, hydrated, total = sum_capacity(row)

        total_capacity_anhydrous += anhydrous
        total_capacity_hydrated += hydrated

        state = states.setdefault(
            state_name,
            {
                "state": state_name,
                "region": region_name,
                "plants": 0,
                "municipalities": set(),
                "capacityAnhydrous": 0.0,
                "capacityHydrated": 0.0,
                "capacityTotal": 0.0,
                "productionAnhydrous": 0.0,
                "productionHydrated": 0.0,
                "productionTotal": 0.0,
                "feedstockTotal": 0.0,
            },
        )
        state["plants"] += 1
        state["municipalities"].add(city_name)
        state["capacityAnhydrous"] += anhydrous
        state["capacityHydrated"] += hydrated
        state["capacityTotal"] += total

        municipality_key = (city_name, state_name)
        municipality = municipalities.setdefault(
            municipality_key,
            {
                "city": city_name,
                "state": state_name,
                "region": region_name,
                "plants": 0,
                "capacityTotal": 0.0,
            },
        )
        municipality["plants"] += 1
        municipality["capacityTotal"] += total

        region = regions.setdefault(
            region_name,
            {
                "region": region_name,
                "plants": 0,
                "states": set(),
                "capacityTotal": 0.0,
                "productionTotal": 0.0,
            },
        )
        region["plants"] += 1
        region["states"].add(state_name)
        region["capacityTotal"] += total

    state_lookup = {item["state"]: item for item in states.values()}

    total_production_anhydrous = 0.0
    total_production_hydrated = 0.0

    for row in production_rows:
        state_name = row["Estado"]
        region_name = row["Região"]
        hydrated = parse_number(row["Produção Etanol Hidratado(m³)"])
        anhydrous = parse_number(row["Produção Etanol Anidro (m³)"])
        total = hydrated + anhydrous

        total_production_hydrated += hydrated
        total_production_anhydrous += anhydrous

        state = state_lookup.setdefault(
            state_name,
            {
                "state": state_name,
                "region": region_name,
                "plants": 0,
                "municipalities": set(),
                "capacityAnhydrous": 0.0,
                "capacityHydrated": 0.0,
                "capacityTotal": 0.0,
                "productionAnhydrous": 0.0,
                "productionHydrated": 0.0,
                "productionTotal": 0.0,
                "feedstockTotal": 0.0,
            },
        )
        state["productionHydrated"] += hydrated
        state["productionAnhydrous"] += anhydrous
        state["productionTotal"] += total

        region = regions.setdefault(
            region_name,
            {
                "region": region_name,
                "plants": 0,
                "states": set(),
                "capacityTotal": 0.0,
                "productionTotal": 0.0,
            },
        )
        region["productionTotal"] += total

    feedstocks: dict[str, dict] = defaultdict(
        lambda: {"product": "", "amount": 0.0, "states": set()}
    )
    total_feedstock = 0.0

    for row in feedstock_rows:
        product_name = row["Produto"]
        amount = parse_number(row["Quantidade Processada (t)"])
        total_feedstock += amount

        item = feedstocks[product_name]
        item["product"] = product_name
        item["amount"] += amount
        item["states"].add(row["Estado"])

        state = state_lookup.setdefault(
            row["Estado"],
            {
                "state": row["Estado"],
                "region": row["Região"],
                "plants": 0,
                "municipalities": set(),
                "capacityAnhydrous": 0.0,
                "capacityHydrated": 0.0,
                "capacityTotal": 0.0,
                "productionAnhydrous": 0.0,
                "productionHydrated": 0.0,
                "productionTotal": 0.0,
                "feedstockTotal": 0.0,
            },
        )
        state["feedstockTotal"] += amount

    top_plants = sorted(
        (
            {
                "company": row["Razão Social"],
                "city": row["Município"],
                "state": row["Estado"],
                "region": row["Região"],
                "capacityAnhydrous": sum_capacity(row)[0],
                "capacityHydrated": sum_capacity(row)[1],
                "capacityTotal": sum_capacity(row)[2],
            }
            for row in capacity_rows
        ),
        key=lambda item: item["capacityTotal"],
        reverse=True,
    )[:8]

    top_municipalities = sorted(
        (
            {
                "city": item["city"],
                "state": item["state"],
                "region": item["region"],
                "plants": item["plants"],
                "capacityTotal": item["capacityTotal"],
            }
            for item in municipalities.values()
        ),
        key=lambda item: item["capacityTotal"],
        reverse=True,
    )[:8]

    ranked_states = sorted(
        ({**item, "municipalitiesCount": len(item["municipalities"])} for item in state_lookup.values()),
        key=lambda item: item["capacityTotal"],
        reverse=True,
    )

    ranked_regions = sorted(
        (
            {
                "region": item["region"],
                "plants": item["plants"],
                "statesCount": len(item["states"]),
                "capacityTotal": item["capacityTotal"],
                "productionTotal": item["productionTotal"],
            }
            for item in regions.values()
        ),
        key=lambda item: item["capacityTotal"],
        reverse=True,
    )

    ranked_feedstocks = sorted(
        (
            {
                "product": item["product"],
                "amount": item["amount"],
                "statesCount": len(item["states"]),
            }
            for item in feedstocks.values()
        ),
        key=lambda item: item["amount"],
        reverse=True,
    )

    return {
        "referencePeriods": {
            "capacity": capacity_period,
            "production": production_period,
            "feedstocks": feedstock_period,
        },
        "summary": {
            "plants": len(capacity_rows),
            "states": len(ranked_states),
            "municipalities": len(municipalities),
            "totalCapacity": round(total_capacity_anhydrous + total_capacity_hydrated, 2),
            "capacityAnhydrous": round(total_capacity_anhydrous, 2),
            "capacityHydrated": round(total_capacity_hydrated, 2),
            "totalProduction": round(total_production_anhydrous + total_production_hydrated, 2),
            "productionAnhydrous": round(total_production_anhydrous, 2),
            "productionHydrated": round(total_production_hydrated, 2),
            "totalFeedstock": round(total_feedstock, 2),
        },
        "states": ranked_states,
        "regions": ranked_regions,
        "feedstocks": ranked_feedstocks,
        "topPlants": top_plants,
        "topMunicipalities": top_municipalities,
    }


def get_etanol_card_resumo() -> dict:
    """Retorna o card-resumo com KPIs gerais do setor."""
    dashboard = _get_etanol_dashboard()
    return {
        "referencePeriods": dashboard["referencePeriods"],
        "summary": dashboard["summary"],
    }


def get_etanol_card_estados() -> dict:
    """Retorna o card de ranking dos estados com maior capacidade."""
    dashboard = _get_etanol_dashboard()
    return {
        "title": "Estados com maior capacidade",
        "period": dashboard["referencePeriods"]["capacity"],
        "items": [
            {
                "state": item["state"],
                "region": item["region"],
                "plants": item["plants"],
                "capacityTotal": item["capacityTotal"],
                "productionTotal": item["productionTotal"],
            }
            for item in dashboard["states"][:8]
        ],
    }


def get_etanol_card_mapa() -> dict:
    """Retorna os agregados estaduais consumidos pelo mapa do dashboard."""
    dashboard = _get_etanol_dashboard()
    return {
        "title": "Mapa de etanol por estado",
        "periods": dashboard["referencePeriods"],
        "items": [
            {
                "state": item["state"],
                "region": item["region"],
                "plants": item["plants"],
                "capacityTotal": item["capacityTotal"],
                "productionTotal": item["productionTotal"],
            }
            for item in dashboard["states"]
        ],
    }


def get_etanol_card_regioes() -> dict:
    """Retorna os agregados por região do último período."""
    dashboard = _get_etanol_dashboard()
    return {
        "title": "Capacidade por região",
        "period": dashboard["referencePeriods"]["capacity"],
        "items": dashboard["regions"],
    }


def get_etanol_card_materias_primas() -> dict:
    """Retorna o card das matérias-primas processadas no último período."""
    dashboard = _get_etanol_dashboard()
    return {
        "title": "Matérias-primas processadas",
        "period": dashboard["referencePeriods"]["feedstocks"],
        "items": dashboard["feedstocks"],
    }


def get_etanol_card_usinas() -> dict:
    """Retorna o ranking das usinas com maior capacidade instalada."""
    dashboard = _get_etanol_dashboard()
    return {
        "title": "Usinas com maior capacidade",
        "period": dashboard["referencePeriods"]["capacity"],
        "items": dashboard["topPlants"],
    }
