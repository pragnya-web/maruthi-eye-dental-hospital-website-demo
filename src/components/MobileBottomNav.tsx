import React from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const MobileBottomNav: React.FC = () => {
  const { settings, openBookingModal } = useHospital();

  const phoneHref = `tel:${settings.phone.replace(/\s+/g, '')}`;
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 shadow-2xl flex items-center justify-between gap-2">
      {/* Call Button */}
      <a
        href={phoneHref}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
      >
        <Phone className="w-4 h-4 text-blue-900 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Call</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 transition-colors"
      >
        <MessageSquare className="w-4 h-4 text-emerald-700 mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
      </a>

      {/* Book Appointment Highlighted Button */}
      <button
        onClick={() => openBookingModal()}
        className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-extrabold text-xs shadow-md transition-all active:scale-95 border border-amber-500/30"
      >
        <Calendar className="w-4 h-4 text-blue-950" />
        <span>BOOK APPOINTMENT</span>
      </button>
    </div>
  );
};
