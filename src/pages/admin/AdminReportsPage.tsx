import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  Database,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { BRAND_CONFIG } from '../../config/brand';

interface ReportsData {
  summary: {
    total_bookings: number;
    completed_bookings: number;
    pending_bookings: number;
    in_progress_bookings: number;
    cancelled_bookings: number;
    gross_booking_value: number;
    eligible_completed_revenue: number;
    total_revenue: number;
    pending_payments: number;
    cancelled_value: number;
    avg_order_value: number;
    revenue_calculation_definition: string;
  };
  top_services: Array<{
    name: string;
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    completed_revenue: number;
    gross_value: number;
  }>;
  status_distribution: Array<{ status: string; count: number }>;
  export_rows: Array<{
    booking_code: string;
    service: string;
    customer: string;
    phone: string;
    email?: string;
    locality: string;
    address: string;
    pincode: string;
    date: string;
    time: string;
    status: string;
    payment_status: string;
    payment_method: string;
    amount: number;
  }>;
}

export const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setError(null);
      const res = await api.getAdminReports();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err?.message || 'Failed to generate financial reports from database.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReports();
  };

  const handleExportCSV = () => {
    if (!data || !data.export_rows) return;

    const filteredRows = data.export_rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });

    const headers = [
      'Booking Ref',
      'Service Name',
      'Customer Name',
      'Phone',
      'Email',
      'Locality',
      'Address',
      'Pincode',
      'Scheduled Date',
      'Time Slot',
      'Status',
      'Payment Status',
      'Payment Method',
      'Amount (INR)',
    ];

    const rows = filteredRows.map((b) => [
      `"${b.booking_code}"`,
      `"${(b.service || '').replace(/"/g, '""')}"`,
      `"${(b.customer || '').replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email || ''}"`,
      `"${(b.locality || '').replace(/"/g, '""')}"`,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      `"${b.pincode}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"${b.status}"`,
      `"${b.payment_status}"`,
      `"${b.payment_method}"`,
      b.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `HomeEase_Junagadh_Audited_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 rounded-none w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-none border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto my-12 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-none p-6 space-y-4">
          <AlertCircle size={24} className="text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Failed to load reports</h2>
          <p className="text-xs text-rose-800">{error || 'Database unavailable'}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-900 text-white rounded-none text-xs font-bold hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, top_services, status_distribution, export_rows } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Operations & Audited Revenue Reports
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real recorded transaction data and service performance in Junagadh, Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-[#176B52] hover:bg-[#125742] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export Audited CSV</span>
          </button>
        </div>
      </div>

      {/* REVENUE AUDIT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realized Revenue */}
        <div className="bg-white p-5 rounded-none border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Eligible Completed Revenue</span>
            <div className="p-1.5 rounded-none bg-emerald-50 text-emerald-700">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {BRAND_CONFIG.currency.symbol}{summary.eligible_completed_revenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            From {summary.completed_bookings} verified completed jobs
          </div>
        </div>

        {/* Gross Order Value */}
        <div className="bg-white p-5 rounded-none border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gross Order Value</span>
            <div className="p-1.5 rounded-none bg-blue-50 text-blue-700">
              <IndianRupee size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {BRAND_CONFIG.currency.symbol}{summary.gross_booking_value.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Excludes {summary.cancelled_bookings} cancelled bookings
          </div>
        </div>

        {/* Pending Collections */}
        <div className="bg-white p-5 rounded-none border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Collections</span>
            <div className="p-1.5 rounded-none bg-amber-50 text-amber-700">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {BRAND_CONFIG.currency.symbol}{summary.pending_payments.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Awaiting job completion & doorstep collection
          </div>
        </div>

        {/* Cancelled Bookings Value */}
        <div className="bg-white p-5 rounded-none border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cancelled (Excluded)</span>
            <div className="p-1.5 rounded-none bg-rose-50 text-rose-700">
              <XCircle size={15} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-500">
            {BRAND_CONFIG.currency.symbol}{summary.cancelled_value.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">
            {summary.cancelled_bookings} request(s) cancelled/rejected
          </div>
        </div>
      </div>

      {/* Accounting Definition Banner */}
      <div className="p-4 rounded-none bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
        <HelpCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">Strict Financial Integrity Rule: </span>
          <span>{summary.revenue_calculation_definition}</span>
        </div>
      </div>

      {/* SERVICE BREAKDOWN TABLE */}
      <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Service Performance Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Actual booking counts and completed revenue by service catalog item.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Avg Order: <strong>₹{summary.avg_order_value}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Cancelled</th>
                <th className="py-3 px-4">Realized Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top_services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No service bookings recorded yet.
                  </td>
                </tr>
              ) : (
                top_services.map((svc) => (
                  <tr key={svc.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {svc.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {svc.total_bookings}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                        {svc.completed_bookings}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-medium">
                      {svc.cancelled_bookings}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      ₹{svc.completed_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FILTER & REAL BOOKING EXPORT PREVIEW */}
      <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">All Recorded Bookings in Database</h3>
            <p className="text-xs text-slate-500">Live transaction rows available for audit and CSV export.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-none border border-slate-200 bg-white cursor-pointer"
            >
              <option value="all">All Bookings ({export_rows.length})</option>
              <option value="pending">Pending ({summary.pending_bookings})</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed ({summary.completed_bookings})</option>
              <option value="cancelled">Cancelled ({summary.cancelled_bookings})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {export_rows
                .filter((r) => statusFilter === 'all' || r.status === statusFilter)
                .map((row) => (
                  <tr key={row.booking_code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {row.booking_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{row.customer}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{row.phone}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-800">
                      {row.service}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {row.locality}, Junagadh
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{row.date}</div>
                      <div className="text-[10px] text-slate-400">{row.time}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{row.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-none text-[10px] font-bold ${
                          row.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : row.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-800'
                            : row.status === 'in_progress'
                            ? 'bg-purple-50 text-purple-800'
                            : row.status === 'cancelled' || row.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded-none text-[10px] font-bold ${
                          row.payment_status === 'completed' || row.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {row.payment_status === 'completed' || row.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
