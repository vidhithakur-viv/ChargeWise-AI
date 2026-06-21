def calculate_roi(data):
    chargers = data.chargers
    price_per_kwh = data.price_per_kwh
    sessions_per_day = data.sessions_per_day
    avg_kwh_per_session = data.avg_kwh_per_session
    setup_cost_per_charger = data.setup_cost_per_charger

    if chargers <= 0:
        return {"error": "Number of chargers must be greater than 0"}

    if price_per_kwh <= 0:
        return {"error": "Price per kWh must be greater than 0"}

    if sessions_per_day <= 0:
        return {"error": "Sessions per day must be greater than 0"}

    if avg_kwh_per_session <= 0:
        return {"error": "Average kWh per session must be greater than 0"}

    if setup_cost_per_charger <= 0:
        return {"error": "Setup cost per charger must be greater than 0"}

    daily_revenue = chargers * sessions_per_day * avg_kwh_per_session * price_per_kwh
    monthly_revenue = daily_revenue * 30
    yearly_revenue = monthly_revenue * 12

    total_setup_cost = chargers * setup_cost_per_charger

    payback_months = round(total_setup_cost / monthly_revenue, 1)

    roi_percentage = round(
        ((yearly_revenue - total_setup_cost) / total_setup_cost) * 100,
        2
    )

    five_year_revenue = yearly_revenue * 5
    five_year_profit = five_year_revenue - total_setup_cost
    five_year_return_multiplier = round(five_year_revenue / total_setup_cost, 2)

    return {
        "chargers": chargers,
        "price_per_kwh": price_per_kwh,
        "sessions_per_day": sessions_per_day,
        "avg_kwh_per_session": avg_kwh_per_session,
        "setup_cost_per_charger": setup_cost_per_charger,
        "daily_revenue": round(daily_revenue, 2),
        "monthly_revenue": round(monthly_revenue, 2),
        "yearly_revenue": round(yearly_revenue, 2),
        "total_setup_cost": round(total_setup_cost, 2),
        "payback_months": payback_months,
        "roi_percentage": roi_percentage,
        "five_year_revenue": round(five_year_revenue, 2),
        "five_year_profit": round(five_year_profit, 2),
        "five_year_return_multiplier": five_year_return_multiplier,
    }