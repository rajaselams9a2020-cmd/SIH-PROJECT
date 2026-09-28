from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..schemas.advisory import AdvisoryOut, AdvisoryGenerateRequest, SowingWindowOut
from ..services.advisory_service import generate_crop_advisory, get_sowing_window

router = APIRouter(prefix="/api/advisories", tags=["Crop Advisories"])

@router.get("/{location_id}", response_model=AdvisoryOut)
def get_advisory(location_id: int, crop_id: Optional[int] = Query(default=1), db: Session = Depends(get_db)):
    return generate_crop_advisory(location_id, crop_id or 1, db)

@router.post("/generate", response_model=AdvisoryOut)
def generate_advisory_post(req: AdvisoryGenerateRequest, db: Session = Depends(get_db)):
    return generate_crop_advisory(req.location_id, req.crop_id or 1, db)

@router.get("/sowing-window/{location_id}", response_model=SowingWindowOut)
def get_sowing_window_route(location_id: int, crop_id: Optional[int] = Query(default=1), db: Session = Depends(get_db)):
    return get_sowing_window(location_id, crop_id or 1, db)
