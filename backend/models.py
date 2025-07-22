from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    
    work_orders = relationship("WorkOrder", back_populates="assigned_to_user")
    updates = relationship("WorkOrderUpdate", back_populates="user")
    notifications = relationship("Notification", back_populates="user") # YENİ: Bildirimler için ilişki

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id = Column(Integer, primary_key=True, index=True)
    is_emri_no = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    priority = Column(Enum('Düşük', 'Normal', 'Yüksek'), default='Normal')
    status = Column(Enum('Pending', 'In Progress', 'Completed', 'Cancelled'), default='Pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_user = relationship("User", back_populates="work_orders")
    
    updates = relationship("WorkOrderUpdate", back_populates="work_order", cascade="all, delete-orphan")

class WorkOrderUpdate(Base):
    __tablename__ = "work_order_updates"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    work_order_id = Column(Integer, ForeignKey("work_orders.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    work_order = relationship("WorkOrder", back_populates="updates")
    user = relationship("User", back_populates="updates")

# YENİ: Notification modeli
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Kullanıcıya olan ilişki
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="notifications")