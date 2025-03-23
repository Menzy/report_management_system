/*
  # Create academic records tables

  1. New Tables
    - `classes` - For storing class information
      - `id` (uuid, primary key)
      - `name` (text, class name)
      - `school_id` (uuid, foreign key to schools)
      - `created_at` (timestamp)
    - `subjects` - For storing subject information
      - `id` (uuid, primary key)
      - `name` (text, subject name)
      - `class_id` (uuid, foreign key to classes)
      - `school_id` (uuid, foreign key to schools)
      - `created_at` (timestamp)
    - `students` - For storing student information
      - `id` (uuid, primary key)
      - `student_id` (text, unique student identifier)
      - `name` (text, student name)
      - `class_id` (uuid, foreign key to classes)
      - `school_id` (uuid, foreign key to schools)
      - `created_at` (timestamp)
    - `scores` - For storing student scores
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `subject_id` (uuid, foreign key to subjects)
      - `assessment_type` (text, type of assessment)
      - `score` (numeric, student score)
      - `max_score` (numeric, maximum possible score)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own school's data
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) NOT NULL,
  school_id UUID REFERENCES schools(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) NOT NULL,
  school_id UUID REFERENCES schools(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, school_id)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) NOT NULL,
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  assessment_type TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for classes table
CREATE POLICY "Users can read their own school's classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own school's classes"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own school's classes"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own school's classes"
  ON classes
  FOR DELETE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

-- Create policies for subjects table
CREATE POLICY "Users can read their own school's subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own school's subjects"
  ON subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own school's subjects"
  ON subjects
  FOR UPDATE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own school's subjects"
  ON subjects
  FOR DELETE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

-- Create policies for students table
CREATE POLICY "Users can read their own school's students"
  ON students
  FOR SELECT
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own school's students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own school's students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own school's students"
  ON students
  FOR DELETE
  TO authenticated
  USING (school_id IN (
    SELECT id FROM schools WHERE user_id = auth.uid()
  ));

-- Create policies for scores table
CREATE POLICY "Users can read their own school's scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert their own school's scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update their own school's scores"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete their own school's scores"
  ON scores
  FOR DELETE
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE school_id IN (
      SELECT id FROM schools WHERE user_id = auth.uid()
    )
  ));