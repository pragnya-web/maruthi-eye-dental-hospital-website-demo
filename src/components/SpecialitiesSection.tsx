import React, { useState } from 'react';
import {
  Eye,
  Smile,
  Calendar,
  Activity,
  Layers,
  Focus,
  ShieldAlert,
  ScanLine,
  PieChart,
  Zap,
  Crosshair,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { DepartmentType, HospitalService } from '../types/index.ts';

export const SpecialitiesSection: React.FC = () => {
  const { services, openBookingModal } = useHospital();
  const [activeTab, setActiveTab] = useState<DepartmentType>('eye');

  const eyeServices = services.filter((s) => s.department === 'eye' && s.isAvailable);
  const dentalServices = services.filter((s) => s.department === 'dental' && s.isAvailable);

  // Map icon name to lucide icon component
  const renderIcon = (name: string, dept: DepartmentType) => {
    const props = { className: 'w-6 h-6' };
    switch (name.toLowerCase()) {
      case 'eye':
        return <Eye {...props} />;
      case 'activity':
        return <Activity {...props} />;
      case 'layers':
        return <Layers {...props} />;
      case 'focus':
        return <Focus {...props} />;
      case 'shieldalert':
        return <ShieldAlert {...props} />;
      case 'scanline':
        return <ScanLine {...props} />;
      case 'piechart':
        return <PieChart {...props} />;
      case 'zap':
        return <Zap {...props} />;
      case 'crosshair':
        return <Crosshair {...props} />;
      case 'smile':
        return <Smile {...props} />;
      default:
        return dept === 'eye' ? <Eye {...props} /> : <Smile {...props} />;
    }
  };

  return (
    <section id="services" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Specialized Medical Departments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clinical Services & Diagnostic Care
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Maruthi Eye & Dental Hospital provides dedicated clinical expertise in ophthalmology and dentistry in Gangavathi.
          </p>
        </div>

        {/* Specialities Switcher Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-white shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('eye')}
              className={`flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'eye'
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Eye className={`w-4 h-4 ${activeTab === 'eye' ? 'text-amber-300' : 'text-blue-700'}`} />
              <span>EYE CARE SERVICES</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'eye' ? 'bg-blue-800 text-amber-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {eyeServices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dental')}
              className={`flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'dental'
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Smile className={`w-4 h-4 ${activeTab === 'dental' ? 'text-amber-300' : 'text-amber-600'}`} />
              <span>DENTAL CARE</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'dental' ? 'bg-blue-800 text-amber-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {dentalServices.length}
              </span>
            </button>
          </div>
        </div>

        {/* EYE CARE TAB CONTENT */}
        {activeTab === 'eye' && (
          <div id="eyecare" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-900" />
                  Eye Care Services
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Modern ophthalmic diagnostic, therapeutic, and surgical evaluation in Gangavathi.
                </p>
              </div>

              <button
                onClick={() => openBookingModal({ department: 'eye' })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Eye Appointment
              </button>
            </div>

            {/* Eye Services Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eyeServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border border-slate-200/80 hover:border-blue-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold mb-4 group-hover:scale-105 group-hover:bg-blue-900 group-hover:text-amber-300 transition-all border border-blue-100">
                      {renderIcon(service.iconName, 'eye')}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-950 transition-colors">
                      {service.name}
                    </h4>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Consultation available
                    </span>

                    <button
                      onClick={() =>
                        openBookingModal({
                          department: 'eye',
                          serviceId: service.id,
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-950 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Book Appointment</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DENTAL CARE TAB CONTENT */}
        {activeTab === 'dental' && (
          <div id="dentalcare" className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Smile className="w-6 h-6 text-amber-500" />
                  Dental Care
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Professional oral health consultations and dental care services.
                </p>
              </div>

              <button
                onClick={() => openBookingModal({ department: 'dental' })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Dental Appointment
              </button>
            </div>

            {/* Dental Hero Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                  Oral Health Services
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Comprehensive Dental Care
                </h4>
                <p className="text-base text-slate-600 leading-relaxed">
                  Consultation and dental care services are available at the hospital. Contact the hospital or book an appointment to discuss your dental concern.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                    <span>
                      Our hospital administration updates specific treatment procedures following verification. You may schedule a clinical consultation for evaluation and customized advice.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openBookingModal({ department: 'dental' })}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98"
                  >
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>Book Dental Appointment</span>
                  </button>

                  <a
                    href="tel:+918533234655"
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-amber-50 hover:bg-amber-100/80 text-amber-950 font-bold text-sm rounded-xl border border-amber-300/80 transition-colors"
                  >
                    <span>Inquire via Phone: +91 85332 34655</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white aspect-4/3">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
                    alt="Dental operatory setup at Maruthi Hospital"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium">
                      Hygienic Dental Consultation Operatory
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Dental Services list if administrator added specific items */}
            {dentalServices.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {dentalServices.slice(1).map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-3 border border-amber-100">
                        {renderIcon(service.iconName, 'dental')}
                      </div>
                      <h5 className="text-base font-bold text-slate-900 mb-1">{service.name}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{service.shortDescription}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{service.durationMinutes} mins</span>
                      <button
                        onClick={() => openBookingModal({ department: 'dental', serviceId: service.id })}
                        className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                      >
                        Book Now <ArrowRight className="w-3 h-3 text-amber-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
