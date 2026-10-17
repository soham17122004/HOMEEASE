import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, CalendarCheck, HelpCircle, User } from 'lucide-react';
import { useStoreData } from '../../lib/store';
import { LoginModal } from './LoginModal';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useStoreData();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Hide on admin panel, admin login, booking flow, and service details
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/book') ||
    (location.pathname.startsWith('/services/') && location.pathname !== '/services')
  ) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true,
    },
    {
      to: '/services',
      label: 'Services',
      icon: Sparkles,
      exact: false,
    },
    {
      to: '/bookings',
      label: 'Track',
      icon: CalendarCheck,
      exact: false,
    },
    {
      to: '/contact',
      label: 'Support',
      icon: HelpCircle,
      exact: false,
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-1 pt-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] flex items-center justify-around"
      >
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative rounded-lg active:scale-95 ${
                isActive ? 'text-[#176B52]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`relative p-1 rounded-full transition-colors ${isActive ? 'bg-emerald-50 text-[#176B52]' : ''}`}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#176B52] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#176B52]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 5th Item: Account / Login Trigger */}
        <button
          type="button"
          onClick={() => setIsLoginModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-all relative rounded-lg active:scale-95 text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <div className="relative p-1 rounded-full">
            {currentUser ? (
              <div className="w-5 h-5 rounded-full bg-[#176B52] text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            ) : (
              <User size={19} strokeWidth={1.8} />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {currentUser ? 'Account' : 'Login'}
          </span>
        </button>
      </nav>

      {/* Account / Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
