from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "farmer"  # farmer, officer, admin
    language: Optional[str] = "en"
    state: Optional[str] = "Tamil Nadu"
    district: Optional[str] = "Chengalpattu"
    block: Optional[str] = "Tambaram"
    panchayat: Optional[str] = "Kadaperi"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    language: str
    state: Optional[str] = None
    district: Optional[str] = None
    block: Optional[str] = None
    panchayat: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    block: Optional[str] = None
    panchayat: Optional[str] = None
