import React from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Globe,
  Award,
  BookOpen,
  Info,
  Stethoscope,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { Doctor } from '../types/index.ts';

export const DoctorsSection: React.FC = () => {
  const { doctors, openBookingModal } = useHospital();

  const availableDoctors = doctors.filter((d) => d.isAvailable);

  return (
    <section id="doctors" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Medical Faculty
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Doctors
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Qualified clinical specialists delivering ophthalmic and dental healthcare in Gangavathi.
          </p>
        </div>

        {/* If no doctors have been added yet (default verified state) */}
        {availableDoctors.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-slate-50 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Stethoscope className="w-8 h-8 text-blue-900" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
              Our medical team information will be updated shortly.
            </h3>

            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
              In accordance with our patient transparency guidelines, verified clinical qualifications, consultation hours, and doctor profiles are uploaded following administrative verification.
            </p>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 text-xs text-slate-500 mb-6 flex items-center justify-center gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Consultations for Eye and Dental care remain open during hospital working hours.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openBookingModal()}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                Book General Consultation
              </button>
              <a
                href="tel:+918533234655"
                className="w-full sm:w-auto px-5 py-3 text-slate-700 hover:text-blue-950 font-semibold text-sm border border-slate-300 rounded-xl hover:bg-white transition-colors"
              >
                Call Hospital: +91 85332 34655
              </a>
            </div>
          </div>
        ) : (
          /* Render Doctors if added via Admin */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableDoctors.map((doc: Doctor) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 flex flex-col justify-between"
              >
                <div className="p-6">
                  {/* Doctor Photo or Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    {doc.photoUrl ? (
                      <img
                        src={doc.photoUrl}
                        alt={doc.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-900"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-2xl border-2 border-blue-200">
                        {doc.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {doc.department === 'eye' ? 'Ophthalmology' : 'Dentistry'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{doc.name}</h3>
                      <p className="text-xs text-slate-600 font-medium">{doc.speciality}</p>
                    </div>
                  </div>

                  {/* Qualifications & Details */}
                  <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    {doc.qualifications && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-800 shrink-0" />
                        <span className="font-semibold text-slate-800">{doc.qualifications}</span>
                      </div>
                    )}
                    {doc.experience && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-800 shrink-0" />
                        <span>Experience: {doc.experience}</span>
                      </div>
                    )}
                    {doc.languages && doc.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-800 shrink-0" />
                        <span>Languages: {doc.languages.join(', ')}</span>
                      </div>
                    )}
                    {doc.consultationHours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-800 shrink-0" />
                        <span>{doc.consultationHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Available by appointment</span>
                  <button
                    onClick={() =>
                      openBookingModal({
                        department: doc.department,
                        doctorId: doc.id,
                      })
                    }
                    className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
