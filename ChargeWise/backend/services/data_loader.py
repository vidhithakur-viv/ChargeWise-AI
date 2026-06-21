import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"


def load_json(filename):
    file_path = PROCESSED_DATA_DIR / filename

    if not file_path.exists():
        return {
            "error": f"{filename} not found. Run python gis/preprocess.py first."
        }

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def get_cities():
    return {
        "cities": [
            {
                "id": "bengaluru",
                "name": "Bengaluru",
                "state": "Karnataka",
                "center": [12.9716, 77.5946],
            }
        ]
    }


def get_heatmap(city: str):
    return load_json("heatmap.json")


def get_deserts(city: str):
    return load_json("deserts.json")


def get_recommendations(city: str):
    return load_json("recommendations.json")


def get_competitors(city: str):
    return load_json("competitors.json")