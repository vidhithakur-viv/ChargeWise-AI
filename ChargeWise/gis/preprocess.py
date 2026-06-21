import json
from pathlib import Path

import geopandas as gpd
import numpy as np
import osmnx as ox
from shapely.geometry import Point

from demand_scoring import calculate_opportunity_score
from desert_detection import is_charging_desert
from competitor_analysis import build_competitor_summary


CITY_NAME = "Bengaluru, Karnataka, India"

BASE_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def save_json(filename, data):
    path = PROCESSED_DIR / filename
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)
    print(f"Saved: {path}")


def convert_geometry_to_centroid(gdf):
    """
    Converts mixed OSM geometries like polygons, lines, and points
    into accurate point centroids using projected CRS.
    """
    if gdf.empty:
        return gdf

    projected_crs = gdf.estimate_utm_crs()

    gdf = gdf.to_crs(projected_crs)
    gdf["geometry"] = gdf.geometry.centroid
    gdf = gdf.to_crs(epsg=4326)

    return gdf


def get_boundary():
    print("Downloading city boundary...")
    return ox.geocode_to_gdf(CITY_NAME)


def get_chargers():
    print("Downloading charging stations...")
    tags = {"amenity": "charging_station"}

    chargers = ox.features_from_place(CITY_NAME, tags)
    chargers = chargers[chargers.geometry.notnull()].copy()
    chargers = chargers.to_crs(epsg=4326)

    chargers = convert_geometry_to_centroid(chargers)

    return chargers


def get_pois():
    print("Downloading demand POIs...")

    tags = {
        "amenity": [
            "hospital",
            "college",
            "university",
            "fuel",
            "parking",
            "bus_station"
        ],
        "shop": True,
        "office": True,
        "tourism": "hotel"
    }

    pois = ox.features_from_place(CITY_NAME, tags)
    pois = pois[pois.geometry.notnull()].copy()
    pois = pois.to_crs(epsg=4326)

    pois = convert_geometry_to_centroid(pois)

    return pois


def get_roads():
    print("Downloading road network...")
    graph = ox.graph_from_place(CITY_NAME, network_type="drive")
    nodes, edges = ox.graph_to_gdfs(graph)
    return nodes.to_crs(epsg=4326)


def create_grid(boundary, spacing=0.015):
    print("Creating candidate grid points...")

    polygon = boundary.geometry.iloc[0]
    minx, miny, maxx, maxy = polygon.bounds

    points = []

    for lon in np.arange(minx, maxx, spacing):
        for lat in np.arange(miny, maxy, spacing):
            point = Point(lon, lat)
            if polygon.contains(point):
                points.append(point)

    return gpd.GeoDataFrame(geometry=points, crs="EPSG:4326")


def count_nearby(target_gdf, source_gdf, radius_m):
    if source_gdf.empty:
        return [0] * len(target_gdf)

    utm_crs = target_gdf.estimate_utm_crs()

    target_m = target_gdf.to_crs(utm_crs)
    source_m = source_gdf.to_crs(utm_crs)

    counts = []

    for point in target_m.geometry:
        buffer = point.buffer(radius_m)
        count = int(source_m[source_m.geometry.within(buffer)].shape[0])
        counts.append(count)

    return counts


def nearest_road_distance(candidates, roads):
    utm_crs = candidates.estimate_utm_crs()

    candidates_m = candidates.to_crs(utm_crs)
    roads_m = roads.to_crs(utm_crs)

    distances = []

    for point in candidates_m.geometry:
        distance = float(roads_m.distance(point).min())
        distances.append(distance)

    return distances


def calculate_recommendation_values(score, poi_count, charger_count):
    """
    Creates more realistic recommendation values using score, POI density,
    and existing charger availability.
    """

    expected_daily_sessions = max(
        round((score * 0.25) + (poi_count * 0.05) - (charger_count * 2)),
        5
    )

    recommended_chargers = max(
        min(round(expected_daily_sessions / 10), 6),
        1
    )

    estimated_roi = round(
        (score * 0.22) + (poi_count * 0.02) - (charger_count * 1.5),
        2
    )

    payback_months = max(
        round(30 - (estimated_roi * 0.45)),
        8
    )

    return expected_daily_sessions, recommended_chargers, estimated_roi, payback_months


def main():
    boundary = get_boundary()
    chargers = get_chargers()
    pois = get_pois()
    roads = get_roads()

    print(f"Chargers found: {len(chargers)}")
    print(f"POIs found: {len(pois)}")
    print(f"Road nodes found: {len(roads)}")

    candidates = create_grid(boundary)

    poi_counts = count_nearby(candidates, pois, 1000)
    charger_counts = count_nearby(candidates, chargers, 1500)
    road_distances = nearest_road_distance(candidates, roads)

    heatmap_features = []
    deserts = []
    recommendations = []

    for i, row in candidates.iterrows():
        lon = row.geometry.x
        lat = row.geometry.y

        poi_count = poi_counts[i]
        charger_count = charger_counts[i]
        road_distance = road_distances[i]

        score = calculate_opportunity_score(
            poi_count=poi_count,
            charger_count=charger_count,
            road_distance_m=road_distance
        )

        status = (
            "High Opportunity"
            if score >= 75
            else "Medium Opportunity"
            if score >= 50
            else "Low Opportunity"
        )

        location_id = f"loc_{i + 1}"

        feature = {
            "type": "Feature",
            "properties": {
                "id": location_id,
                "name": f"Bengaluru Zone {i + 1}",
                "opportunity_score": score,
                "poi_count": poi_count,
                "existing_chargers_nearby": charger_count,
                "nearest_road_distance_m": round(road_distance, 2),
                "status": status
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        }

        heatmap_features.append(feature)

        (
            expected_daily_sessions,
            recommended_chargers,
            estimated_roi,
            payback_months
        ) = calculate_recommendation_values(
            score=score,
            poi_count=poi_count,
            charger_count=charger_count
        )

        recommendations.append({
            "rank": 0,
            "location": f"Bengaluru Zone {i + 1}",
            "score": score,
            "expected_daily_sessions": expected_daily_sessions,
            "recommended_chargers": recommended_chargers,
            "estimated_roi": estimated_roi,
            "payback_months": payback_months,
            "coordinates": [lon, lat]
        })

        if is_charging_desert(score, charger_count):
            deserts.append({
                "id": f"desert_{len(deserts) + 1}",
                "name": f"Bengaluru Desert Zone {len(deserts) + 1}",
                "demand_score": score,
                "existing_chargers": charger_count,
                "reason": "High urban activity but no nearby EV charger within 1.5 km",
                "coordinates": [lon, lat]
            })

    recommendations = sorted(
        recommendations,
        key=lambda x: (
            x["score"],
            x["estimated_roi"],
            x["expected_daily_sessions"]
        ),
        reverse=True
    )[:15]

    for index, rec in enumerate(recommendations):
        rec["rank"] = index + 1

    heatmap_json = {
        "city": "bengaluru",
        "type": "FeatureCollection",
        "features": heatmap_features
    }

    deserts_json = {
        "city": "bengaluru",
        "deserts": deserts
    }

    recommendations_json = {
        "city": "bengaluru",
        "recommendations": recommendations
    }

    competitors_json = build_competitor_summary(chargers)

    save_json("heatmap.json", heatmap_json)
    save_json("deserts.json", deserts_json)
    save_json("recommendations.json", recommendations_json)
    save_json("competitors.json", competitors_json)

    print("Real GIS preprocessing completed.")


if __name__ == "__main__":
    main()