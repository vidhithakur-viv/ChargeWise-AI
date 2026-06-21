from services.data_loader import get_recommendations, get_deserts


def generate_copilot_response(city: str, question: str):
    question_lower = question.lower()

    recommendations = get_recommendations(city)["recommendations"]
    deserts = get_deserts(city)["deserts"]

    if "best" in question_lower or "recommend" in question_lower:
        top = recommendations[0]
        answer = (
            f"The best recommended location is {top['location']} with an opportunity score "
            f"of {top['score']}/100. It is expected to generate around "
            f"{top['expected_daily_sessions']} daily sessions and has an estimated ROI of "
            f"{top['estimated_roi']}%."
        )

    elif "desert" in question_lower or "underserved" in question_lower:
        top_desert = deserts[0]
        answer = (
            f"{top_desert['name']} is a major charging desert. It has a demand score of "
            f"{top_desert['demand_score']}/100 but has {top_desert['existing_chargers']} "
            f"existing chargers nearby. Reason: {top_desert['reason']}."
        )

    elif "roi" in question_lower:
        top = recommendations[0]
        answer = (
            f"{top['location']} has the strongest ROI potential with an estimated ROI of "
            f"{top['estimated_roi']}% and payback period of {top['payback_months']} months."
        )

    else:
        answer = (
            "ChargeWise AI analyzes EV demand, existing charger availability, competitor presence, "
            "and ROI potential to recommend the best charging station locations."
        )

    return {
        "city": city,
        "question": question,
        "answer": answer,
    }