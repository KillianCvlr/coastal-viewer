import os
from datetime import datetime
from typing import Optional
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from schemas import PhotoCreate, FieldSurveyData, FieldSurveyCreate
from logger import logger

RAWPHOTOS_ROOT = "/app/rawphotos"

def parse_gps(gps):
    def to_float(rational):
        from PIL.TiffImagePlugin import IFDRational
        if isinstance(rational, IFDRational):
            return float(rational)
        else:
            return float(rational)
    def convert(coord):
        d, m, s = coord
        return to_float(d) + to_float(m)/60 + to_float(s)/3600

    try:
        lat = convert(gps[2])
        if gps[1] in ['S', 's']:
            lat = -lat

        lon = convert(gps[4])
        if gps[3] in ['W', 'w']:
            lon = -lon

        return lat, lon
    except Exception as e:
        logger.error(f"⚠ GPS parse error: {e}")
        return None, None

def parse_photos_from_folder(
    folder_path: str,
    is_underwater: bool = False,
    survey_id: Optional[int] = None
) -> list[PhotoCreate]:
    photo_list = []
    if len(folder_path) == 0 :
        logger.error("Parsing without folder path")
        return photo_list
    
    abs_path = os.path.join(RAWPHOTOS_ROOT, folder_path)
    if not os.path.exists(abs_path):
        logger.error(f"Parsing with non existent folder path {folder_path}")
        return photo_list
    
    logger.info("Reccursively parsing folder \"%s\" with absolute path %s ...", folder_path, abs_path)
    for root, dirs, files in os.walk(abs_path):
        dirs.sort()   # Ensure os.walk descends into directories in alphabetical order
        logger.info("Parsing folder \"%s\" ...", root)
        for fname in files:
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                full_path = os.path.join(root, fname)

                dt = None
                coords = None

                try:
                    image = Image.open(full_path)
                    exif_data = image._getexif()

                    if exif_data:
                        timestamp_raw = exif_data.get(36867)
                        if timestamp_raw:
                            dt = datetime.strptime(timestamp_raw, "%Y:%m:%d %H:%M:%S")

                        gps_info = exif_data.get(34853)
                        if gps_info:
                            coords = parse_gps(gps_info)
                        

                except Exception as e:
                    logger.info("Error Parsing %s", full_path)
                    pass  # Continue without failing

                photo = PhotoCreate(
                    filename=fname,
                    filepath=os.path.relpath(full_path, start="/app/rawphotos"),
                    in_survey_index = -1,
                    datetime=dt,
                    coords=coords,
                    is_underwater=is_underwater,
                    survey_id=survey_id,
                )
                ''' Too loud debbuging
                logger.debug(f"Parsed photo : {photo.filename}, {photo.filepath}, {photo.datetime}, "
                f"{photo.coords}, {photo.is_underwater}, {photo.survey_id}"
                )'''
                photo_list.append(photo)
    logger.info(f"Parsed {len(photo_list)} photos in {folder_path}")
    # Adding local indexes
    photo_list.sort(key=lambda p: p.filename)
    i = 0
    for photo in photo_list :
            photo.in_survey_index = i
            i +=1
    return photo_list

def is_existing_folder(new_folder : str) -> bool:
    abs_path = os.path.join(RAWPHOTOS_ROOT, new_folder)
    if not os.path.exists(abs_path):
        logger.error(f"Parsing with non existent folder path {new_folder}")
        return False
    return True

def get_conflicting_folder(new_folder: str, surveys : list[FieldSurveyData]) -> str | None:
    for survey in surveys:
        for folder in [survey.abovewater_folder, survey.underwater_folder]:
            if not folder:
                continue

            if (
                new_folder.startswith(folder + os.sep)  # new_folder inside existing
                or folder.startswith(new_folder + os.sep)  # existing inside new_folder
                or new_folder == folder  # exact match
            ):
                return folder  # conflict found
    return None  # no conflict

def internal_folder_conflict(new_data: FieldSurveyCreate):
    return (
                new_data.underwater_folder.startswith(new_data.abovewater_folder + os.sep)  # new_data.underwater_folder inside existing
                or new_data.abovewater_folder.startswith(new_data.underwater_folder + os.sep)  # existing inside new_data.underwater_folder
                or new_data.underwater_folder == new_data.abovewater_folder  # exact match
            )