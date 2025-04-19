-- Make price column nullable
ALTER TABLE coaches ALTER COLUMN price DROP NOT NULL;

-- Rename sort_order to position
ALTER TABLE coach_images RENAME COLUMN sort_order TO position;