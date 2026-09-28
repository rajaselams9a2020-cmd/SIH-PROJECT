# Backend — Hyperlocal Monsoon Prediction & Agricultural Advisory Platform (ID: 26086)

FastAPI REST backend with SQLite and hybrid ML prediction engine.

### Quick Start:

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Seed database:
   ```bash
   python seed_data.py
   ```

3. Start server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

- API Docs: http://127.0.0.1:8000/docs
- Swagger ReDoc: http://127.0.0.1:8000/redoc

### Demo Credentials:
- Farmer: farmer@example.com / farmer123
- Officer: officer@example.com / officer123
- Admin: admin@example.com / admin123
