import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, DollarSign, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { api } from '../../lib/api';

interface CustomerRecord {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  full_address: string;
  pincode: string;
  booking_count: number;
  completed_count: number;
  total_spend: number;
  last_booking_date: string;
  last_booking_code: string;
  created_at: string;
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCustomers = async (search?: string) => {
    try {
      setError(null);
      const res = await api.getAdminCustomers(search);
      setCustomers(res || []);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err?.message || 'Failed to load customer directory from database.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCustomers(searchQuery);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Directory & Lifetime Value
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real registered customer contacts and lifetime completed booking spend in Junagadh.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-2 rounded-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
          <span>Sync Customers</span>
        </button>
      </div>

      {/* Search Input & Total Stats */}
      <div className="bg-white p-3.5 rounded-none border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, mobile number, locality..."
            className="w-full pl-8 pr-3 py-1.5 rounded-none bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Customers in Database: <strong className="text-slate-900">{customers.length}</strong>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-none p-4 flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] bg-slate-50 font-semibold">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Doorstep Location</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Realized Spend</th>
                <th className="py-3 px-4">Last Booking Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs animate-pulse">
                    Loading customer directory from database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No customer accounts found in the database.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.phone} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Registered Customer</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone size={12} className="text-slate-400" />
                        <span className="font-mono">{customer.phone}</span>
                      </div>
                      {customer.email ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          <span>{customer.email}</span>
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="font-medium text-slate-800 truncate">
                        {customer.locality || customer.full_address || 'Junagadh'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {customer.pincode ? `PIN: ${customer.pincode} • ` : ''}Junagadh, Gujarat
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-none bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                          {customer.booking_count} order(s)
                        </span>
                        {customer.completed_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-none bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {customer.completed_count} completed
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {BRAND_CONFIG.currency.symbol}{customer.total_spend.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {customer.last_booking_date ? (
                        <div>
                          <div className="font-medium text-slate-800">{customer.last_booking_date}</div>
                          {customer.last_booking_code ? (
                            <div className="text-[10px] font-mono text-slate-400">{customer.last_booking_code}</div>
                          ) : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
