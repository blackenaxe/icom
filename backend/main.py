from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import isemri, users, auth
from . import notifications # YENİ: notifications'u import et

app = FastAPI()

# CORS ayarları
origins = [
    "http://localhost:3000",  "http://localhost:8081" , "http://192.168.1.176:3000","http://192.168.1.144:3000","http://172.20.10.5:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'larınızı buraya dahil edin
app.include_router(isemri.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(notifications.router, prefix="/api") # YENİ: Bildirim router'ını ekle

# Ana rota
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}