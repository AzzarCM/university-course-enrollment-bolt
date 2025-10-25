/*
  # University Course Enrollment System Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Student unique identifier
      - `email` (text, unique) - Student email address
      - `full_name` (text) - Student full name
      - `created_at` (timestamptz) - Account creation timestamp

    - `courses`
      - `id` (uuid, primary key) - Course unique identifier
      - `code` (text, unique) - Course code (e.g., CS101)
      - `title` (text) - Course title
      - `description` (text) - Course description
      - `instructor` (text) - Instructor name
      - `credits` (integer) - Credit hours
      - `max_capacity` (integer) - Maximum number of students
      - `created_at` (timestamptz) - Record creation timestamp

    - `course_schedules`
      - `id` (uuid, primary key) - Schedule unique identifier
      - `course_id` (uuid, foreign key) - Reference to courses table
      - `day_of_week` (integer) - Day of week (0=Sunday, 6=Saturday)
      - `start_time` (time) - Class start time
      - `end_time` (time) - Class end time
      - `location` (text) - Classroom location
      - `created_at` (timestamptz) - Record creation timestamp

    - `enrollments`
      - `id` (uuid, primary key) - Enrollment unique identifier
      - `student_id` (uuid, foreign key) - Reference to students table
      - `course_id` (uuid, foreign key) - Reference to courses table
      - `enrolled_at` (timestamptz) - Enrollment timestamp
      - `status` (text) - Enrollment status (enrolled, dropped, waitlist)

  2. Security
    - Enable RLS on all tables
    - Students can read all courses and schedules (public information)
    - Students can view their own enrollment records
    - Students can enroll in courses (insert their own enrollments)
    - Students can drop courses (update their own enrollment status)
    - Students can read their own student profile

  3. Important Notes
    - Each course can have multiple schedule entries (for courses meeting multiple times per week)
    - Enrollment capacity is enforced at the application level
    - Uses auth.uid() for row-level security policies
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  instructor text NOT NULL,
  credits integer NOT NULL DEFAULT 3,
  max_capacity integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create course_schedules table
CREATE TABLE IF NOT EXISTS course_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY;

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'waitlist')),
  UNIQUE(student_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view their own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can insert their own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can update their own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for courses table (publicly readable)
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for course_schedules table (publicly readable)
CREATE POLICY "Anyone can view course schedules"
  ON course_schedules FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for enrollments table
CREATE POLICY "Students can view their own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll in courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id AND status = 'enrolled');

CREATE POLICY "Students can update their own enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_schedules_course_id ON course_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
