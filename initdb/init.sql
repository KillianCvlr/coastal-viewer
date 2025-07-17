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
  filename TEXT,
  filepath TEXT UNIQUE,
  datetime TIMESTAMP,
  location GEOGRAPHY(Point, 4326),
  is_underwater BOOLEAN DEFAULT FALSE,
  description TEXT,
  survey_id INTEGER REFERENCES field_surveys(id) ON DELETE CASCADE
);

