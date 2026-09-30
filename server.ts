import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { initialHospitalDatabase, DEFAULT_ADMIN_PASSWORD_HASH } from './src/data/defaultData.ts';
import { HospitalDatabase, Appointment, ContactMessage, Holiday, HospitalService, Doctor, Facility, GalleryImage, WorkingHoursDay, HospitalSettings } from './src/types/index.ts';
import {
  saveAppointmentToSupabase,
  saveContactToSupabase,
  checkSupabaseStatus,
  SUPABASE_SETUP_SQL,
  SUPABASE_PROJECT_ID,
} from './src/lib/supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data store path
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'hospital_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory active database
let db: HospitalDatabase;

function loadDatabase(): HospitalDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure required collections exist
      return {
        ...initialHospitalDatabase,
        ...parsed,
        settings: { ...initialHospitalDatabase.settings, ...(parsed.settings || {}) },
        businessHours: parsed.businessHours || initialHospitalDatabase.businessHours,
        holidays: parsed.holidays || initialHospitalDatabase.holidays,
        services: parsed.services || initialHospitalDatabase.services,
        doctors: parsed.doctors || initialHospitalDatabase.doctors,
        facilities: parsed.facilities || initialHospitalDatabase.facilities,
        gallery: parsed.gallery || initialHospitalDatabase.gallery,
        appointments: parsed.appointments || initialHospitalDatabase.appointments,
        contactMessages: parsed.contactMessages || initialHospitalDatabase.contactMessages,
        adminPasswordHash: parsed.adminPasswordHash || DEFAULT_ADMIN_PASSWORD_HASH,
      };
    }
  } catch (err) {
    console.error('Error reading hospital_data.json, loading defaults:', err);
  }
  return JSON.parse(JSON.stringify(initialHospitalDatabase));
}

function saveDatabase() {
  try {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

db = loadDatabase();
saveDatabase();

// In-memory valid admin session tokens
const activeAdminTokens = new Set<string>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

// Helper to format minutes to "hh:mm AM/PM"
function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 is 12
  const formattedH = h < 10 ? `0${h}` : `${h}`;
  const formattedM = m < 10 ? `0${m}` : `${m}`;
  return `${formattedH}:${formattedM} ${ampm}`;
}

// Generate time slots given start and end "HH:mm" with step in minutes
function generateTimeIntervals(startTime: string, endTime: string, stepMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentTotalMin = startH * 60 + startM;
  const endTotalMin = endH * 60 + endM;

  while (currentTotalMin + stepMinutes <= endTotalMin) {
    const h = Math.floor(currentTotalMin / 60);
    const m = currentTotalMin % 60;
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push(formatTime12h(time24));
    currentTotalMin += stepMinutes;
  }
  return slots;
}

// Middleware: Authenticate Admin via Bearer token
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }
  const token = authHeader.split('Bearer ')[1].trim();
  if (!activeAdminTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // --------------------------------------------------------------------------
  // PUBLIC API ENDPOINTS
  // --------------------------------------------------------------------------

  // Full public payload (excluding admin secrets, contact messages, and private patient details)
  app.get('/api/public-data', (req: Request, res: Response) => {
    res.json({
      settings: db.settings,
      businessHours: db.businessHours,
      holidays: db.holidays,
      services: db.services.filter((s) => s.isAvailable),
      doctors: db.doctors.filter((d) => d.isAvailable),
      facilities: db.facilities,
      gallery: db.gallery,
    });
  });

  // Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  // Services
  app.get('/api/services', (req: Request, res: Response) => {
    const { department } = req.query;
    let list = db.services.filter((s) => s.isAvailable);
    if (department) {
      list = list.filter((s) => s.department === department);
    }
    res.json(list);
  });

  // Doctors
  app.get('/api/doctors', (req: Request, res: Response) => {
    const { department } = req.query;
    let list = db.doctors.filter((d) => d.isAvailable);
    if (department) {
      list = list.filter((d) => d.department === department);
    }
    res.json(list);
  });

  // Facilities
  app.get('/api/facilities', (req: Request, res: Response) => {
    res.json(db.facilities);
  });

  // Gallery
  app.get('/api/gallery', (req: Request, res: Response) => {
    res.json(db.gallery);
  });

  // Business Hours
  app.get('/api/business-hours', (req: Request, res: Response) => {
    res.json(db.businessHours);
  });

  // Holidays
  app.get('/api/holidays', (req: Request, res: Response) => {
    res.json(db.holidays);
  });

  // Dynamic available time slots with double-booking prevention
  app.get('/api/appointments/available-slots', (req: Request, res: Response) => {
    const { date, department, doctorId } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date query parameter (YYYY-MM-DD) is required' });
    }

    // Check holiday
    const isHoliday = db.holidays.find((h) => h.date === date);
    if (isHoliday) {
      return res.json({
        date,
        isClosed: true,
        reason: `Hospital holiday: ${isHoliday.name}`,
        slots: [],
      });
    }

    // Determine Day of Week
    const targetDate = new Date(`${date}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const dayNames: WorkingHoursDay['day'][] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayOfWeek = dayNames[targetDate.getDay()];

    const schedule = db.businessHours.find((b) => b.day === dayOfWeek);
    if (!schedule || !schedule.isOpen) {
      return res.json({
        date,
        isClosed: true,
        reason: schedule?.note || `${dayOfWeek} is currently closed. Contact hospital to confirm availability.`,
        slots: [],
      });
    }

    // Check if doctor has specific consultation days if doctor specified
    if (doctorId && typeof doctorId === 'string') {
      const doctor = db.doctors.find((d) => d.id === doctorId);
      if (doctor && doctor.consultationDays && doctor.consultationDays.length > 0) {
        if (!doctor.consultationDays.includes(dayOfWeek)) {
          return res.json({
            date,
            isClosed: true,
            reason: `${doctor.name} does not consult on ${dayOfWeek}s. Please pick another date or select General Consultation.`,
            slots: [],
          });
        }
      }
    }

    const duration = db.settings.slotDurationMinutes || 30;

    // Morning session slots
    const morningSlots = schedule.morningStart && schedule.morningEnd
      ? generateTimeIntervals(schedule.morningStart, schedule.morningEnd, duration)
      : [];

    // Evening session slots
    const eveningSlots = schedule.eveningStart && schedule.eveningEnd
      ? generateTimeIntervals(schedule.eveningStart, schedule.eveningEnd, duration)
      : [];

    const allCandidateSlots = [...morningSlots, ...eveningSlots];

    // Find all active booked appointments for this date & department/doctor
    const bookedAppointments = db.appointments.filter((apt) => {
      if (apt.date !== date) return false;
      if (apt.status === 'Cancelled') return false;

      // If doctor specified, conflict if doctor is booked
      if (doctorId && apt.doctorId) {
        return apt.doctorId === doctorId;
      }
      // If same department, prevent slot collision
      if (department) {
        return apt.department === department;
      }
      return true;
    });

    const bookedTimes = new Set(bookedAppointments.map((a) => a.time));

    const resultSlots = allCandidateSlots.map((timeStr) => {
      const isBooked = bookedTimes.has(timeStr);
      return {
        time: timeStr,
        isAvailable: !isBooked,
        reason: isBooked ? 'Already booked by another patient' : undefined,
      };
    });

    res.json({
      date,
      isClosed: false,
      dayOfWeek,
      schedule,
      slots: resultSlots,
    });
  });

  // Book an appointment (with strict server-side validation and double-booking prevention)
  app.post('/api/appointments', async (req: Request, res: Response) => {
    try {
      const {
        patientName,
        phone,
        email,
        age,
        gender,
        isNewPatient,
        department,
        serviceId,
        serviceName,
        doctorId,
        doctorName,
        date,
        time,
        reason,
        preferredLanguage,
        consent,
      } = req.body;

      if (!consent) {
        return res.status(400).json({ error: 'Patient consent must be confirmed before booking.' });
      }

      if (!patientName || !phone || !department || !serviceId || !date || !time) {
        return res.status(400).json({ error: 'Missing required appointment fields.' });
      }

      // Check double-booking
      const existing = db.appointments.find((apt) => {
        if (apt.date !== date || apt.time !== time) return false;
        if (apt.status === 'Cancelled') return false;
        if (doctorId && apt.doctorId) {
          return apt.doctorId === doctorId;
        }
        return apt.department === department;
      });

      if (existing) {
        return res.status(409).json({
          error: 'This appointment slot was just booked by another patient. Please select another convenient time.',
          conflict: true,
        });
      }

      // Generate unique appointment ID: e.g. MEH-2026-08421
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const appointmentId = `MEH-${year}-${randomSuffix}`;

      // Resolve service name if missing
      const resolvedService = db.services.find((s) => s.id === serviceId);
      const finalServiceName = serviceName || resolvedService?.name || 'General Consultation';

      // Resolve doctor name if applicable
      let finalDoctorName = doctorName;
      if (doctorId && !finalDoctorName) {
        const doc = db.doctors.find((d) => d.id === doctorId);
        finalDoctorName = doc?.name;
      }

      const newAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        appointmentId,
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        age: parseInt(String(age), 10) || 0,
        gender: gender || 'Prefer not to say',
        isNewPatient: Boolean(isNewPatient),
        department: department === 'dental' ? 'dental' : 'eye',
        serviceId,
        serviceName: finalServiceName,
        doctorId: doctorId || undefined,
        doctorName: finalDoctorName || undefined,
        date,
        time,
        reason: (reason || 'Consultation').trim(),
        preferredLanguage: preferredLanguage || 'English',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.appointments.unshift(newAppointment);
      saveDatabase();

      // Automatically sync appointment to Supabase database
      const supabaseResult = await saveAppointmentToSupabase(newAppointment);
      if (supabaseResult.success) {
        console.log(`[Supabase] Synced appointment ${appointmentId} to Supabase successfully.`);
      } else {
        console.warn(`[Supabase] Note on appointment ${appointmentId}: ${supabaseResult.error}`);
      }

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        appointment: newAppointment,
        supabaseSynced: supabaseResult.success,
        supabaseError: supabaseResult.error,
      });
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      res.status(500).json({ error: 'Failed to process appointment booking.' });
    }
  });

  // Submit contact message
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const { name, phone, email, message } = req.body;
      if (!name || !phone || !message) {
        return res.status(400).json({ error: 'Name, phone number, and message are required.' });
      }

      const newMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        message: message.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      db.contactMessages.unshift(newMsg);
      saveDatabase();

      // Sync contact message to Supabase
      saveContactToSupabase(newMsg).catch((err) => {
        console.warn('[Supabase] Contact message sync note:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for contacting Maruthi Eye & Dental Hospital. Our hospital desk will get in touch shortly.',
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit contact message.' });
    }
  });

  // --------------------------------------------------------------------------
  // ADMIN AUTHENTICATION
  // --------------------------------------------------------------------------

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashed = hashPassword(password);
    if (hashed === db.adminPasswordHash) {
      const token = `admin_tok_${crypto.randomBytes(24).toString('hex')}`;
      activeAdminTokens.add(token);
      return res.json({
        success: true,
        token,
        message: 'Admin authenticated successfully',
      });
    }

    res.status(401).json({ error: 'Invalid administrator password' });
  });

  app.get('/api/admin/verify', requireAdmin, (req: Request, res: Response) => {
    res.json({ authenticated: true });
  });

  app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      activeAdminTokens.delete(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    const currentHash = hashPassword(currentPassword);
    if (currentHash !== db.adminPasswordHash) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    db.adminPasswordHash = hashPassword(newPassword);
    saveDatabase();
    res.json({ success: true, message: 'Admin password updated successfully' });
  });

  // --------------------------------------------------------------------------
  // ADMIN DASHBOARD & MANAGEMENT (Protected)
  // --------------------------------------------------------------------------

  // Get full appointments list with query filters
  app.get('/api/admin/appointments', requireAdmin, (req: Request, res: Response) => {
    const { status, department, search, date } = req.query;

    let list = [...db.appointments];

    if (status && typeof status === 'string' && status !== 'all') {
      list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    if (department && typeof department === 'string' && department !== 'all') {
      list = list.filter((a) => a.department === department);
    }

    if (date && typeof date === 'string') {
      list = list.filter((a) => a.date === date);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.appointmentId.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      );
    }

    res.json({
      total: db.appointments.length,
      filteredTotal: list.length,
      appointments: list,
    });
  });

  // Update appointment status
  app.put('/api/admin/appointments/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (status) {
      apt.status = status;
    }
    if (staffNotes !== undefined) {
      apt.staffNotes = staffNotes;
    }
    apt.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, appointment: apt });
  });

  // Reschedule appointment with double-booking check
  app.put('/api/admin/appointments/:id/reschedule', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, time } = req.body;

    const apt = db.appointments.find((a) => a.id === id);
    if (!apt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check double-booking
    const conflict = db.appointments.find((other) => {
      if (other.id === id) return false;
      if (other.date !== date || other.time !== time) return false;
      if (other.status === 'Cancelled') return false;
      if (apt.doctorId && other.doctorId) return other.doctorId === apt.doctorId;
      return other.department === apt.department;
    });

    if (conflict) {
      return res.status(409).json({
        error: `Slot ${time} on ${date} is already booked by ${conflict.patientName} (${conflict.appointmentId})`,
      });
    }

    apt.date = date;
    apt.time = time;
    apt.status = 'Confirmed';
    apt.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, appointment: apt });
  });

  // Delete appointment
  app.delete('/api/admin/appointments/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const removed = db.appointments.splice(index, 1)[0];
    saveDatabase();
    res.json({ success: true, removedId: removed.id });
  });

  // Manage Settings
  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    saveDatabase();
    res.json({ success: true, settings: db.settings });
  });

  // Manage Working Hours
  app.put('/api/admin/business-hours', requireAdmin, (req: Request, res: Response) => {
    const { businessHours } = req.body;
    if (Array.isArray(businessHours)) {
      db.businessHours = businessHours;
      saveDatabase();
      return res.json({ success: true, businessHours: db.businessHours });
    }
    res.status(400).json({ error: 'Invalid business hours payload' });
  });

  // Manage Holidays
  app.post('/api/admin/holidays', requireAdmin, (req: Request, res: Response) => {
    const { date, name } = req.body;
    if (!date || !name) {
      return res.status(400).json({ error: 'Date and holiday name are required' });
    }
    const newHol: Holiday = {
      id: `hol-${Date.now()}`,
      date,
      name,
      isRecurring: Boolean(req.body.isRecurring),
    };
    db.holidays.push(newHol);
    saveDatabase();
    res.status(201).json({ success: true, holiday: newHol });
  });

  app.delete('/api/admin/holidays/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.holidays = db.holidays.filter((h) => h.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Manage Services
  app.post('/api/admin/services', requireAdmin, (req: Request, res: Response) => {
    const { department, name, shortDescription, iconName, durationMinutes, price } = req.body;
    if (!department || !name || !shortDescription) {
      return res.status(400).json({ error: 'Department, name, and short description are required' });
    }

    const newService: HospitalService = {
      id: `srv-${Date.now()}`,
      department: department === 'dental' ? 'dental' : 'eye',
      name: name.trim(),
      shortDescription: shortDescription.trim(),
      iconName: iconName || (department === 'dental' ? 'Smile' : 'Eye'),
      durationMinutes: parseInt(String(durationMinutes), 10) || 30,
      price: price ? price.trim() : undefined,
      isAvailable: true,
      displayOrder: db.services.length + 1,
    };

    db.services.push(newService);
    saveDatabase();
    res.status(201).json({ success: true, service: newService });
  });

  app.put('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.services.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }

    db.services[index] = { ...db.services[index], ...req.body };
    saveDatabase();
    res.json({ success: true, service: db.services[index] });
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.services = db.services.filter((s) => s.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Manage Doctors
  app.post('/api/admin/doctors', requireAdmin, (req: Request, res: Response) => {
    const {
      name,
      department,
      speciality,
      qualifications,
      experience,
      languages,
      consultationDays,
      consultationHours,
      photoUrl,
    } = req.body;

    if (!name || !department || !speciality) {
      return res.status(400).json({ error: 'Doctor name, department, and speciality are required' });
    }

    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      name: name.trim(),
      department: department === 'dental' ? 'dental' : 'eye',
      speciality: speciality.trim(),
      qualifications: qualifications ? qualifications.trim() : '',
      experience: experience ? experience.trim() : '',
      languages: Array.isArray(languages) ? languages : ['Kannada', 'English'],
      consultationDays: Array.isArray(consultationDays)
        ? consultationDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      consultationHours: consultationHours || '09:30 AM - 01:30 PM, 04:30 PM - 08:30 PM',
      photoUrl: photoUrl || '',
      isAvailable: true,
      notes: req.body.notes || '',
    };

    db.doctors.push(newDoctor);
    saveDatabase();
    res.status(201).json({ success: true, doctor: newDoctor });
  });

  app.put('/api/admin/doctors/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.doctors.findIndex((d) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    db.doctors[index] = { ...db.doctors[index], ...req.body };
    saveDatabase();
    res.json({ success: true, doctor: db.doctors[index] });
  });

  app.delete('/api/admin/doctors/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.doctors = db.doctors.filter((d) => d.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Manage Facilities
  app.post('/api/admin/facilities', requireAdmin, (req: Request, res: Response) => {
    const { title, category, description, imageUrl, features } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const newFacility: Facility = {
      id: `fac-${Date.now()}`,
      title: title.trim(),
      category: category || 'Facility',
      description: description.trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      features: Array.isArray(features) ? features : [],
      displayOrder: db.facilities.length + 1,
    };
    db.facilities.push(newFacility);
    saveDatabase();
    res.status(201).json({ success: true, facility: newFacility });
  });

  app.put('/api/admin/facilities/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.facilities.findIndex((f) => f.id === id);
    if (index === -1) return res.status(404).json({ error: 'Facility not found' });
    db.facilities[index] = { ...db.facilities[index], ...req.body };
    saveDatabase();
    res.json({ success: true, facility: db.facilities[index] });
  });

  app.delete('/api/admin/facilities/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.facilities = db.facilities.filter((f) => f.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Manage Gallery
  app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
    const { title, category, imageUrl, altText } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and Image URL are required' });
    }
    const newImage: GalleryImage = {
      id: `gal-${Date.now()}`,
      title: title.trim(),
      category: category || 'Facilities',
      imageUrl: imageUrl.trim(),
      altText: altText ? altText.trim() : title.trim(),
      displayOrder: db.gallery.length + 1,
    };
    db.gallery.push(newImage);
    saveDatabase();
    res.status(201).json({ success: true, galleryImage: newImage });
  });

  app.put('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.gallery.findIndex((g) => g.id === id);
    if (index === -1) return res.status(404).json({ error: 'Gallery image not found' });
    db.gallery[index] = { ...db.gallery[index], ...req.body };
    saveDatabase();
    res.json({ success: true, galleryImage: db.gallery[index] });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    db.gallery = db.gallery.filter((g) => g.id !== id);
    saveDatabase();
    res.json({ success: true });
  });

  // Contact Messages Inbox (Protected)
  app.get('/api/admin/messages', requireAdmin, (req: Request, res: Response) => {
    res.json(db.contactMessages);
  });

  app.put('/api/admin/messages/:id/read', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const msg = db.contactMessages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      saveDatabase();
    }
    res.json({ success: true });
  });

  // --------------------------------------------------------------------------
  // SUPABASE INTEGRATION STATUS & BULK SYNC (Protected)
  // --------------------------------------------------------------------------

  app.get('/api/admin/supabase-status', requireAdmin, async (req: Request, res: Response) => {
    const status = await checkSupabaseStatus();
    res.json({
      ...status,
      projectId: SUPABASE_PROJECT_ID,
      sqlScript: SUPABASE_SETUP_SQL,
      localAppointmentsCount: db.appointments.length,
    });
  });

  app.post('/api/admin/supabase-sync-all', requireAdmin, async (req: Request, res: Response) => {
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const apt of db.appointments) {
      const result = await saveAppointmentToSupabase(apt);
      if (result.success) {
        synced++;
      } else {
        failed++;
        if (result.error && !errors.includes(result.error)) {
          errors.push(result.error);
        }
      }
    }

    res.json({
      success: true,
      synced,
      failed,
      total: db.appointments.length,
      errors: errors.slice(0, 3),
    });
  });

  // --------------------------------------------------------------------------
  // FRONTEND INTEGRATION
  // --------------------------------------------------------------------------

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maruthi Hospital Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
