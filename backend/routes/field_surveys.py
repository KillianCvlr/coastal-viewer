from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from db import get_db
from schemas import FieldSurveyCreate, PhotoOut, FieldSurveyData
from crud import create_survey, add_photos, update_survey_with_first_photo, get_all_surveys_data, get_survey_data, get_survey_photos
from crud import get_survey_photos_abovewater, get_survey_photos_underwater, get_first_photo_with_location, get_count_survey_abovewater_photos, get_count_survey_underwater_photos
from crud import delete_survey_by_id
from pathlib import Path
from logger import logger
from utils import parse_photos_from_folder, get_conflicting_folder, is_existing_folder, internal_folder_conflict

router = APIRouter()

@router.get("/surveys/", response_model=list[FieldSurveyData])
def serve_all_surveys_data(db: Session = Depends(get_db)):
    logger.info("Getting all surveys data")
    return get_all_surveys_data(db)

@router.get("/surveys/{survey_id:int}", response_model=FieldSurveyData)
def serve_survey_data(survey_id: int, db: Session = Depends(get_db)):
    logger.info(f"Getting survey {survey_id} data")
    return get_survey_data(db, survey_id)

@router.get("/surveys/{survey_id:int}/photos/", response_model=list[PhotoOut])
def serve_survey_photos(survey_id: int, db: Session = Depends(get_db)):
    logger.info(f"Getting survey {survey_id} photos")
    return get_survey_photos(db, survey_id)

@router.get("/surveys/{survey_id:int}/photos/aboveWater/", response_model=list[PhotoOut])
def serve_survey_photos(survey_id: int, db: Session = Depends(get_db)):
    logger.info(f"Getting survey {survey_id} photos")
    return get_survey_photos_abovewater(db, survey_id)

@router.get("/surveys/{survey_id:int}/photos/underWater/", response_model=list[PhotoOut])
def serve_survey_photos(survey_id: int, db: Session = Depends(get_db)):
    logger.info(f"Getting survey {survey_id} photos")
    return get_survey_photos_underwater(db, survey_id)

@router.delete("/surveys/{survey_id:int}/", status_code=204)
def delete_survey_by_id_route(survey_id: int, db: Session = Depends(get_db)):
    logger.info(f"Deleting Survey by Id : {survey_id}")
    db_survey = get_survey_data(db, survey_id)
    if not db_survey: 
        logger.info(f"No survey with ID {survey_id} found")
        raise HTTPException(status_code=500, detail=f"No Survey with Id {survey_id} found")
    nb_underwater = get_count_survey_underwater_photos(db, survey_id)
    nb_abovewater = get_count_survey_abovewater_photos(db, survey_id)
    delete_survey_by_id(db, survey_id)
    logger.info(f"Survey {survey_id} deleted")
    logger.info(f"Deleting {nb_abovewater} abovewater photos and {nb_underwater} underwater photos relations")
    return

@router.post("/surveys/")
def post_and_process_survey(new_data: FieldSurveyCreate, db: Session = Depends(get_db)):
    
    # First check survey's folder validty
    # Checks existence, No input = no folder, not no relative path
    for folder in [new_data.underwater_folder, new_data.abovewater_folder]:
        if not folder:
            continue
        if not is_existing_folder(folder):
            logger.error(f"Folder {folder} does not exists")
            raise HTTPException(status_code=500, detail=f"Folder {folder} does not exists")
    
    # Checks conflict between above and underwater folders :
    if internal_folder_conflict(new_data):
        logger.error("Conflicts between above and under water folders")
        raise HTTPException(status_code=500, detail="Conflicts between above and under water folders")
    
    # Checks conflicts with existing folders
    conflicting_folder = is_conflicting_survey(new_data,db)
    if (conflicting_folder):
        logger.error(f"Conflicts with existing'{conflicting_folder}'")
        raise HTTPException(status_code=500, detail=f"Conflicts with existing'{conflicting_folder}'")
    
    # No Errors founded, try to send data to database
    try:
        survey = create_survey(db, new_data)

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create field survey in database")
    
    # Survey created and sent to database
    logger.info(f"Created Survey : {survey.survey_name} with id {survey.id}...")

    # Parsing photos from NAS to send details to database
    logger.info("Parsing photos...")
    photos_parsed = parse_photos_from_folder(survey.abovewater_folder, is_underwater=False, survey_id=survey.id)
    photos_parsed.extend(parse_photos_from_folder(survey.underwater_folder, is_underwater=True, survey_id=survey.id))
    actualised_field_trip = False
    if len(photos_parsed) > 0:
        try:
            add_photos(db, photos_parsed)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to add photos to database")
        
        first_photo = get_first_photo_with_location(db, survey_id=survey.id)
        if first_photo :
            update_survey_with_first_photo(db, survey, first_photo)
            actualised_field_trip = True
            logger.info(f"Updated survey {survey.survey_name} location with photo {first_photo.filename}")
        else:
                logger.info("No Photo found to actualise field survey")
        logger.info(f"Parsed a total of {len(photos_parsed)} photos")
    else : 
        logger.info("No Photo Parsed")

    logger.info(f"✅ Successfuly added survey {survey.survey_name} with id : {survey.id} and {len(photos_parsed)} photos to database")

    return {"survey_id": survey.id, "total_photo_parsed": len(photos_parsed), "localisation_added": actualised_field_trip }

def is_conflicting_survey(survey: FieldSurveyCreate, db: Session = Depends(get_db)) -> str | None:
    surveys_data = serve_all_surveys_data(db)
    # Checks for both new under and abovewater directories if conflicting
    for folder in [survey.abovewater_folder, survey.underwater_folder]:
        if not folder:
            continue
        conflict = get_conflicting_folder(folder, surveys_data)
        if conflict:
            logger.error(f"folder {folder} conflicting with existing {conflict}")
            return conflict  # return first conflicting path
    return None

