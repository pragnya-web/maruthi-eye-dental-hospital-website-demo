import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  HospitalSettings,
  WorkingHoursDay,
  Holiday,
  HospitalService,
  Doctor,
  Facility,
  GalleryImage,
  DepartmentType,
} from '../types/index.ts';
import { initialHospitalDatabase } from '../data/defaultData.ts';
import { api } from '../services/api.ts';

interface BookingModalOptions {
  isOpen: boolean;
  initialDepartment?: DepartmentType;
  initialServiceId?: string;
  initialDoctorId?: string;
}

interface HospitalContextType {
  settings: HospitalSettings;
  businessHours: WorkingHoursDay[];
  holidays: Holiday[];
  services: HospitalService[];
  doctors: Doctor[];
  facilities: Facility[];
  gallery: GalleryImage[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  bookingModal: BookingModalOptions;
  openBookingModal: (options?: { department?: DepartmentType; serviceId?: string; doctorId?: string }) => void;
  closeBookingModal: () => void;
  currentOpenStatus: {
    isOpenNow: boolean;
    statusText: string;
    todaySchedule?: WorkingHoursDay;
  };
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HospitalSettings>(initialHospitalDatabase.settings);
  const [businessHours, setBusinessHours] = useState<WorkingHoursDay[]>(initialHospitalDatabase.businessHours);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHospitalDatabase.holidays);
  const [services, setServices] = useState<HospitalService[]>(initialHospitalDatabase.services);
  const [doctors, setDoctors] = useState<Doctor[]>(initialHospitalDatabase.doctors);
  const [facilities, setFacilities] = useState<Facility[]>(initialHospitalDatabase.facilities);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialHospitalDatabase.gallery);
  const [isLoading, setIsLoading] = useState(true);

  const [bookingModal, setBookingModal] = useState<BookingModalOptions>({
    isOpen: false,
    initialDepartment: 'eye',
  });

  const loadData = useCallback(async () => {
    try {
      const data = await api.getPublicData();
      if (data) {
        if (data.settings) setSettings(data.settings);
        if (data.businessHours) setBusinessHours(data.businessHours);
        if (data.holidays) setHolidays(data.holidays);
        if (data.services) setServices(data.services);
        if (data.doctors) setDoctors(data.doctors);
        if (data.facilities) setFacilities(data.facilities);
        if (data.gallery) setGallery(data.gallery);
      }
    } catch (err) {
      console.warn('Error loading public data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openBookingModal = (options?: { department?: DepartmentType; serviceId?: string; doctorId?: string }) => {
    setBookingModal({
      isOpen: true,
      initialDepartment: options?.department || 'eye',
      initialServiceId: options?.serviceId,
      initialDoctorId: options?.doctorId,
    });
  };

  const closeBookingModal = () => {
    setBookingModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Determine if hospital is open right now
  const computeOpenStatus = () => {
    const now = new Date();
    const dayNames: WorkingHoursDay['day'][] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDay = dayNames[now.getDay()];
    const todaySched = businessHours.find((b) => b.day === currentDay);

    if (!todaySched || !todaySched.isOpen) {
      return {
        isOpenNow: false,
        statusText: todaySched?.note || 'Closed today (Confirm with hospital)',
        todaySchedule: todaySched,
      };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseToMin = (t?: string) => {
      if (!t) return null;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const mStart = parseToMin(todaySched.morningStart);
    const mEnd = parseToMin(todaySched.morningEnd);
    const eStart = parseToMin(todaySched.eveningStart);
    const eEnd = parseToMin(todaySched.eveningEnd);

    let isOpenNow = false;
    let statusText = 'Currently Closed';

    if (mStart !== null && mEnd !== null && currentMinutes >= mStart && currentMinutes <= mEnd) {
      isOpenNow = true;
      statusText = `Open now (Morning session until ${todaySched.morningEnd})`;
    } else if (eStart !== null && eEnd !== null && currentMinutes >= eStart && currentMinutes <= eEnd) {
      isOpenNow = true;
      statusText = `Open now (Evening session until ${todaySched.eveningEnd})`;
    } else if (mEnd !== null && eStart !== null && currentMinutes > mEnd && currentMinutes < eStart) {
      isOpenNow = false;
      statusText = `Mid-day recess. Evening session opens at ${todaySched.eveningStart}`;
    } else {
      isOpenNow = false;
      statusText = 'Closed for the day';
    }

    return { isOpenNow, statusText, todaySchedule: todaySched };
  };

  return (
    <HospitalContext.Provider
      value={{
        settings,
        businessHours,
        holidays,
        services,
        doctors,
        facilities,
        gallery,
        isLoading,
        refreshData: loadData,
        bookingModal,
        openBookingModal,
        closeBookingModal,
        currentOpenStatus: computeOpenStatus(),
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
