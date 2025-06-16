### backend/crud.py
from sqlalchemy.orm import Session
from models import Photo

def get_all_photos(db: Session):
    photos = db.query(Photo).all()
    return [
        {
            "id": p.id,
            "filename": p.filename,
            "lat": p.location.coords[1] if p.location else None,
            "lon": p.location.coords[0] if p.location else None,
            "description": p.description
        } for p in photos
    ]

def get_photo_by_id(db: Session, photo_id: int):
    return db.query(Photo).filter(Photo.id == photo_id).first()