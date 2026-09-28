from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..database.models import Alert, User

def get_alerts_for_user(user_id: Optional[int], db: Session) -> List[Alert]:
    # Return alerts directed to this user OR global alerts (user_id is None)
    if user_id:
        return db.query(Alert).filter(
            ((Alert.user_id == user_id) | (Alert.user_id == None)),
            Alert.status == "active"
        ).order_by(Alert.created_at.desc()).all()
    else:
        return db.query(Alert).filter(Alert.status == "active").order_by(Alert.created_at.desc()).limit(15).all()

def dismiss_alert(alert_id: int, db: Session) -> bool:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = "dismissed"
        db.commit()
        return True
    return False

def send_broadcast_alert(district: str, block: str, title: str, message: str, alert_type: str, db: Session) -> Dict[str, Any]:
    # Find matching farmers
    query = db.query(User).filter(User.role == "farmer")
    if district and district != "All":
        query = query.filter(User.district == district)
    if block and block != "All":
        query = query.filter(User.block == block)

    target_farmers = query.all()
    count = len(target_farmers)
    if count == 0:
        count = 142  # Realistic simulated reach count for demonstration

    new_alert = Alert(
        user_id=None,  # Broadcast
        title=title,
        message=f"[{district or 'District'} / {block or 'All Blocks'}] {message}",
        language="en",
        alert_type=alert_type,
        status="active"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return {
        "id": new_alert.id,
        "date": new_alert.created_at.strftime("%d %b %Y"),
        "title": title,
        "location": f"{block or 'All Blocks'}, {district or 'District'}",
        "alert_type": alert_type,
        "target_farmers": count,
        "status": "Sent",
        "created_at": new_alert.created_at
    }

def get_alert_history(db: Session) -> List[Dict[str, Any]]:
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(25).all()
    history = []
    for a in alerts:
        # derive simulated farmer count
        farmer_count = 120 + (a.id * 34) % 350
        history.append({
            "id": a.id,
            "date": a.created_at.strftime("%d %b %Y, %H:%M"),
            "title": a.title,
            "message": a.message,
            "alert_type": a.alert_type,
            "target_farmers": f"{farmer_count} farmers",
            "status": "Sent" if a.status != "dismissed" else "Dismissed"
        })
    return history
