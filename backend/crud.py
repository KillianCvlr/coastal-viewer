### backend/crud.py
from sqlalchemy.orm import Session, joinedload
from models import Photo, Tag, photo_tags
from schemas import PhotoCreate, TagBase, TagCreate
from typing import List

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import delete, and_


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


def get_missing_photo_ids(db: Session, photo_ids: list[int]) -> set[int]:
    result = db.query(Photo.id).filter(Photo.id.in_(photo_ids)).all()
    found_ids = {row[0] for row in result}
    return set(photo_ids) - found_ids

def get_photos_by_ids(db: Session, photo_ids: list[int]) -> list[Photo]:
    return db.query(Photo).filter(Photo.id.in_(photo_ids)).all()

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

def delete_survey_by_id(db: Session, survey_id: int):
    survey = db.query(FieldSurvey).filter(FieldSurvey.id == survey_id).first()
    if not survey:
        return None
    db.delete(survey)
    db.commit()
    return survey

def get_all_surveys_data(db: Session):
    return db.query(FieldSurvey).all()

def get_survey_data(db: Session, survey_id: int):
    return db.query(FieldSurvey).filter(FieldSurvey.id == survey_id).first()

def get_survey_photos(db: Session, survey_id: int):
    return db.query(Photo).options(joinedload(Photo.tags)).filter(Photo.survey_id == survey_id)

def get_survey_by_name(db: Session, surveyName: str):
    return db.query(FieldSurvey).filter(FieldSurvey.survey_name == surveyName).first()

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

def get_count_survey_abovewater_photos(db: Session, survey_id: int):
    return (
        db.query(Photo)
        .filter(Photo.survey_id == survey_id)
        .filter(Photo.is_underwater == False)
        .count()
    )

def get_count_survey_underwater_photos(db: Session, survey_id: int):
    return (
        db.query(Photo)
        .filter(Photo.survey_id == survey_id)
        .filter(Photo.is_underwater == True)
        .count()
    )

def update_survey_with_first_photo(db: Session, survey: FieldSurvey, photo: Photo):
    if not survey or not photo:
        return
    survey.datetime = photo.datetime
    survey.location = photo.location
    db.commit()

def get_num_surveys(db: Session):
    return db.query(FieldSurvey).count()

def get_survey_photos_ids_without_loc(db: Session, survey_id:int) -> list[int]:
    rows = (
        db.query(Photo.id)
        .filter(Photo.survey_id == survey_id)
        .filter((Photo.location == None))
        .all()
    )
    return [row[0] for row in rows] 

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

def get_missing_tag_ids(db: Session, tag_ids: list[int]) -> set[int]:
    result = db.query(Tag.id).filter(Tag.id.in_(tag_ids)).all()
    found_ids = {row[0] for row in result}
    return set(tag_ids) - found_ids

def get_tags_by_ids(db: Session, tag_ids: list[int]) -> list[Tag]:
    return db.query(Tag).filter(Tag.id.in_(tag_ids)).all()

def bulk_delete_and_set_photo_tags(db: Session, photo_ids: list[int], tag_ids: list[int]):
    # 1. Clear old associations
    db.execute(delete(photo_tags).where(photo_tags.c.photo_id.in_(photo_ids)))

    if(len(tag_ids) > 0) :
        # 2. Insert new associations
        new_rows = [{"photo_id": pid, "tag_id": tid} for pid in photo_ids for tid in tag_ids]
        db.execute(insert(photo_tags), new_rows)

    db.commit()

def bulk_add_photo_tags(db: Session, photo_ids: list[int], tag_ids: list[int]):
    if(len(tag_ids) > 0) :
        stmt = insert(photo_tags).values([
            {"photo_id": pid, "tag_id": tid} 
            for pid in photo_ids 
            for tid in tag_ids
        ])
        stmt = stmt.on_conflict_do_nothing(index_elements=["photo_id", "tag_id"])

        db.execute(stmt)
    db.commit()

def bulk_pop_photo_tags(db: Session, photo_ids: list[int], tag_ids: list[int]):
    if(len(tag_ids) > 0) :
        stmt = delete(photo_tags).where(
        and_(
            photo_tags.c.photo_id.in_(photo_ids),
            photo_tags.c.tag_id.in_(tag_ids)
            )
        )   
        db.execute(stmt)
    db.commit()