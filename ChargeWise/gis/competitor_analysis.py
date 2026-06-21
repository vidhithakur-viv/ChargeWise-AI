def clean_operator_name(operator):
    if operator is None:
        return "Unknown"

    operator = str(operator).lower()

    if "ather" in operator:
        return "Ather"
    if "tata" in operator:
        return "Tata Power"
    if "bescom" in operator:
        return "BESCOM"
    if "eesl" in operator:
        return "EESL"
    if "chargezone" in operator:
        return "ChargeZone"

    return "Others"


def build_competitor_summary(chargers_gdf):
    if chargers_gdf.empty:
        return {
            "city": "bengaluru",
            "operators": []
        }

    if "operator" not in chargers_gdf.columns:
        chargers_gdf["operator"] = "Unknown"

    chargers_gdf["clean_operator"] = chargers_gdf["operator"].apply(clean_operator_name)

    counts = chargers_gdf["clean_operator"].value_counts()
    total = int(counts.sum())

    operators = []

    for name, count in counts.items():
        operators.append({
            "name": name,
            "chargers": int(count),
            "market_share": round((count / total) * 100, 2)
        })

    return {
        "city": "bengaluru",
        "total_chargers": total,
        "operators": operators
    }