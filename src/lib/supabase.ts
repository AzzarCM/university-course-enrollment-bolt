import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Student {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor: string;
  credits: number;
  max_capacity: number;
  created_at: string;
}

export interface CourseSchedule {
  id: string;
  course_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'enrolled' | 'dropped' | 'waitlist';
}

export interface CourseWithSchedules extends Course {
  course_schedules: CourseSchedule[];
  enrollments?: Enrollment[];
}
