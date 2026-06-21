def is_charging_desert(opportunity_score, nearby_chargers):
    """
    Determines whether a location is an EV charging desert.

    Criteria:
    - Very high opportunity score (90+)
    - No existing charger within 1.5 km

    Returns:
        bool
    """

    return opportunity_score >= 90 and nearby_chargers == 0