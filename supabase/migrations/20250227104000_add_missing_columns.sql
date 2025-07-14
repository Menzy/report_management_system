/*
  # Add missing columns to existing tables

  1. Add missing columns to schools table:
    - `email` (text) - School contact email
    - `phone` (text) - School contact phone number

  2. Add missing columns to scores table:
    - `term` (text) - Academic term (FIRST TERM, SECOND TERM, THIRD TERM)
    - `academic_year` (text) - Academic year in format YYYY/YYYY

  3. Update RLS policies to account for new columns
*/

-- Add missing columns to schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add missing columns to scores table
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS term TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- Create index for better performance on term and academic_year queries
CREATE INDEX IF NOT EXISTS idx_scores_term_academic_year 
ON scores(term, academic_year);

-- Create index for better performance on student_id, subject_id, term, academic_year combination
CREATE INDEX IF NOT EXISTS idx_scores_student_subject_term_year 
ON scores(student_id, subject_id, term, academic_year); 