from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from isemri import router as isemri_router
from auth import router as auth_router

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için uygundur
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

# Rotaları bağla
app.include_router(auth_router, prefix="/api")
app.include_router(isemri_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "İş Emri API çalışıyor"}
