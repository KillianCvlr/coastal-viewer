### backend/crud.py
from sqlalchemy.orm import Session
from models import Photo
from schemas import PhotoCreate
from typing import List
def get_all_photos_data(db: Session):
    return db.query(Photo).all()

def get_photo_data_by_id(db: Session, photo_id: int):
    return db.query(Photo).filter(Photo.id == photo_id).first()

def add_photos(db: Session, photos: List[PhotoCreate]):
    for photo in photos:
        db_photo = Photo(**(photo.to_orm()))
        db.add(db_photo)
    db.commit()

def get_first_photo_with_location(db: Session, survey_id: int):
    return (
        db.query(Photo)
        .filter(Photo.survey_id == survey_id, Photo.location.isnot(None))
        .first()
    )

############################## Field Survey ###################################
from models import FieldSurvey
from schemas import FieldSurveyCreate
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

def create_survey(db: Session, survey_data: FieldSurveyCreate):
    new_survey = FieldSurvey(
        **survey_data.dict(),
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey

def get_all_surveys_data(db: Session):
    return db.query(FieldSurvey).all()

def update_survey_with_first_photo(db: Session, survey: FieldSurvey, photo: Photo):
    if not survey or not photo:
        return
    survey.datetime = photo.datetime
    survey.location = photo.location
    db.commit()
