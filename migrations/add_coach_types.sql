-- Create coach_types table
CREATE TABLE IF NOT EXISTS coach_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Add default coach types
INSERT INTO coach_types (name) VALUES
  ('Class A'),
  ('Class B'),
  ('Class C'),
  ('Luxury');

-- Add type_id column to coaches table
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS type_id INTEGER REFERENCES coach_types(id);

-- Set default type for existing coaches (assuming 'Luxury' is id 4)
UPDATE coaches SET type_id = 4 WHERE type_id IS NULL;