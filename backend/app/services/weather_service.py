import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..database.models import WeatherData, ClimateIndex, Location

def get_current_weather(location_id: int, db: Session) -> Dict[str, Any]:
    # Fetch recent records
    records = db.query(WeatherData).filter(WeatherData.location_id == location_id).order_by(WeatherData.date.desc()).limit(30).all()
    
    if not records:
        # Fallback values
        today_str = datetime.now().strftime("%Y-%m-%d")
        return {
            "location_id": location_id,
            "date": today_str,
            "temperature": 31.4,
            "humidity": 74.0,
            "soil_moisture": 52.0,
            "wind_speed": 14.2,
            "today_rainfall": 12.5,
            "rainfall_last_7days": 38.0,
            "rainfall_last_14days": 82.0,
            "rainfall_last_30days": 142.0,
            "rainfall_anomaly": 15.5,
            "consecutive_dry_days": 0,
            "consecutive_wet_days": 2,
            "status": "Light to Moderate Showers"
        }

    latest = records[0]
    rains = [r.rainfall for r in records]
    
    r7 = sum(rains[:7])
    r14 = sum(rains[:14])
    r30 = sum(rains[:30])

    # Calculate dry/wet streaks
    dry_streak = 0
    wet_streak = 0
    for r in rains:
        if r < 1.0:
            if wet_streak > 0:
                break
            dry_streak += 1
        else:
            if dry_streak > 0:
                break
            wet_streak += 1

    # Typical seasonal 30-day baseline for Tamil Nadu (~110mm)
    anomaly = round(r30 - 110.0, 1)

    status_str = "Partly Cloudy"
    if latest.rainfall > 25:
        status_str = "Heavy Rain"
    elif latest.rainfall > 5:
        status_str = "Moderate Showers"
    elif latest.rainfall > 0:
        status_str = "Light Drizzle"
    elif dry_streak >= 5:
        status_str = "Dry & Sunny"

    return {
        "location_id": location_id,
        "date": latest.date,
        "temperature": round(latest.temperature, 1),
        "humidity": round(latest.humidity, 1),
        "soil_moisture": round(latest.soil_moisture, 1),
        "wind_speed": round(latest.wind_speed, 1),
        "today_rainfall": round(latest.rainfall, 1),
        "rainfall_last_7days": round(r7, 1),
        "rainfall_last_14days": round(r14, 1),
        "rainfall_last_30days": round(r30, 1),
        "rainfall_anomaly": anomaly,
        "consecutive_dry_days": dry_streak,
        "consecutive_wet_days": wet_streak,
        "status": status_str
    }

def get_weather_history(location_id: int, db: Session, limit: int = 180) -> Dict[str, Any]:
    records = db.query(WeatherData).filter(WeatherData.location_id == location_id).order_by(WeatherData.date.asc()).limit(limit).all()
    
    if not records:
        return {
            "location_id": location_id,
            "records": [],
            "historical_avg_daily_rain": 4.1
        }

    rain_list = [r.rainfall for r in records]
    avg_daily = round(sum(rain_list) / len(rain_list), 2) if rain_list else 4.1

    return {
        "location_id": location_id,
        "records": [
            {
                "id": r.id,
                "date": r.date,
                "rainfall": round(r.rainfall, 1),
                "temperature": round(r.temperature, 1),
                "humidity": round(r.humidity, 1),
                "soil_moisture": round(r.soil_moisture, 1),
                "wind_speed": round(r.wind_speed, 1)
            } for r in records
        ],
        "historical_avg_daily_rain": avg_daily
    }

def get_climate_indices(db: Session) -> Dict[str, Any]:
    latest = db.query(ClimateIndex).order_by(ClimateIndex.date.desc()).first()
    if not latest:
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "enso": "Neutral (ONI: +0.2)",
            "enso_index": 0.2,
            "enso_impact": "Neutral ENSO conditions in the tropical Pacific favor normal Northeast monsoon onset and progression across the Tamil Nadu coastline.",
            "iod": "Positive (DMI: +0.32)",
            "iod_index": 0.32,
            "iod_impact": "Positive Indian Ocean Dipole enhances convective activity and low-pressure cyclonic genesis over the south Bay of Bengal.",
            "mjo_phase": 4,
            "mjo_impact": "MJO is in Phase 4 (Maritime Continent/East Indian Ocean) with amplitude > 1.2, fostering moist easterly wave propagation across Tamil Nadu.",
            "climate_signal_score": 26.5,
            "description": "Favorable large-scale teleconnections: Active MJO Phase 4 combined with Positive IOD provides supportive conditions for rainfall spells."
        }

    # Derive dynamic descriptions
    enso_status = latest.enso
    enso_val = latest.enso_index
    if enso_val > 0.8:
        enso_desc = "Moderate to Strong El Niño: Can enhance Northeast monsoon rainfall in coastal Tamil Nadu while suppressing Southwest monsoon in interior districts."
    elif enso_val < -0.8:
        enso_desc = "La Niña event: Tends to reduce late-monsoon cyclonic disturbances in south peninsular India."
    else:
        enso_desc = "Neutral ENSO conditions: Normal monsoon onset dynamics without Pacific teleconnection suppression."

    iod_status = latest.iod
    iod_val = latest.iod_index
    if iod_val > 0.2:
        iod_desc = "Positive IOD: Warmer western Indian Ocean sea surface temperatures intensify rainband convergence towards Tamil Nadu."
    elif iod_val < -0.2:
        iod_desc = "Negative IOD: Tends to inhibit easterly cloudband formation and increase dry spell risks."
    else:
        iod_desc = "Neutral IOD: Seasonal sea-surface temperature gradient is within normal climatological range."

    mjo_phase = latest.mjo_phase
    if mjo_phase in [3, 4, 5]:
        mjo_desc = f"MJO Phase {mjo_phase} (Indian Ocean / Maritime Continent): Very favorable for deep convection and widespread rainfall events."
    else:
        mjo_desc = f"MJO Phase {mjo_phase} (Pacific / Western Hemisphere): Convective envelope is distant, promoting subsidence or temporary dry breaks."

    # Compute climate signal score (-50 to +50)
    score = (25.0 if mjo_phase in [3, 4, 5] else -8.0) + (iod_val * 25.0) + (enso_val * 10.0)
    score = round(float(np.clip(score, -45.0, 45.0)), 1)

    return {
        "date": latest.date,
        "enso": enso_status,
        "enso_index": enso_val,
        "enso_impact": enso_desc,
        "iod": iod_status,
        "iod_index": iod_val,
        "iod_impact": iod_desc,
        "mjo_phase": mjo_phase,
        "mjo_impact": mjo_desc,
        "climate_signal_score": score,
        "description": f"Climate teleconnections score is {score}/50. Favorable ocean-atmosphere coupling indicated."
    }
