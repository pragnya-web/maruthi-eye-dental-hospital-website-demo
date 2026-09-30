import React from 'react';
import {
  Calendar,
  Phone,
  Navigation,
  Eye,
  Smile,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const Hero: React.FC = () => {
  const { settings, openBookingModal } = useHospital();

  return (
    <section id="home" className="relative bg-gradient-to-b from-blue-50/70 via-white to-slate-50 overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/60">
      {/* Background Subtle Accent Circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hospital Messaging & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-900 text-xs sm:text-sm font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>COMPREHENSIVE EYE & DENTAL CARE</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Expert Eye & Dental Care,{' '}
              <span className="relative inline-block text-blue-900">
                Under One Roof.
                <span className="absolute left-0 bottom-1 w-full h-2 bg-amber-300/60 -z-10 rounded-sm" />
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Providing comprehensive eye and dental care in Gangavathi with modern diagnostic and treatment facilities.
            </p>

            {/* Quick Badges / Assurances */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-sm text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Vidya Nagar, Gangavathi
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mon–Sat: 9:30 AM – 8:30 PM
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Online Slot Booking
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              {/* Primary CTA */}
              <button
                onClick={() => openBookingModal()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 active:scale-98 shadow-md hover:shadow-lg transition-all rounded-xl border border-amber-500/30"
              >
                <Calendar className="w-5 h-5 text-blue-950" />
                <span>Book an Appointment</span>
              </button>

              {/* Secondary CTA */}
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base font-semibold text-blue-950 bg-white hover:bg-blue-50 border border-slate-300 rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-5 h-5 text-blue-900" />
                <span>Call {settings.phone}</span>
              </a>

              {/* Third CTA */}
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-slate-700 hover:text-blue-950 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Navigation className="w-4 h-4 text-amber-600" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hospital Image with Floating Trust Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-4/3 sm:aspect-5/4">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80"
                  alt="Maruthi Eye & Dental Hospital facility in Gangavathi"
                  className="w-full h-full object-cover brightness-95 hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Visual Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Subtitle Badge at bottom */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-950">Maruthi Eye & Dental Hospital</p>
                    <p className="text-[11px] text-slate-600">OSB Road, Vidya Nagar, Gangavathi</p>
                  </div>
                  <span className="text-[11px] font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    Speciality Care
                  </span>
                </div>
              </div>

              {/* Floating Trust Card 1: Eye Care (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Eye Care</p>
                  <p className="text-[11px] text-slate-500">Cataract, Laser & Retina</p>
                </div>
              </div>

              {/* Floating Trust Card 2: Dental Care (Bottom Right) */}
              <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dental Care</p>
                  <p className="text-[11px] text-slate-500">Comprehensive Oral Health</p>
                </div>
              </div>

              {/* Floating Trust Card 3: Modern Diagnostics (Top Right) */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Modern Diagnostics</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
