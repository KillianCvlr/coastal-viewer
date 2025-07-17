# routes/photos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.responses import FileResponse, JSONResponse
from db import get_db
from models import Photo
from schemas import PhotoOut
from crud import get_all_photos_data, get_photo_data_by_id
from geoalchemy2.functions import ST_AsGeoJSON
import os
import json
from logger import logger

router = APIRouter()

@router.get("/photos", response_model=list[PhotoOut])
def read_photos(db: Session = Depends(get_db)):
    logger.info("Getting all the photosdata")
    return get_all_photos_data(db)

@router.get("/photoData/{photo_id}", response_model=PhotoOut)
def serve_external_photo_data(photo_id: int, db: Session = Depends(get_db)):
    return get_photo_data_by_id(db, photo_id=photo_id)


@router.get("/photo/{photo_path:path}")
def serve_photo_by_id(photo_path: str):
    logger.info(f"got photo request for {photo_path}")
    if ".." in photo_path or photo_path.startswith("/"):
        logger.error("Invalid Path Requested")
        raise HTTPException(400, "Invalid path")
    
    full_path = os.path.join("/app/rawphotos", photo_path)
    if not os.path.exists(full_path):
        logger.error("No such filepath")
        raise HTTPException(status_code=404, detail="No Such filepath")
    
    return FileResponse(full_path)
# --- Static file serving ---
# raw_photo_path = "/app/rawphotos"
# if os.path.exists(raw_photo_path):
#     app.mount("/photo", StaticFiles(directory=raw_photo_path), name="photo")