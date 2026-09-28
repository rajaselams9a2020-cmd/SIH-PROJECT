from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..database.models import Advisory, Crop, Location
from .prediction_service import get_prediction_summary
from .weather_service import get_current_weather

def generate_crop_advisory(location_id: int, crop_id: int, db: Session) -> Dict[str, Any]:
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        crop = db.query(Crop).first()

    summary = get_prediction_summary(location_id, db)
    weather = get_current_weather(location_id, db)

    onset = summary["onset_probability"]
    dry_spell = summary["dry_spell_probability"]
    heavy_rain = summary["heavy_rain_probability"]
    expected_rain = summary["expected_rainfall"]
    soil_m = weather["soil_moisture"]

    # Rule-based expert system logic
    if heavy_rain > 70:
        severity = "HIGH"
        msg = "Heavy rainfall risk is high. Avoid fertilizer application immediately before rainfall, clear drainage channels in field, and secure standing crops against waterlogging."
        t_msg = "கனமழை வாய்ப்பு அதிகம். மழைக்கு முன் உரம் இடுவதை தவிர்க்கவும். வயலில் வடிகால் வாய்க்கால்களை தூர்வாரி, நீர் தேங்காமல் பார்த்துக் கொள்ளவும்."
        action_items = [
            "Clear and deepen field drainage outlets",
            "Postpone all chemical fertilizer and pesticide spraying",
            "Harvest matured crops immediately to prevent lodging",
            "Store harvested grains in moisture-proof elevated structures"
        ]
        t_action_items = [
            "வயல் வடிகால் வாய்க்கால்களை தூர்வாரவும்",
            "இரசாயன உரம் மற்றும் பூச்சிக்கொல்லி தெளிப்பதை ஒத்திவைக்கவும்",
            "முதிர்ந்த பயிர்களை உடனே அறுவடை செய்து பாதுகாக்கவும்",
            "அறுவடை செய்த தானியங்களை மேடான உலர்ந்த இடத்தில் பாதுகாக்கவும்"
        ]
    elif onset > 70 and dry_spell < 30:
        severity = "LOW"
        msg = f"Conditions are favorable for sowing {crop.name}. Adequate soil moisture and robust monsoon onset probability ensure optimal seed germination."
        t_msg = f"{crop.tamil_name} விதைப்பு செய்ய வானிலை மிகவும் சாதகமாக உள்ளது. போதுமான மண் ஈரப்பதம் மற்றும் பருவமழை தொடக்கம் முளைப்புத் திறனை அதிகரிக்கும்."
        action_items = [
            "Treat seeds with bio-fertilizers (Azospirillum / Trichoderma viride)",
            "Begin primary land tillage and basal fertilization",
            "Prepare raised nursery beds for transplanting",
            "Conserve rainwater in farm ponds and recharge pits"
        ]
        t_action_items = [
            "உயிரி உரங்கள் மூலம் விதை நேர்த்தி செய்யவும்",
            "முதன்மை நில உழவு மற்றும் அடி உரம் இடவும்",
            "நாற்றங்கால் அமைத்து விதைப்பு பணிகளை தொடங்கவும்",
            "மழைநீரை பண்ணைக் குட்டைகளில் சேமிக்கவும்"
        ]
    elif onset < 40 and dry_spell > 60:
        severity = "HIGH"
        msg = f"Delay sowing of {crop.name} and prepare irrigation support. Elevated dry-spell conditions may cause moisture stress and poor seed establishment."
        t_msg = f"{crop.tamil_name} விதைப்பை தாமதப்படுத்தி, பாசன வசதியை தயார் நிலையில் வைத்திருக்கவும். வறட்சி வாய்ப்பு அதிகம் உள்ளதால் நாற்றுகள் வாடக்கூடும்."
        action_items = [
            "Delay direct seeding until the next convective spell",
            "Prepare drip/sprinkler irrigation systems for deficit watering",
            "Apply mulching (crop residues) to reduce soil moisture evaporation",
            "Monitor soil moisture levels closely before sowing"
        ]
        t_action_items = [
            "அடுத்த மழை பொழிவு வரை நேரடி விதைப்பை ஒத்திவைக்கவும்",
            "சொட்டு நீர் அல்லது தெளிப்பு நீர் பாசனத்தை தயார் செய்யவும்",
            "மண் ஈரப்பதத்தை காக்க மூடாக்கு (பயிர் கழிவுகள்) இடவும்",
            "விதைப்பதற்கு முன் மண் ஈரப்பதத்தை சரிபார்க்கவும்"
        ]
    else:
        severity = "MODERATE"
        msg = f"Rainfall conditions are moderately favorable for {crop.name}. Monitor daily rainfall patterns and prepare seedbeds before final sowing."
        t_msg = f"{crop.tamil_name} பயிருக்கு மழைப்பொழிவு நிலை மிதமான சாதகமாக உள்ளது. விதைப்பதற்கு முன் மழை நிலையை தொடர்ந்து கண்காணிக்கவும்."
        action_items = [
            "Prepare quality certified seed materials",
            "Clean and repair primary irrigation channels",
            "Monitor local panchayat rainfall and soil moisture",
            "Avoid unnecessary flood irrigation"
        ]
        t_action_items = [
            "தரமான சான்று பெற்ற விதைகளை தயார் செய்யவும்",
            "பாசன வாய்க்கால்களை சுத்தம் செய்து சரிசெய்யவும்",
            "உள்ளூர் மழை மற்றும் மண் ஈரப்பதத்தை கண்காணிக்கவும்",
            "தேவையற்ற பாய்ச்சல் பாசனத்தை தவிர்க்கவும்"
        ]

    # Save to database if not exists
    adv_record = Advisory(
        location_id=location_id,
        crop_id=crop.id if crop else None,
        advisory_type="Sowing & Moisture Advisory",
        message=msg,
        tamil_message=t_msg,
        severity=severity
    )
    db.add(adv_record)
    db.commit()
    db.refresh(adv_record)

    return {
        "id": adv_record.id,
        "location_id": location_id,
        "crop_id": crop.id if crop else 1,
        "crop_name": crop.name if crop else "Paddy",
        "crop_tamil_name": crop.tamil_name if crop else "நெல்",
        "advisory_type": "Agricultural Weather Advisory",
        "message": msg,
        "tamil_message": t_msg,
        "severity": severity,
        "action_items": action_items,
        "tamil_action_items": t_action_items,
        "created_at": adv_record.created_at
    }

