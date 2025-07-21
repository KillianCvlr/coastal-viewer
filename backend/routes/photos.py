# routes/photos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.responses import FileResponse, StreamingResponse
from io import BytesIO
from db import get_db
from models import Photo
from schemas import PhotoOut
from crud import get_all_photos_data, get_photo_data_by_id
from geoalchemy2.functions import ST_AsGeoJSON
import os
from logger import logger
from PIL import Image

router = APIRouter()

@router.get("/photos/", response_model=list[PhotoOut])
def read_photos(db: Session = Depends(get_db)):
    logger.info("Getting all the photosdata")
    return get_all_photos_data(db)

@router.get("/photos/{photo_id:int}/data/", response_model=PhotoOut)
def serve_external_photo_data(photo_id: int, db: Session = Depends(get_db)):
    return get_photo_data_by_id(db, photo_id=photo_id)


@router.get("/photos/{photo_path:path}/fullRes/")
def serve_photo_by_id(photo_path: str):
    logger.info(f"get fullres photo request for {photo_path}")
    if ".." in photo_path or photo_path.startswith("/"):
        logger.error("Invalid Path Requested")
        raise HTTPException(400, "Invalid path")
    
    full_path = os.path.join("/app/rawphotos", photo_path)
    if not os.path.exists(full_path):
        logger.error("No such filepath")
        raise HTTPException(status_code=404, detail="No Such filepath")
    
    return FileResponse(full_path)

@router.get("/photos/{photo_path:path}/downscaled/")
def serve_downscaled_image(photo_path: str):
    logger.info(f"get photo request for {photo_path}")
    if ".." in photo_path or photo_path.startswith("/"):
        logger.error("Invalid Path Requested")
        raise HTTPException(400, "Invalid path")
    
    full_path = os.path.join("/app/rawphotos", photo_path)
    if not os.path.exists(full_path):
        logger.error("No such filepath")
        raise HTTPException(status_code=404, detail="No Such filepath")
    
    image = Image.open(full_path)

    # Resize to fit screen (e.g., max 1280px wide)
    image.thumbnail((1280, 1280), Image.Resampling.BICUBIC)

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/jpeg")

