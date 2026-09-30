export type DepartmentType = 'eye' | 'dental';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';

export interface HospitalSettings {
  name: string;
  alternateNames: string[];
  tagline: string;
  description: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phone: string;
  email: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  googleMapsEmbedQuery: string;
  slotDurationMinutes: number;
  aboutText: string;
  features: string[];
  medicalDisclaimer: string;
  emergencyNotice: string;
}

export interface WorkingHoursDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  morningStart: string; // e.g., "09:30"
  morningEnd: string;   // e.g., "13:30"
  eveningStart: string; // e.g., "16:30"
  eveningEnd: string;   // e.g., "20:30"
  note?: string;        // e.g., "Contact hospital to confirm availability."
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isRecurring?: boolean;
}

export interface HospitalService {
  id: string;
  department: DepartmentType;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  iconName: string;
  durationMinutes: number;
  price?: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface Doctor {
  id: string;
  name: string;
  department: DepartmentType;
  speciality: string;
  qualifications: string;
  experience: string;
  languages: string[];
  consultationDays: string[];
  consultationHours: string;
  photoUrl?: string;
  isAvailable: boolean;
  notes?: string;
}

export interface Facility {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  features: string[];
  displayOrder: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: 'Hospital Exterior' | 'Reception' | 'Eye Care' | 'Dental Care' | 'Facilities' | 'Patient Areas';
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

export interface Appointment {
  id: string;
  appointmentId: string; // e.g., "MEH-2026-00124"
  patientName: string;
  phone: string;
  email?: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  isNewPatient: boolean;
  department: DepartmentType;
  serviceId: string;
  serviceName: string;
  doctorId?: string;
  doctorName?: string;
  date: string; // YYYY-MM-DD
  time: string; // "09:30 AM"
  reason: string;
  preferredLanguage: string;
  status: AppointmentStatus;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface HospitalDatabase {
  settings: HospitalSettings;
  businessHours: WorkingHoursDay[];
  holidays: Holiday[];
  services: HospitalService[];
  doctors: Doctor[];
  facilities: Facility[];
  gallery: GalleryImage[];
  appointments: Appointment[];
  contactMessages: ContactMessage[];
  adminPasswordHash: string; // SHA-256
}
