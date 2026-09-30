import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Download,
  Plus,
  Trash2,
  Edit,
  Save,
  LogOut,
  Building,
  Settings as SettingsIcon,
  ShieldCheck,
  Eye,
  Smile,
  Image as ImageIcon,
  MessageSquare,
  KeyRound,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Database,
  Copy,
  Check,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext.tsx';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  Appointment,
  AppointmentStatus,
  HospitalService,
  Doctor,
  Facility,
  GalleryImage,
  WorkingHoursDay,
  Holiday,
  ContactMessage,
} from '../../types/index.ts';

interface AdminDashboardProps {
  onClose: () => void;
}

type TabType =
  | 'appointments'
  | 'supabase'
  | 'settings'
  | 'hours'
  | 'holidays'
  | 'services'
  | 'doctors'
  | 'facilities'
  | 'gallery'
  | 'messages'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { logout } = useAdminAuth();
  const {
    settings,
    businessHours,
    holidays,
    services,
    doctors,
    facilities,
    gallery,
    refreshData,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loadingApts, setLoadingApts] = useState(false);

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableReady: boolean;
    message: string;
    projectId: string;
    sqlScript: string;
    count?: number;
    localAppointmentsCount?: number;
  } | null>(null);
  const [loadingSupabase, setLoadingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Local Form Copies
  const [localSettings, setLocalSettings] = useState(settings);
  const [localHours, setLocalHours] = useState<WorkingHoursDay[]>(businessHours);

  // Security password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Show toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Supabase status
  const fetchSupabaseStatus = async () => {
    setLoadingSupabase(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
    } catch (e: any) {
      console.warn('Failed to load Supabase status:', e);
    } finally {
      setLoadingSupabase(false);
    }
  };

  // Bulk sync all appointments to Supabase
  const handleBulkSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await api.syncAllToSupabase();
      if (res.success) {
        showToast(`Synced ${res.synced} appointment(s) to Supabase Cloud DB!`);
        fetchSupabaseStatus();
      } else {
        alert(res.message || 'Sync failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error syncing to Supabase');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Copy SQL script
  const handleCopySql = () => {
    if (supabaseStatus?.sqlScript) {
      navigator.clipboard.writeText(supabaseStatus.sqlScript);
      setCopiedSql(true);
      showToast('Supabase SQL Setup script copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  // Fetch admin appointments
  const fetchAppointments = async () => {
    setLoadingApts(true);
    try {
      const data = await api.getAdminAppointments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
        search: searchQuery.trim() || undefined,
        date: dateFilter || undefined,
      });
      setAppointments(data.appointments || []);
    } catch (e: any) {
      console.warn('Failed to load appointments:', e);
    } finally {
      setLoadingApts(false);
    }
  };

  // Fetch contact messages
  const fetchMessages = async () => {
    try {
      const msgs = await api.getMessages();
      setMessages(msgs || []);
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'messages') {
      fetchMessages();
    } else if (activeTab === 'supabase') {
      fetchSupabaseStatus();
    }
  }, [activeTab, statusFilter, deptFilter, searchQuery, dateFilter]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setLocalHours(businessHours);
  }, [businessHours]);

  // Appointment Action handlers
  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(id, status);
      showToast(`Appointment status updated to ${status}`);
      fetchAppointments();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment record?')) return;
    try {
      await api.deleteAppointment(id);
      showToast('Appointment record removed');
      fetchAppointments();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;

    setRescheduleError(null);
    try {
      await api.rescheduleAppointment(rescheduleApt.id, rescheduleDate, rescheduleTime);
      showToast('Appointment rescheduled successfully');
      setRescheduleApt(null);
      fetchAppointments();
      refreshData();
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to reschedule appointment');
    }
  };

  // Export Appointments to CSV
  const exportAppointmentsToCSV = () => {
    if (appointments.length === 0) {
      alert('No appointments to export.');
      return;
    }
    const headers = [
      'Appointment ID',
      'Patient Name',
      'Phone',
      'Email',
      'Age',
      'Gender',
      'Department',
      'Service',
      'Doctor',
      'Date',
      'Time',
      'Status',
      'Reason',
      'Created At',
    ];
    const rows = appointments.map((a) => [
      `"${a.appointmentId}"`,
      `"${a.patientName}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      a.age,
      `"${a.gender || ''}"`,
      `"${a.department}"`,
      `"${a.serviceName}"`,
      `"${a.doctorName || 'General'}"`,
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.status}"`,
      `"${(a.reason || '').replace(/"/g, '""')}"`,
      `"${a.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Maruthi_Hospital_Appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(localSettings);
      showToast('Hospital settings updated successfully');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  // Save Working Hours
  const handleSaveHours = async () => {
    try {
      await api.updateBusinessHours(localHours);
      showToast('Weekly business hours saved');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update working hours');
    }
  };

  // Add Holiday
  const [newHolDate, setNewHolDate] = useState('');
  const [newHolName, setNewHolName] = useState('');
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolDate || !newHolName) return;
    try {
      await api.addHoliday({ date: newHolDate, name: newHolName });
      setNewHolDate('');
      setNewHolName('');
      showToast('Holiday added');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await api.deleteHoliday(id);
      showToast('Holiday removed');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove holiday');
    }
  };

  // Add Service State
  const [newSrvDept, setNewSrvDept] = useState<'eye' | 'dental'>('dental');
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvDur, setNewSrvDur] = useState(30);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName || !newSrvDesc) return;
    try {
      await api.addService({
        department: newSrvDept,
        name: newSrvName,
        shortDescription: newSrvDesc,
        durationMinutes: Number(newSrvDur) || 30,
        iconName: newSrvDept === 'dental' ? 'Smile' : 'Eye',
      });
      setNewSrvName('');
      setNewSrvDesc('');
      showToast('New service added');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      showToast('Service deleted');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  // Add Doctor State
  const [docName, setDocName] = useState('');
  const [docDept, setDocDept] = useState<'eye' | 'dental'>('eye');
  const [docSpec, setDocSpec] = useState('');
  const [docQual, setDocQual] = useState('');
  const [docExp, setDocExp] = useState('');
  const [docHours, setDocHours] = useState('09:30 AM - 01:30 PM, 04:30 PM - 08:30 PM');
  const [docPhoto, setDocPhoto] = useState('');

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docSpec) {
      alert('Doctor Name and Speciality are required.');
      return;
    }
    try {
      await api.addDoctor({
        name: docName,
        department: docDept,
        speciality: docSpec,
        qualifications: docQual,
        experience: docExp,
        consultationHours: docHours,
        photoUrl: docPhoto,
        languages: ['Kannada', 'English'],
        consultationDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      });
      setDocName('');
      setDocSpec('');
      setDocQual('');
      setDocExp('');
      setDocPhoto('');
      showToast('Verified doctor added to medical team');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm('Remove this doctor profile?')) return;
    try {
      await api.deleteDoctor(id);
      showToast('Doctor removed');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete doctor');
    }
  };

  // Add Gallery Image State
  const [galTitle, setGalTitle] = useState('');
  const [galCat, setGalCat] = useState<GalleryImage['category']>('Hospital Exterior');
  const [galUrl, setGalUrl] = useState('');

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitle || !galUrl) return;
    try {
      await api.addGalleryImage({
        title: galTitle,
        category: galCat,
        imageUrl: galUrl,
        altText: galTitle,
      });
      setGalTitle('');
      setGalUrl('');
      showToast('Gallery image added');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to add image');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await api.deleteGalleryImage(id);
      showToast('Image removed from gallery');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete image');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert('New passwords do not match');
      return;
    }
    try {
      await api.changePassword(currentPw, newPw);
      showToast('Administrator password updated successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    }
  };

  // Appointment Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayApts = appointments.filter((a) => a.date === today);
    const pending = appointments.filter((a) => a.status === 'Pending');
    const confirmed = appointments.filter((a) => a.status === 'Confirmed');
    const completed = appointments.filter((a) => a.status === 'Completed');
    const cancelled = appointments.filter((a) => a.status === 'Cancelled');
    return {
      total: appointments.length,
      today: todayApts.length,
      pending: pending.length,
      confirmed: confirmed.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [appointments]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Banner Navigation */}
      <div className="bg-blue-950 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-blue-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight text-white">
                Maruthi Eye & Dental Hospital
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-800 text-amber-300">
                Staff Admin Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Vidya Nagar, Gangavathi, Karnataka</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshData();
              if (activeTab === 'appointments') fetchAppointments();
              showToast('Data refreshed');
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
            title="Refresh active database"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Website</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-3 bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xl border border-emerald-600 flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Layout: Sidebar Tabs + Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
        
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'appointments', label: 'Appointments', icon: Calendar, badge: stats.pending },
            { id: 'supabase', label: 'Supabase Cloud DB', icon: Database, badge: 'Cloud' },
            { id: 'settings', label: 'Hospital Info', icon: SettingsIcon },
            { id: 'hours', label: 'Working Hours', icon: Clock },
            { id: 'holidays', label: 'Holidays', icon: AlertCircle },
            { id: 'services', label: 'Services Manager', icon: Eye },
            { id: 'doctors', label: 'Doctors Faculty', icon: User },
            { id: 'facilities', label: 'Facilities', icon: Building },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
            { id: 'messages', label: 'Patient Inquiries', icon: MessageSquare, badge: messages.filter((m) => !m.isRead).length },
            { id: 'security', label: 'Security & Password', icon: KeyRound },
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive ? 'bg-amber-400 text-blue-950' : 'bg-blue-100 text-blue-900'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Today's Visits</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.today}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
                  <p className="text-[11px] font-bold text-amber-800 uppercase">Pending</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase">Confirmed</p>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{stats.confirmed}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
                  <p className="text-[11px] font-bold text-blue-800 uppercase">Completed</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">{stats.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Cancelled</p>
                  <p className="text-2xl font-black text-slate-500 mt-1">{stats.cancelled}</p>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  
                  {/* Search */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No-Show</option>
                  </select>

                  {/* Department Filter */}
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden font-medium"
                  >
                    <option value="all">All Departments</option>
                    <option value="eye">Eye Care</option>
                    <option value="dental">Dental Care</option>
                  </select>

                  {/* Date Filter */}
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden"
                  />

                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="text-xs text-blue-900 hover:underline"
                    >
                      Clear Date
                    </button>
                  )}
                </div>

                <button
                  onClick={exportAppointmentsToCSV}
                  className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Appointments List / Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {loadingApts ? (
                  <div className="py-16 text-center text-xs text-slate-500">
                    Loading appointments...
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">No appointments found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting the search query or date filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">ID & Date</th>
                          <th className="py-3 px-4">Patient Info</th>
                          <th className="py-3 px-4">Department & Service</th>
                          <th className="py-3 px-4">Doctor</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* ID & Date */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-blue-950 block">
                                {apt.appointmentId}
                              </span>
                              <span className="text-[11px] text-slate-700 font-semibold">
                                {apt.date}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {apt.time}
                              </span>
                            </td>

                            {/* Patient Info */}
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{apt.patientName}</p>
                              <a
                                href={`tel:${apt.phone}`}
                                className="text-blue-900 font-medium hover:underline block text-[11px]"
                              >
                                {apt.phone}
                              </a>
                              <span className="text-[10px] text-slate-500">
                                {apt.age ? `${apt.age}y` : ''} • {apt.gender || ''} • {apt.isNewPatient ? 'New' : 'Existing'}
                              </span>
                            </td>

                            {/* Department & Service */}
                            <td className="py-3 px-4">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                apt.department === 'eye'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {apt.department === 'eye' ? 'Eye Care' : 'Dental Care'}
                              </span>
                              <p className="font-semibold text-slate-800 text-xs mt-1">
                                {apt.serviceName}
                              </p>
                              {apt.reason && (
                                <p className="text-[10px] text-slate-500 line-clamp-1 italic">
                                  "{apt.reason}"
                                </p>
                              )}
                            </td>

                            {/* Doctor */}
                            <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                              {apt.doctorName || 'General OPD'}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                apt.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : apt.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {apt.status !== 'Confirmed' && apt.status !== 'Completed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200"
                                    title="Confirm appointment"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {apt.status === 'Confirmed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] rounded-lg border border-blue-200"
                                    title="Mark completed"
                                  >
                                    Complete
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setRescheduleApt(apt);
                                    setRescheduleDate(apt.date);
                                    setRescheduleTime(apt.time);
                                    setRescheduleError(null);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg"
                                  title="Reschedule appointment date/time"
                                >
                                  Reschedule
                                </button>

                                {apt.status !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200"
                                    title="Cancel appointment"
                                  >
                                    Cancel
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteAppointment(apt.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: SUPABASE CLOUD BACKEND */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-4xl">
              
              {/* Header Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold border border-emerald-500/20">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          Supabase Backend Integration
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Whenever someone books an appointment, data is automatically dispatched and saved to your Supabase PostgreSQL database.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchSupabaseStatus}
                    disabled={loadingSupabase}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSupabase ? 'animate-spin' : ''}`} />
                    <span>Test Table Connection</span>
                  </button>
                </div>

                {/* Connection Parameters Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Project ID
                    </p>
                    <p className="text-xs font-mono font-bold text-blue-950 mt-1 truncate">
                      skjxhebmiepgirclepfg
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Supabase Endpoint
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                      https://skjxhebmiepgirclepfg.supabase.co
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Table
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-700 mt-1">
                      public.appointments
                    </p>
                  </div>
                </div>

                {/* Status alert */}
                {supabaseStatus && (
                  <div
                    className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                      supabaseStatus.tableReady
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {supabaseStatus.tableReady ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">
                        {supabaseStatus.tableReady
                          ? 'Table public.appointments is Live & Ready'
                          : 'Action Required: Run SQL Table Setup in Supabase'}
                      </p>
                      <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                        {supabaseStatus.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bulk Sync Section */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Synchronize Appointments</p>
                    <p className="text-[11px] text-slate-500">
                      Sync all {appointments.length} existing appointments from hospital records into Supabase cloud table.
                    </p>
                  </div>

                  <button
                    onClick={handleBulkSyncSupabase}
                    disabled={isSyncingSupabase}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSyncingSupabase ? 'Syncing Records...' : 'Sync All Appointments Now'}</span>
                  </button>
                </div>
              </div>

              {/* SQL Setup Helper Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Supabase SQL Schema & Policies
                    </h4>
                    <p className="text-xs text-slate-500">
                      If you haven't created the <code className="font-mono font-bold text-blue-900">appointments</code> table yet in your Supabase dashboard, copy and run this script in your Supabase SQL Editor.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopySql}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-300"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copy SQL Script</span>
                        </>
                      )}
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/skjxhebmiepgirclepfg/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>Open SQL Editor</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* SQL Code Block */}
                <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[380px] border border-slate-800">
                  <pre className="whitespace-pre">
{`-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  appointment_id TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  gender TEXT,
  is_new_patient BOOLEAN DEFAULT true,
  department TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  reason TEXT,
  preferred_language TEXT DEFAULT 'Kannada',
  status TEXT DEFAULT 'Pending',
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Security policies allowing patient bookings
CREATE POLICY "Allow public insert to appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select from appointments"
  ON public.appointments FOR SELECT
  USING (true);

CREATE POLICY "Allow public update of appointments"
  ON public.appointments FOR UPDATE
  USING (true);

-- 4. Contact messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to contact_messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select from contact_messages"
  ON public.contact_messages FOR SELECT
  USING (true);`}
                  </pre>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  💡 <span className="font-bold text-slate-700">Quick tip:</span> Paste the snippet above into the SQL Editor on your Supabase dashboard and click <strong>"Run"</strong>. Once created, appointments submitted by patients will immediately appear in your Supabase Table Editor!
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HOSPITAL INFO & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hospital Information & Settings</h3>
                <p className="text-xs text-slate-500">
                  Update verified contact details, addresses, slot intervals, and medical notices.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hospital Name</label>
                    <input
                      type="text"
                      value={localSettings.name}
                      onChange={(e) => setLocalSettings({ ...localSettings, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Telephone</label>
                    <input
                      type="text"
                      value={localSettings.phone}
                      onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      value={localSettings.email}
                      onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Street & Cross</label>
                    <input
                      type="text"
                      value={localSettings.address.street}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          address: { ...localSettings.address, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={localSettings.address.area}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          address: { ...localSettings.address, area: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={localSettings.address.city}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          address: { ...localSettings.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={localSettings.address.state}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          address: { ...localSettings.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={localSettings.address.pincode}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          address: { ...localSettings.address, pincode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Maps Link</label>
                  <input
                    type="url"
                    value={localSettings.googleMapsUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Appointment Slot Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={localSettings.slotDurationMinutes}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        slotDurationMinutes: parseInt(e.target.value, 10) || 30,
                      })
                    }
                    className="w-32 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">About Hospital Copy</label>
                  <textarea
                    rows={3}
                    value={localSettings.aboutText}
                    onChange={(e) => setLocalSettings({ ...localSettings, aboutText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>Save Hospital Information</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WORKING HOURS & SCHEDULE */}
          {activeTab === 'hours' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Weekly OPD Consultation Schedule</h3>
                  <p className="text-xs text-slate-500">
                    Configure daily opening, morning/evening sessions, and closed days.
                  </p>
                </div>
                <button
                  onClick={handleSaveHours}
                  className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Save Schedule</span>
                </button>
              </div>

              <div className="space-y-3">
                {localHours.map((item, idx) => (
                  <div
                    key={item.day}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3 sm:w-36">
                      <input
                        type="checkbox"
                        checked={item.isOpen}
                        onChange={(e) => {
                          const updated = [...localHours];
                          updated[idx].isOpen = e.target.checked;
                          setLocalHours(updated);
                        }}
                        className="w-4 h-4 rounded text-blue-950"
                      />
                      <span className={`font-bold ${item.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.day}
                      </span>
                    </div>

                    {item.isOpen ? (
                      <div className="flex flex-wrap items-center gap-4 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Morning:</span>
                          <input
                            type="time"
                            value={item.morningStart}
                            onChange={(e) => {
                              const updated = [...localHours];
                              updated[idx].morningStart = e.target.value;
                              setLocalHours(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={item.morningEnd}
                            onChange={(e) => {
                              const updated = [...localHours];
                              updated[idx].morningEnd = e.target.value;
                              setLocalHours(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Evening:</span>
                          <input
                            type="time"
                            value={item.eveningStart}
                            onChange={(e) => {
                              const updated = [...localHours];
                              updated[idx].eveningStart = e.target.value;
                              setLocalHours(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={item.eveningEnd}
                            onChange={(e) => {
                              const updated = [...localHours];
                              updated[idx].eveningEnd = e.target.value;
                              setLocalHours(updated);
                            }}
                            className="px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Note for closed day (e.g. Contact hospital to confirm availability)"
                          value={item.note || ''}
                          onChange={(e) => {
                            const updated = [...localHours];
                            updated[idx].note = e.target.value;
                            setLocalHours(updated);
                          }}
                          className="w-full px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: HOLIDAYS */}
          {activeTab === 'holidays' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Add Hospital Closure Holiday</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Dates marked here will automatically be blocked from online appointment bookings.
                </p>

                <form onSubmit={handleAddHoliday} className="flex flex-wrap items-center gap-3">
                  <input
                    type="date"
                    required
                    value={newHolDate}
                    onChange={(e) => setNewHolDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Holiday Name (e.g. Festival Closure)"
                    value={newHolName}
                    onChange={(e) => setNewHolName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs min-w-[200px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-950 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Add Holiday</span>
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Scheduled Holidays ({holidays.length})</h4>
                {holidays.length === 0 ? (
                  <p className="text-xs text-slate-400">No holidays scheduled.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {holidays.map((h: Holiday) => (
                      <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{h.name}</p>
                          <p className="text-slate-500 font-mono text-[11px]">{h.date}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Delete holiday"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-4xl">
              {/* Add Service Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Add Hospital Service</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Add custom dental or eye care procedures with descriptions and duration.
                </p>

                <form onSubmit={handleAddService} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department</label>
                      <select
                        value={newSrvDept}
                        onChange={(e: any) => setNewSrvDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="dental">Dental Care</option>
                        <option value="eye">Eye Care</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Service Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Scaling & Root Planing, Pediatric Dental Care..."
                        value={newSrvName}
                        onChange={(e) => setNewSrvName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Brief clinical description of what is evaluated or treated..."
                      value={newSrvDesc}
                      onChange={(e) => setNewSrvDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-700">Duration (mins):</label>
                      <input
                        type="number"
                        min={15}
                        max={120}
                        value={newSrvDur}
                        onChange={(e) => setNewSrvDur(Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-950 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Save Service</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Services List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">
                  Active Hospital Services ({services.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((srv: HospitalService) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            srv.department === 'eye' ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {srv.department === 'eye' ? 'Eye Care' : 'Dental Care'}
                          </span>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-1">{srv.name}</h5>
                        <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                          {srv.shortDescription}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                        <span>Duration: {srv.durationMinutes}m</span>
                        <span className="font-semibold text-emerald-700">Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Add Verified Doctor</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Per compliance guidelines, add doctors only after hospital credentials and qualifications have been verified.
                </p>

                <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Full Name"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department *</label>
                      <select
                        value={docDept}
                        onChange={(e: any) => setDocDept(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="eye">Eye Care (Ophthalmology)</option>
                        <option value="dental">Dental Care (Dentistry)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Speciality *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cataract & Phaco Specialist"
                        value={docSpec}
                        onChange={(e) => setDocSpec(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, MS (Ophthalmology), DNB"
                        value={docQual}
                        onChange={(e) => setDocQual(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Experience</label>
                      <input
                        type="text"
                        placeholder="e.g. 12+ Years Clinical Practice"
                        value={docExp}
                        onChange={(e) => setDocExp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Consultation Hours</label>
                      <input
                        type="text"
                        placeholder="09:30 AM - 01:30 PM, 04:30 PM - 08:30 PM"
                        value={docHours}
                        onChange={(e) => setDocHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Photo Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={docPhoto}
                        onChange={(e) => setDocPhoto(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-right">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 ml-auto"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Publish Verified Doctor</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Doctors Faculty List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">
                  Medical Team Faculty ({doctors.length})
                </h4>

                {doctors.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No doctors published yet.</p>
                    <p className="text-[11px] text-slate-400">
                      The public homepage currently displays the default notice: "Our medical team information will be updated shortly."
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {doctors.map((d: Doctor) => (
                      <div
                        key={d.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between text-xs"
                      >
                        <div className="flex items-start gap-3">
                          {d.photoUrl ? (
                            <img src={d.photoUrl} alt={d.name} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                              {d.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                              {d.department}
                            </span>
                            <h5 className="font-bold text-slate-900 mt-0.5">{d.name}</h5>
                            <p className="text-slate-600 text-[11px]">{d.speciality}</p>
                            <p className="text-slate-400 text-[10px] mt-1">{d.qualifications}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDoctor(d.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Remove doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-4xl space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Hospital Facilities & Equipments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {facilities.map((fac: Facility) => (
                  <div key={fac.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex gap-3 text-xs">
                    <img src={fac.imageUrl} alt={fac.title} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">{fac.category}</span>
                      <h5 className="font-bold text-slate-900">{fac.title}</h5>
                      <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">{fac.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Add Image to Gallery</h3>
                <form onSubmit={handleAddGallery} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Image Caption</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Slit Lamp Diagnostic Station"
                      value={galTitle}
                      onChange={(e) => setGalTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={galCat}
                      onChange={(e: any) => setGalCat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="Hospital Exterior">Hospital Exterior</option>
                      <option value="Reception">Reception</option>
                      <option value="Eye Care">Eye Care</option>
                      <option value="Dental Care">Dental Care</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Patient Areas">Patient Areas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={galUrl}
                      onChange={(e) => setGalUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-3 text-right pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-950 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 ml-auto"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Add Image</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Gallery Photos ({gallery.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((img: GalleryImage) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-4/3">
                      <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white text-xs">
                        <span className="text-[10px] font-bold text-amber-300">{img.category}</span>
                        <p className="line-clamp-2">{img.title}</p>
                        <button
                          onClick={() => handleDeleteGallery(img.id)}
                          className="self-end p-1.5 bg-red-600 rounded text-white hover:bg-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PATIENT INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-4xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Patient Messages & Inquiries</h3>
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No messages received yet.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m: ContactMessage) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        m.isRead ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                          <span className="text-slate-500 ml-2 font-mono">{m.phone}</span>
                          {m.email && <span className="text-slate-400 ml-2">({m.email})</span>}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-md space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Change Admin Password</h3>
              <p className="text-xs text-slate-500">
                Update the administrator password used to access this staff portal.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900">Reschedule Appointment</h4>
              <button
                onClick={() => setRescheduleApt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rescheduling appointment for <span className="font-bold">{rescheduleApt.patientName}</span> ({rescheduleApt.appointmentId})
            </p>

            {rescheduleError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Time (e.g. 10:30 AM)</label>
                <input
                  type="text"
                  required
                  placeholder="10:30 AM"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-950 text-white font-bold rounded-xl"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
