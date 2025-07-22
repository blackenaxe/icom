# backend/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .database import get_db
from .models import User
from .schemas import UserOut # UserOut şemasını import ettiğinizden emin olun
from .auth import get_current_user

router = APIRouter()

# Yeni endpoint: Tüm kullanıcıları listeler
@router.get("/users", response_model=List[UserOut])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).all()
    return users

@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: dict, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.get("username")).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Basit bir kullanıcı oluşturma örneği
    new_user = User(username=user.get("username"), hashed_password=user.get("password"))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.get("/users/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user