# database.py
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./test.db" # Veritabanı URL'nizi buraya yazın

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class IsEmri(Base):
    __tablename__ = "is_emirleri"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(String)
    assigned = Column(String)
    status = Column(String)
    is_emri_no = Column(String, unique=True, index=True)
    created_at = Column(String)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Eğer veritabanı tablolarınız yoksa veya şema değiştiyse,
# bu satırı bir kez çalıştırarak tabloları oluşturabilirsiniz.
# Ancak mevcut veritabanınızda veri varsa dikkatli olun,
# şema değişikliği için Alembic gibi bir migration aracı kullanmanız önerilir.
Base.metadata.create_all(bind=engine) # <-- BU SATIRIN YORUMUNU KALDIRIN!