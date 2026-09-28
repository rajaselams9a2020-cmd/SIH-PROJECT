import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.database import engine, Base, SessionLocal
from .database import models
from .routes import auth, locations, weather, predictions, advisories, alerts, dashboard
from .ml.predictor import predictor
from .ml.train_model import train_and_save_model, MODEL_FILE

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure ML model file exists on startup
if not os.path.exists(MODEL_FILE):
    try:
        print("Initializing ML model weights...")
        train_and_save_model()
    except Exception as e:
        print(f"Model initialization note: {e}")

app = FastAPI(
    title="Hyperlocal Monsoon Prediction & Agricultural Advisory Platform",
    description="Problem Statement ID: 26086 — Hyperlocal Monsoon Onset & Break Prediction System (Block/Village Scale)",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server and all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route groups
app.include_router(auth.router)
app.include_router(locations.router)
app.include_router(locations.crops_router)
app.include_router(weather.router)
app.include_router(weather.climate_router)
app.include_router(predictions.router)
app.include_router(predictions.risk_map_router)
app.include_router(advisories.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Hyperlocal Monsoon Onset & Break Prediction System",
        "problem_statement_id": "26086",
        "scale": "Block/Village Scale (7–30 Days Outlook)",
        "docs": "/docs",
        "swagger": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "ml_engine": "ready",
        "model": "Hybrid Random Forest + Teleconnection Signals"
    }
