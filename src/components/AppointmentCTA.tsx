import React from 'react';
import { Calendar, Phone, Clock, ShieldCheck } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const AppointmentCTA: React.FC = () => {
  const { settings, openBookingModal } = useHospital();

  return (
    <section className="py-16 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Clock className="w-3.5 h-3.5" />
              Prioritized Consultation
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Schedule Your Visit in Advance
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Booking your consultation online helps our medical desk allocate adequate time for examination and minimize waiting times at the hospital.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                No Booking Fees
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Instant Slot Confirmation
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                SMS / WhatsApp Notification Support
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => openBookingModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-98"
            >
              <Calendar className="w-4 h-4 text-blue-950" />
              <span>Book Appointment Now</span>
            </button>

            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>Call Reception</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
