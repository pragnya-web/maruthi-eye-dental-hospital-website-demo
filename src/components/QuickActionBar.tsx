import React from 'react';
import { Calendar, Phone, Navigation, Clock, ChevronRight } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const QuickActionBar: React.FC = () => {
  const { settings, openBookingModal, currentOpenStatus, businessHours } = useHospital();

  // Find weekday timing summary from business hours
  const weekdaySchedule = businessHours.find((b) => b.day === 'Monday') || businessHours[0];
  const weekdayHoursText = weekdaySchedule
    ? `9:30 AM – 8:30 PM`
    : `9:30 AM – 8:30 PM`;

  return (
    <section className="relative z-10 -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Book Appointment */}
        <button
          onClick={() => openBookingModal()}
          className="group text-left bg-blue-900 text-white p-5 rounded-2xl shadow-lg shadow-blue-950/15 hover:shadow-xl hover:-translate-y-1 transition-all border border-blue-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-blue-800 text-amber-300 px-2.5 py-1 rounded-full">
              Online
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white mb-1 flex items-center justify-between">
              BOOK APPOINTMENT
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Choose an eye or dental service and your preferred time slot.
            </p>
          </div>
        </button>

        {/* Card 2: Call Us */}
        <a
          href={`tel:${settings.phone.replace(/\s+/g, '')}`}
          className="group text-left bg-white text-slate-800 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200/80 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-100 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6 text-blue-800" />
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/60">
              Direct Desk
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-1 flex items-center justify-between">
              CALL US
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm font-bold text-blue-900 mb-0.5">{settings.phone}</p>
            <p className="text-xs text-slate-500">Call for immediate queries or phone assistance.</p>
          </div>
        </a>

        {/* Card 3: Get Directions */}
        <a
          href={settings.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group text-left bg-white text-slate-800 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200/80 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-110 transition-transform">
              <Navigation className="w-6 h-6 text-amber-700" />
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Google Maps
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-1 flex items-center justify-between">
              GET DIRECTIONS
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs font-medium text-slate-700 mb-0.5">OSB Road, 2nd Cross, Vidya Nagar</p>
            <p className="text-xs text-slate-500">Gangavathi, Karnataka – 583227</p>
          </div>
        </a>

        {/* Card 4: Working Hours */}
        <div className="group text-left bg-white text-slate-800 p-5 rounded-2xl shadow-md border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 text-slate-700" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                currentOpenStatus.isOpenNow
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentOpenStatus.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {currentOpenStatus.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-1">
              WORKING HOURS
            </h3>
            <p className="text-xs font-bold text-slate-900">Mon–Sat: {weekdayHoursText}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Sunday: Contact hospital to confirm availability.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
