### backend/crud.py
from sqlalchemy.orm import Session, joinedload
from models import Photo, Tag
from schemas import PhotoCreate, TagBase, TagCreate
from typing import List


def get_all_photos_data(db: Session):
    return db.query(Photo).options(joinedload(Photo.tags)).all()

def get_photo_data_by_id(db: Session, photo_id: int):
    return db.query(Photo).options(joinedload(Photo.tags)).filter(Photo.id == photo_id).first()

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
        **survey_data.dict()
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey

def get_all_surveys_data(db: Session):
    return db.query(FieldSurvey).all()

def get_survey_data(db: Session, survey_id: int):
    return db.query(FieldSurvey).filter(FieldSurvey.id == survey_id).first()

def get_survey_photos(db: Session, survey_id: int):
    return db.query(Photo).options(joinedload(Photo.tags)).filter(Photo.survey_id == survey_id)

def get_survey_photos_abovewater(db: Session, survey_id: int):
    return (
        db.query(Photo)
        .filter(Photo.survey_id == survey_id)
        .filter(Photo.is_underwater == False)
        .all()
    )

def get_survey_photos_underwater(db: Session, survey_id: int):
    return (
        db.query(Photo)
        .filter(Photo.survey_id == survey_id)
        .filter(Photo.is_underwater == True)
        .all()
    )

def update_survey_with_first_photo(db: Session, survey: FieldSurvey, photo: Photo):
    if not survey or not photo:
        return
    survey.datetime = photo.datetime
    survey.location = photo.location
    db.commit()

def get_num_surveys(db: Session):
    return db.query(FieldSurvey).count()

################################## TAG CRUD ###################################
def read_all_tags(db: Session):
    return db.query(Tag).all()

def get_tag_by_name(db: Session, name:str):
    return db.query(Tag).filter(Tag.name == name).first()

def get_tag_by_id(db: Session, id:int):
    return db.query(Tag).filter(Tag.id == id).first()

def delete_tag_by_id(db: Session, tag_id: int):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        return None
    db.delete(tag)
    db.commit()
    return tag

def delete_tag_by_name(db: Session, tag_name:str):
    tag = db.query(Tag).filter(Tag.name == tag_name).first()
    if not tag:
        return None
    db.delete(tag)
    db.commit()
    return tag



def create_tag(db: Session, tag:TagCreate):
    new_tag = Tag(**tag.dict())
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag