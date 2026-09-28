import os
import numpy as np
from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
from .train_model import LightweightRandomForest, MODEL_FILE, FEATURE_NAMES

class HybridMonsoonPredictor:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_FILE):
            try:
                self.model = LightweightRandomForest.load(MODEL_FILE)
            except Exception as e:
                print(f"Warning: Could not load model from {MODEL_FILE}: {e}. Using deterministic fallback.")
                self.model = None
        else:
            self.model = None

    def calculate_climate_signal(self, enso: float, iod: float, mjo_phase: float) -> Tuple[float, str]:
        score = 0.0
        if mjo_phase in [3, 4, 5]:
            score += 24.0
        elif mjo_phase in [1, 2]:
            score += 8.0
        else:
            score -= 10.0

        score += iod * 25.0
        score += enso * 10.0

        score = float(np.clip(score, -45.0, 45.0))
        if score > 15:
            impact = "Strong positive convective signal from Indian Ocean MJO & IOD"
        elif score < -15:
            impact = "Suppressed convective signals; elevated dry spell risk"
        else:
            impact = "Moderate / Neutral oceanic-atmospheric coupling"

        return round(score, 1), impact

    def calculate_atmospheric_signal(self, temp: float, humidity: float, soil_moisture: float) -> float:
        h_score = (humidity - 50.0) * 0.8
        t_penalty = max(0.0, temp - 32.0) * 2.5
        s_score = (soil_moisture - 40.0) * 0.5
        sig = h_score - t_penalty + s_score
        return float(np.clip(sig, -35.0, 35.0))

    def calculate_local_rainfall_signal(self, r7: float, r14: float, anomaly: float, dry_days: float) -> float:
        momentum = (r7 * 0.4) + (r14 * 0.2) + (anomaly * 0.3) - (dry_days * 3.5)
        return float(np.clip(momentum, -30.0, 30.0))

    def deterministic_fallback_predict(self, features: Dict[str, float]) -> Dict[str, float]:
        enso = features.get("enso", 0.2)
        iod = features.get("iod", 0.1)
        mjo = features.get("mjo_phase", 4.0)
        temp = features.get("temperature", 31.0)
        humidity = features.get("humidity", 72.0)
        soil_moisture = features.get("soil_moisture", 48.0)
        r7 = features.get("rainfall_7day", 18.0)
        r14 = features.get("rainfall_14day", 42.0)
        anomaly = features.get("rainfall_anomaly", 5.0)
        dry_days = features.get("previous_dry_days", 2.0)

        climate_sig, _ = self.calculate_climate_signal(enso, iod, mjo)
        atmo_sig = self.calculate_atmospheric_signal(temp, humidity, soil_moisture)
        rain_sig = self.calculate_local_rainfall_signal(r7, r14, anomaly, dry_days)

        combined_signal = (climate_sig * 0.4) + (atmo_sig * 0.35) + (rain_sig * 0.25)

        onset_prob = 50.0 + combined_signal * 1.1
        dry_spell_prob = 40.0 - combined_signal * 0.9 + (dry_days * 3.0)
        heavy_rain_prob = 25.0 + (combined_signal * 0.7) + (humidity - 60.0) * 0.4

        onset_prob = float(np.clip(onset_prob, 8.0, 96.0))
        dry_spell_prob = float(np.clip(dry_spell_prob, 5.0, 94.0))
        heavy_rain_prob = float(np.clip(heavy_rain_prob, 4.0, 90.0))

        expected_rain = (onset_prob / 100.0) * 85.0 + max(0.0, rain_sig * 1.2) - (dry_spell_prob / 100.0 * 25.0)
        expected_rain = float(np.clip(expected_rain, 0.0, 240.0))

        confidence = 72.0 + (10.0 if abs(climate_sig) > 10 else 4.0) + (8.0 if humidity > 60 else 2.0)
        confidence = float(np.clip(confidence, 65.0, 92.0))

        return {
            "onset_probability": round(onset_prob, 1),
            "dry_spell_probability": round(dry_spell_prob, 1),
            "heavy_rain_probability": round(heavy_rain_prob, 1),
            "rainfall_prediction": round(expected_rain, 1),
            "confidence": round(confidence, 1)
        }

    def predict(self, features: Dict[str, float]) -> Dict[str, float]:
        if self.model is None:
            self._load_model()

        if self.model is not None:
            try:
                x_vec = np.array([features.get(k, 0.0) for k in FEATURE_NAMES])
                preds = self.model.predict(x_vec)
                onset = float(np.clip(preds[0], 5.0, 98.0))
                dry_spell = float(np.clip(preds[1], 4.0, 95.0))
                heavy_rain = float(np.clip(preds[2], 2.0, 94.0))
                exp_rain = float(np.clip(preds[3], 0.0, 250.0))

                humidity = features.get("humidity", 70.0)
                conf = 74.0 + (humidity - 50.0) * 0.2 + (5.0 if features.get("mjo_phase", 0) in [3,4,5] else 0)
                conf = float(np.clip(conf, 68.0, 94.0))

                return {
                    "onset_probability": round(onset, 1),
                    "dry_spell_probability": round(dry_spell, 1),
                    "heavy_rain_probability": round(heavy_rain, 1),
                    "rainfall_prediction": round(exp_rain, 1),
                    "confidence": round(conf, 1)
                }
            except Exception as e:
                return self.deterministic_fallback_predict(features)
        else:
            return self.deterministic_fallback_predict(features)

    def generate_30day_forecast(self, summary_pred: Dict[str, float], start_date_str: str = None) -> List[Dict[str, Any]]:
        if not start_date_str:
            start_date = datetime.now()
        else:
            try:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            except:
                start_date = datetime.now()

        onset_p = summary_pred.get("onset_probability", 65.0)
        dry_p = summary_pred.get("dry_spell_probability", 25.0)
        heavy_p = summary_pred.get("heavy_rain_probability", 30.0)
        rain_val = summary_pred.get("expected_rainfall", summary_pred.get("rainfall_prediction", 70.0))
        base_rain = rain_val / 14.0

        forecast = []
        for day in range(1, 31):
            curr_date = start_date + timedelta(days=day)
            wave = np.sin(day * 0.85) * 0.4 + np.cos(day * 0.4) * 0.3
            day_rain = max(0.0, (base_rain * (1.0 + wave)))
            if day > 10 and dry_p > 50:
                day_rain *= 0.4
            if heavy_p > 40 and day in [3, 4, 12]:
                day_rain += (heavy_p * 0.35)

            historical_avg = round(3.8 + np.sin(day * 0.2) * 1.2, 1)

            day_onset = np.clip(onset_p - (day * 0.4) + np.sin(day) * 5, 10.0, 95.0)
            day_dry = np.clip(dry_p + (day * 0.3) + np.cos(day) * 4, 5.0, 95.0)
            day_heavy = np.clip(heavy_rain_prob_for_day(heavy_p, day_rain), 5.0, 90.0)
            day_conf = np.clip(summary_pred["confidence"] - (day * 0.45), 55.0, 90.0)

            forecast.append({
                "date": curr_date.strftime("%Y-%m-%d"),
                "day": day,
                "rainfall": round(float(day_rain), 1),
                "historical_avg": historical_avg,
                "onset_probability": round(float(day_onset), 1),
                "dry_spell_probability": round(float(day_dry), 1),
                "heavy_rain_probability": round(float(day_heavy), 1),
                "confidence": round(float(day_conf), 1)
            })

        return forecast

def heavy_rain_prob_for_day(base_heavy: float, day_rain: float) -> float:
    if day_rain > 25.0:
        return min(95.0, base_heavy + 30.0)
    elif day_rain > 10.0:
        return min(85.0, base_heavy + 15.0)
    else:
        return max(5.0, base_heavy - 10.0)

predictor = HybridMonsoonPredictor()
