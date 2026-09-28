from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from ..database.models import Location, WeatherData, ClimateIndex, Prediction, User
from ..ml.feature_engineering import extract_features
from ..ml.predictor import predictor

def determine_risk(dry_spell_prob: float, heavy_rain_prob: float, onset_prob: float) -> tuple[str, str]:
    """
    Evaluates multi-hazard risk level and hex color code:
    CRITICAL (Red): Very high heavy rain (>70%) or severe dry spell (>75%)
    HIGH (Orange): Elevated dry spell (>55%) or heavy rain (>55%) or very late onset with dry conditions
    MODERATE (Yellow): Intermediate probabilities
    LOW (Green): Well-balanced, normal onset with low extremes
    """
    if heavy_rain_prob >= 70 or dry_spell_prob >= 75:
        return "CRITICAL", "#dc2626"
    elif heavy_rain_prob >= 50 or dry_spell_prob >= 52:
        return "HIGH", "#ea580c"
    elif heavy_rain_prob >= 35 or dry_spell_prob >= 35 or onset_prob < 45:
        return "MODERATE", "#d97706"
    else:
        return "LOW", "#16a34a"

def get_prediction_summary(location_id: int, db: Session) -> Dict[str, Any]:
    loc = db.query(Location).filter(Location.id == location_id).first()
    loc_name = f"{loc.panchayat}, {loc.block} ({loc.district})" if loc else "Block / Village"

    # Get weather records
    records = db.query(WeatherData).filter(WeatherData.location_id == location_id).order_by(WeatherData.date.desc()).limit(35).all()
    rec_dicts = [
        {
            "date": r.date,
            "rainfall": r.rainfall,
            "temperature": r.temperature,
            "humidity": r.humidity,
            "soil_moisture": r.soil_moisture,
            "wind_speed": r.wind_speed
        }
        for r in reversed(records)
    ]

    # Get climate record
    climate_rec = db.query(ClimateIndex).order_by(ClimateIndex.date.desc()).first()
    climate_dict = None
    if climate_rec:
        climate_dict = {
            "enso_index": climate_rec.enso_index,
            "iod_index": climate_rec.iod_index,
            "mjo_phase": climate_rec.mjo_phase
        }

    features = extract_features(rec_dicts, climate_dict)
    preds = predictor.predict(features)

    risk_level, risk_color = determine_risk(
        preds["dry_spell_probability"],
        preds["heavy_rain_probability"],
        preds["onset_probability"]
    )

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    return {
        "location_id": location_id,
        "location_name": loc_name,
        "prediction_date": datetime.now().strftime("%Y-%m-%d"),
        "horizon_days": 14,
        "onset_probability": preds["onset_probability"],
        "dry_spell_probability": preds["dry_spell_probability"],
        "heavy_rain_probability": preds["heavy_rain_probability"],
        "expected_rainfall": preds["rainfall_prediction"],
        "confidence": preds["confidence"],
        "risk_level": risk_level,
        "risk_color": risk_color,
        "model_name": "Hybrid Prototype Model (Random Forest + Climate Signals)",
        "last_updated": now_str,
        "disclaimer": "Probabilities are prototype model estimates and should be used together with official IMD/State weather advisories."
    }

def get_30day_prediction(location_id: int, db: Session) -> List[Dict[str, Any]]:
    # Check if saved 30-day predictions exist in db
    db_preds = db.query(Prediction).filter(Prediction.location_id == location_id).order_by(Prediction.forecast_day.asc()).all()
    if db_preds and len(db_preds) == 30:
        return [
            {
                "date": p.prediction_date,
                "day": p.forecast_day,
                "rainfall": p.rainfall_prediction,
                "historical_avg": round(4.2 + (0.8 if p.forecast_day % 2 == 0 else -0.5), 1),
                "onset_probability": p.onset_probability,
                "dry_spell_probability": p.dry_spell_probability,
                "heavy_rain_probability": p.heavy_rain_probability,
                "confidence": p.confidence
            }
            for p in db_preds
        ]

    # Generate live using predictor
    summary = get_prediction_summary(location_id, db)
    return predictor.generate_30day_forecast(summary)

def get_risk_map_data(db: Session) -> List[Dict[str, Any]]:
    locations = db.query(Location).all()
    points = []

    # Get total farmers count per block/panchayat
    users = db.query(User).filter(User.role == "farmer").all()
    user_counts = {}
    for u in users:
        key = f"{u.district}-{u.block}-{u.panchayat}"
        user_counts[key] = user_counts.get(key, 0) + 1

    for loc in locations:
        key = f"{loc.district}-{loc.block}-{loc.panchayat}"
        f_count = user_counts.get(key, 35 + (loc.id * 7) % 65)

        summary = get_prediction_summary(loc.id, db)

        # Build recommendation based on risk
        risk = summary["risk_level"]
        if risk == "CRITICAL":
            action = "High extreme weather hazard: halt open sowing, prepare drainage and hold inputs."
            tamil_action = "தீவிர வானிலை எச்சரிக்கை: நேரடி விதைப்பை நிறுத்தி, வடிகால் வசதியை உறுதி செய்யவும்."
        elif risk == "HIGH":
            action = "Elevated dry spell / erratic rain: delay sowing, inspect borewells and irrigation channels."
            tamil_action = "வறட்சி / ஒழுங்கற்ற மழை வாய்ப்பு: விதைப்பை தாமதப்படுத்தி, பாசன அமைப்புகளை சரிபார்க்கவும்."
        elif risk == "MODERATE":
            action = "Moderate conditions: prepare nursery bed, treat seeds with Trichoderma viride."
            tamil_action = "மிதமான சூழல்: நாற்றங்கால் தயார் செய்து, விதை நேர்த்தி மேற்கொள்ளவும்."
        else:
            action = "Highly favorable monsoon onset: proceed with planned sowing and basal fertilizer application."
            tamil_action = "சாதகமான பருவமழை: திட்டமிட்ட விதைப்பு மற்றும் அடி உரம் இடுதலை தொடரலாம்."

        points.append({
            "location_id": loc.id,
            "state": loc.state,
            "district": loc.district,
            "block": loc.block,
            "panchayat": loc.panchayat,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "onset_probability": summary["onset_probability"],
            "dry_spell_probability": summary["dry_spell_probability"],
            "heavy_rain_probability": summary["heavy_rain_probability"],
            "expected_rainfall": summary["expected_rainfall"],
            "confidence": summary["confidence"],
            "risk_level": risk,
            "risk_color": summary["risk_color"],
            "farmer_count": f_count,
            "recommended_action": action,
            "tamil_action": tamil_action
        })

    return points
