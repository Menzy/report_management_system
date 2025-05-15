import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Note: In a real application, these would be environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be provided. Please connect to Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type School = {
  id: string;
  name: string;
  slogan: string;
  address: string;
  crest_url: string;
  user_id: string;
  created_at: string;
  email?: string;
  phone?: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
  has_completed_onboarding: boolean;
};

export type Class = {
  id: string;
  name: string;
  school_id: string;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  class_id: string;
  school_id: string;
  created_at: string;
};

export type Student = {
  id: string;
  student_id: string;
  name: string;
  class_id: string;
  school_id: string;
  created_at: string;
};

export type Score = {
  id: string;
  student_id: string;
  subject_id: string;
  assessment_type: string;
  score: number;
  max_score: number;
  created_at: string;
  term?: string;
  academic_year?: string;
};

export type StudentRecord = {
  student_id: string;
  name: string;
  scores: {
    [assessmentType: string]: number;
  };
  attendance?: number;
  term?: string;
  academic_year?: string;
};

export const ASSESSMENT_TYPES = ['TEST 1', 'TEST 2', 'EXAM', 'CA', 'QUIZ', 'MIDTERM', 'FINAL'];

export const TERMS = ['FIRST TERM', 'SECOND TERM', 'THIRD TERM'];

// Helper function to get the current academic year in format '2024/2025'
export const getCurrentAcademicYear = (): string => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed, 0 = January
  
  // If we're in the second half of the year (July onwards), academic year is current/next
  // Otherwise it's previous/current
  if (month >= 6) { // July onwards
    return `${currentYear}/${currentYear + 1}`;
  } else {
    return `${currentYear - 1}/${currentYear}`;
  }
};