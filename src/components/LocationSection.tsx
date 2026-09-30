import React from 'react';
import { MapPin, Navigation, Phone, Clock, ExternalLink } from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';

export const LocationSection: React.FC = () => {
  const { settings, currentOpenStatus, businessHours } = useHospital();

  return (
    <section id="location" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Find Us in Gangavathi
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Maruthi Eye & Dental Hospital
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Conveniently located in Vidya Nagar with smooth road access and parking convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Hospital Address & Timings Card */}
          <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              
              {/* Address Block */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 border border-blue-200">
                  <MapPin className="w-6 h-6 text-blue-900" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Hospital Address
                  </h4>
                  <p className="text-base font-bold text-slate-900">
                    Maruthi Eye & Dental Hospital
                  </p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                    {settings.address.street}, {settings.address.area},<br />
                    {settings.address.city}, {settings.address.state} – {settings.address.pincode}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Landmark: 2nd Cross, Vidya Nagar
                  </p>
                </div>
              </div>

              {/* Phone Block */}
              <div className="flex items-start gap-4 pt-4 border-t border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
                  <Phone className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Direct Phone Line
                  </h4>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="text-base font-bold text-blue-900 hover:underline"
                  >
                    {settings.phone}
                  </a>
                  <p className="text-xs text-slate-500 mt-1">
                    Call for inquiries, registration, or appointment assistance.
                  </p>
                </div>
              </div>

              {/* Working Hours Block */}
              <div className="flex items-start gap-4 pt-4 border-t border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Working Hours
                    </h4>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        currentOpenStatus.isOpenNow
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {currentOpenStatus.isOpenNow ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Monday to Saturday:
                    </p>
                    <p className="text-slate-600 pl-2">
                      Morning: 09:30 AM – 01:30 PM<br />
                      Evening: 04:30 PM – 08:30 PM
                    </p>
                    <p className="font-semibold text-slate-900 pt-1">Sunday:</p>
                    <p className="text-slate-600 pl-2">Contact hospital to confirm availability.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Directions Action */}
            <div className="pt-4 border-t border-slate-200">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-blue-950" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            </div>

          </div>

          {/* Right Column: Google Maps Interactive Embed Frame */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-md border border-slate-200/90 relative min-h-[380px] bg-slate-100 flex flex-col">
            <iframe
              title="Maruthi Eye and Dental Hospital Gangavathi Location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                'Maruthi Eye and Dental Hospital OSB Road Vidya Nagar Gangavathi Karnataka 583227'
              )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
              allowFullScreen
            />

            {/* Map Floating Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Maruthi Eye & Dental Hospital</p>
                  <p className="text-[11px] text-slate-600">Vidya Nagar, Gangavathi</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
