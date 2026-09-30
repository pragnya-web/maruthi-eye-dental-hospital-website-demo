import React from 'react';
import { Eye, Smile, MapPin, Phone, Mail, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { settings, openBookingModal } = useHospital();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Branding & Intro (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center border border-amber-400/80">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Eye className="w-4 h-4 text-amber-300" />
                  <Smile className="w-3.5 h-3.5 text-white -ml-1" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">
                  MARUTHI
                </span>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase block">
                  Eye & Dental Hospital
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Comprehensive eye and dental care under one roof in Gangavathi, Karnataka. Providing modern diagnostic and clinical services.
            </p>

            <div className="text-xs text-slate-400 pt-1">
              <p className="font-semibold text-slate-300">Also recognized as:</p>
              <p className="text-[11px] text-slate-500">
                Maruti Eye & Dental Hospital / Maruthi Super Speciality Eye and Dental Hospital
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#eyecare" className="hover:text-white transition-colors">Eye Care</a>
              </li>
              <li>
                <a href="#dentalcare" className="hover:text-white transition-colors">Dental Care</a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-white transition-colors">Hospital Facilities</a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-white transition-colors">Doctors</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Appointments (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Appointments
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Book consultations online in advance to confirm your preferred time slot.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => openBookingModal()}
                className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-xs text-center block transition-colors"
              >
                Book Appointment Online
              </button>
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs rounded-xl text-center block transition-colors"
              >
                Call: {settings.phone}
              </a>
            </div>
          </div>

          {/* Col 4: Contact Info (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Hospital Location
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {settings.address.street}, {settings.address.area},<br />
                  {settings.address.city}, {settings.address.state} – {settings.address.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white font-medium">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Mon–Sat: 9:30 AM – 8:30 PM<br />
                  Sunday: Contact hospital
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Medical Disclaimer Banner */}
        <div className="py-6 border-b border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Medical Disclaimer
          </p>
          <p>
            {settings.medicalDisclaimer}
          </p>
          <p className="text-slate-400">
            {settings.emergencyNotice}
          </p>
        </div>

        {/* Bottom Bar: Copyright & Staff Login */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 Maruthi Eye & Dental Hospital. All rights reserved. Gangavathi, Karnataka.
          </p>

          <div className="flex items-center space-x-6 text-[11px]">
            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Lock className="w-3 h-3" />
              Administrator Dashboard
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
