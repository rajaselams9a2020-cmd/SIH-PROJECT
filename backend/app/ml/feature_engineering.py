import numpy as np
from typing import List, Dict, Any

def extract_features(weather_records: List[Dict[str, Any]], climate_record: Dict[str, Any] = None) -> Dict[str, float]:
    """
    Extracts 12 engineered features from historical weather records and climate indices:
    - rainfall_7day
    - rainfall_14day
    - rainfall_30day
    - rainfall_anomaly
    - temperature
    - humidity
    - soil_moisture
    - enso
    - iod
    - mjo_phase
    - previous_dry_days
    - previous_wet_days
    """
    if not weather_records:
        return {
            "rainfall_7day": 18.5,
            "rainfall_14day": 42.0,
            "rainfall_30day": 95.0,
            "rainfall_anomaly": 5.2,
            "temperature": 31.5,
            "humidity": 72.0,
            "soil_moisture": 48.0,
            "enso": 0.2,
            "iod": 0.1,
            "mjo_phase": 4.0,
            "previous_dry_days": 2.0,
            "previous_wet_days": 1.0
        }

    # Sort records chronologically
    sorted_records = sorted(weather_records, key=lambda r: r.get("date", ""))

    rains = [float(r.get("rainfall", 0.0)) for r in sorted_records]
    temps = [float(r.get("temperature", 30.0)) for r in sorted_records]
    hums = [float(r.get("humidity", 65.0)) for r in sorted_records]
    soils = [float(r.get("soil_moisture", 45.0)) for r in sorted_records]

    n = len(rains)
    r7 = float(sum(rains[-7:])) if n >= 7 else float(sum(rains))
    r14 = float(sum(rains[-14:])) if n >= 14 else float(sum(rains))
    r30 = float(sum(rains[-30:])) if n >= 30 else float(sum(rains))

    mean_daily = (sum(rains) / n) if n > 0 else 3.5
    long_term_mean_30 = float(mean_daily * 30.0)
    rainfall_anomaly = float(r30 - long_term_mean_30)

    temperature = float(np.mean(temps[-3:])) if len(temps) >= 3 else float(temps[-1])
    humidity = float(np.mean(hums[-3:])) if len(hums) >= 3 else float(hums[-1])
    soil_moisture = float(soils[-1]) if len(soils) > 0 else 45.0

    # Calculate streaks
    dry_count = 0
    wet_count = 0
    for r in reversed(rains):
        if r < 1.0:
            if wet_count > 0:
                break
            dry_count += 1
        else:
            if dry_count > 0:
                break
            wet_count += 1

    enso_val = 0.2
    iod_val = 0.1
    mjo_val = 4.0
    if climate_record:
        enso_val = float(climate_record.get("enso_index", 0.2))
        iod_val = float(climate_record.get("iod_index", 0.1))
        mjo_val = float(climate_record.get("mjo_phase", 4.0))

    return {
        "rainfall_7day": round(r7, 2),
        "rainfall_14day": round(r14, 2),
        "rainfall_30day": round(r30, 2),
        "rainfall_anomaly": round(rainfall_anomaly, 2),
        "temperature": round(temperature, 2),
        "humidity": round(humidity, 2),
        "soil_moisture": round(soil_moisture, 2),
        "enso": round(enso_val, 2),
        "iod": round(iod_val, 2),
        "mjo_phase": float(mjo_val),
        "previous_dry_days": float(dry_count),
        "previous_wet_days": float(wet_count)
    }
