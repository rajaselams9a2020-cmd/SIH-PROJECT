from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..schemas.prediction import PredictionDayOut, PredictionSummaryOut, RiskMapPointOut
from ..services.prediction_service import get_30day_prediction, get_prediction_summary, get_risk_map_data

router = APIRouter(prefix="/api/predictions", tags=["Predictions & Risk Map"])
risk_map_router = APIRouter(prefix="/api/risk-map", tags=["Risk Map"])

@router.get("/summary/{location_id}", response_model=PredictionSummaryOut)
def prediction_summary(location_id: int, db: Session = Depends(get_db)):
    return get_prediction_summary(location_id, db)

@router.get("/{location_id}", response_model=List[PredictionDayOut])
def prediction_30day(location_id: int, db: Session = Depends(get_db)):
    return get_30day_prediction(location_id, db)

@risk_map_router.get("", response_model=List[RiskMapPointOut])
def risk_map(db: Session = Depends(get_db)):
    return get_risk_map_data(db)

@router.get("/risk/all", response_model=List[RiskMapPointOut])
def risk_map_alt(db: Session = Depends(get_db)):
    return get_risk_map_data(db)
