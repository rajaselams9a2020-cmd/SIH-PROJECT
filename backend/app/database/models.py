import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer", nullable=False)  # farmer, officer, admin
    language = Column(String(10), default="en", nullable=False)
    state = Column(String(50), default="Tamil Nadu")
    district = Column(String(50), default="Chengalpattu")
    block = Column(String(50), default="Tambaram")
    panchayat = Column(String(50), default="Kadaperi")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    alerts = relationship("Alert", back_populates="user")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(50), index=True, nullable=False)
    district = Column(String(50), index=True, nullable=False)
    block = Column(String(50), index=True, nullable=False)
    panchayat = Column(String(50), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    weather_records = relationship("WeatherData", back_populates="location")
    predictions = relationship("Prediction", back_populates="location")
    advisories = relationship("Advisory", back_populates="location")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    tamil_name = Column(String(100), nullable=False)
    sowing_month = Column(String(100), nullable=False)
    optimal_rainfall = Column(Float, nullable=False)  # mm/season
    rainfall_tolerance = Column(Float, nullable=False)
    dry_spell_tolerance = Column(Integer, nullable=False)  # consecutive dry days
    heavy_rain_tolerance = Column(Float, nullable=False)  # mm/day

    advisories = relationship("Advisory", back_populates="crop")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    date = Column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    rainfall = Column(Float, default=0.0)  # mm
    temperature = Column(Float, default=30.0)  # °C
    humidity = Column(Float, default=65.0)  # %
    soil_moisture = Column(Float, default=45.0)  # %
    wind_speed = Column(Float, default=12.0)  # km/h

    location = relationship("Location", back_populates="weather_records")


class ClimateIndex(Base):
    __tablename__ = "climate_indices"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), index=True, nullable=False)
    enso = Column(String(50), nullable=False)  # e.g., Neutral, Weak El Niño
    iod = Column(String(50), nullable=False)   # e.g., Neutral, Positive
    mjo_phase = Column(Integer, nullable=False)  # 1 to 8
    enso_index = Column(Float, default=0.0)     # ONI value (-2.0 to +2.0)
    iod_index = Column(Float, default=0.0)      # DMI value (-1.0 to +1.0)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    prediction_date = Column(String(10), index=True, nullable=False)  # Date model ran
    forecast_day = Column(Integer, nullable=False)  # 1 to 30
    onset_probability = Column(Float, nullable=False)  # 0 to 100%
    dry_spell_probability = Column(Float, nullable=False)  # 0 to 100%
    heavy_rain_probability = Column(Float, nullable=False)  # 0 to 100%
    rainfall_prediction = Column(Float, nullable=False)  # expected mm
    confidence = Column(Float, nullable=False)  # 0 to 100%

    location = relationship("Location", back_populates="predictions")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), index=True, nullable=True)
    advisory_type = Column(String(50), nullable=False)  # Sowing, Irrigation, Pest, Fertilizer, Harvest
    message = Column(Text, nullable=False)
    tamil_message = Column(Text, nullable=False)
    severity = Column(String(20), default="MODERATE")  # LOW, MODERATE, HIGH, CRITICAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("Location", back_populates="advisories")
    crop = relationship("Crop", back_populates="advisories")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    alert_type = Column(String(50), nullable=False)  # monsoon_onset, dry_spell, heavy_rain, sowing, irrigation
    status = Column(String(20), default="active")  # active, dismissed, sent
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alerts")
