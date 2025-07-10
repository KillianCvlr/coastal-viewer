# routes/photos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.responses import FileResponse, JSONResponse
from db import get_db
from models import Photo
from schemas import PhotoOut
from crud import get_all_photos, get_photo_by_id
from geoalchemy2.functions import ST_AsGeoJSON
import os
import json

router = APIRouter()

@router.get("/photos", response_model=list[PhotoOut])
def read_photos(db: Session = Depends(get_db)):
    return get_all_photos(db)

@router.get("/photo/{filename}")
def serve_external_photo(filename: str):
    file_path = f"/app/rawphotos/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(404, "Not found")
    return FileResponse(file_path)
