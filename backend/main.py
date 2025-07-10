from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import psycopg2
import json
from sqlalchemy.exc import OperationalError
from db import SessionLocal, engine, get_db
from models import Base
from crud import get_all_photos, get_photo_by_id
from extract_exif import extract_all_exif
import os
import threading
from fastapi.middleware.cors import CORSMiddleware
from routes import field_surveys, photos

from fastapi.exceptions import RequestValidationError
import logging


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"Validation error: {exc}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

app.include_router(field_surveys.router)
app.include_router(photos.router)

Base.metadata.create_all(bind=engine)

MAX_RETRIES = 10
for i in range(MAX_RETRIES):
    try:
        # Try a dummy DB session
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database is ready")
        break
    except OperationalError:
        print(f"⏳ Waiting for database... ({i+1}/{MAX_RETRIES})")
        time.sleep(200)
else:
    raise Exception("❌ Could not connect to the database after retries.")

# --- Static file serving ---
raw_photo_path = "/app/rawphotos"
if os.path.exists(raw_photo_path):
    app.mount("/photo", StaticFiles(directory=raw_photo_path), name="photo")

extract_all_exif()