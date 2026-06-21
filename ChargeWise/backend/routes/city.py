from fastapi import APIRouter
from services.data_loader import (
    get_cities,
    get_heatmap,
    get_deserts,
    get_recommendations,
    get_competitors,
)

router = APIRouter(prefix="/api", tags=["City Data"])


@router.get("/cities")
def cities():
    return get_cities()


@router.get("/heatmap/{city}")
def heatmap(city: str):
    return get_heatmap(city)


@router.get("/deserts/{city}")
def deserts(city: str):
    return get_deserts(city)


@router.get("/recommendations/{city}")
def recommendations(city: str):
    return get_recommendations(city)


@router.get("/competitors/{city}")
def competitors(city: str):
    return get_competitors(city)