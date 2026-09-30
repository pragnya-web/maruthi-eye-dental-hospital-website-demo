import {
  HospitalSettings,
  WorkingHoursDay,
  Holiday,
  HospitalService,
  Doctor,
  Facility,
  GalleryImage,
  Appointment,
  ContactMessage,
} from '../types/index.ts';
import { initialHospitalDatabase } from '../data/defaultData.ts';

const ADMIN_TOKEN_KEY = 'maruthi_admin_token';

export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

const authHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Public data
  async getPublicData() {
    try {
      const res = await fetch('/api/public-data');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API getPublicData failed, using fallback:', e);
    }
    return {
      settings: initialHospitalDatabase.settings,
      businessHours: initialHospitalDatabase.businessHours,
      holidays: initialHospitalDatabase.holidays,
      services: initialHospitalDatabase.services,
      doctors: initialHospitalDatabase.doctors,
      facilities: initialHospitalDatabase.facilities,
      gallery: initialHospitalDatabase.gallery,
    };
  },

  // Available slots check with double-booking prevention
  async getAvailableSlots(date: string, department?: string, doctorId?: string) {
    const params = new URLSearchParams({ date });
    if (department) params.append('department', department);
    if (doctorId) params.append('doctorId', doctorId);

    const res = await fetch(`/api/appointments/available-slots?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch slots');
    }
    return await res.json();
  },

  // Book appointment
  async bookAppointment(appointmentData: {
    patientName: string;
    phone: string;
    email?: string;
    age: number;
    gender?: string;
    isNewPatient: boolean;
    department: 'eye' | 'dental';
    serviceId: string;
    serviceName: string;
    doctorId?: string;
    doctorName?: string;
    date: string;
    time: string;
    reason: string;
    preferredLanguage: string;
    consent: boolean;
  }) {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to book appointment.');
    }
    return data;
  },

  // Submit contact message
  async submitContact(formData: { name: string; phone: string; email?: string; message: string }) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit message.');
    }
    return data;
  },

  // Admin Auth
  async loginAdmin(password: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    if (data.token) {
      setAdminToken(data.token);
    }
    return data;
  },

  async verifyAdmin() {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/admin/verify', {
        headers: authHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async logoutAdmin() {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch (e) {
      console.warn('Logout API failed:', e);
    } finally {
      clearAdminToken();
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update password');
    return data;
  },

  // Admin appointments
  async getAdminAppointments(filters?: { status?: string; department?: string; search?: string; date?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date) params.append('date', filters.date);

    const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin appointments');
    return await res.json();
  },

  async updateAppointmentStatus(id: string, status: string, staffNotes?: string) {
    const res = await fetch(`/api/admin/appointments/${id}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status, staffNotes }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  },

  async rescheduleAppointment(id: string, date: string, time: string) {
    const res = await fetch(`/api/admin/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ date, time }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reschedule');
    return data;
  },

  async deleteAppointment(id: string) {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
    return await res.json();
  },

  // Admin Settings
  async updateSettings(settings: Partial<HospitalSettings>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  },

  // Admin Business Hours
  async updateBusinessHours(businessHours: WorkingHoursDay[]) {
    const res = await fetch('/api/admin/business-hours', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ businessHours }),
    });
    if (!res.ok) throw new Error('Failed to update business hours');
    return await res.json();
  },

  // Admin Holidays
  async addHoliday(holiday: { date: string; name: string; isRecurring?: boolean }) {
    const res = await fetch('/api/admin/holidays', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(holiday),
    });
    if (!res.ok) throw new Error('Failed to add holiday');
    return await res.json();
  },

  async deleteHoliday(id: string) {
    const res = await fetch(`/api/admin/holidays/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete holiday');
    return await res.json();
  },

  // Admin Services
  async addService(service: Partial<HospitalService>) {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to add service');
    return await res.json();
  },

  async updateService(id: string, service: Partial<HospitalService>) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return await res.json();
  },

  async deleteService(id: string) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return await res.json();
  },

  // Admin Doctors
  async addDoctor(doctor: Partial<Doctor>) {
    const res = await fetch('/api/admin/doctors', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(doctor),
    });
    if (!res.ok) throw new Error('Failed to add doctor');
    return await res.json();
  },

  async updateDoctor(id: string, doctor: Partial<Doctor>) {
    const res = await fetch(`/api/admin/doctors/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(doctor),
    });
    if (!res.ok) throw new Error('Failed to update doctor');
    return await res.json();
  },

  async deleteDoctor(id: string) {
    const res = await fetch(`/api/admin/doctors/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete doctor');
    return await res.json();
  },

  // Admin Facilities
  async addFacility(facility: Partial<Facility>) {
    const res = await fetch('/api/admin/facilities', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(facility),
    });
    if (!res.ok) throw new Error('Failed to add facility');
    return await res.json();
  },

  async updateFacility(id: string, facility: Partial<Facility>) {
    const res = await fetch(`/api/admin/facilities/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(facility),
    });
    if (!res.ok) throw new Error('Failed to update facility');
    return await res.json();
  },

  async deleteFacility(id: string) {
    const res = await fetch(`/api/admin/facilities/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete facility');
    return await res.json();
  },

  // Admin Gallery
  async addGalleryImage(image: Partial<GalleryImage>) {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(image),
    });
    if (!res.ok) throw new Error('Failed to add gallery image');
    return await res.json();
  },

  async updateGalleryImage(id: string, image: Partial<GalleryImage>) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(image),
    });
    if (!res.ok) throw new Error('Failed to update gallery image');
    return await res.json();
  },

  async deleteGalleryImage(id: string) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete gallery image');
    return await res.json();
  },

  // Admin Messages
  async getMessages() {
    const res = await fetch('/api/admin/messages', {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },

  async markMessageRead(id: string) {
    const res = await fetch(`/api/admin/messages/${id}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark message as read');
    return await res.json();
  },

  // Supabase Backend Management
  async getSupabaseStatus() {
    const res = await fetch('/api/admin/supabase-status', {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve Supabase status');
    return await res.json();
  },

  async syncAllToSupabase() {
    const res = await fetch('/api/admin/supabase-sync-all', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to trigger bulk sync');
    return await res.json();
  },
};
