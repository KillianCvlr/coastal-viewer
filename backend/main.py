from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import psycopg2
import os
import json
from sqlalchemy.exc import OperationalError
from db import SessionLocal, engine
from models import Base
from crud import get_all_photos, get_photo_by_id
from extract_exif import extract_all_exif
import os
import threading
from fastapi.middleware.cors import CORSMiddleware

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

# --- DB Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- API Endpoints ---
@app.get("/photos")
def get_photos():
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Fetch photo filename and geom as GeoJSON
    cur.execute("""
        SELECT filename, ST_AsGeoJSON(geom) as geojson, datetime
        FROM photos;
    """)
    photos = []
    for row in cur.fetchall():
        filename, geojson, datetime = row
        # geojson may be None if no GPS
        if geojson:
            coords = json.loads(geojson)["coordinates"]
        else:
            coords = None
        photos.append({
            "filename": filename,
            "coords": coords,
            "datetime": datetime.isoformat() if datetime else None
        })

    cur.close()
    conn.close()
    return JSONResponse(content=photos)

@app.get("/photo/{filename}")
def serve_external_photo(filename: str):
    file_path = f"/mnt/photos/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(404, "Not found")
    return FileResponse(file_path)
