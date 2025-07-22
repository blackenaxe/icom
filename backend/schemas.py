from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    model_config = ConfigDict(from_attributes=True)

class UserInUpdate(BaseModel):
    username: str
    model_config = ConfigDict(from_attributes=True)

class WorkOrderUpdateBase(BaseModel):
    description: str
    model_config = ConfigDict(from_attributes=True)

class WorkOrderUpdateOut(WorkOrderUpdateBase):
    id: int
    work_order_id: int
    created_at: datetime
    user: UserInUpdate
    model_config = ConfigDict(from_attributes=True)

class WorkOrderBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = 'Normal'
    assigned_user_id: Optional[int] = None
    status: Optional[str] = 'Pending'
    model_config = ConfigDict(from_attributes=True)

class WorkOrderIn(WorkOrderBase):
    pass

class WorkOrderOut(WorkOrderBase):
    id: int
    is_emri_no: str
    created_at: datetime
    updated_at: datetime
    assigned_to_user: Optional[UserOut] = None
    updates: List[WorkOrderUpdateOut] = []
    model_config = ConfigDict(from_attributes=True)

# YENİ: Bildirim okuma şeması
class NotificationRead(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime
    user_id: int
    model_config = ConfigDict(from_attributes=True)