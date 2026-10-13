import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CalendarCheck,
  Clock,
  ChevronRight,
  MapPin,
  RefreshCw,
  AlertCircle,
  Database,
  Users,
  Wrench,
  Calendar,
  Phone,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { api } from '../../lib/api';
import { DataStore } from '../../lib/store';
import { BookingStatus } from '../../types';

interface DashboardData {
  total_bookings: number;
  pending_requests: number;
  confirmed_bookings: number;
  in_progress_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  status_distribution: Array<{ status: string; count: number }>;
  gross_booking_value: number;
  eligible_completed_revenue: number;
  total_revenue: number;
  pending_payments: number;
  cancelled_revenue: number;
  collected_payments: number;
  refunds: number;
  net_revenue: number;
  revenue_calculation_definition: string;
  today_bookings_count: number;
  today_bookings: any[];
  upcoming_bookings_count: number;
  upcoming_bookings: any[];
  total_customers: number;
  active_services_count: number;
  active_services: any[];
  slots_summary: Array<{
    slot: string;
    max_capacity: number;
    booked_count: number;
    completed_count: number;
    cancelled_count: number;
    available_count: number;
  }>;
  monthly_trend: Array<{
    month: string;
    bookings: number;
    revenue: number;
    completed: number;
  }>;
  recent_bookings: any[];
}

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getAdminDashboard();
      setData(res);
      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load real dashboard metrics:', err);
      setError(err?.message || 'Unable to connect to the production database. Please check your backend connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
    DataStore.syncWithBackend().catch(console.warn);
  };

  const handleStatusChange = async (bookingId: number | string, newStatus: string) => {
    try {
      setStatusUpdatingId(bookingId);
      await api.updateBookingStatus(bookingId, newStatus);
      await fetchDashboardData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message || 'Unknown error'}`);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl mx-auto my-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Database Connection Notice</h2>
          <p className="text-xs text-rose-800 leading-relaxed max-w-md mx-auto">
            {error || 'Unable to load live dashboard statistics from the database.'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Header with Live Database Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Operations & Dispatch
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time database analytics for Junagadh, Gujarat. Zero placeholder data or fabricated metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title={`Last updated at ${lastRefreshedAt.toLocaleTimeString()}`}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span>Sync</span>
          </button>
          <Link
            to="/admin/service-areas"
            className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <MapPin size={13} className="text-slate-500" />
            <span>Service Areas</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>All Bookings ({data.total_bookings})</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* REVENUE & ACCOUNTING AUDIT CALLOUT (Clear Definition) */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
          <div>
            <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={13} />
              <span>Realized Revenue Audit (Production Source of Truth)</span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              {BRAND_CONFIG.currency.symbol}{data.eligible_completed_revenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-emerald-800/60 border border-emerald-700/60 rounded-xl px-3.5 py-2 text-right">
            <div className="text-[10px] text-emerald-300 font-semibold uppercase">Realized Calculation Rule</div>
            <div className="text-xs font-bold text-emerald-100 mt-0.5">
              Completed Jobs Only ({data.completed_bookings} of {data.total_bookings} total)
            </div>
          </div>
        </div>

        {/* Breakdown row: Gross Value vs Collected vs Pending vs Cancelled */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-[10px] text-emerald-400 font-semibold block">Gross Booking Value</span>
            <span className="text-sm font-bold text-white">
              {BRAND_CONFIG.currency.symbol}{data.gross_booking_value.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-[10px] text-emerald-400 font-semibold block">Verified Collected</span>
            <span className="text-sm font-bold text-white">
              {BRAND_CONFIG.currency.symbol}{data.collected_payments.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-[10px] text-amber-300 font-semibold block">Pending / Unverified</span>
            <span className="text-sm font-bold text-amber-200">
              {BRAND_CONFIG.currency.symbol}{data.pending_payments.toLocaleString()}
            </span>
          </div>

          <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50">
            <span className="text-[10px] text-rose-300 font-semibold block">Cancelled (Excluded)</span>
            <span className="text-sm font-bold text-rose-200">
              {BRAND_CONFIG.currency.symbol}{data.cancelled_revenue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-emerald-200/90 flex items-start gap-1.5 pt-1">
          <HelpCircle size={13} className="shrink-0 mt-0.5 text-emerald-400" />
          <span>{data.revenue_calculation_definition}</span>
        </div>
      </div>

      {/* CORE KPI CARDS (4x Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Orders Placed</span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <CalendarCheck size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.total_bookings}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
              {data.completed_bookings} Completed
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
              {data.pending_requests} Pending
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
              {data.cancelled_bookings} Cancelled
            </span>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today's Appointments</span>
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.today_bookings_count}
          </div>
          <div className="text-[11px] text-slate-500">
            {data.upcoming_bookings_count} upcoming scheduled ahead
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered Customers</span>
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.total_customers}
          </div>
          <div className="text-[11px] text-slate-500">
            Verified contacts in Junagadh database
          </div>
        </div>

        {/* Active Catalog Services */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Services</span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
              <Wrench size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {data.active_services_count}
          </div>
          <div className="text-[11px] text-slate-500">
            Configured in catalog with live pricing
          </div>
        </div>
      </div>

      {/* APPOINTMENT SLOTS CAPACITY & UTILIZATION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Appointment Slot Capacity & Utilization</h3>
            <p className="text-xs text-slate-500">
              Real-time slot utilization tracking across active dispatch windows in Junagadh.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            Operating Hours: 8:00 AM – 8:00 PM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.slots_summary.map((slot) => {
            const bookedRatio = Math.min(100, Math.round((slot.booked_count / (slot.max_capacity || 5)) * 100));
            return (
              <div
                key={slot.slot}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{slot.slot}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      slot.available_count === 0
                        ? 'bg-rose-100 text-rose-800'
                        : slot.available_count <= 2
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {slot.available_count} Available
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${bookedRatio}%` }}
                    className={`h-full transition-all ${
                      bookedRatio >= 80 ? 'bg-rose-500' : bookedRatio >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>{slot.booked_count} active bookings</span>
                  <span className="text-slate-400">Cap: {slot.max_capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TRENDS & STATUS PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Monthly Revenue Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Booking & Revenue Trend</h3>
              <p className="text-xs text-slate-500">Aggregated strictly from actual completed records in the database</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Actual Database Records
            </span>
          </div>

          {data.monthly_trend.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Database size={24} className="text-slate-300" />
              <span>No completed booking revenue recorded yet. New completed orders will populate this chart.</span>
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-100">
              {data.monthly_trend.map((item, idx) => {
                const maxAmt = Math.max(...data.monthly_trend.map((m) => m.revenue), 1000);
                const heightPct = Math.max(12, Math.round((item.revenue / maxAmt) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-600 opacity-90 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue.toLocaleString()}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[42px] bg-[#176B52] group-hover:bg-[#125742] rounded-t transition-all"
                    />
                    <span className="text-[11px] text-slate-600 font-semibold">{item.month}</span>
                    <span className="text-[9px] text-slate-400">{item.bookings} order(s)</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Real Average Completed Order:{' '}
              <strong className="text-slate-900">
                ₹{data.completed_bookings > 0 ? Math.round(data.eligible_completed_revenue / data.completed_bookings).toLocaleString() : '0'}
              </strong>
            </span>
            <span>
              Total Database Records: <strong className="text-slate-900">{data.total_bookings}</strong>
            </span>
          </div>
        </div>

        {/* Status Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Booking Status Pipeline</h3>
            <p className="text-xs text-slate-500">Live counts by dispatch phase</p>
          </div>

          <div className="space-y-2">
            {data.status_distribution.map((item) => (
              <div
                key={item.status}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-emerald-500'
                        : item.status === 'confirmed'
                        ? 'bg-blue-500'
                        : item.status === 'in_progress'
                        ? 'bg-purple-500'
                        : item.status === 'pending'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-700 capitalize">
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all bookings in dispatch list</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ACTIVE SERVICES AND CONFIGURED PRICING PREVIEW */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Configured Database Services & Pricing</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live service prices maintained by the admin panel and displayed on customer pages.
            </p>
          </div>
          <Link
            to="/admin/services"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
          >
            <Wrench size={13} />
            <span>Manage Catalog ({data.active_services_count})</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Configured Price</th>
                <th className="py-3 px-4">Original Price</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.active_services.slice(0, 6).map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {svc.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {svc.category_id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{svc.price}
                  </td>
                  <td className="py-3 px-4 text-slate-400 line-through">
                    {svc.original_price ? `₹${svc.original_price}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {svc.duration_minutes} mins
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {svc.is_active ? 'Active on Website' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT REAL BOOKINGS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Real Customer Bookings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records retrieved directly from production database.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-slate-900 hover:underline"
          >
            View All ({data.total_bookings}) →
          </Link>
        </div>

        {data.recent_bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No bookings recorded in the database yet. Real bookings placed by customers will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer Contact</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.booking_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{b.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{b.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="font-medium text-slate-900 truncate">{b.service_name}</div>
                      <div className="text-[11px] text-slate-500">{b.locality}, Junagadh</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{b.scheduled_date}</div>
                      <div className="text-[10px] text-slate-500">{b.scheduled_time}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{b.total_amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.payment_status === 'completed' || b.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {b.payment_status === 'completed' || b.payment_status === 'paid' ? 'Paid' : 'Pending / COD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        disabled={statusUpdatingId === b.id}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${
                          b.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.status === 'in_progress'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : b.status === 'cancelled' || b.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
