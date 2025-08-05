from pydantic import BaseModel, Field, validator, errors
from datetime import datetime
from typing import Optional
from fastapi import Form
from geoalchemy2 import WKTElement



######################   Photo TAGS   #################################

class TagBase(BaseModel):
    name: str
    color: Optional[str] = Field(..., pattern=r'^#(?:[0-9a-fA-F]{3}){1,2}$')

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int

    class Config:
        orm_mode = True

######################   Photo      #################################

class PhotoOut(BaseModel):
    id : int
    in_surey_index : int
    filename: str
    filepath: str
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]
    is_underwater: Optional[bool]
    survey_id: Optional[int]
    tags: Optional[list[int]] = Field(..., alias="tag_ids")

    
    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class PhotoCreate(BaseModel) :
    filename: str
    in_surey_index: int
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
    id: int
    comment: Optional[str]
    coords: Optional[list[float]] = None
    datetime: Optional[datetime]
    abovewater_folder: Optional[str]
    underwater_folder: Optional[str]
    linking_file: Optional[str]
    underwater_offset : Optional[int]

    class Config:
        orm_mode = True

class FieldSurveyUpdate(BaseModel):
    survey_name: Optional[str] = None
    comment: Optional[str] = None
    abovewater_folder: Optional[str] = None
    underwater_folder: Optional[str] = None
    linking_file: Optional[str] = None
    underwater_offset: Optional[int] = None

    class Config:
        orm_mode = True

