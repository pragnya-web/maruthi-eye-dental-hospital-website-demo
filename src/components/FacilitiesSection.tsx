import React from 'react';
import { Check, Shield, Building2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const FacilitiesSection: React.FC = () => {
  const { facilities, openBookingModal } = useHospital();

  return (
    <section id="facilities" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Infrastructure & Equipment
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hospital Facilities
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Carefully maintained clinical spaces and diagnostic instrumentation supporting patient care in Gangavathi.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all border border-slate-200/80 flex flex-col group"
            >
              {/* Facility Image with Category Tag */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                <img
                  src={facility.imageUrl}
                  alt={facility.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-blue-950/90 text-amber-300 text-xs font-bold rounded-lg shadow-sm backdrop-blur-xs">
                    {facility.category}
                  </span>
                </div>
              </div>

              {/* Facility Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {facility.description}
                  </p>
                </div>

                {/* Key features */}
                {facility.features && facility.features.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <ul className="space-y-1.5">
                      {facility.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Booking Prompt */}
        <div className="mt-12 text-center">
          <button
            onClick={() => openBookingModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-98"
          >
            <span>Book an Appointment at Our Facility</span>
          </button>
        </div>

      </div>
    </section>
  );
};
