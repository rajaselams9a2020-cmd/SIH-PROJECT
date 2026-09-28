from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..schemas.weather import WeatherCurrentOut, WeatherHistoryOut, ClimateIndexOut
from ..services.weather_service import get_current_weather, get_weather_history, get_climate_indices

router = APIRouter(prefix="/api/weather", tags=["Weather"])
climate_router = APIRouter(prefix="/api/climate", tags=["Climate Indices"])

@router.get("/current/{location_id}", response_model=WeatherCurrentOut)
def current_weather(location_id: int, db: Session = Depends(get_db)):
    return get_current_weather(location_id, db)

@router.get("/history/{location_id}", response_model=WeatherHistoryOut)
def weather_history(location_id: int, db: Session = Depends(get_db)):
    return get_weather_history(location_id, db)

@climate_router.get("/indices", response_model=ClimateIndexOut)
def climate_indices(db: Session = Depends(get_db)):
    return get_climate_indices(db)

# Also expose under /api/weather/climate-indices for convenience
@router.get("/indices", response_model=ClimateIndexOut)
def climate_indices_alt(db: Session = Depends(get_db)):
    return get_climate_indices(db)
