from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PhotoOut(BaseModel):
    filename: str
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]


    class Config:
        orm_mode = True

class FieldSurveyCreate(BaseModel):
    survey_name: str
    location: tuple[float, float]  # (longitude, latitude)
    datetime: datetime
    comment: Optional[str] = None
    abovewater_folder: Optional[str] = None
    underwater_folder: Optional[str] = None
    linking_file: Optional[str] = None
