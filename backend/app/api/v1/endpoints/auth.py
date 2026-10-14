from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.domain import Doctor
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from app.schemas.doctor import DoctorRegister
from jose import jwt, JWTError

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = security.create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = security.create_refresh_token(data={"sub": user.email})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(deps.get_db)):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    access_token = security.create_access_token(data={"sub": user.email, "role": user.role})
    new_refresh_token = security.create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user

@router.post("/register-doctor", response_model=UserResponse)
def register_doctor(doctor_in: DoctorRegister, db: Session = Depends(deps.get_db)):
    existing = db.query(User).filter(User.email == doctor_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = security.get_password_hash(doctor_in.password)
    db_user = User(
        email=doctor_in.email,
        hashed_password=hashed_password,
        full_name=doctor_in.full_name,
        role="DOCTOR",
        is_active=True,
        is_verified=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    doctor_profile = Doctor(
        user_id=db_user.id,
        specialization=doctor_in.specialization,
        license_number=doctor_in.license_number,
        experience_years=doctor_in.experience_years,
    )
    db.add(doctor_profile)
    db.commit()
    return db_user
