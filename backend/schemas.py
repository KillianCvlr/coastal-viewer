from pydantic import BaseModel, Field, validator, errors
from datetime import datetime
from typing import Optional
from fastapi import Form
from geoalchemy2 import WKTElement


class PhotoOut(BaseModel):
    id : int
    filename: str
    filepath: str
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]
    is_underwater: Optional[bool]
    survey_id: Optional[int]

    class Config:
        orm_mode = True

class PhotoCreate(BaseModel) :
    filename: str
    filepath: str
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]
    is_underwater: Optional[bool]
    survey_id: Optional[int]

    def to_orm(self) -> dict:
        data = self.dict()
        if self.coords:
            data["location"] = WKTElement(f'POINT({self.coords[0]} {self.coords[1]})', srid=4326)
        data.pop("coords", None) 
        return data

    class Config:
        orm_mode = True

######################   Field Surveys   #################################

class FieldSurveyCreate(BaseModel):
    survey_name: str
    comment: Optional[str] = None
    abovewater_folder: Optional[str] = None
    underwater_folder: Optional[str] = None
    linking_file: Optional[str] = None

class FieldSurveyData(BaseModel):
    survey_name: str
    comment: Optional[str]
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]
    abovewater_folder: Optional[str]
    underwater_folder: Optional[str]
    linking_file: Optional[str]

    class Config:
        orm_mode = True

class FieldSurveyUpdate(BaseModel):
    survey_name: Optional[str] = None
    comment: Optional[str] = None
    abovewater_folder: Optional[str] = None
    underwater_folder: Optional[str] = None
    linking_file: Optional[str] = None

    class Config:
        orm_mode = True