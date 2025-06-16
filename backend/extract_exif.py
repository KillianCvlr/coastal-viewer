import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import psycopg2
from datetime import datetime

def extract_all_exif():
    photo_dir = "/app/rawphotos"
    db_url = os.environ.get("DATABASE_URL")

    if not db_url:
        raise ValueError("DATABASE_URL not set")

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    for filename in os.listdir(photo_dir):
        if not filename.lower().endswith(('.jpg', '.jpeg', '.tif')):
            continue

        path = os.path.join(photo_dir, filename)
        timestamp = None
        lat, lon = None, None

        try:
            img = Image.open(path)
            exif_data = img._getexif()
            if exif_data:
                timestamp_raw = exif_data.get(36867)
                if timestamp_raw:
                    timestamp = datetime.strptime(timestamp_raw, "%Y:%m:%d %H:%M:%S")

                gps_info = exif_data.get(34853)
                if gps_info:
                    lat, lon = parse_gps(gps_info)
        except Exception as e:
            print(f"⚠ Error reading {filename}: {e}")

        try:
            if lat is not None and lon is not None:
                cur.execute("""
                    INSERT INTO photos (filename, filepath, datetime, geom)
                    VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    ON CONFLICT (filename) DO NOTHING;
                """, (filename, path, timestamp, lon, lat))
            else:
                # No GPS, set geom to NULL
                cur.execute("""
                    INSERT INTO photos (filename, filepath, datetime, geom)
                    VALUES (%s, %s, %s, NULL)
                    ON CONFLICT (filename) DO NOTHING;
                """, (filename, path, timestamp))
        except Exception as e:
            print(f"⚠ Insert error for {filename}: {e}")
            conn.rollback()
        else:
            conn.commit()

    cur.close()
    conn.close()

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
        print(f"⚠ GPS parse error: {e}")
        return None, None
