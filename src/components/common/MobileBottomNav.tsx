import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, CalendarCheck, HelpCircle } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

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
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-[#E6E8EC] h-14 px-2 flex items-center justify-around shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
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
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
              isActive ? 'text-[#176B52] font-bold' : 'text-[#666D78] hover:text-[#22252B]'
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
