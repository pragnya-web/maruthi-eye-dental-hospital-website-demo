import React from 'react';
import {
  Activity,
  Home,
  MapPin,
  HeartHandshake,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: Activity,
      title: 'Modern Diagnostic Facilities',
      description:
        'Equipped with specialized ophthalmic evaluation tools including OCT scanning and Humphrey Field Analyzer for objective clinical evaluation.',
    },
    {
      icon: Home,
      title: 'Eye & Dental Care Under One Roof',
      description:
        'Saves time for individuals and families in Gangavathi needing ophthalmic evaluations and oral health consultations in a single medical center.',
    },
    {
      icon: MapPin,
      title: 'Convenient Gangavathi Location',
      description:
        'Centrally situated on OSB Road, 2nd Cross, Vidya Nagar with accessible ground-level entry and prompt local road connectivity.',
    },
    {
      icon: HeartHandshake,
      title: 'Professional Patient Care',
      description:
        'Attentive clinical staff focused on clear communication, thorough consultations, and respectful patient guidance during visits.',
    },
    {
      icon: CalendarCheck,
      title: 'Accessible Appointment Booking',
      description:
        'Real-time online appointment scheduling with instant confirmation to help you choose convenient consultation times.',
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Patient Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Care Designed Around the Patient
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Focused on providing reliable, accessible, and ethical eye and dental care to the community of Gangavathi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((pt, index) => {
            const IconComponent = pt.icon;
            return (
              <div
                key={index}
                className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {pt.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pt.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
