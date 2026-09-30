import { createClient } from '@supabase/supabase-js';
import { Appointment, ContactMessage } from '../types/index.ts';

export const SUPABASE_PROJECT_ID = 'skjxhebmiepgirclepfg';
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://skjxhebmiepgirclepfg.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_UJ4Bk3TFcHjXxQpb6BTOJw_gSf_-MAm';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SQL script for the user to run in Supabase SQL editor if table is not yet created
export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new)

CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  appointment_id TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT,
  is_new_patient BOOLEAN DEFAULT true,
  department TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  preferred_language TEXT DEFAULT 'Kannada',
  status TEXT DEFAULT 'Pending',
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow insert and read access
CREATE POLICY "Allow public inserts" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.appointments FOR UPDATE USING (true);

-- Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public message insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public message select" ON public.contact_messages FOR SELECT USING (true);
`;

/**
 * Saves an appointment record to the Supabase database.
 * Formats the data to match standard Supabase PostgreSQL table columns.
 */
export async function saveAppointmentToSupabase(apt: Appointment): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: apt.id,
      appointment_id: apt.appointmentId,
      patient_name: apt.patientName,
      phone: apt.phone,
      email: apt.email || null,
      age: apt.age || 0,
      gender: apt.gender || 'Prefer not to say',
      is_new_patient: Boolean(apt.isNewPatient),
      department: apt.department,
      service_id: apt.serviceId,
      service_name: apt.serviceName,
      doctor_id: apt.doctorId || null,
      doctor_name: apt.doctorName || null,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      preferred_language: apt.preferredLanguage || 'Kannada',
      status: apt.status || 'Pending',
      staff_notes: apt.staffNotes || null,
      created_at: apt.createdAt || new Date().toISOString(),
      updated_at: apt.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('appointments').insert([payload]);

    if (error) {
      console.warn('Supabase insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving appointment to Supabase:', err);
    return { success: false, error: err.message || 'Supabase connection error' };
  }
}

/**
 * Saves a contact message to Supabase
 */
export async function saveContactToSupabase(msg: ContactMessage): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: msg.id,
      name: msg.name,
      phone: msg.phone,
      email: msg.email || null,
      message: msg.message,
      created_at: msg.createdAt || new Date().toISOString(),
      is_read: Boolean(msg.isRead),
    };

    const { error } = await supabase.from('contact_messages').insert([payload]);

    if (error) {
      console.warn('Supabase contact message insert warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Check if Supabase appointments table exists and is accessible
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  tableReady: boolean;
  message: string;
  count?: number;
}> {
  try {
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('Could not find the table') || error.code === 'PGRST205') {
        return {
          connected: true,
          tableReady: false,
          message: "Connected to Supabase project 'skjxhebmiepgirclepfg', but table 'public.appointments' has not been created yet.",
        };
      }
      return {
        connected: false,
        tableReady: false,
        message: error.message,
      };
    }

    return {
      connected: true,
      tableReady: true,
      message: "Connected and 'appointments' table is ready!",
      count: count ?? 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableReady: false,
      message: err.message || 'Failed to connect to Supabase',
    };
  }
}
