from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..schemas.advisory import AlertOut, AlertCreateRequest
from ..services.alert_service import get_alerts_for_user, dismiss_alert, send_broadcast_alert, get_alert_history
from ..services.auth_service import get_current_user
from ..database.models import User

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertOut])
def get_alerts(current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id if current_user else None
    return get_alerts_for_user(user_id, db)

@router.post("/send")
def send_alert(req: AlertCreateRequest, db: Session = Depends(get_db)):
    result = send_broadcast_alert(
        district=req.district or "Chengalpattu",
        block=req.block or "All",
        title=req.title,
        message=req.message,
        alert_type=req.alert_type,
        db=db
    )
    return {"status": "success", "alert": result}

@router.post("/dismiss/{alert_id}")
def dismiss_alert_route(alert_id: int, db: Session = Depends(get_db)):
    success = dismiss_alert(alert_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "success", "message": "Alert dismissed"}

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    return get_alert_history(db)
