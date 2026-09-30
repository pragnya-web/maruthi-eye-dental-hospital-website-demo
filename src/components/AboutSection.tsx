import React from 'react';
import { Check, ShieldCheck, HeartHandshake, Eye, Smile } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const AboutSection: React.FC = () => {
  const { settings, openBookingModal } = useHospital();

  return (
    <section id="about" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hospital Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80"
                alt="Maruthi Eye & Dental Hospital healthcare environment"
                className="w-full h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="inline-block px-2.5 py-1 bg-amber-400 text-blue-950 text-xs font-bold rounded mb-2">
                  Vidya Nagar, Gangavathi
                </span>
                <p className="text-xl font-bold text-white tracking-tight">
                  Dual Speciality Healthcare Center
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  Dedicated clinical infrastructure for ophthalmic and dental consultations.
                </p>
              </div>
            </div>

            {/* Accent badge in bottom right corner */}
            <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-blue-950 text-white p-4 rounded-xl shadow-xl border-2 border-amber-400 items-center gap-3">
              <div className="p-2 bg-amber-400/20 rounded-lg text-amber-300">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Care Approach</p>
                <p className="text-sm font-semibold text-white">Patient-Centric Consultations</p>
              </div>
            </div>
          </div>

          {/* Right Column: About Content */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                About The Hospital
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Comprehensive Care for Your Eyes & Oral Health
              </h2>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {settings.aboutText}
            </p>

            <p className="text-sm text-slate-500 leading-relaxed">
              Located conveniently on OSB Road, 2nd Cross in Vidya Nagar, Gangavathi, our facility integrates diagnostic evaluation, specialized therapies, and routine consultations under one trusted medical roof.
            </p>

            {/* Editable Feature Checkmarks */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Key Hospital Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-semibold text-sm hover:bg-blue-50/60 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => openBookingModal()}
                className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98"
              >
                Schedule Consultation
              </button>
              <a
                href="#eyecare"
                className="px-5 py-3 text-slate-700 hover:text-blue-950 font-semibold text-sm border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Explore Services
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
