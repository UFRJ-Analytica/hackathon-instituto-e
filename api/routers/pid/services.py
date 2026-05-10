"""Camada de transformação de dados da PID usando APIs oficiais em tempo real."""

from __future__ import annotations

import csv
import gzip
import io
import json
import time
from typing import Any, Callable, TypeVar
from urllib.request import Request, urlopen


T = TypeVar("T")

SIDRA_2021_URL = "https://apisidra.ibge.gov.br/values/t/5938/n6/all/v/517,37/p/2021"
IBGE_MALHA_URL = (
    "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR"
    "?intrarregiao=municipio&qualidade=minima&formato=application/vnd.geo+json"
)
ANEEL_SIGA_DIARIO_URL = (
    "https://dadosabertos.aneel.gov.br/dataset/6d90b77c-c5f5-4d81-bdec-7bc619494bb9/"
    "resource/2f65a1b0-19b8-4360-8238-b34ab4693d55/download/"
    "siga-empreendimentos-geracao-diario.csv"
)

REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Encoding": "gzip",
}
TTL_SECONDS = 60 * 30

_CACHE: dict[str, tuple[float, Any]] = {}

SIDRA_VARIABLES = {
    "37": "pib",
    "517": "industry_vab",
}


def _get_cached(key: str, loader: Callable[[], T], ttl_seconds: int = TTL_SECONDS) -> T:
    now = time.time()
    cached = _CACHE.get(key)
    if cached and cached[0] > now:
        return cached[1]

    value = loader()
    _CACHE[key] = (now + ttl_seconds, value)
    return value


def _download_bytes(url: str) -> bytes:
    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=180) as response:
        body = response.read()
        encoding = response.headers.get("Content-Encoding", "")
        if encoding == "gzip" or body[:2] == b"\x1f\x8b":
            return gzip.decompress(body)
        return body


def _download_json(url: str) -> Any:
    return json.loads(_download_bytes(url).decode("utf-8"))


def _download_csv_rows(url: str, encoding: str = "latin-1") -> list[dict[str, str]]:
    text_stream = io.StringIO(_download_bytes(url).decode(encoding))
    reader = csv.DictReader(text_stream, delimiter=";")
    return [dict(row) for row in reader]


def _parse_sidra_number(raw_value: str) -> float | None:
    if raw_value in {"...", "..", "-", "X", ""}:
        return None

    normalized = raw_value.replace(".", "").replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        return None


def _split_city_and_state(label: str) -> tuple[str, str]:
    if " - " not in label:
        return label, ""
    city, state = label.rsplit(" - ", 1)
    return city, state


def _iter_coordinates(geometry: dict[str, Any]) -> list[tuple[float, float]]:
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates", [])
    points: list[tuple[float, float]] = []

    if geometry_type == "Polygon":
        for ring in coordinates:
            for lon, lat in ring:
                points.append((float(lon), float(lat)))
        return points

    if geometry_type == "MultiPolygon":
        for polygon in coordinates:
            for ring in polygon:
                for lon, lat in ring:
                    points.append((float(lon), float(lat)))
        return points

    return points


def _geometry_centroid(geometry: dict[str, Any]) -> tuple[float, float]:
    points = _iter_coordinates(geometry)
    if not points:
        return (0.0, 0.0)

    min_lon = min(point[0] for point in points)
    max_lon = max(point[0] for point in points)
    min_lat = min(point[1] for point in points)
    max_lat = max(point[1] for point in points)
    return ((min_lat + max_lat) / 2, (min_lon + max_lon) / 2)


def _parse_decimal(raw_value: str) -> float | None:
    value = raw_value.strip()
    if not value:
        return None

    normalized = value.replace(".", "").replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        return None


