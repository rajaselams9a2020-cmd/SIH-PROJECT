from typing import List, Optional
from pydantic import BaseModel

class PredictionDayOut(BaseModel):
    date: str
    day: int
    rainfall: float
    historical_avg: float
    onset_probability: float
    dry_spell_probability: float
    heavy_rain_probability: float
    confidence: float

class PredictionSummaryOut(BaseModel):
    location_id: int
    location_name: str
    prediction_date: str
    horizon_days: int
    onset_probability: float
    dry_spell_probability: float
    heavy_rain_probability: float
    expected_rainfall: float
    confidence: float
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    risk_color: str
    model_name: str
    last_updated: str
    disclaimer: str

class RiskMapPointOut(BaseModel):
    location_id: int
    state: str
    district: str
    block: str
    panchayat: str
    latitude: float
    longitude: float
    onset_probability: float
    dry_spell_probability: float
    heavy_rain_probability: float
    expected_rainfall: float
    confidence: float
    risk_level: str
    risk_color: str
    farmer_count: int
    recommended_action: str
    tamil_action: str
