from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from schemas import FieldSurveyCreate
from crud import create_survey

router = APIRouter()

@router.post("/surveys/")
def create_field_survey(survey: FieldSurveyCreate, db: Session = Depends(get_db)):
    return create_survey(db, survey)