def _classify_source_group(source_name: str) -> str:
    name = source_name.lower()

    if "vento" in name:
        return "Eólica"

    if "biogás" in name or "biogas" in name:
        return "Biogás/Biometano"

    if any(
        term in name
        for term in [
            "bagaço",
            "resíduos florestais",
            "lenha",
            "casca de arroz",
            "licor negro",
            "capim elefante",
            "carvão vegetal",
            "óleos vegetais",
            "etanol",
            "biomassa",
        ]
    ):
        return "Biomassa"

    if "radiação solar" in name or "solar" in name:
        return "Solar"

    if "hidráulico" in name:
        return "Hidrelétrica"

    return "Outras"


def _load_sidra_metrics() -> tuple[str, dict[str, dict[str, Any]]]:
    rows = _get_cached("sidra-2021", lambda: _download_json(SIDRA_2021_URL))
    metrics_by_city: dict[str, dict[str, Any]] = {}
    year = ""

    for row in rows[1:]:
        city_code = row["D1C"]
        metric_name = SIDRA_VARIABLES.get(row["D2C"])
        if metric_name is None:
            continue

        city_name, state = _split_city_and_state(row["D1N"])
        year = row["D3N"]

        city_metrics = metrics_by_city.setdefault(
            city_code,
            {
                "code": city_code,
                "name": city_name,
                "state": state,
                "industry_vab": None,
                "pib": None,
            },
        )
        city_metrics[metric_name] = _parse_sidra_number(row["V"])

    for metrics in metrics_by_city.values():
        pib = metrics["pib"]
        industry_vab = metrics["industry_vab"]
        if pib and industry_vab is not None:
            metrics["industry_share"] = (industry_vab / pib) * 100
        else:
            metrics["industry_share"] = None

    return year, metrics_by_city


def get_pid_industrial_map() -> dict[str, Any]:
    year, metrics_by_city = _load_sidra_metrics()
    malha = _get_cached("ibge-malha-municipios", lambda: _download_json(IBGE_MALHA_URL))

    feature_collection: dict[str, Any] = {
        "type": "FeatureCollection",
        "features": [],
    }

    national_industry_vab = 0.0
    covered_municipalities = 0
    state_totals: dict[str, float] = {}
    ranked_municipalities: list[dict[str, Any]] = []

    for feature in malha.get("features", []):
        properties = feature.get("properties", {})
        municipality_code = str(properties.get("codarea", ""))
        metrics = metrics_by_city.get(municipality_code)
        if metrics is None:
            continue

        industry_vab = metrics["industry_vab"]
        pib = metrics["pib"]
        industry_share = metrics["industry_share"]

        if industry_vab is not None:
            national_industry_vab += industry_vab
            state_totals[metrics["state"]] = (
                state_totals.get(metrics["state"], 0.0) + industry_vab
            )

        if pib is not None:
            covered_municipalities += 1

        centroid_lat, centroid_lon = _geometry_centroid(feature["geometry"])
        ranked_municipalities.append(
            {
                "code": municipality_code,
                "name": metrics["name"],
                "state": metrics["state"],
                "industryVab": industry_vab,
                "pib": pib,
                "industryShare": industry_share,
                "lat": centroid_lat,
                "lon": centroid_lon,
            }
        )

        feature_collection["features"].append(
            {
                "type": "Feature",
                "geometry": feature["geometry"],
                "properties": {
                    "code": municipality_code,
                    "name": metrics["name"],
                    "state": metrics["state"],
                    "industryVab": industry_vab,
                    "pib": pib,
                    "industryShare": industry_share,
                    "year": year,
                },
            }
        )

    ranked_municipalities.sort(
        key=lambda item: item["industryVab"] if item["industryVab"] is not None else -1,
        reverse=True,
    )

    top_states = sorted(
        (
            {
                "state": state,
                "industryVab": total,
            }
            for state, total in state_totals.items()
        ),
        key=lambda item: item["industryVab"],
        reverse=True,
    )[:10]

    top_municipalities = ranked_municipalities[:20]
    top_share_municipalities = sorted(
        (
            item
            for item in ranked_municipalities
            if item["industryShare"] is not None and item["pib"] and item["pib"] > 0
        ),
        key=lambda item: item["industryShare"],
        reverse=True,
    )[:20]

    return {
        "title": "Mapa da industrialização brasileira",
        "subtitle": "Valor adicionado bruto da indústria por município com base oficial do IBGE/SIDRA.",
        "year": year,
        "sources": [
            "IBGE SIDRA tabela 5938 — PIB dos Municípios (consulta ao vivo, 2021)",
            "IBGE API de malhas geográficas — municípios, qualidade mínima",
        ],
        "summary": {
            "coveredMunicipalities": covered_municipalities,
            "nationalIndustryVab": national_industry_vab,
            "topState": top_states[0]["state"] if top_states else None,
            "topMunicipality": top_municipalities[0]["name"] if top_municipalities else None,
        },
        "topStates": top_states,
        "topMunicipalities": top_municipalities,
        "topIndustryShareMunicipalities": top_share_municipalities,
        "featureCollection": feature_collection,
    }


