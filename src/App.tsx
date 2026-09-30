import React, { useState } from 'react';
import { HospitalProvider } from './context/HospitalContext.tsx';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { QuickActionBar } from './components/QuickActionBar.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { SpecialitiesSection } from './components/SpecialitiesSection.tsx';
import { WhyChooseUs } from './components/WhyChooseUs.tsx';
import { FacilitiesSection } from './components/FacilitiesSection.tsx';
import { DoctorsSection } from './components/DoctorsSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { AppointmentCTA } from './components/AppointmentCTA.tsx';
import { LocationSection } from './components/LocationSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

function MainAppContent() {
  const { isAuthenticated } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleOpenAdmin = () => {
    if (isAuthenticated) {
      setShowDashboard(true);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Sticky Header */}
      <Header onOpenAdmin={handleOpenAdmin} />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Quick Action Bar */}
        <QuickActionBar />

        {/* 4. About Hospital */}
        <AboutSection />

        {/* 5 & 6. Eye Care & Dental Care Specialities Switcher */}
        <SpecialitiesSection />

        {/* 7. Why Choose Us */}
        <WhyChooseUs />

        {/* 8. Hospital Facilities */}
        <FacilitiesSection />

        {/* 9. Meet Our Doctors */}
        <DoctorsSection />

        {/* 10. Gallery */}
        <GallerySection />

        {/* 11. Appointment CTA */}
        <AppointmentCTA />

        {/* 12. Location & Google Maps */}
        <LocationSection />

        {/* 13. Contact & Inquiry Helpdesk */}
        <ContactSection />
      </main>

      {/* 14. Footer */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Mobile Sticky Action Bar */}
      <MobileBottomNav />

      {/* Interactive Booking Modal (8 steps with double-booking prevention) */}
      <BookingModal />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          setShowDashboard(true);
        }}
      />

      {/* Admin Dashboard Portal */}
      {showDashboard && (
        <AdminDashboard onClose={() => setShowDashboard(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HospitalProvider>
      <AdminAuthProvider>
        <MainAppContent />
      </AdminAuthProvider>
    </HospitalProvider>
  );
}
