import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  X,
  MapPin,
  ExternalLink,
  Download,
  Map as MapIcon,
  List,
  Navigation,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { useStoreData, DataStore } from '../../lib/store';
import { Booking, BookingStatus } from '../../types';

export const AdminBookingsPage: React.FC = () => {
  const { bookings, serviceAreas, technicians, currentUser } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');
  const [serviceAreaFilter, setServiceAreaFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  useEffect(() => {
    DataStore.syncWithBackend();
  }, []);

  // Modal states
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [assignProBooking, setAssignProBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);

  // Form state for technician assignment
  const [selectedTechId, setSelectedTechId] = useState('');
  const [proName, setProName] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proRating, setProRating] = useState('5.0');
  const [proJobs, setProJobs] = useState('0');

  // Unique cities from bookings
  const bookingCities = Array.from(
    new Set(bookings.map((b) => b.city || b.address.city || 'Junagadh'))
  );

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const bCity = (b.city || b.address.city || '').toLowerCase();
    const matchesCity = cityFilter === 'all' || bCity === cityFilter.toLowerCase();
    const bPin = b.postal_code || b.address.postal_code || b.address.pincode || '';
    const matchesPin = !pincodeFilter.trim() || bPin.includes(pincodeFilter.trim());
    const matchesArea =
      serviceAreaFilter === 'all' ||
      (b.locality || b.address.locality || b.address.area || '').toLowerCase().includes(serviceAreaFilter.toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      b.bookingCode.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.toLowerCase().includes(q) ||
      (b.address_line || '').toLowerCase().includes(q) ||
      b.items[0]?.serviceTitle.toLowerCase().includes(q);

    return matchesStatus && matchesCity && matchesPin && matchesArea && matchesSearch;
  });

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    await DataStore.updateBookingStatus(bookingId, newStatus);
  };

  const handleOpenAssignModal = (booking: Booking) => {
    setAssignProBooking(booking);
    setSelectedTechId(booking.technicianId || '');
    setProName(booking.assignedProfessional?.name || (technicians[0]?.fullName || ''));
    setProPhone(booking.assignedProfessional?.phone || (technicians[0]?.phone || ''));
    setProRating(String(booking.assignedProfessional?.rating || (technicians[0]?.rating || '5.0')));
    setProJobs(String(booking.assignedProfessional?.completedJobs || (technicians[0]?.totalJobs || '0')));
  };

  const handleSelectTechnicianChange = (techId: string) => {
    setSelectedTechId(techId);
    const tech = technicians.find((t) => t.id === techId);
    if (tech) {
      setProName(tech.fullName || tech.name || '');
      setProPhone(tech.phone);
      setProRating(String(tech.rating));
      setProJobs(String(tech.totalJobs || tech.completedJobs || 0));
    }
  };

  const handleSaveAssignedPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignProBooking) return;

    if (selectedTechId) {
      await DataStore.assignTechnicianToBooking(assignProBooking.id, selectedTechId);
    } else {
      await DataStore.updateBookingStatus(assignProBooking.id, assignProBooking.status, {
        name: proName,
        phone: proPhone,
        rating: parseFloat(proRating) || 5.0,
        completedJobs: parseInt(proJobs, 10) || 0,
      });
    }

    setAssignProBooking(null);
  };

  const handleRescheduleSubmit = async (bookingId: string) => {
    if (!rescheduleDate || !rescheduleSlot) {
      alert('Please select both a new date and a time slot.');
      return;
    }
    await DataStore.rescheduleBooking(bookingId, rescheduleDate, rescheduleSlot);
    setShowReschedule(false);
    if (selectedBookingForDetails && selectedBookingForDetails.id === bookingId) {
      setSelectedBookingForDetails({
        ...selectedBookingForDetails,
        scheduledDate: rescheduleDate,
        scheduledTimeSlot: rescheduleSlot,
      });
    }
  };

  // CSV Export with role-based access control
  const handleExportCSV = () => {
    if (currentUser?.role !== 'admin') {
      alert('Access Denied: Only administrators have permission to export customer address data.');
      return;
    }

    const headers = [
      'Booking Code',
      'Customer Name',
      'Phone',
      'Email',
      'Service',
      'Date',
      'Slot',
      'Status',
      'Payment Status',
      'Payment Method',
      'Amount (INR)',
      'Full Address',
      'Apartment/House',
      'Building',
      'Locality',
      'City',
      'District',
      'State',
      'Postal Code',
      'Latitude',
      'Longitude',
      'Location Confirmed',
      'Google Maps Directions URL',
    ];

    const rows = filteredBookings.map((b) => {
      const lat = b.latitude ?? b.address.latitude ?? 21.1418;
      const lng = b.longitude ?? b.address.longitude ?? 72.7709;
      const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

      return [
        `"${b.bookingCode}"`,
        `"${b.customerName}"`,
        `"${b.customerPhone}"`,
        `"${b.customerEmail}"`,
        `"${(b.items[0]?.serviceTitle || '').replace(/"/g, '""')}"`,
        `"${b.scheduledDate}"`,
        `"${b.scheduledTimeSlot}"`,
        `"${b.status}"`,
        `"${b.paymentStatus}"`,
        `"${b.paymentMethod}"`,
        b.totalAmount,
        `"${(b.address_line || b.address.address_line || `${b.address.houseNumber}, ${b.address.street}`).replace(/"/g, '""')}"`,
        `"${(b.apartment_or_house_number || b.address.apartment_or_house_number || b.address.houseNumber || '').replace(/"/g, '""')}"`,
        `"${(b.building_name || b.address.building_name || b.address.street || '').replace(/"/g, '""')}"`,
        `"${(b.locality || b.address.locality || b.address.area || '').replace(/"/g, '""')}"`,
        `"${b.city || b.address.city || ''}"`,
        `"${b.district || b.address.district || b.city || ''}"`,
        `"${b.state || b.address.state || 'Gujarat'}"`,
        `"${b.postal_code || b.address.postal_code || b.address.pincode || ''}"`,
        lat,
        lng,
        b.location_confirmed || b.address.location_confirmed ? 'YES' : 'NO',
        `"${gmapsUrl}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `homeease_gujarat_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bookings Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch technicians across Gujarat, filter by city and PIN code, and inspect precise doorstep coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-none border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={13} />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon size={13} />
              <span>Map View</span>
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-none text-xs font-semibold border border-slate-200 flex items-center gap-2 transition-colors shadow-sm"
            title="Export filtered booking addresses and coordinates to CSV"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-none border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, customer, pro..."
              className="w-full pl-8 pr-3 py-2 rounded-none bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
            />
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-none bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-900"
            >
              <option value="all">All Gujarat Cities</option>
              {bookingCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* PIN Code Filter */}
          <div>
            <input
              type="text"
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Filter by PIN (e.g. 395007)..."
              className="w-full px-3 py-2 rounded-none bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:bg-white focus:border-slate-900"
            />
          </div>

          {/* Service Area Filter */}
          <div>
            <select
              value={serviceAreaFilter}
              onChange={(e) => setServiceAreaFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-none bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-900"
            >
              <option value="all">All Service Localities</option>
              {serviceAreas.map((sa) => (
                <option key={sa.id} value={sa.locality}>
                  {sa.locality} ({sa.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium shrink-0">
            Showing {filteredBookings.length} of {bookings.length} Bookings
          </span>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] bg-slate-50 font-semibold">
                  <th className="py-3 px-4">Booking Code</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Service & Slot</th>
                  <th className="py-3 px-4">Doorstep Location Snapshot</th>
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No bookings found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const lat = b.latitude ?? b.address.latitude ?? 21.1418;
                    const lng = b.longitude ?? b.address.longitude ?? 72.7709;
                    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Booking Code */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {b.bookingCode}
                        </td>

                        {/* Customer & City */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{b.customerName}</div>
                          <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            {b.city || b.address.city}, Gujarat
                          </div>
                        </td>

                        {/* Service & Slot */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="font-medium text-slate-900 truncate">
                            {b.items[0]?.serviceTitle || 'Home Service'}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            <span>{b.scheduledTimeSlot}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(b.scheduledDate).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Doorstep Location Snapshot */}
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="text-xs text-slate-900 truncate font-medium">
                            {b.address.houseNumber}, {b.address.street}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {b.locality || b.address.locality || b.address.area}, PIN {b.postal_code || b.address.pincode}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-slate-400">
                              {lat.toFixed(4)}°, {lng.toFixed(4)}°
                            </span>
                            <a
                              href={gmapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                              title="Open exact doorstep location in Google Maps directions"
                            >
                              <span>Navigate</span>
                              <ExternalLink size={9} />
                            </a>
                          </div>
                        </td>

                        {/* Assigned Tech */}
                        <td className="py-3.5 px-4">
                          {b.assignedProfessional ? (
                            <div>
                              <div className="font-medium text-slate-900">{b.assignedProfessional.name}</div>
                              <div className="text-[11px] text-slate-500">{b.assignedProfessional.phone}</div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignModal(b)}
                              className="px-2.5 py-1 rounded-none bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold border border-amber-200"
                            >
                              Assign Pro
                            </button>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {BRAND_CONFIG.currency.symbol}{b.totalAmount}
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize">{b.paymentMethod}</div>
                        </td>

                        {/* Status Dropdown & One-Click Accept/Reject */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                              className={`border text-xs rounded-none px-2.5 py-1 font-medium focus:outline-none ${getStatusBadge(b.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {b.status === 'pending' && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, 'confirmed')}
                                  className="px-2 py-0.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs"
                                  title="Accept Booking"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.id, 'cancelled')}
                                  className="px-2 py-0.5 rounded-none bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200"
                                  title="Reject Booking"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAssignModal(b)}
                              className="px-2.5 py-1.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                              title="Assign Technician"
                            >
                              Assign Pro
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBookingForDetails(b);
                                setRescheduleDate(b.scheduledDate);
                                setRescheduleSlot(b.scheduledTimeSlot);
                                setShowReschedule(false);
                              }}
                              className="px-3 py-1.5 rounded-none bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE GUJARAT BOOKINGS MAP */}
      {viewMode === 'map' && (
        <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Booking Locations Across Gujarat</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic coordinates snapshot for each active customer booking.
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-none border border-emerald-200">
              {filteredBookings.length} Pinned Customer Locations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredBookings.map((b) => {
              const lat = b.latitude ?? b.address.latitude ?? 21.1418;
              const lng = b.longitude ?? b.address.longitude ?? 72.7709;
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-none bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900">{b.bookingCode}</span>
                      <h4 className="font-semibold text-slate-900 text-xs mt-0.5">{b.customerName}</h4>
                      <p className="text-[11px] text-slate-500">{b.customerPhone}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-bold border ${getStatusBadge(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-none bg-white border border-slate-200 space-y-1 text-xs">
                    <div className="text-slate-800 font-medium">
                      {b.address_line || `${b.address.houseNumber}, ${b.address.street}, ${b.address.city}`}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
                      <span className="text-slate-500">PIN {b.postal_code || b.address.pincode}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-slate-800">
                      {b.scheduledTimeSlot} ({new Date(b.scheduledDate).toLocaleDateString()})
                    </span>
                    <a
                      href={gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Navigation size={12} />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INSPECT BOOKING DETAILS MODAL */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none p-6 sm:p-8 max-w-lg w-full border border-slate-200 text-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBookingForDetails(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-none border border-slate-200">
                {selectedBookingForDetails.bookingCode}
              </span>
              <span className="text-xs text-slate-400">Order ID: {selectedBookingForDetails.id}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-0.5">
              {selectedBookingForDetails.items[0]?.serviceTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: {selectedBookingForDetails.customerName} ({selectedBookingForDetails.customerPhone})
            </p>

            <div className="mt-5 space-y-4 text-xs">
              {/* Confirmed Location Snapshot Box */}
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-600" />
                    <span>Gujarat Doorstep Snapshot (Confirmed)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-none bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    GPS Locked
                  </span>
                </div>
                <div className="text-slate-800 font-medium leading-relaxed">
                  {selectedBookingForDetails.address_line || `${selectedBookingForDetails.address.houseNumber}, ${selectedBookingForDetails.address.street}, ${selectedBookingForDetails.address.area}, ${selectedBookingForDetails.address.city}, Gujarat ${selectedBookingForDetails.address.pincode}`}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <div>
                    City: <strong className="text-slate-900">{selectedBookingForDetails.city || selectedBookingForDetails.address.city}</strong>
                  </div>
                  <div>
                    PIN: <strong className="text-slate-900">{selectedBookingForDetails.postal_code || selectedBookingForDetails.address.pincode}</strong>
                  </div>
                  <div>
                    Lat: <strong className="text-slate-900 font-mono">{(selectedBookingForDetails.latitude ?? selectedBookingForDetails.address.latitude)?.toFixed(5)}° N</strong>
                  </div>
                  <div>
                    Lng: <strong className="text-slate-900 font-mono">{(selectedBookingForDetails.longitude ?? selectedBookingForDetails.address.longitude)?.toFixed(5)}° E</strong>
                  </div>
                </div>

                {selectedBookingForDetails.landmark && (
                  <div className="text-slate-500 pt-1">Landmark: {selectedBookingForDetails.landmark}</div>
                )}
                {(selectedBookingForDetails.location_instructions || selectedBookingForDetails.address.notesForPro) && (
                  <div className="text-amber-700 bg-amber-50 p-2 rounded-none border border-amber-200 mt-1">
                    Entry Note: "{selectedBookingForDetails.location_instructions || selectedBookingForDetails.address.notesForPro}"
                  </div>
                )}

                {/* Direct Google Maps Navigation Button */}
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBookingForDetails.latitude ?? selectedBookingForDetails.address.latitude},${selectedBookingForDetails.longitude ?? selectedBookingForDetails.address.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={13} />
                    <span>Open in Google Maps Navigation</span>
                  </a>
                </div>
              </div>

              {/* Service & Schedule Breakdown */}
              <div className="p-4 rounded-none bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-900">
                  <span>Scheduled Date & Slot</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{new Date(selectedBookingForDetails.scheduledDate).toLocaleDateString()} ({selectedBookingForDetails.scheduledTimeSlot})</span>
                    <button
                      type="button"
                      onClick={() => setShowReschedule(!showReschedule)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {showReschedule ? 'Cancel' : 'Reschedule'}
                    </button>
                  </div>
                </div>

                {showReschedule && (
                  <div className="p-3 bg-slate-50 rounded-none border border-slate-200 mt-2 space-y-2.5">
                    <div className="font-semibold text-slate-800 text-[11px]">Reschedule Appointment</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">New Date</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full p-2 rounded-none border border-slate-200 text-xs bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">New Time Slot</label>
                        <select
                          value={rescheduleSlot}
                          onChange={(e) => setRescheduleSlot(e.target.value)}
                          className="w-full p-2 rounded-none border border-slate-200 text-xs bg-white text-slate-900"
                        >
                          <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                          <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                          <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                          <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                          <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRescheduleSubmit(selectedBookingForDetails.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-semibold"
                    >
                      Confirm Rescheduled Time
                    </button>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Payment Method & Status</span>
                  <span className="capitalize">{selectedBookingForDetails.paymentMethod} ({selectedBookingForDetails.paymentStatus})</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-100">
                  <span>Total Amount Paid</span>
                  <span className="text-sm">{BRAND_CONFIG.currency.symbol}{selectedBookingForDetails.totalAmount}</span>
                </div>
              </div>

              {/* Status Actions: Accept / Reject for Pending */}
              {selectedBookingForDetails.status === 'pending' && (
                <div className="p-3 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                  <div className="text-xs text-amber-900 font-medium">
                    This booking request is pending admin confirmation.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedBookingForDetails.id, 'confirmed');
                        setSelectedBookingForDetails({ ...selectedBookingForDetails, status: 'confirmed' });
                      }}
                      className="px-3 py-1.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleStatusChange(selectedBookingForDetails.id, 'cancelled');
                        setSelectedBookingForDetails({ ...selectedBookingForDetails, status: 'cancelled' });
                      }}
                      className="px-3 py-1.5 rounded-none bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold border border-rose-300"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Assigned Technician Card */}
              {selectedBookingForDetails.assignedProfessional ? (
                <div className="p-4 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Technician</span>
                    <div className="font-semibold text-slate-900">{selectedBookingForDetails.assignedProfessional.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedBookingForDetails.assignedProfessional.phone}</div>
                  </div>
                  <button
                    onClick={() => {
                      const b = selectedBookingForDetails;
                      setSelectedBookingForDetails(null);
                      handleOpenAssignModal(b);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Reassign
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const b = selectedBookingForDetails;
                    setSelectedBookingForDetails(null);
                    handleOpenAssignModal(b);
                  }}
                  className="w-full py-2.5 rounded-none bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200 hover:bg-amber-100"
                >
                  Assign Field Technician Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PROFESSIONAL MODAL */}
      {assignProBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-none p-6 max-w-md w-full border border-slate-200 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setAssignProBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Assign Technician to Booking
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking {assignProBooking.bookingCode} • Junagadh, Gujarat
            </p>

            <form onSubmit={handleSaveAssignedPro} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select from Registered Junagadh Technicians
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => handleSelectTechnicianChange(e.target.value)}
                  className="w-full p-2.5 rounded-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                >
                  <option value="">-- Or enter custom details below --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.phone}) — {t.specialties.join(', ')} [{t.rating}★, {t.isActive ? 'Active' : 'Inactive'}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Technician Full Name</label>
                <input
                  type="text"
                  value={proName}
                  onChange={(e) => setProName(e.target.value)}
                  required
                  placeholder="e.g. Suresh Patil"
                  className="w-full p-2.5 rounded-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Direct Phone Number</label>
                <input
                  type="text"
                  value={proPhone}
                  onChange={(e) => setProPhone(e.target.value)}
                  required
                  placeholder="e.g. +91 98450 11223"
                  className="w-full p-2.5 rounded-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="5.0"
                    value={proRating}
                    onChange={(e) => setProRating(e.target.value)}
                    className="w-full p-2.5 rounded-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Jobs Completed</label>
                  <input
                    type="number"
                    value={proJobs}
                    onChange={(e) => setProJobs(e.target.value)}
                    className="w-full p-2.5 rounded-none bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignProBooking(null)}
                  className="px-4 py-2 rounded-none border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-none bg-[#176B52] hover:bg-[#135742] text-white font-semibold shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
