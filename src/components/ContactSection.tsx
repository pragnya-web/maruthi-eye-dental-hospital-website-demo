import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext.tsx';
import { api } from '../services/api.ts';

export const ContactSection: React.FC = () => {
  const { settings } = useHospital();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please provide your name, phone number, and query message.',
      });
      return;
    }

    setStatus({ type: 'loading' });
    try {
      const res = await api.submitContact(formData);
      setStatus({
        type: 'success',
        message: res.message || 'Message submitted successfully. Our hospital desk will contact you.',
      });
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to submit message. Please call us directly.',
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Patient Inquiry & Helpdesk
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Have questions regarding diagnostic scans, laser facilities, or appointment availability? Send us a message or call directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Contact Details & WhatsApp Prompt */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">
                Hospital Helpdesk
              </h3>

              <div className="space-y-5 text-sm">
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                    <Phone className="w-5 h-5 text-blue-800" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Telephone Inquiries</p>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-900 transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <MessageSquare className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">WhatsApp Assistance</p>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-emerald-800 hover:underline"
                    >
                      {settings.whatsappNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0 border border-amber-100">
                    <Mail className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-sm font-semibold text-slate-800 hover:text-blue-900 transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">OPD Consultation Timings</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Monday to Saturday: 9:30 AM – 8:30 PM
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sunday: Contact hospital to confirm availability.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Emergency Guidance Box */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                Urgent Medical Notice
              </p>
              <p className="leading-relaxed">
                {settings.emergencyNotice}
              </p>
            </div>

          </div>

          {/* Right Column: Clean Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Send an Inquiry Message
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our front-desk administration monitors messages and replies promptly during regular OPD hours.
            </p>

            {status.type === 'success' && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Message Delivered</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{status.message}</p>
                </div>
              </div>
            )}

            {status.type === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Submission Notice</p>
                  <p className="text-xs text-red-700 mt-0.5">{status.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98450 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Inquiry / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your inquiry (e.g., questions regarding cataract evaluation, dental consultation, or diagnostic scan availability)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:border-blue-900 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status.type === 'loading'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{status.type === 'loading' ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
