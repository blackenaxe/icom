from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import get_db, engine
from .auth import get_current_user

router = APIRouter()

models.Base.metadata.create_all(bind=engine)

@router.get("/emirler", response_model=List[schemas.WorkOrderOut])
def get_work_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.WorkOrder).all()
    return orders

@router.get("/emirler/{work_order_id}", response_model=schemas.WorkOrderOut)
def get_work_order_detail(work_order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.WorkOrder).filter(models.WorkOrder.id == work_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")
    return order

@router.post("/emirler", response_model=schemas.WorkOrderOut, status_code=status.HTTP_201_CREATED)
def create_work_order(
    work_order: schemas.WorkOrderIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    is_emri_no = "WO" + str(len(db.query(models.WorkOrder).all()) + 1).zfill(4)
    new_order = models.WorkOrder(
        is_emri_no=is_emri_no,
        title=work_order.title,
        description=work_order.description,
        priority=work_order.priority,
        status=work_order.status,
        assigned_user_id=work_order.assigned_user_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # YENİ: Atanan kullanıcıya bildirim oluştur
    if new_order.assigned_user_id:
        assigned_user = db.query(models.User).filter(models.User.id == new_order.assigned_user_id).first()
        if assigned_user:
            notification_message = f"Size yeni bir iş emri atandı: {new_order.title} ({new_order.is_emri_no})"
            new_notification = models.Notification(
                message=notification_message,
                user_id=assigned_user.id
            )
            db.add(new_notification)
            db.commit()
    return new_order

@router.put("/emirler/{work_order_id}", response_model=schemas.WorkOrderOut)
def update_work_order(
    work_order_id: int,
    work_order: schemas.WorkOrderIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    existing_order = db.query(models.WorkOrder).filter(models.WorkOrder.id == work_order_id).first()
    if not existing_order:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")

    for key, value in work_order.model_dump(exclude_unset=True).items():
        setattr(existing_order, key, value)

    db.commit()
    db.refresh(existing_order)
    return existing_order

@router.delete("/emirler/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_order(work_order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.WorkOrder).filter(models.WorkOrder.id == work_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı")

    db.delete(order)
    db.commit()
    return {"ok": True}

@router.post("/emirler/{work_order_id}/updates", response_model=schemas.WorkOrderUpdateOut, status_code=status.HTTP_201_CREATED)
def create_work_order_update(
    work_order_id: int,
    update_data: schemas.WorkOrderUpdateBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    work_order = db.query(models.WorkOrder).filter(models.WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="İş emri bulunamadı.")

    db_update = models.WorkOrderUpdate(
        description=update_data.description,
        work_order_id=work_order_id,
        user_id=current_user.id
    )
    db.add(db_update)
    db.commit()
    db.refresh(db_update)
    
    db_update = db.query(models.WorkOrderUpdate).filter(models.WorkOrderUpdate.id == db_update.id).first()
    
    return db_update

@router.put("/updates/{update_id}", response_model=schemas.WorkOrderUpdateOut)
def update_work_order_update(
    update_id: int,
    update_data: schemas.WorkOrderUpdateBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_update = db.query(models.WorkOrderUpdate).filter(models.WorkOrderUpdate.id == update_id).first()
    if not db_update:
        raise HTTPException(status_code=404, detail="Güncelleme bulunamadı")

    db_update.description = update_data.description
    db.commit()
    db.refresh(db_update)

    return db_update