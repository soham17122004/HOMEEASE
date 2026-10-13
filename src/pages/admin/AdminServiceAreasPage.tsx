import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Edit2,
  Trash2,
  Sliders,
  Map as MapIcon,
  List,
  Compass,
  Building2,
  Inbox,
  ExternalLink,
  Check,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useStoreData, DataStore } from '../../lib/store';
import { ServiceArea, ServiceEnquiry } from '../../types';
import { GUJARAT_CITIES } from '../../data/gujaratLocations';

export const AdminServiceAreasPage: React.FC = () => {
  const { serviceAreas, serviceEnquiries, currentUser } = useStoreData();
  const [activeTab, setActiveTab] = useState<'areas' | 'map' | 'enquiries'>('areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states for Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

  // Form states
  const [city, setCity] = useState('Junagadh');
  const [district, setDistrict] = useState('Junagadh');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('362002');
  const [radiusKm, setRadiusKm] = useState('7');
  const [latitude, setLatitude] = useState('21.5222');
  const [longitude, setLongitude] = useState('70.4579');
  const [isActive, setIsActive] = useState(true);
  const [supportedServices, setSupportedServices] = useState<string[]>([
    'cat-sofa',
    'cat-cleaning',
    'cat-ac',
    'cat-appliances',
  ]);
  const [formError, setFormError] = useState('');

  // Service definitions with color badges
  const SERVICE_OPTIONS = [
    { id: 'cat-sofa', label: 'Sofa Cleaning', desc: 'Fabric & leather extraction' },
    { id: 'cat-cleaning', label: 'Home Deep Cleaning', desc: 'Full apartment/villa deep clean' },
    { id: 'cat-ac', label: 'AC Servicing', desc: 'Jet washing & gas top-up' },
    { id: 'cat-appliances', label: 'Washing Machine Service', desc: 'Motor, PCB & drum repair' },
  ];

  // Unique cities from configured areas
  const configuredCities = Array.from(new Set(serviceAreas.map((a) => a.city)));

  // Filtered areas
  const filteredAreas = serviceAreas.filter((area) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      area.locality.toLowerCase().includes(q) ||
      area.city.toLowerCase().includes(q) ||
      area.pincode.includes(q) ||
      area.district.toLowerCase().includes(q);

    const matchesCity = cityFilter === 'all' || area.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && area.isActive) ||
      (statusFilter === 'inactive' && !area.isActive);

    return matchesSearch && matchesCity && matchesStatus;
  });

  const activeCount = serviceAreas.filter((a) => a.isActive).length;
  const pendingEnquiriesCount = serviceEnquiries.filter((e) => e.status === 'pending').length;

  const handleOpenAddModal = () => {
    setEditingArea(null);
    setCity('Junagadh');
    setDistrict('Junagadh');
    setLocality('');
    setPincode('362002');
    setRadiusKm('7');
    setLatitude('21.5222');
    setLongitude('70.4579');
    setIsActive(true);
    setSupportedServices(['cat-sofa', 'cat-cleaning', 'cat-ac', 'cat-appliances']);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setCity(area.city);
    setDistrict(area.district);
    setLocality(area.locality);
    setPincode(area.pincode);
    setRadiusKm(String(area.radiusKm || 7));
    setLatitude(String(area.latitude));
    setLongitude(String(area.longitude));
    setIsActive(area.isActive);
    setSupportedServices(
      area.supportedServiceCategories || ['cat-sofa', 'cat-cleaning', 'cat-ac', 'cat-appliances']
    );
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCitySelectChange = (cityName: string) => {
    setCity(cityName);
    const found = GUJARAT_CITIES.find((c) => c.name === cityName);
    if (found) {
      setDistrict(found.district);
      setLatitude(String(found.center.lat));
      setLongitude(String(found.center.lng));
    }
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (!locality.trim()) {
      setFormError('Locality name is required.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radiusKm) || 7;

    if (isNaN(lat) || isNaN(lng)) {
      setFormError('Valid latitude and longitude are required.');
      return;
    }

    if (editingArea) {
      DataStore.updateServiceArea(editingArea.id, {
        city,
        district,
        locality: locality.trim(),
        pincode: pincode.trim(),
        radiusKm: rad,
        latitude: lat,
        longitude: lng,
        isActive,
        supportedServiceCategories: supportedServices,
      });
    } else {
      DataStore.addServiceArea({
        city,
        district,
        locality: locality.trim(),
        pincode: pincode.trim(),
        radiusKm: rad,
        latitude: lat,
        longitude: lng,
        isActive,
        supportedServiceCategories: supportedServices,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    DataStore.updateServiceArea(id, { isActive: !currentStatus });
  };

  const handleDeleteArea = (id: string, localityName: string) => {
    if (window.confirm(`Delete coverage area "${localityName}" from the Gujarat database?`)) {
      DataStore.deleteServiceArea(id);
    }
  };

  const toggleServiceCategoryForArea = (area: ServiceArea, serviceCatId: string) => {
    const current = area.supportedServiceCategories || [
      'cat-sofa',
      'cat-cleaning',
      'cat-ac',
      'cat-appliances',
    ];
    const updated = current.includes(serviceCatId)
      ? current.filter((id) => id !== serviceCatId)
      : [...current, serviceCatId];

    DataStore.updateServiceArea(area.id, { supportedServiceCategories: updated });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gujarat Service Areas & Coverage Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure active cities, PIN codes, and service availability separately for sofa cleaning, home cleaning, AC servicing, and washing machines.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors"
        >
          <Plus size={15} />
          <span>Add New Service Area</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Configured Areas</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{serviceAreas.length}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{configuredCities.length} Gujarat City Hubs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Active Service Zones</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{activeCount}</span>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">Accepting Bookings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Paused / Staged Zones</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{serviceAreas.length - activeCount}</span>
          <span className="text-[11px] text-amber-600 mt-0.5 block">Bookings Blocked</span>
        </div>

        <div
          onClick={() => setActiveTab('enquiries')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <span className="text-[11px] font-semibold text-slate-500 block">Expansion Enquiries</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">{serviceEnquiries.length}</span>
          <span className="text-[11px] text-blue-600 mt-0.5 block">{pendingEnquiriesCount} Pending Review</span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('areas')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'areas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <List size={13} />
          <span>Service Areas ({filteredAreas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapIcon size={13} />
          <span>Coverage Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox size={13} />
          <span>Expansion Enquiries</span>
          {pendingEnquiriesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {pendingEnquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SERVICE AREAS LIST */}
      {activeTab === 'areas' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area, locality, or PIN code..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-900"
              >
                <option value="all">All Gujarat Cities</option>
                {configuredCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-900"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Service Areas Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Locality & City</th>
                    <th className="py-3 px-4">PIN Code</th>
                    <th className="py-3 px-4">Coordinates & Radius</th>
                    <th className="py-3 px-4">Separate Service Coverage</th>
                    <th className="py-3 px-4 text-center">Active Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAreas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No service areas found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAreas.map((area) => (
                      <tr key={area.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Locality & City */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-xs">{area.locality}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-slate-400" />
                            <span>{area.city}, {area.district} Dist.</span>
                          </div>
                        </td>

                        {/* PIN Code */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          {area.pincode}
                        </td>

                        {/* Coordinates & Radius */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-slate-600 font-mono">
                            {area.latitude.toFixed(4)}°N, {area.longitude.toFixed(4)}°E
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Radius: {area.radiusKm || 7} km dispatch
                          </div>
                        </td>

                        {/* Individual Service Category Matrix */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {SERVICE_OPTIONS.map((srv) => {
                              const isSupported = (area.supportedServiceCategories || []).includes(srv.id);
                              return (
                                <button
                                  key={srv.id}
                                  type="button"
                                  onClick={() => toggleServiceCategoryForArea(area, srv.id)}
                                  title={`Click to toggle ${srv.label} in ${area.locality}`}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all border ${
                                    isSupported
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 line-through hover:bg-slate-200'
                                  }`}
                                >
                                  {srv.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(area.id, area.isActive)}
                            className="inline-flex items-center gap-1.5 focus:outline-none"
                            title={area.isActive ? 'Click to Pause Area' : 'Click to Activate Area'}
                          >
                            {area.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle size={12} />
                                <span>Paused</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(area)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit Area Details"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArea(area.id, area.locality)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Area"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE GUJARAT MAP VIEW */}
      {activeTab === 'map' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Gujarat Operational Grid</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of dispatch hubs and active coverage zones across Gujarat.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Active ({activeCount})</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Paused ({serviceAreas.length - activeCount})</span>
              </span>
            </div>
          </div>

          {/* Visual Grid Map Representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {serviceAreas.map((area) => (
              <div
                key={area.id}
                className={`p-4 rounded-xl border transition-all ${
                  area.isActive
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{area.locality}</span>
                      {area.isActive ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {area.city} • PIN {area.pincode}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${area.latitude},${area.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs"
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-500">
                  {area.latitude.toFixed(4)}° N, {area.longitude.toFixed(4)}° E (±{area.radiusKm}km)
                </div>

                {/* Per service badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {SERVICE_OPTIONS.map((srv) => {
                    const supported = area.supportedServiceCategories?.includes(srv.id);
                    return (
                      <span
                        key={srv.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          supported
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 line-through'
                        }`}
                      >
                        {srv.label.split(' ')[0]}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER EXPANSION ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Customer Coverage Expansion Enquiries</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Requests submitted by users outside currently serviceable Gujarat PIN codes.
              </p>
            </div>
          </div>

          {serviceEnquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expansion enquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {serviceEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{enq.customerName}</span>
                      <span className="text-[11px] text-slate-500">({enq.customerPhone})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        PIN {enq.pincode} ({enq.city})
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">{enq.fullAddress}</div>
                    {enq.notes && (
                      <div className="text-[11px] text-slate-500 italic">"{enq.notes}"</div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      Requested: {new Date(enq.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={enq.status}
                      onChange={(e) =>
                        DataStore.updateServiceEnquiryStatus(
                          enq.id,
                          e.target.value as ServiceEnquiry['status']
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="contacted">Contacted</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenAddModal();
                        setCity(enq.city || 'Surat');
                        setPincode(enq.pincode || '');
                        setLocality(enq.fullAddress.slice(0, 30));
                        if (enq.latitude) setLatitude(String(enq.latitude));
                        if (enq.longitude) setLongitude(String(enq.longitude));
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Create Area Here
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT SERVICE AREA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingArea ? 'Edit Service Coverage Area' : 'Add New Gujarat Service Area'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    City / Town (Gujarat) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => handleCitySelectChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  >
                    {GUJARAT_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.district} Dist.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                    placeholder="e.g. Surat"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Locality / Sector Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                    placeholder="e.g. Vesu & VIP Road"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    6-Digit Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-900"
                    placeholder="e.g. 395007"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Latitude (Numeric Coordinate) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-900"
                    placeholder="e.g. 21.1418"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Longitude (Numeric Coordinate) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-900"
                    placeholder="e.g. 72.7709"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Dispatch Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Area Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Active (Accepting Bookings)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Supported Service Categories Matrix */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Service Availability Matrix for this Area
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICE_OPTIONS.map((srv) => {
                    const isChecked = supportedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-slate-50 border-slate-900 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSupportedServices([...supportedServices, srv.id]);
                            } else {
                              setSupportedServices(supportedServices.filter((s) => s !== srv.id));
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                        <div>
                          <div className="font-semibold text-xs">{srv.label}</div>
                          <div className="text-[10px] text-slate-400">{srv.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
                >
                  {editingArea ? 'Save Changes' : 'Create Service Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
