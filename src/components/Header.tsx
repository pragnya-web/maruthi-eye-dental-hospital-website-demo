import React, { useState, useEffect } from 'react';
import {
  Phone,
  Calendar,
  Menu,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Eye,
  Smile,
  Lock,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

interface HeaderProps {
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin }) => {
  const { settings, openBookingModal, currentOpenStatus } = useHospital();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Eye Care', href: '#eyecare' },
    { name: 'Dental Care', href: '#dentalcare' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Notification / Information Ribbon */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              OSB Road, 2nd Cross, Vidya Nagar, Gangavathi – 583227
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Mon–Sat: 9:30 AM – 8:30 PM
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  currentOpenStatus.isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {currentOpenStatus.statusText}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              {settings.phone}
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenAdmin}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-xs"
              title="Hospital Staff & Administrator Login"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              Staff Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5 border-b border-slate-200/80'
            : 'bg-white py-3.5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 flex items-center justify-center shadow-md shadow-blue-900/10 border-2 border-amber-400/80 relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="flex items-center justify-center gap-0.5 text-white">
                  <Eye className="w-5 h-5 text-amber-300" />
                  <Smile className="w-4 h-4 text-white -ml-1" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-blue-950">
                    MARUTHI
                  </span>
                  <span className="bg-amber-400 text-blue-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    HOSPITAL
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                  Eye & Dental Hospital
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-blue-950 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/60 rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-4 h-4 text-blue-800" />
                <span>Call Now</span>
              </a>

              <button
                onClick={() => openBookingModal()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 active:scale-95 shadow-sm hover:shadow-md transition-all rounded-xl border border-amber-500/30"
              >
                <Calendar className="w-4 h-4 text-blue-950" />
                <span>Book Appointment</span>
              </button>
            </div>

            {/* Mobile Header Icons & Hamburger */}
            <div className="flex items-center gap-2 sm:hidden">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-200"
                aria-label="Call Hospital"
              >
                <Phone className="w-4 h-4" />
              </a>

              <button
                onClick={() => openBookingModal()}
                className="px-2.5 py-1.5 bg-amber-400 text-blue-950 font-bold text-xs rounded-lg shadow-xs"
              >
                Book
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1 mb-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold rounded-xl text-center shadow-xs flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book an Appointment
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="w-full py-2.5 bg-blue-50 text-blue-950 font-semibold rounded-xl text-center border border-blue-200 flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4 text-blue-800" />
                Call +91 85332 34655
              </a>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                <span>Vidya Nagar, Gangavathi</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-blue-900 font-medium hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Staff Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
