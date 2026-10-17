import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { useStoreData } from '../../lib/store';
import { WHATSAPP_DISPLAY, openWhatsApp } from '../../lib/whatsapp';

export interface LocationPickerValue {
  address_line: string;
  apartment_or_house_number: string;
  building_name: string;
  floor_number?: string;
  landmark?: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  google_place_id?: string;
  location_accuracy_meters?: number;
  location_confirmed: boolean;
  location_instructions?: string;
}

interface LocationPickerProps {
  serviceIdOrCategory?: string;
  initialValue?: Partial<LocationPickerValue>;
  onLocationChange: (value: LocationPickerValue, isServiceable: boolean) => void;
  required?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialValue,
  onLocationChange,
}) => {
  const { selectedCity } = useStoreData();

  // Address fields state - Default strictly to Junagadh, Gujarat
  const [houseNumber, setHouseNumber] = useState(
    initialValue?.apartment_or_house_number || ''
  );
  const [buildingName, setBuildingName] = useState(
    initialValue?.building_name || ''
  );
  const [floorNumber, setFloorNumber] = useState(initialValue?.floor_number || '');
  const [locality, setLocality] = useState(initialValue?.locality || 'Zanzarda Road');
  const [city, setCity] = useState(initialValue?.city || 'Junagadh');
  const [district, setDistrict] = useState(initialValue?.district || 'Junagadh');
  const state = 'Gujarat';
  const [pincode, setPincode] = useState(initialValue?.postal_code || '362002');
  const [landmark, setLandmark] = useState(initialValue?.landmark || '');
  const [instructions, setInstructions] = useState(initialValue?.location_instructions || '');

  // Serviceability check for Junagadh
  const isCityJunagadh = city.trim().toLowerCase() === 'junagadh';
  const isPincodeJunagadh = pincode.startsWith('362');
  const isServiceable = isCityJunagadh && isPincodeJunagadh;

  // Emit updated address values on state change
  useEffect(() => {
    const formattedAddress = [
      houseNumber.trim(),
      floorNumber ? `Floor ${floorNumber}` : null,
      buildingName.trim(),
      locality.trim(),
      landmark ? `Landmark: ${landmark.trim()}` : null,
      `${city.trim()}, Gujarat ${pincode.trim()}`,
    ]
      .filter(Boolean)
      .join(', ');

    const val: LocationPickerValue = {
      address_line: formattedAddress,
      apartment_or_house_number: houseNumber.trim(),
      building_name: buildingName.trim(),
      floor_number: floorNumber.trim(),
      landmark: landmark.trim(),
      locality: locality.trim(),
      city: city.trim(),
      district: district.trim() || city.trim(),
      state: 'Gujarat',
      postal_code: pincode.trim(),
      country: 'India',
      latitude: 21.5222,
      longitude: 70.4579,
      location_accuracy_meters: 5,
      location_confirmed: isServiceable,
      location_instructions: instructions.trim(),
    };

    onLocationChange(val, isServiceable);
  }, [houseNumber, buildingName, floorNumber, locality, city, district, pincode, landmark, instructions, isServiceable]);

  const handleWhatsAppHelp = () => {
    openWhatsApp({
      customMessage: `Hello HomeEase! 👋 I need assistance sharing my address for booking in Junagadh. My address is: ${houseNumber}, ${buildingName}, ${locality}, Junagadh. Please confirm technician dispatch.`,
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Info - Crisp Rectangular */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-slate-50 border border-slate-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-none bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Doorstep Service Address in Gujarat</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-none">
                Active Coverage
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Our verified technicians arrive directly at your home with industrial equipment & clean kits.
            </p>
          </div>
        </div>

        {/* WhatsApp Direct Assist Button */}
        <button
          type="button"
          onClick={handleWhatsAppHelp}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-none bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-bold transition-all border border-slate-800 cursor-pointer"
        >
          <span>Share Address on WhatsApp</span>
        </button>
      </div>

      {/* Structured Address Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* House / Flat / Door Number */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Flat / House / Door Number *
          </label>
          <input
            type="text"
            required
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="e.g. Flat 402, Tower B"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
        </div>

        {/* Society / Apartment / Building Name */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Society / Apartment / Building Name *
          </label>
          <input
            type="text"
            required
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="e.g. Avadh Copper Stone / Raj Residency"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
        </div>

        {/* Floor Number */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Floor / Wing (Optional)
          </label>
          <input
            type="text"
            value={floorNumber}
            onChange={(e) => setFloorNumber(e.target.value)}
            placeholder="e.g. 4th Floor, Wing A"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
        </div>

        {/* Area / Locality in Junagadh */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Area / Locality in Junagadh *
          </label>
          <input
            type="text"
            required
            list="junagadh-localities"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="e.g. Zanzarda Road, Joshipura, Moti Baug"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
          <datalist id="junagadh-localities">
            {BRAND_CONFIG.primaryCity.localities.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        {/* Operating City (Junagadh, Gujarat Only) */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Service City *
          </label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setDistrict(e.target.value);
            }}
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all font-semibold"
          >
            <option value="Junagadh">Junagadh, Gujarat (Active)</option>
            <option value="Ahmedabad" disabled>Ahmedabad (Coming Soon)</option>
            <option value="Surat" disabled>Surat (Coming Soon)</option>
            <option value="Rajkot" disabled>Rajkot (Coming Soon)</option>
          </select>
        </div>

        {/* PIN Code */}
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Pincode (Junagadh: 362001 - 362015) *
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="e.g. 362002"
            className={`w-full p-2.5 rounded-none border text-xs bg-white text-slate-900 focus:outline-none transition-all ${
              !isPincodeJunagadh && pincode.length === 6
                ? 'border-rose-400 bg-rose-50/30'
                : 'border-slate-300 focus:border-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Landmark & Special Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Nearby Landmark (Recommended)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near Zanzarda Bypass / Opp. Swaminarayan Temple"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
            Problem Description or Special Instructions (Optional)
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. AC cooling low / Ring bell on 2nd floor"
            className="w-full p-2.5 rounded-none border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Verified Status Banner */}
      <div className={`p-3.5 rounded-none border flex items-center justify-between ${
        isServiceable
          ? 'bg-slate-50 border-slate-300'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2 text-xs">
          {isServiceable ? (
            <>
              <CheckCircle2 size={16} className="text-[#176B52] shrink-0" />
              <span className="text-slate-800">Address confirmed for technician dispatch in <strong>Junagadh, Gujarat</strong></span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-none bg-amber-500 shrink-0" />
              <span>We currently only serve <strong>Junagadh, Gujarat (Pincode: 362xxx)</strong>. Bookings outside Junagadh are coming soon!</span>
            </>
          )}
        </div>
        <div className="text-[11px] font-semibold">
          {isServiceable ? (
            <span className="text-emerald-800 font-bold">Service Available</span>
          ) : (
            <span className="text-amber-700 font-bold">Coming Soon</span>
          )}
        </div>
      </div>
    </div>
  );
};
