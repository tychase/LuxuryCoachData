-- Add seller and location columns to coaches table
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS seller TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;