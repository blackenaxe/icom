#crud.py
from sqlalchemy.orm import Session
from models import WorkOrder
from schemas import WorkOrderCreate

def get_emirler(db: Session):
    return db.query(WorkOrder).order_by(WorkOrder.created_at.desc()).all()

def create_emir(db: Session, emir: WorkOrderCreate):
    db_emir = WorkOrder(**emir.dict())
    db.add(db_emir)
    db.commit()
    db.refresh(db_emir)
    return db_emir
