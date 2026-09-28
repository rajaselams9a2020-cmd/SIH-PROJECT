import os
import json
import csv
import math
import random
from datetime import datetime, timedelta
import numpy as np

# Ensure working directory is set to backend
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine, Base, SessionLocal
from app.database.models import User, Location, Crop, WeatherData, ClimateIndex, Prediction, Advisory, Alert
from app.services.auth_service import hash_password
from app.ml.train_model import train_and_save_model

def seed():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data to ensure pristine seed state
    print("Purging existing records...")
    db.query(Alert).delete()
    db.query(Advisory).delete()
    db.query(Prediction).delete()
    db.query(WeatherData).delete()
    db.query(ClimateIndex).delete()
    db.query(Crop).delete()
    db.query(Location).delete()
    db.query(User).delete()
    db.commit()

    # 1. Seed Locations
    print("Loading locations from locations.json...")
    locations_file = os.path.join("app", "data", "locations.json")
    with open(locations_file, "r", encoding="utf-8") as f:
        loc_data = json.load(f)

    for item in loc_data:
        loc = Location(
            id=item["id"],
            state=item["state"],
            district=item["district"],
            block=item["block"],
            panchayat=item["panchayat"],
            latitude=item["latitude"],
            longitude=item["longitude"]
        )
        db.add(loc)
    db.commit()
    print(f"Seeded {len(loc_data)} locations across Tamil Nadu.")

    # 2. Seed Crops
    print("Loading crops from crops.json...")
    crops_file = os.path.join("app", "data", "crops.json")
    with open(crops_file, "r", encoding="utf-8") as f:
        crop_data = json.load(f)

    for item in crop_data:
        crop = Crop(
            id=item["id"],
            name=item["name"],
            tamil_name=item["tamil_name"],
            sowing_month=item["sowing_month"],
            optimal_rainfall=item["optimal_rainfall"],
            rainfall_tolerance=item["rainfall_tolerance"],
            dry_spell_tolerance=item["dry_spell_tolerance"],
            heavy_rain_tolerance=item["heavy_rain_tolerance"]
        )
        db.add(crop)
    db.commit()
    print(f"Seeded {len(crop_data)} crops.")

    # 3. Seed Users
    print("Creating demo users...")
    demo_users = [
        User(
            name="Murugan (Farmer)",
            email="farmer@example.com",
            phone="+91 98401 23456",
            password_hash=hash_password("farmer123"),
            role="farmer",
            language="en",
            state="Tamil Nadu",
            district="Chengalpattu",
            block="Tambaram",
            panchayat="Kadaperi"
        ),
        User(
            name="Dr. Sundaram (Agriculture Officer)",
            email="officer@example.com",
            phone="+91 94440 98765",
            password_hash=hash_password("officer123"),
            role="officer",
            language="en",
            state="Tamil Nadu",
            district="Chengalpattu",
            block="Chengalpattu",
            panchayat="Paranur"
        ),
        User(
            name="System Administrator",
            email="admin@example.com",
            phone="+91 99999 00000",
            password_hash=hash_password("admin123"),
            role="admin",
            language="en",
            state="Tamil Nadu",
            district="Chengalpattu",
            block="Tambaram",
            panchayat="Mudichur"
        ),
        # Extra regional farmers for officer analytics
        User(
            name="Kavitha R (Farmer)",
            email="kavitha@example.com",
            phone="+91 98405 11223",
            password_hash=hash_password("farmer123"),
            role="farmer",
            language="ta",
            state="Tamil Nadu",
            district="Chengalpattu",
            block="Kattankulathur",
            panchayat="Potheri"
        ),
        User(
            name="Palanisamy K (Farmer)",
            email="palanisamy@example.com",
            phone="+91 97500 44556",
            password_hash=hash_password("farmer123"),
            role="farmer",
            language="ta",
            state="Tamil Nadu",
            district="Thanjavur",
            block="Kumbakonam",
            panchayat="Swamimalai"
        ),
        User(
            name="Subramanian M (Farmer)",
            email="subbu@example.com",
            phone="+91 94432 77889",
            password_hash=hash_password("farmer123"),
            role="farmer",
            language="ta",
            state="Tamil Nadu",
            district="Madurai",
            block="Vadipatti",
            panchayat="Alanganallur"
        )
    ]
    for u in demo_users:
        db.add(u)
    db.commit()
    print("Demo users successfully created (farmer, officer, admin).")

    # 4. Seed Climate Indices
    print("Generating Climate Indices (ENSO, IOD, MJO)...")
    today = datetime.now()
    for i in range(30, -1, -1):
        d_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        ci = ClimateIndex(
            date=d_str,
            enso="Neutral (ONI: +0.2)",
            iod="Positive (DMI: +0.28)",
            mjo_phase=4,
            enso_index=0.2,
            iod_index=0.28
        )
        db.add(ci)
    db.commit()
    print("Seeded historical climate teleconnection indices.")

    # 5. Seed 180 Days Realistic Seasonal Weather Data per location
    print("Generating 180 days of realistic seasonal weather data per location...")
    all_locations = db.query(Location).all()
    sample_csv_path = os.path.join("app", "data", "sample_weather.csv")

    weather_batch = []
    csv_rows = []

    # Tamil Nadu seasonal climate curves:
    # Days 180 to 90 ago (Summer/Pre-monsoon: hotter 34-38C, lower rain 0-15mm)
    # Days 90 to 30 ago (Southwest monsoon tail: 28-33C, moderate showers 5-45mm)
    # Days 30 to present (Northeast monsoon build-up: high humidity 70-95%, showers 10-85mm, temp 26-31C)
    random.seed(42)

    for loc in all_locations:
        # Geographic variance based on latitude & proximity to coast
        coastal_factor = 1.2 if loc.longitude > 80.0 else 0.9
        base_temp = 31.0 - (loc.latitude - 10.0) * 0.4

        for d_ago in range(180, -1, -1):
            date_obj = today - timedelta(days=d_ago)
            d_str = date_obj.strftime("%Y-%m-%d")

            # Day of year sine wave
            day_of_year = date_obj.timetuple().tm_yday
            season_sin = math.sin((day_of_year - 80) * 2 * math.pi / 365)

            temp = base_temp + season_sin * 4.0 + random.uniform(-1.5, 1.8)
            temp = max(21.0, min(38.5, temp))

            # Realistic rainfall generation with spell clustering
            # Monsoon spell probability
            spell_prob = 0.35 if d_ago <= 45 else 0.18
            if random.random() < spell_prob:
                # Rainy day
                rain = random.expovariate(1 / 18.0) * coastal_factor
                rain = min(148.0, rain)
            else:
                rain = 0.0

            if rain > 15.0:
                humidity = random.uniform(78.0, 95.0)
                soil_m = random.uniform(65.0, 88.0)
            elif rain > 0:
                humidity = random.uniform(65.0, 85.0)
                soil_m = random.uniform(45.0, 70.0)
            else:
                humidity = random.uniform(42.0, 72.0)
                soil_m = max(12.0, 45.0 - (d_ago % 7) * 2.0 + random.uniform(-3, 3))

            wind = random.uniform(8.0, 24.0)

            wd = WeatherData(
                location_id=loc.id,
                date=d_str,
                rainfall=round(rain, 1),
                temperature=round(temp, 1),
                humidity=round(humidity, 1),
                soil_moisture=round(soil_m, 1),
                wind_speed=round(wind, 1)
            )
            weather_batch.append(wd)

            # Keep a subset for sample CSV export
            if loc.id <= 5:
                csv_rows.append([loc.id, loc.district, loc.block, loc.panchayat, d_str, round(rain, 1), round(temp, 1), round(humidity, 1), round(soil_m, 1), round(wind, 1)])

            if len(weather_batch) >= 2000:
                db.bulk_save_objects(weather_batch)
                db.commit()
                weather_batch = []

    if weather_batch:
        db.bulk_save_objects(weather_batch)
        db.commit()

    print(f"Weather dataset successfully loaded into SQLite database.")

    # Write sample_weather.csv
    print(f"Exporting sample CSV to {sample_csv_path}...")
    with open(sample_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["location_id", "district", "block", "panchayat", "date", "rainfall_mm", "temp_c", "humidity_pct", "soil_moisture_pct", "wind_speed_kmh"])
        writer.writerows(csv_rows)
    print("sample_weather.csv written.")

    # 6. Train and Save the Random Forest Model
    print("Training ML model on engineered meteorological features...")
    train_and_save_model()

    # 7. Seed 30-day Predictions for primary demo locations
    print("Seeding 30-day forecast predictions...")
    from app.services.prediction_service import get_prediction_summary
    from app.ml.predictor import predictor

    for loc in all_locations[:12]:
        summary = get_prediction_summary(loc.id, db)
        forecast_30 = predictor.generate_30day_forecast(summary, today.strftime("%Y-%m-%d"))

        for day_item in forecast_30:
            pred_row = Prediction(
                location_id=loc.id,
                prediction_date=day_item["date"],
                forecast_day=day_item["day"],
                onset_probability=day_item["onset_probability"],
                dry_spell_probability=day_item["dry_spell_probability"],
                heavy_rain_probability=day_item["heavy_rain_probability"],
                rainfall_prediction=day_item["rainfall"],
                confidence=day_item["confidence"]
            )
            db.add(pred_row)
    db.commit()
    print("Predictions saved.")

    # 8. Seed Sample Advisories
    print("Seeding Agricultural Advisories...")
    from app.services.advisory_service import generate_crop_advisory
    for loc_id in [1, 5, 9, 13, 17, 30, 36, 40]:
        for c_id in [1, 2, 3]:
            generate_crop_advisory(loc_id, c_id, db)
    print("Advisories populated.")

    # 9. Seed Realistic Alerts
    print("Seeding Simulated Alerts...")
    initial_alerts = [
        Alert(
            user_id=1,
            title="Monsoon Onset Favorable Window",
            message="Northeast monsoon convective signals are intensifying. Expected onset window begins within the next 48-72 hours across Tambaram block.",
            language="en",
            alert_type="monsoon_onset",
            status="active",
            created_at=today - timedelta(hours=4)
        ),
        Alert(
            user_id=1,
            title="Sowing Window Alert (Paddy)",
            message="Soil moisture at 52% and onset probability at 78%. Recommended sowing dates: Oct 4 – Oct 9. Complete Trichoderma seed treatment.",
            language="en",
            alert_type="sowing",
            status="active",
            created_at=today - timedelta(hours=12)
        ),
        Alert(
            user_id=None,
            title="Heavy Rainfall Warning — Coastal Chengalpattu",
            message="Isolated heavy rainfall spells (35–65 mm) likely between Day 3 and Day 5. Clear agricultural drainage channels and avoid applying nitrogenous fertilizers immediately.",
            language="en",
            alert_type="heavy_rain",
            status="active",
            created_at=today - timedelta(days=1)
        ),
        Alert(
            user_id=None,
            title="Dry Spell Vigilance — Interior Blocks",
            message="Dry spell probability may increase over Day 8 to 14 in western sub-blocks. Farmers are advised to maintain mulching and inspect micro-irrigation facilities.",
            language="en",
            alert_type="dry_spell",
            status="active",
            created_at=today - timedelta(days=2)
        )
    ]
    for alt in initial_alerts:
        db.add(alt)
    db.commit()
    print("Initial alerts created.")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed()
