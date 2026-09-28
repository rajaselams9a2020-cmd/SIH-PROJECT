from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Location, Crop
from ..schemas.location import LocationOut, CropOut

router = APIRouter(prefix="/api/locations", tags=["Locations & Crops"])

@router.get("/states", response_model=List[str])
def get_states(db: Session = Depends(get_db)):
    results = db.query(Location.state).distinct().all()
    return [r[0] for r in results]

@router.get("/districts/{state}", response_model=List[str])
def get_districts(state: str, db: Session = Depends(get_db)):
    results = db.query(Location.district).filter(Location.state == state).distinct().all()
    return [r[0] for r in results]

@router.get("/blocks/{district}", response_model=List[str])
def get_blocks(district: str, db: Session = Depends(get_db)):
    results = db.query(Location.block).filter(Location.district == district).distinct().all()
    return [r[0] for r in results]

@router.get("/panchayats/{block}", response_model=List[LocationOut])
def get_panchayats(block: str, db: Session = Depends(get_db)):
    return db.query(Location).filter(Location.block == block).all()

@router.get("/all", response_model=List[LocationOut])
def get_all_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.get("/{location_id}", response_model=LocationOut)
def get_location_by_id(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc

@router.get("/crops/all", response_model=List[CropOut])
def get_crops(db: Session = Depends(get_db)):
    return db.query(Crop).all()

# Alias router for /api/crops directly
crops_router = APIRouter(prefix="/api/crops", tags=["Crops"])

@crops_router.get("", response_model=List[CropOut])
def get_crops_root(db: Session = Depends(get_db)):
    return db.query(Crop).all()
