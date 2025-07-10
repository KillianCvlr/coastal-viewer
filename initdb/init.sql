CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE,
  filepath TEXT,
  datetime TIMESTAMP,
  location GEOMETRY(Point, 4326),
  description TEXT
);

CREATE TABLE  IF NOT EXISTS field_surveys (
  id SERIAL PRIMARY KEY,
  survey_name TEXT NOT NULL,
  location GEOMETRY(Point, 4326),
  datetime TIMESTAMP,
  comment TEXT,
  abovewater_folder TEXT,
  underwater_folder TEXT,
  linking_file TEXT
);
