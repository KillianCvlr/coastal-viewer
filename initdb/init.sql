CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE  IF NOT EXISTS field_surveys (
  id SERIAL PRIMARY KEY,
  survey_name TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),
  datetime TIMESTAMP,
  comment TEXT,
  abovewater_folder TEXT,
  underwater_folder TEXT,
  linking_file TEXT
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  local_index INTEGER DEFAULT (-1),
  filename TEXT,
  filepath TEXT UNIQUE,
  datetime TIMESTAMP,
  location GEOGRAPHY(Point, 4326),
  is_underwater BOOLEAN DEFAULT FALSE,
  description TEXT,
  survey_id INTEGER REFERENCES field_surveys(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS photo_tags (
  photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);