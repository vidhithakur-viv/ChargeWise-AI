def calculate_opportunity_score(poi_count, charger_count, road_distance_m):
    """
    Calculates stricter EV charging opportunity score for a Bengaluru zone.

    Score is based on:
    1. Urban demand proxy: nearby POIs
    2. Charging gap: nearby EV chargers
    3. Road accessibility: distance to nearest road

    Final score range: 0-90
    """

    # POI demand score
    if poi_count >= 300:
        poi_score = 35
    elif poi_count >= 200:
        poi_score = 30
    elif poi_count >= 120:
        poi_score = 24
    elif poi_count >= 60:
        poi_score = 18
    elif poi_count >= 20:
        poi_score = 10
    else:
        poi_score = 4

    # Charger gap score
    if charger_count == 0:
        charger_gap_score = 25
    elif charger_count <= 2:
        charger_gap_score = 15
    elif charger_count <= 5:
        charger_gap_score = 8
    else:
        charger_gap_score = 2

    # Road access score
    if road_distance_m <= 50:
        road_score = 18
    elif road_distance_m <= 150:
        road_score = 14
    elif road_distance_m <= 300:
        road_score = 10
    elif road_distance_m <= 700:
        road_score = 5
    else:
        road_score = 1

    final_score = poi_score + charger_gap_score + road_score

    return min(round(final_score, 2), 90)
