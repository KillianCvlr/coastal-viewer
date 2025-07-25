# routes/photos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi.responses import FileResponse, StreamingResponse
from io import BytesIO
from db import get_db
from schemas import PhotoOut, TagCreate, TagOut
from crud import get_all_photos_data, get_photo_data_by_id, get_tag_by_name, create_tag, read_all_tags, get_tag_by_id, delete_tag_by_id, delete_tag_by_name
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
def serve_photo_data(photo_id: int, db: Session = Depends(get_db)):
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
    image.thumbnail((1280, 1280), Image.Resampling.BILINEAR)

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="image/jpeg")

################################# TAG Router ##################################

@router.get("/tags/", response_model=list[TagOut])
def get_all_tags(db: Session = Depends(get_db)):
    return read_all_tags(db)


@router.post("/tags/", response_model=TagOut)
def post_new_tag(tag: TagCreate, db: Session = Depends(get_db)):
    db_tag = get_tag_by_name(db, tag.name)
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag already exists")
    if tag.color == None:
        tag.color = '#000000'
        
    return create_tag(db, tag)

@router.post("/photos/{photo_id}/tags/", response_model=PhotoOut)
def assign_tags_to_photo(photo_id: int, tagList: list[int], db: Session = Depends(get_db)):
    photoData = get_photo_data_by_id(db, photo_id)
    if not photoData:
        raise HTTPException(status_code=404, detail="Photo not found")

    tags = []
    for tagId in tagList:
        db_tag = get_tag_by_id(db, tagId)
        if not db_tag:
            raise HTTPException(status_code=404, detail=f"Tag id: {tagId} not found")
        tags.append(db_tag)

    photoData.tags = tags
    db.commit()
    db.refresh(photoData)
    return photoData

@router.delete("/tags/{id:int}/", status_code=204)
def post_new_tag(id:int, db: Session = Depends(get_db)):
    db_tag = delete_tag_by_id(db,id)
    if not db_tag:
        raise HTTPException(status_code=400, detail="Tag does not exists")
    return

@router.delete("/tags/{name:str}/", status_code=204)
def post_new_tag(name:str, db: Session = Depends(get_db)):
    db_tag = delete_tag_by_name(db,name)
    if not db_tag:
        raise HTTPException(status_code=400, detail="Tag does not exists")
    return