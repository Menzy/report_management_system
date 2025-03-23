/*
  # Create storage buckets for school assets

  1. New Storage Buckets
    - `school-assets` - For storing school crests and other school-related files
  2. Security
    - Enable public access for authenticated users
*/

-- Create the school-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-assets', 'school-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the school-assets bucket
CREATE POLICY "Anyone can view school assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'school-assets');

CREATE POLICY "Authenticated users can upload school assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-assets');

CREATE POLICY "Users can update their own school assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-assets' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own school assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-assets' AND auth.uid() = owner);