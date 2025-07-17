### backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db import Base
from geoalchemy2 import Geography

from geoalchemy2 import Geometry
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql import func
from geoalchemy2.shape import to_shape

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String, unique=True, index=True)
    location = Column(Geography(geometry_type='POINT', srid=4326))
    datetime = Column(DateTime)
    description = Column(String)
    is_underwater = Column(Boolean, default=False) 
    
    @hybrid_property
    def coords(self):
        # Convert WKBElement to shapely shape, then extract coords
        if self.location is not None:
            point = to_shape(self.location)  # shapely Point object
            return [point.x, point.y]
        else:
            return None
        
    survey_id = Column(Integer, ForeignKey("field_surveys.id", ondelete="CASCADE"))
    survey = relationship("FieldSurvey", back_populates="photos")
        
class FieldSurvey(Base):
    __tablename__ = "field_surveys"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    survey_name = Column(String(100), unique=True, index=True, nullable=False)
    location = Column(Geography(geometry_type='POINT', srid=4326), nullable = True)
    datetime = Column(DateTime)
    comment = Column(String(500))
    abovewater_folder = Column(String(100))
    underwater_folder = Column(String(100))
    linking_file = Column(String(100))
    photos = relationship("Photo", back_populates="survey", cascade="all, delete-orphan")
    
    @hybrid_property
    def coords(self):
        # Convert WKBElement to shapely shape, then extract coords
        if self.location is not None:
            point = to_shape(self.location)  # shapely Point object
            return [point.x, point.y]
        else:
            return None
