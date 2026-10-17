import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Users,
  Settings,
  ShieldCheck,
  MapPin,
  Home,
  BarChart3,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { DataStore, useStoreData } from '../../lib/store';
import { AdminAuth } from '../../lib/adminAuth';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookings, technicians } = useStoreData();
  const authorizedEmail = AdminAuth.getAuthorizedEmail();

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeTechCount = technicians.filter((t) => t.isActive).length;

  const handleLogout = () => {
    AdminAuth.logout();
    navigate('/admin/login', { replace: true });
  };

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      await DataStore.syncWithBackend();
    } catch {
      // Ignored or toast
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    {
      to: '/admin',
      label: 'Operations Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: '/admin/bookings',
      label: 'Bookings & Locations',
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      to: '/admin/services',
      label: 'Services & Pricing',
      icon: Wrench,
    },
    {
      to: '/admin/customers',
      label: 'Registered Customers',
      icon: Users,
    },
    {
      to: '/admin/technicians',
      label: 'Field Technicians',
      icon: ShieldCheck,
      badge: activeTechCount > 0 ? `${activeTechCount} Active` : undefined,
    },
    {
      to: '/admin/service-areas',
      label: 'Service Areas (Junagadh)',
      icon: MapPin,
    },
    {
      to: '/admin/reports',
      label: 'Reports & CSV Export',
      icon: BarChart3,
    },
    {
      to: '/admin/settings',
      label: 'Business Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      {/* Admin Compact Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-[#176B52] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                  {BRAND_CONFIG.name} Admin
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  Junagadh Hub Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {navLinks.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-none transition-colors ${
                    isActive
                      ? 'bg-[#176B52] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-none text-[10px] font-bold ${
                        isActive ? 'bg-white text-slate-900' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Profile */}
        <div className="p-3 border-t border-slate-200 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Home size={13} />
            <span>Customer Website</span>
          </Link>

          <button
            type="button"
            onClick={handleSyncData}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-emerald-700 text-[11px] font-medium transition-colors disabled:opacity-50"
            title="Sync live records directly from backend SQLite database"
          >
            <RotateCcw size={11} className={isSyncing ? 'animate-spin text-emerald-600' : ''} />
            <span>{isSyncing ? 'Syncing DB...' : 'Sync Live Database'}</span>
          </button>

          {/* Logged in Admin Info & Logout */}
          <div className="p-2.5 rounded-none bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="truncate flex-1">
              <div className="text-[11px] font-bold text-slate-900 truncate">
                Operations Head
              </div>
              <div className="text-[10px] text-slate-500 truncate" title={authorizedEmail}>
                {authorizedEmail}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-none hover:bg-white transition-colors cursor-pointer"
              title="Secure Log Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 bg-slate-50/70 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
