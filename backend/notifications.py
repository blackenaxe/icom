# backend/notifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, auth
from .database import get_db

router = APIRouter(tags=["Bildirimler"])

@router.get("/notifications", response_model=List[schemas.NotificationRead])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()
    return notifications

@router.put("/notifications/{notification_id}/read", response_model=schemas.NotificationRead)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı veya bu bildirimi okuma yetkiniz yok.")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification