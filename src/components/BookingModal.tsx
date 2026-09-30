import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smile,
  ShieldCheck,
  Download,
  Share2,
  Navigation,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { DepartmentType, HospitalService, Doctor, Appointment } from '../types/index.ts';
import { api } from '../services/api.ts';

export const BookingModal: React.FC = () => {
  const {
    settings,
    services,
    doctors,
    businessHours,
    holidays,
    bookingModal,
    closeBookingModal,
  } = useHospital();

  // Step state: 1 to 8 (8 is confirmation)
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [department, setDepartment] = useState<DepartmentType>('eye');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');
  const [isNewPatient, setIsNewPatient] = useState<boolean>(true);
  const [reason, setReason] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Kannada');
  const [consent, setConsent] = useState(false);

  // Slot checking state
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isAvailable: boolean; reason?: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Sync initial props from modal opener
  useEffect(() => {
    if (bookingModal.isOpen) {
      setStep(1);
      setConfirmedAppointment(null);
      setSubmitError(null);

      const dept = bookingModal.initialDepartment || 'eye';
      setDepartment(dept);

      if (bookingModal.initialServiceId) {
        setSelectedServiceId(bookingModal.initialServiceId);
        // Can jump directly to date or service
      } else {
        const defaultService = services.find((s) => s.department === dept);
        if (defaultService) setSelectedServiceId(defaultService.id);
      }

      if (bookingModal.initialDoctorId) {
        setSelectedDoctorId(bookingModal.initialDoctorId);
      } else {
        setSelectedDoctorId('any');
      }

      // Default date to tomorrow if not set
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      setSelectedDate(tomorrowStr);
    }
  }, [bookingModal.isOpen, bookingModal.initialDepartment, bookingModal.initialServiceId, bookingModal.initialDoctorId, services]);

  // Filtered services
  const departmentServices = useMemo(() => {
    return services.filter((s) => s.department === department && s.isAvailable);
  }, [services, department]);

  // Filtered doctors
  const departmentDoctors = useMemo(() => {
    return doctors.filter((d) => d.department === department && d.isAvailable);
  }, [doctors, department]);

  // Fetch available slots from backend when date or doctor changes
  useEffect(() => {
    if (!selectedDate || step < 4) return;

    let isMounted = true;
    setSlotsLoading(true);
    setSlotsError(null);

    const docId = selectedDoctorId === 'any' ? undefined : selectedDoctorId;

    api
      .getAvailableSlots(selectedDate, department, docId)
      .then((data) => {
        if (!isMounted) return;
        if (data.isClosed) {
          setSlotsError(data.reason || 'Hospital is closed on this date.');
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.slots || []);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setSlotsError(err.message || 'Unable to check slot availability.');
        setAvailableSlots([]);
      })
      .finally(() => {
        if (isMounted) setSlotsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, department, selectedDoctorId, step]);

  // Selected Service object
  const currentService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Selected Doctor object
  const currentDoctor = useMemo(() => {
    if (selectedDoctorId === 'any') return null;
    return doctors.find((d) => d.id === selectedDoctorId);
  }, [doctors, selectedDoctorId]);

  // Trigger Confetti on Confirmation
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F2C59', '#FACC15', '#10B981', '#3B82F6'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Submit booking
  const handleFinalSubmit = async () => {
    if (!consent) {
      setSubmitError('Please accept the consent checkbox to continue.');
      return;
    }
    if (!patientName.trim() || !phone.trim()) {
      setSubmitError('Please provide your name and phone number.');
      return;
    }
    if (!selectedTime) {
      setSubmitError('Please select a valid consultation time slot.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.bookAppointment({
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : undefined,
        age: parseInt(age, 10) || 0,
        gender,
        isNewPatient,
        department,
        serviceId: selectedServiceId,
        serviceName: currentService?.name || 'General Consultation',
        doctorId: selectedDoctorId !== 'any' ? selectedDoctorId : undefined,
        doctorName: currentDoctor?.name || 'General Medical Specialist',
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim() || 'General Consultation',
        preferredLanguage,
        consent,
      });

      if (res.success && res.appointment) {
        setConfirmedAppointment(res.appointment);
        setStep(8); // Confirmation step
        triggerConfetti();
      } else {
        throw new Error(res.message || 'Failed to complete booking');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while scheduling. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Calendar Link generator
  const createGoogleCalendarUrl = (apt: Appointment) => {
    const title = encodeURIComponent(`Appointment: ${apt.serviceName} - Maruthi Eye & Dental Hospital`);
    const details = encodeURIComponent(
      `Appointment ID: ${apt.appointmentId}\nPatient: ${apt.patientName}\nDepartment: ${
        apt.department === 'eye' ? 'Eye Care' : 'Dental Care'
      }\nDoctor: ${apt.doctorName || 'General'}\nHospital Phone: ${settings.phone}\nAddress: ${
        settings.address.street
      }, ${settings.address.area}, ${settings.address.city}`
    );
    const location = encodeURIComponent('Maruthi Eye & Dental Hospital, OSB Road, Vidya Nagar, Gangavathi, Karnataka 583227');

    // Parse date and time to ISO format (assume local IST)
    const [year, month, day] = apt.date.split('-');
    const [timeStr, ampm] = apt.time.split(' ');
    let [h, m] = timeStr.split(':').map(Number);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;

    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), h - 5, m - 30));
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGDate(
      startDate
    )}/${formatGDate(endDate)}&details=${details}&location=${location}`;
  };

  // iCal .ics file download generator
  const downloadIcsFile = (apt: Appointment) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Maruthi Eye and Dental Hospital//Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${apt.appointmentId}@maruthieyedental.com`,
      `SUMMARY:Appointment: ${apt.serviceName} - Maruthi Eye & Dental Hospital`,
      `DESCRIPTION:Appointment ID: ${apt.appointmentId}\\nPatient: ${apt.patientName}\\nDepartment: ${apt.department}\\nHospital Phone: ${settings.phone}`,
      `LOCATION:OSB Road, 2nd Cross, Vidya Nagar, Gangavathi, Karnataka 583227`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Maruthi-Hospital-${apt.appointmentId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!bookingModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Main Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              {department === 'eye' ? <Eye className="w-4 h-4" /> : <Smile className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                <span>Book Appointment</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-800 text-amber-300 uppercase">
                  {department === 'eye' ? 'Eye Care' : 'Dental Care'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">Maruthi Eye & Dental Hospital, Gangavathi</p>
            </div>
          </div>

          <button
            onClick={closeBookingModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker (Steps 1 to 7) */}
        {step < 8 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Step {step} of 7</span>
              <span className="text-blue-950 font-bold">
                {step === 1 && 'Select Department'}
                {step === 2 && 'Select Service'}
                {step === 3 && 'Consulting Specialist'}
                {step === 4 && 'Choose Date'}
                {step === 5 && 'Select Time Slot'}
                {step === 6 && 'Patient Details'}
                {step === 7 && 'Review & Consent'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-bold text-slate-900">Select Clinical Department</h4>
                <p className="text-xs text-slate-500">
                  Choose between our specialized ophthalmology or dentistry departments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDepartment('eye');
                    const firstEye = services.find((s) => s.department === 'eye');
                    if (firstEye) setSelectedServiceId(firstEye.id);
                    setStep(2);
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between group ${
                    department === 'eye'
                      ? 'border-blue-950 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-blue-400 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold mb-3 shadow-xs">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-slate-900 mb-1">Eye Care (Ophthalmology)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cataract evaluation, phacoemulsification, glaucoma, retina care, OCT scan, and ophthalmic laser services.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-900">
                    <span>Continue with Eye Care</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepartment('dental');
                    const firstDental = services.find((s) => s.department === 'dental');
                    if (firstDental) setSelectedServiceId(firstDental.id);
                    setStep(2);
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between group ${
                    department === 'dental'
                      ? 'border-blue-950 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-amber-400 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold mb-3 shadow-xs">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-base text-slate-900 mb-1">Dental Care (Dentistry)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Comprehensive oral health consultations, dental examinations, tooth care, and customized oral treatments.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-900">
                    <span>Continue with Dental Care</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Service */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Select Service</h4>
                <p className="text-xs text-slate-500">
                  Select the specific reason or clinical evaluation pathway for your visit.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {departmentServices.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedServiceId === srv.id
                        ? 'border-blue-950 bg-blue-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{srv.name}</span>
                      {selectedServiceId === srv.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-950 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {srv.shortDescription}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Select Doctor */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Consulting Specialist</h4>
                <p className="text-xs text-slate-500">
                  Select a doctor or choose our on-duty general specialist.
                </p>
              </div>

              <div className="space-y-3">
                {/* General Option */}
                <button
                  type="button"
                  onClick={() => setSelectedDoctorId('any')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    selectedDoctorId === 'any'
                      ? 'border-blue-950 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">
                        Hospital General OPD Specialist
                      </h5>
                      <p className="text-xs text-slate-500">
                        Assigned based on regular OPD schedule and immediate availability.
                      </p>
                    </div>
                  </div>
                  {selectedDoctorId === 'any' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-950" />
                  )}
                </button>

                {/* Verified doctors if available in department */}
                {departmentDoctors.map((doc: Doctor) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      selectedDoctorId === doc.id
                        ? 'border-blue-950 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {doc.photoUrl ? (
                        <img
                          src={doc.photoUrl}
                          alt={doc.name}
                          className="w-10 h-10 rounded-xl object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                          {doc.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{doc.name}</h5>
                        <p className="text-xs text-slate-500">
                          {doc.speciality} {doc.qualifications ? `• ${doc.qualifications}` : ''}
                        </p>
                        {doc.consultationHours && (
                          <p className="text-[11px] text-blue-900 mt-0.5 font-medium">
                            {doc.consultationHours}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedDoctorId === doc.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-950" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Select Date */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Choose Appointment Date</h4>
                <p className="text-xs text-slate-500">
                  Hospital consultations run Monday through Saturday. Sunday availability must be confirmed directly.
                </p>
              </div>

              {/* Quick Preset Buttons (Today, Tomorrow, Day After) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[0, 1, 2, 3].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const str = d.toISOString().split('T')[0];
                  const label =
                    offset === 0
                      ? 'Today'
                      : offset === 1
                      ? 'Tomorrow'
                      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <button
                      key={str}
                      type="button"
                      onClick={() => setSelectedDate(str)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedDate === str
                          ? 'bg-blue-950 text-white border-blue-950'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Date Input Calendar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Calendar Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              {/* Holidays or Notes notice */}
              {holidays.some((h) => h.date === selectedDate) && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Note: The selected date is marked as a hospital closure holiday (
                    {holidays.find((h) => h.date === selectedDate)?.name}).
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Select Time Slot (Dynamic + Double Booking Prevention) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Select Time Slot</h4>
                  <p className="text-xs text-slate-500">
                    Date: <span className="font-semibold text-slate-800">{selectedDate}</span>
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  30 min slots
                </span>
              </div>

              {slotsLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading available hospital slots...</p>
                </div>
              ) : slotsError ? (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="text-sm font-semibold text-amber-900">{slotsError}</p>
                  <p className="text-xs text-slate-600">
                    Please go back and select another date, or call the hospital directly at +91 85332 34655.
                  </p>
                  <button
                    onClick={() => setStep(4)}
                    className="px-4 py-2 bg-white text-slate-800 font-bold text-xs rounded-xl border border-slate-300"
                  >
                    Change Date
                  </button>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-800">
                    No appointments are available for this date.
                  </p>
                  <p className="text-xs text-slate-500">
                    All slots may be booked or the clinic is not in session. Please choose another date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Slots Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-blue-950 text-amber-300 border-blue-950 shadow-sm'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-900 hover:bg-blue-50/50'
                          }`}
                          title={slot.reason || (slot.isAvailable ? 'Available' : 'Booked')}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                      Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-950" />
                      Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 line-through" />
                      Booked / Unavailable
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Patient Information */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Patient Details</h4>
                <p className="text-xs text-slate-500">
                  Please provide basic identification and contact details for appointment booking.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age in yrs"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-slate-400 font-normal">(Opt)</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden bg-white"
                    >
                      <option value="Prefer not to say">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden bg-white"
                    >
                      <option value="Kannada">Kannada</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Telugu">Telugu</option>
                    </select>
                  </div>
                </div>

                {/* New vs Existing Patient */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Visit Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                        isNewPatient
                          ? 'bg-blue-950 text-white border-blue-950'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      New Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewPatient(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                        !isNewPatient
                          ? 'bg-blue-950 text-white border-blue-950'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Existing Patient
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Visit / Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief description of symptoms or consultation goal..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Consent & Final Summary */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Review & Confirm Appointment</h4>
                <p className="text-xs text-slate-500">
                  Please verify your consultation details before finalizing your slot.
                </p>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {department === 'eye' ? 'Eye Care (Ophthalmology)' : 'Dental Care'}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="font-bold text-blue-950">{currentService?.name}</span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="font-bold text-slate-900">
                    {selectedDate} at {selectedTime}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Patient Name</span>
                  <span className="font-bold text-slate-900">{patientName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Mobile Number</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that the information provided is correct and agree to be contacted regarding my appointment.
                </span>
              </label>

              {/* Hospital Location Reminder */}
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>
                  Consultation at: Maruthi Eye & Dental Hospital, OSB Road, Vidya Nagar, Gangavathi.
                </span>
              </div>
            </div>
          )}

          {/* STEP 8: Confirmation Screen */}
          {step === 8 && confirmedAppointment && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-300">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Appointment Confirmed
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  We look forward to seeing you!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your appointment request has been scheduled with Maruthi Eye & Dental Hospital.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-300 text-left max-w-lg mx-auto space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Appointment ID
                    </p>
                    <p className="text-lg font-mono font-extrabold text-blue-950">
                      {confirmedAppointment.appointmentId}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-blue-950">
                    {confirmedAppointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Patient Name</p>
                    <p className="font-bold text-slate-900">{confirmedAppointment.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Phone</p>
                    <p className="font-bold text-slate-900">{confirmedAppointment.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <p className="text-slate-500 font-medium">Department</p>
                    <p className="font-bold text-slate-900">
                      {confirmedAppointment.department === 'eye' ? 'Eye Care' : 'Dental Care'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Service</p>
                    <p className="font-bold text-blue-900">{confirmedAppointment.serviceName}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-950 text-white rounded-xl flex items-center justify-between text-xs mt-2">
                  <div>
                    <p className="text-amber-300 font-semibold text-[10px] uppercase">
                      Scheduled Slot
                    </p>
                    <p className="text-sm font-bold">
                      {confirmedAppointment.date} at {confirmedAppointment.time}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>

                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800">Hospital Location & Helpdesk:</p>
                  <p>OSB Road, 2nd Cross, Vidya Nagar, Gangavathi – 583227</p>
                  <p>Phone: <span className="font-bold text-blue-900">+91 85332 34655</span></p>
                </div>
              </div>

              {/* Action Buttons: Calendar, Call, Directions */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <a
                  href={createGoogleCalendarUrl(confirmedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-4 h-4 text-amber-300" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={() => downloadIcsFile(confirmedAppointment)}
                  className="px-3.5 py-2.5 bg-white text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .ics</span>
                </button>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="px-3.5 py-2.5 bg-white text-slate-700 hover:text-blue-900 font-semibold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-900" />
                  <span>Call Hospital</span>
                </a>

                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-white text-slate-700 hover:text-amber-800 font-semibold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-600" />
                  <span>Directions</span>
                </a>
              </div>

              {/* Book another appointment or close */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setConfirmedAppointment(null);
                  }}
                  className="text-xs text-blue-900 font-bold hover:underline"
                >
                  Book Another Appointment
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (Steps 1 to 7) */}
        {step < 8 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && !selectedServiceId) return;
                  if (step === 4 && !selectedDate) return;
                  if (step === 5 && !selectedTime) return;
                  if (step === 6) {
                    if (!patientName.trim() || !phone.trim()) {
                      alert('Please provide patient name and contact phone number.');
                      return;
                    }
                  }
                  setStep((prev) => prev + 1);
                }}
                disabled={
                  (step === 2 && !selectedServiceId) ||
                  (step === 4 && !selectedDate) ||
                  (step === 5 && !selectedTime)
                }
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !consent}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-blue-950 hover:bg-blue-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
