from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import User
from ..schemas.user import UserRegister, UserLogin, UserOut, Token, UserUpdate
from ..services.auth_service import hash_password, verify_password, create_access_token, require_current_user, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hash_password(user_in.password),
        role=user_in.role or "farmer",
        language=user_in.language or "en",
        state=user_in.state or "Tamil Nadu",
        district=user_in.district or "Chengalpattu",
        block=user_in.block or "Tambaram",
        panchayat=user_in.panchayat or "Kadaperi"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(require_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(update_data: UserUpdate, current_user: User = Depends(require_current_user), db: Session = Depends(get_db)):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.language is not None:
        current_user.language = update_data.language
    if update_data.state is not None:
        current_user.state = update_data.state
    if update_data.district is not None:
        current_user.district = update_data.district
    if update_data.block is not None:
        current_user.block = update_data.block
    if update_data.panchayat is not None:
        current_user.panchayat = update_data.panchayat

    db.commit()
    db.refresh(current_user)
    return current_user
