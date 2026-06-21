from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.city import router as city_router
from routes.roi import router as roi_router
from routes.copilot import router as copilot_router

app = FastAPI(title="ChargeWise AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(city_router)
app.include_router(roi_router)
app.include_router(copilot_router)


@app.get("/")
def root():
    return {"message": "ChargeWise AI Backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}