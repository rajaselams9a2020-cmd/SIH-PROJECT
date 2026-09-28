from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class AdvisoryOut(BaseModel):
    id: Optional[int] = None
    location_id: int
    crop_id: Optional[int] = None
    crop_name: Optional[str] = None
    crop_tamil_name: Optional[str] = None
    advisory_type: str
    message: str
    tamil_message: str
    severity: str  # LOW, MODERATE, HIGH, CRITICAL
    action_items: List[str]
    tamil_action_items: List[str]
    created_at: Optional[datetime] = None

class SowingWindowOut(BaseModel):
    crop_name: str
    tamil_crop_name: str
    current_status: str
    recommended_start_date: str
    recommended_end_date: str
    risk_level: str
    confidence: float
    reason: str
    tamil_reason: str
    action_checklist: List[str]
    tamil_checklist: List[str]

class AdvisoryGenerateRequest(BaseModel):
    location_id: int
    crop_id: Optional[int] = 1

class AlertOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    message: str
    language: str
    alert_type: str  # monsoon_onset, dry_spell, heavy_rain, sowing, irrigation
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertCreateRequest(BaseModel):
    location_id: Optional[int] = None
    block: Optional[str] = None
    district: Optional[str] = None
    title: str
    message: str
    language: Optional[str] = "en"
    alert_type: str = "dry_spell"

class AlertDismissRequest(BaseModel):
    alert_id: int
