/*
  # Create Resume Builder Tables

  1. New Tables
    - `resumes` - Stores base resumes
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text, full resume content)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `resume_work_experience` - Stores work experience entries
      - `id` (uuid, primary key)
      - `resume_id` (uuid, references resumes)
      - `title` (text, job title - immutable)
      - `company` (text)
      - `start_date` (text, immutable)
      - `end_date` (text, immutable)
      - `description` (text, mutable - for AI customization)
      - `original_description` (text, backup of original)
      - `order` (integer, for ordering)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own resumes
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume_work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  start_date text NOT NULL,
  end_date text NOT NULL,
  description text NOT NULL,
  original_description text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage work experience in their resumes"
  ON resume_work_experience FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_work_experience.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert work experience in their resumes"
  ON resume_work_experience FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_work_experience.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update work experience in their resumes"
  ON resume_work_experience FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_work_experience.resume_id
      AND resumes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_work_experience.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete work experience in their resumes"
  ON resume_work_experience FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_work_experience.resume_id
      AND resumes.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_resume_id ON resume_work_experience(resume_id);
