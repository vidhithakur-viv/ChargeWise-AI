from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import generate_copilot_response

router = APIRouter(prefix="/api", tags=["AI Copilot"])


class CopilotRequest(BaseModel):
    city: str
    question: str


@router.post("/copilot")
def copilot(data: CopilotRequest):
    return generate_copilot_response(data.city, data.question)