from fastapi import APIRouter
from pydantic import BaseModel
from services.roi_engine import calculate_roi

router = APIRouter(prefix="/api", tags=["ROI"])


class ROIRequest(BaseModel):
    chargers: int
    price_per_kwh: float
    sessions_per_day: int
    avg_kwh_per_session: float = 18
    setup_cost_per_charger: float = 600000


@router.post("/roi")
def roi(data: ROIRequest):
    return calculate_roi(data)