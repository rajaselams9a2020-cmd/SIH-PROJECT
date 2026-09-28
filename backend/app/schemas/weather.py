from typing import List, Optional
from pydantic import BaseModel

class WeatherRecordSchema(BaseModel):
    id: Optional[int] = None
    date: str
    rainfall: float
    temperature: float
    humidity: float
    soil_moisture: float
    wind_speed: float

    class Config:
        from_attributes = True

class WeatherCurrentOut(BaseModel):
    location_id: int
    date: str
    temperature: float
    humidity: float
    soil_moisture: float
    wind_speed: float
    today_rainfall: float
    rainfall_last_7days: float
    rainfall_last_14days: float
    rainfall_last_30days: float
    rainfall_anomaly: float
    consecutive_dry_days: int
    consecutive_wet_days: int
    status: str

class ClimateIndexOut(BaseModel):
    date: str
    enso: str
    enso_index: float
    enso_impact: str
    iod: str
    iod_index: float
    iod_impact: str
    mjo_phase: int
    mjo_impact: str
    climate_signal_score: float
    description: str

class WeatherHistoryOut(BaseModel):
    location_id: int
    records: List[WeatherRecordSchema]
    historical_avg_daily_rain: float
