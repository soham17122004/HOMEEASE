import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { WhatsAppButton } from './components/common/WhatsAppButton';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { LegalPage } from './pages/LegalPage';

// Admin Pages & Guard
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminTechniciansPage } from './pages/admin/AdminTechniciansPage';
import { AdminServiceAreasPage } from './pages/admin/AdminServiceAreasPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to top upon route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Customer Layout with Sticky Header, Footer & App-like Mobile Bottom Nav
function CustomerLayout() {
  // Discreet keyboard shortcut: Ctrl+Shift+A or Alt+A opens Admin Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        window.location.href = '/admin/login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-14 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Customer Portal Routes (No customer login required) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />
        </Route>

        {/* Dedicated Admin Login Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Secure Admin Portal (Protected by AdminGuard) */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="technicians" element={<AdminTechniciansPage />} />
          <Route path="service-areas" element={<AdminServiceAreasPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Fallback & Redirects */}
        <Route path="/auth" element={<AdminLoginPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
