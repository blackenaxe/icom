from pydantic import BaseModel
from datetime import datetime

class WorkOrderCreate(BaseModel):
    title: str
    description: str
    priority: str
    assigned: str

class WorkOrderOut(WorkOrderCreate):
    id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
