import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  XCircle,
  MapPin,
  Wrench,
  Search,
  Filter,
  X,
  Calendar,
} from 'lucide-react';
import { useStoreData, DataStore } from '../../lib/store';
import { Technician } from '../../types';

export const AdminTechniciansPage: React.FC = () => {
  const { technicians, bookings, categories } = useStoreData();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTechForAssign, setSelectedTechForAssign] = useState<Technician | null>(null);
  const [assignBookingId, setAssignBookingId] = useState('');

  // Form State for Add Technician
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [specialties, setSpecialties] = useState<string[]>(['cat-cleaning']);
  const [assignedAreas, setAssignedAreas] = useState<string[]>([
    'Zanzarda Road',
    'Moti Baug',
    'Joshipura',
  ]);

  const junagadhLocalities = [
    'Zanzarda Road',
    'Moti Baug',
    'Joshipura',
    'Kalva Chowk',
    'Timbavadi',
    'Bilkha Road',
    'College Road',
    'Gandhi Chowk',
    'Majevadi Gate',
    'Dolatpara',
    'Madhuram',
  ];

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch =
      tech.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.phone.includes(searchQuery) ||
      tech.assignedAreas.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecialty =
      specialtyFilter === 'all' || tech.specialties.includes(specialtyFilter);

    return matchesSearch && matchesSpecialty;
  });

  const handleCreateTechnician = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    DataStore.addTechnician({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      experienceYears: Number(experienceYears),
      specialties,
      assignedAreas,
      isActive: true,
    });

    setIsAddModalOpen(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setExperienceYears(3);
    setSpecialties(['cat-cleaning']);
  };

  const handleToggleSpecialty = (catId: string) => {
    setSpecialties((prev) =>
      prev.includes(catId) ? prev.filter((s) => s !== catId) : [...prev, catId]
    );
  };

  const handleToggleArea = (area: string) => {
    setAssignedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleAssignToBooking = () => {
    if (!selectedTechForAssign || !assignBookingId) return;
    DataStore.assignTechnicianToBooking(assignBookingId, selectedTechForAssign.id);
    setSelectedTechForAssign(null);
    setAssignBookingId('');
  };

  const activeBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Technician Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified field professionals operating across Junagadh service areas
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B52] hover:bg-[#125742] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technician by name, phone, or Junagadh locality..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#176B52] focus:ring-1 focus:ring-[#176B52]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#176B52]"
          >
            <option value="all">All Specialties</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className={`p-5 rounded-2xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
              tech.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {tech.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tech.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        {tech.rating}
                      </span>
                      <span className="text-[11px] text-slate-400">• {tech.totalJobs} jobs completed</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => DataStore.toggleTechnician(tech.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer transition-colors ${
                    tech.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {tech.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Contact Details */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{tech.phone}</span>
                </div>
                {tech.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Wrench size={13} className="text-slate-400 shrink-0" />
                  <span>{tech.experienceYears} Years Experience</span>
                </div>
              </div>

              {/* Service Areas */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-700" />
                  <span>Assigned Junagadh Localities:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tech.assignedAreas.map((area) => (
                    <span
                      key={area}
                      className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTechForAssign(tech)}
                className="text-xs font-bold text-[#176B52] hover:text-[#125742] hover:underline cursor-pointer"
              >
                Assign to Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove ${tech.fullName} from technicians?`)) {
                    DataStore.deleteTechnician(tech.id);
                  }
                }}
                className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Technician Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-200 animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Field Technician</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mukesh Vaghela"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tech@homeease.in"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              {/* Service Categories */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Assigned Specialties:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => {
                    const isSelected = specialties.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleSpecialty(c.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#176B52] text-white border-[#176B52] font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Junagadh Localities Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Operating Junagadh Localities:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {junagadhLocalities.map((area) => {
                    const isSelected = assignedAreas.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => handleToggleArea(area)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#176B52] hover:bg-[#125742] text-white"
                >
                  Save Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {selectedTechForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 animate-scaleIn">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Assign {selectedTechForAssign.fullName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an active Junagadh customer booking to assign this technician.
            </p>

            {activeBookings.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Booking:
                  </label>
                  <select
                    value={assignBookingId}
                    onChange={(e) => setAssignBookingId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- Choose active booking --</option>
                    {activeBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookingCode} - {b.customerName} ({b.items[0]?.serviceTitle || 'Service'}) - {b.scheduledDate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTechForAssign(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!assignBookingId}
                    onClick={handleAssignToBooking}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#176B52] hover:bg-[#125742] text-white disabled:opacity-50"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500">No active bookings available to assign.</p>
                <button
                  type="button"
                  onClick={() => setSelectedTechForAssign(null)}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