def get_industries_generation_assets() -> dict[str, Any]:
    rows = _get_cached(
        "aneel-siga-diario",
        lambda: _download_csv_rows(ANEEL_SIGA_DIARIO_URL),
        ttl_seconds=60 * 10,
    )

    points: list[dict[str, Any]] = []
    source_group_stats: dict[str, dict[str, Any]] = {}
    phases: set[str] = set()
    states: set[str] = set()
    updated_at = ""

    for row in rows:
        updated_at = row.get("DatGeracaoConjuntoDados", updated_at)
        source_name = (
            row.get("NomFonteCombustivel")
            or row.get("DscFonteCombustivel")
            or row.get("SigTipoGeracao")
            or "Não informado"
        )
        phase = row.get("DscFaseUsina", "Não informada")
        state = row.get("SigUFPrincipal", "")
        lat = _parse_decimal(row.get("NumCoordNEmpreendimento", ""))
        lon = _parse_decimal(row.get("NumCoordEEmpreendimento", ""))
        power_kw = _parse_decimal(row.get("MdaPotenciaFiscalizadaKw", "")) or 0.0

        if lat is None or lon is None or not state:
            continue

        source_group = _classify_source_group(source_name)
        phases.add(phase)
        states.add(state)

        stats = source_group_stats.setdefault(
            source_group,
            {"group": source_group, "count": 0, "capacityKw": 0.0},
        )
        stats["count"] += 1
        stats["capacityKw"] += power_kw

        points.append(
            {
                "id": row.get("CodCEG")
                or row.get("IdeNucleoCEG")
                or row.get("NomEmpreendimento"),
                "name": row.get("NomEmpreendimento", "Sem nome"),
                "state": state,
                "municipalities": row.get("DscMuninicpios", ""),
                "sourceName": source_name,
                "sourceGroup": source_group,
                "phase": phase,
                "generationType": row.get("SigTipoGeracao", ""),
                "powerKw": power_kw,
                "lat": lat,
                "lon": lon,
            }
        )

    points.sort(key=lambda item: item["powerKw"], reverse=True)
    source_group_totals = sorted(
        source_group_stats.values(),
        key=lambda item: item["capacityKw"],
        reverse=True,
    )

    return {
        "title": "Ativos energéticos e industriais mapeados",
        "subtitle": (
            "Empreendimentos do SIGA/ANEEL com filtros por tipo de fonte, fase e localização."
        ),
        "updatedAt": updated_at,
        "filters": {
            "sourceGroups": [item["group"] for item in source_group_totals],
            "phases": sorted(phases),
            "states": sorted(states),
        },
        "summary": {
            "totalAssets": len(points),
            "totalCapacityKw": sum(item["powerKw"] for item in points),
            "sourceGroupTotals": source_group_totals,
        },
        "points": points,
    }
