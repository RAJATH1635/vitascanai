from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User
from app.schemas.token import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        print("\n================ JWT DEBUG ================")
        print("Received Token:", token[:50] + "...")

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        print("PAYLOAD:", payload)

        email: str = payload.get("sub")
        role: str = payload.get("role")

        print("EMAIL FROM TOKEN:", email)
        print("ROLE FROM TOKEN:", role)

        if email is None:
            print("[ERROR] Email is None")
            raise credentials_exception

        token_data = TokenData(email=email, role=role)

    except JWTError as e:
        print("[ERROR] JWT ERROR:", e)
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()

    print("USER FOUND:", user)

    if user is None:
        print("[ERROR] User not found in database")
        raise credentials_exception

    print("[OK] Authentication Successful")
    print("=========================================\n")

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return user

from fastapi import Query
def pagination_params(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(None)
):
    return {"skip": skip, "limit": limit, "search": search}