def get_sowing_window(location_id: int, crop_id: int, db: Session) -> Dict[str, Any]:
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        crop = db.query(Crop).first()

    summary = get_prediction_summary(location_id, db)
    weather = get_current_weather(location_id, db)

    onset = summary["onset_probability"]
    dry_spell = summary["dry_spell_probability"]
    now = datetime.now()

    if onset >= 65 and dry_spell <= 35:
        start_date = now + timedelta(days=2)
        end_date = now + timedelta(days=8)
        status = "Optimal Sowing Window Open"
        tamil_status = "விதைப்புக்கு உகந்த காலம்"
        reason = "High onset probability (>65%) and sufficient soil moisture create ideal germination conditions."
        tamil_reason = "அதிக பருவமழை தொடக்க வாய்ப்பு மற்றும் போதுமான மண் ஈரப்பதம் விரைவான முளைப்புக்கு சிறந்தது."
        risk = "LOW"
    elif dry_spell > 55:
        start_date = now + timedelta(days=12)
        end_date = now + timedelta(days=18)
        status = "Window Delayed (Waiting for Moisture)"
        tamil_status = "விதைப்பு தற்காலிகமாக ஒத்திவைப்பு"
        reason = "Elevated dry spell probability in next 7-10 days. Sowing now risks crop wilting."
        tamil_reason = "அடுத்த 7-10 நாட்களில் வறட்சி வாய்ப்பு அதிகம் உள்ளதால் விதைப்பை தள்ளிப்போடவும்."
        risk = "HIGH"
    else:
        start_date = now + timedelta(days=4)
        end_date = now + timedelta(days=11)
        status = "Moderate Sowing Opportunity"
        tamil_status = "மிதமான விதைப்பு வாய்ப்பு"
        reason = "Normal weather progression expected. Light tillering and seedbed preparation recommended."
        tamil_reason = "இயல்பான வானிலை நிலவுகிறது. நாற்றங்கால் தயார் செய்து விதைப்பை தொடங்கலாம்."
        risk = "MODERATE"

    checklist = [
        "Certified disease-resistant seed stock prepared",
        "Trichoderma seed treatment completed",
        "Field channels cleared of silt and weeds",
        "Basal compost / farmyard manure applied",
        "Rain gauge / soil moisture monitored daily"
    ]
    t_checklist = [
        "சான்றளிக்கப்பட்ட விதை இருப்பு தயார் செய்தல்",
        "டிரைக்கோடெர்மா விதை நேர்த்தி செய்தல்",
        "வயல் வாய்க்கால்களில் தூர் மற்றும் களை அகற்றுதல்",
        "அடி உரம் மற்றும் தொழு உரம் இடுதல்",
        "மழை மற்றும் மண் ஈரப்பதத்தை தினசரி கண்காணித்தல்"
    ]

    return {
        "crop_name": crop.name if crop else "Paddy",
        "tamil_crop_name": crop.tamil_name if crop else "நெல்",
        "current_status": status,
        "tamil_status": tamil_status,
        "recommended_start_date": start_date.strftime("%b %d, %Y"),
        "recommended_end_date": end_date.strftime("%b %d, %Y"),
        "risk_level": risk,
        "confidence": summary["confidence"],
        "reason": reason,
        "tamil_reason": tamil_reason,
        "action_checklist": checklist,
        "tamil_checklist": t_checklist
    }
