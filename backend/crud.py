### backend/crud.py
from sqlalchemy.orm import Session
from models import Photo

def get_all_photos(db: Session):
    return db.query(Photo).all()

def get_photo_by_id(db: Session, photo_id: int):
    return db.query(Photo).filter(Photo.id == photo_id).first()

from models import FieldSurveys
from schemas import FieldSurveyCreate
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

def create_survey(db: Session, survey: FieldSurveyCreate):
    location_geom = from_shape(Point(survey.location_lon, survey.location_lat), srid=4326)

    new_survey = FieldSurveys(
        survey_name=survey.survey_name,
        location=location_geom,
        datetime=survey.datetime,
        comment=survey.comment,
        abovewater_folder=survey.abovewater_folder,
        underwater_folder=survey.underwater_folder,
        linking_file=survey.linking_file
    )
    db.add(new_survey)
    db.commit()
    db.refresh(new_survey)
    return new_survey
