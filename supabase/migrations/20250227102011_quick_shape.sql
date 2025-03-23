/*
  # Create schools table

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `slogan` (text)
      - `address` (text)
      - `crest_url` (text)
      - `user_id` (uuid, references profiles.id)
      - `created_at` (timestamp with time zone, default now())
  2. Security
    - Enable RLS on `schools` table
    - Add policies for authenticated users to read and update their own school
*/

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slogan TEXT,
  address TEXT,
  crest_url TEXT,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own school
CREATE POLICY "Users can read own school"
  ON schools
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own school
CREATE POLICY "Users can insert own school"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own school
CREATE POLICY "Users can update own school"
  ON schools
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);