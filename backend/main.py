from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import psycopg2
import json
from sqlalchemy.exc import OperationalError
from db import SessionLocal, engine, get_db
from models import Base
from fastapi.middleware.cors import CORSMiddleware
from routes import field_surveys, photos, logs
from schemas import FieldSurveyCreate, TagCreate
from crud import get_num_surveys

from fastapi.exceptions import RequestValidationError
from logger import logger, setup_logger

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_logger()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

app.include_router(field_surveys.router)
app.include_router(photos.router)
app.include_router(logs.router)

Base.metadata.create_all(bind=engine)

MAX_RETRIES = 10
for i in range(MAX_RETRIES):
    try:
        # Try a dummy DB session
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        if not (photos.no_coords_tag_exists(db)):

            noCoordTag = TagCreate(
                name="noCoords",
                color="#63452c"
            )
            photos.post_new_tag(noCoordTag, db)

        if get_num_surveys(db) < 1 :
            test_survey = FieldSurveyCreate(
                survey_name="survey_test_2020",
                comment="Test survey creation",
                abovewater_folder="fromNAS/2020-IP/Alto",
                underwater_folder="fromNAS/2020-IP/Basso",
                linking_file="survey_2025_07/links.csv"
            )

            field_surveys.post_and_process_survey(test_survey, db )
            
        db.close()
        print("✅ Database is ready")
        break
    except OperationalError:
        print(f"⏳ Waiting for database... ({i+1}/{MAX_RETRIES})")
        time.sleep(200)
else:
    raise Exception("❌ Could not connect to the database after retries.")

logger.info("Backend Extracting phots...")
#extract_all_exif("/app/rawphotos/test")
logger.info("Backend Ready !")

