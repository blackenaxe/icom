from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Veritabanı bağlantı adresi
SQLALCHEMY_DATABASE_URL = "sqlite:///./isemri.db"

# SQLite için özel bağlantı parametresi
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Oturum (session) oluşturucu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Taban sınıf (model mirası için)
Base = declarative_base()

# Kullanıcı modeli (giriş-çıkış için)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

# İş Emri modeli
class IsEmri(Base):
    __tablename__ = "isemirleri"
    id = Column(Integer, primary_key=True, index=True)
    is_emri_no = Column(String, unique=True, index=True)  # 👈 iş emri numarası
    title = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String)
    assigned = Column(String)
    status = Column(String)
    created_at = Column(String)  # Basit tarih metni olarak saklıyoruz

# DB bağlantısı dependency'si
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
