from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, IsEmri
from auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# İstemciden alınacak veri modeli
class IsEmriCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "Orta"
    assigned: Optional[str] = ""
    status: Optional[str] = "acik"

# API'den dönecek veri modeli
class IsEmriOut(IsEmriCreate):
    id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    assigned: Optional[str]
    is_emri_no: str                # 👈 Bu satır olmalı
    created_at: str

    class Config:
        orm_mode = True

# Tüm iş emirlerini getir
@router.get("/emirler", response_model=List[IsEmriOut])
def get_emirler(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    emirler = db.query(IsEmri).all()
    return emirler

# Yeni iş emri oluştur
@router.post("/emirler", response_model=IsEmriOut)
def create_emir(emir: IsEmriCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    yeni_emir = IsEmri(is_emri_no=generate_is_emri_no(db), **emir.dict(), created_at=datetime.now().isoformat())
    db.add(yeni_emir)
    db.commit()
    db.refresh(yeni_emir)
    return yeni_emir

# İş emrini sil
@router.delete("/emirler/{emir_id}")
def delete_emir(emir_id: int, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    emir = db.query(IsEmri).filter(IsEmri.id == emir_id).first()
    if not emir:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")
    db.delete(emir)
    db.commit()
    return {"message": "İş emri silindi"}

# İş emrini güncelle
@router.put("/emirler/{emir_id}", response_model=IsEmriOut)
def update_emir(emir_id: int, emir_guncel: IsEmriCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    emir = db.query(IsEmri).filter(IsEmri.id == emir_id).first()
    if not emir:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")
    for key, value in emir_guncel.dict().items():
        setattr(emir, key, value)
    db.commit()
    db.refresh(emir)
    return emir

@router.get("/emirler/{emir_id}")
def get_is_emri(emir_id: int, db: Session = Depends(get_db)):
    emir = db.query(IsEmri).filter(IsEmri.id == emir_id).first()
    if not emir:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")
    return emir

def generate_is_emri_no(db: Session):
    last_emir = db.query(IsEmri).order_by(IsEmri.id.desc()).first()
    if last_emir and last_emir.is_emri_no:
        try:
            last_no = int(last_emir.is_emri_no.split("-")[1])
            next_no = last_no + 1
        except (IndexError, ValueError):
            next_no = 1
    else:
        next_no = 1

    return f"IE-{next_no:04d}"

