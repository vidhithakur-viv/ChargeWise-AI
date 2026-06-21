def calculate_opportunity_score(poi_count, charger_count, road_distance_m):
    """
    Calculates EV charging opportunity score for a Bengaluru zone.

    Score is based on:
    1. Urban demand proxy: nearby POIs
    2. Charging gap: nearby EV chargers
    3. Road accessibility: distance to nearest road

    Final score range: 0-100
    """

    # POI demand score
    if poi_count >= 150:
        poi_score = 45
    elif poi_count >= 80:
        poi_score = 35
    elif poi_count >= 30:
        poi_score = 25
    elif poi_count >= 10:
        poi_score = 15
    elif poi_count >= 3:
        poi_score = 8
    else:
        poi_score = 2

    # Charger gap score
    if charger_count == 0:
        charger_gap_score = 35
    elif charger_count <= 2:
        charger_gap_score = 20
    elif charger_count <= 5:
        charger_gap_score = 10
    else:
        charger_gap_score = 2

    # Road access score
    if road_distance_m <= 100:
        road_score = 20
    elif road_distance_m <= 300:
        road_score = 14
    elif road_distance_m <= 700:
        road_score = 8
    else:
        road_score = 3

    final_score = poi_score + charger_gap_score + road_score

    return min(round(final_score, 2), 100)