from typing import List, Optional
from pydantic import BaseModel

class LocationBase(BaseModel):
    state: str
    district: str
    block: str
    panchayat: str
    latitude: float
    longitude: float

class LocationOut(LocationBase):
    id: int

    class Config:
        from_attributes = True

class CropOut(BaseModel):
    id: int
    name: str
    tamil_name: str
    sowing_month: str
    optimal_rainfall: float
    rainfall_tolerance: float
    dry_spell_tolerance: int
    heavy_rain_tolerance: float

    class Config:
        from_attributes = True
