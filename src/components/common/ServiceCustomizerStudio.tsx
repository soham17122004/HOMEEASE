import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Bug,
  Droplets,
  Zap,
  Bath,
} from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';

export interface CustomizedServiceConfig {
  calculatedPrice: number;
  originalPrice: number;
  summaryLabel: string;
  details: Record<string, string | number>;
  selectedAddOns: string[];
}

interface ServiceCustomizerStudioProps {
  serviceSlug: string;
  /** Category ID from the Service object — the authoritative routing key */
  categoryId?: string;
  basePrice: number;
  onChange: (config: CustomizedServiceConfig) => void;
  onProceedToBooking: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared UI helpers
───────────────────────────────────────────────────────────────────────────── */

interface OptionCardProps {
  label: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
}
const OptionCard: React.FC<OptionCardProps> = ({ label, desc, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-xl border text-left transition-all ${
      selected
        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
    }`}
  >
    <div className="text-xs font-bold">{label}</div>
    {desc && (
      <div className={`text-[10px] mt-0.5 line-clamp-2 ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
        {desc}
      </div>
    )}
  </button>
);

interface AddonRowProps {
  label: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}
const AddonRow: React.FC<AddonRowProps> = ({ label, price, checked, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
      checked
        ? 'border-emerald-700 bg-emerald-50/50 text-slate-900 font-semibold'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded flex items-center justify-center ${checked ? 'bg-emerald-700 text-white' : 'border border-slate-300'}`}>
        {checked && <Check size={11} strokeWidth={3} />}
      </div>
      <span>{label}</span>
    </div>
    <span className="font-bold text-slate-900">+₹{price}</span>
  </button>
);

interface CounterRowProps {
  label: string;
  subtitle?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}
const CounterRow: React.FC<CounterRowProps> = ({ label, subtitle, value, min = 1, max = 20, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
    <div>
      <div className="text-xs font-bold text-slate-900">{label}</div>
      {subtitle && <div className="text-[10px] text-slate-500">{subtitle}</div>}
    </div>
    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded"
      >
        <Minus size={12} />
      </button>
      <span className="font-bold text-xs w-4 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded"
      >
        <Plus size={12} />
      </button>
    </div>
  </div>
);

interface SectionHeadingProps {
  step: number;
  title: string;
  subtitle?: string;
  badge?: string;
}
const SectionHeading: React.FC<SectionHeadingProps> = ({ step, title, subtitle, badge }) => (
  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
    <div>
      <h3 className="font-bold text-sm text-slate-900">{step}. {title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {badge && (
      <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">{badge}</span>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY-SPECIFIC CUSTOMIZER COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

// ── 1. SOFA & UPHOLSTERY ─────────────────────────────────────────────────────
interface SofaConfig { seats: number; material: 'fabric' | 'suede' | 'leather'; addons: string[] }
const SofaCustomizer: React.FC<{ basePrice: number; onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ onCalc }) => {
  const [seats, setSeats] = useState(3);
  const [material, setMaterial] = useState<SofaConfig['material']>('fabric');
  const [addons, setAddons] = useState<string[]>([]);

  const rateMap = { fabric: 149, suede: 189, leather: 229 };

  useEffect(() => {
    const rate = rateMap[material];
    let price = seats * rate;
    const ao: string[] = [];
    if (addons.includes('cushion')) { price += 199; ao.push('4 Cushions'); }
    if (addons.includes('stain-guard')) { price += 349; ao.push('Stain Guard'); }
    if (addons.includes('ottoman')) { price += 149; ao.push('Ottoman'); }
    const label = `${seats}-Seater ${material === 'leather' ? 'Leather Conditioning' : material === 'suede' ? 'Velvet/Suede' : 'Fabric Shampoo'}`;
    onCalc(price, Math.round(price * 1.35), label, { Seats: seats, Material: material }, ao);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seats, material, addons]);

  const toggleAddon = (id: string) => setAddons(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <SectionHeading step={1} title="Select Sofa Seater Count" subtitle="₹149/seat fabric • ₹189/seat suede • ₹229/seat leather" badge={`${seats}S • ₹${seats * rateMap[material]}`} />
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => setSeats(n)}
            className={`py-2 text-xs font-bold rounded-lg border transition-all text-center ${seats === n ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`}>
            {n}S
          </button>
        ))}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Sofa Material / Upholstery</h4>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'fabric', label: 'Standard Fabric', desc: 'Cotton, linen & canvas' },
            { id: 'suede', label: 'Velvet / Suede', desc: 'Gentle low-moisture (+₹40/seat)' },
            { id: 'leather', label: 'Leatherette / Leather', desc: 'Nutritive conditioning (+₹80/seat)' },
          ].map(m => <OptionCard key={m.id} label={m.label} desc={m.desc} selected={material === m.id} onClick={() => setMaterial(m.id as SofaConfig['material'])} />)}
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2">3. Optional Add-Ons</h4>
        <div className="space-y-2">
          <AddonRow label="4 Throw Cushions Deep Wash" price={199} checked={addons.includes('cushion')} onToggle={() => toggleAddon('cushion')} />
          <AddonRow label="Nano-Shield Fabric Stain Guard" price={349} checked={addons.includes('stain-guard')} onToggle={() => toggleAddon('stain-guard')} />
          <AddonRow label="Single Footstool / Ottoman Wash" price={149} checked={addons.includes('ottoman')} onToggle={() => toggleAddon('ottoman')} />
        </div>
      </div>
    </div>
  );
};

// ── 2. HOME DEEP CLEANING ─────────────────────────────────────────────────────
const HomeCustomizer: React.FC<{ onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ onCalc }) => {
  const [bhk, setBhk] = useState<'1bhk' | '2bhk' | '3bhk' | '4bhk' | 'villa'>('2bhk');
  const [furnished, setFurnished] = useState<'furnished' | 'unfurnished'>('furnished');
  const [addons, setAddons] = useState<string[]>([]);

  const bhkPrices = { '1bhk': 2499, '2bhk': 3499, '3bhk': 4499, '4bhk': 5999, villa: 7999 };

  useEffect(() => {
    let price = bhkPrices[bhk];
    if (furnished === 'unfurnished') price -= 300;
    const ao: string[] = [];
    if (addons.includes('kitchen')) { price += 499; ao.push('Kitchen Cabinets'); }
    if (addons.includes('bath')) { price += 399; ao.push('Bathroom Descaling'); }
    if (addons.includes('balcony')) { price += 199; ao.push('Balcony Scrub'); }
    const label = `${bhk.toUpperCase()} Full Home Deep Cleaning (${furnished})`;
    onCalc(price, Math.round(price * 1.35), label, { Layout: bhk.toUpperCase(), Furnishing: furnished }, ao);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bhk, furnished, addons]);

  const toggleAddon = (id: string) => setAddons(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <SectionHeading step={1} title="Select Property Configuration (BHK)" subtitle="Includes full home scrubbing, windows, kitchen & bathrooms." />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: '1bhk', label: '1 BHK', area: '~550 sq.ft' },
          { id: '2bhk', label: '2 BHK', area: '~950 sq.ft' },
          { id: '3bhk', label: '3 BHK', area: '~1,450 sq.ft' },
          { id: '4bhk', label: '4 BHK', area: '~2,100 sq.ft' },
          { id: 'villa', label: 'Villa / Duplex', area: '~3,000 sq.ft' },
        ].map(item => (
          <OptionCard key={item.id} label={item.label} desc={item.area} selected={bhk === item.id} onClick={() => setBhk(item.id as typeof bhk)} />
        ))}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Furnishing Condition</h4>
        <div className="grid grid-cols-2 gap-2">
          <OptionCard label="Furnished Home" desc="Includes furniture wipedown" selected={furnished === 'furnished'} onClick={() => setFurnished('furnished')} />
          <OptionCard label="Unfurnished / Move-In" desc="Save ₹300 on empty spaces" selected={furnished === 'unfurnished'} onClick={() => setFurnished('unfurnished')} />
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2">3. Area-Specific Additions (Optional)</h4>
        <div className="space-y-2">
          <AddonRow label="Inside Kitchen Cabinets Degreasing" price={499} checked={addons.includes('kitchen')} onToggle={() => toggleAddon('kitchen')} />
          <AddonRow label="Additional Bathroom Descaling Spa" price={399} checked={addons.includes('bath')} onToggle={() => toggleAddon('bath')} />
          <AddonRow label="Extra Balcony Machine Scrub" price={199} checked={addons.includes('balcony')} onToggle={() => toggleAddon('balcony')} />
        </div>
      </div>
    </div>
  );
};

// ── 3. AC SERVICING ──────────────────────────────────────────────────────────
type AcServiceType = 'jet-clean' | 'gas-check' | 'install' | 'uninstall' | 'repair';
const AcCustomizer: React.FC<{ onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ onCalc }) => {
  const [acType, setAcType] = useState<'split' | 'window'>('split');
  const [serviceType, setServiceType] = useState<AcServiceType>('jet-clean');
  const [units, setUnits] = useState(1);

  useEffect(() => {
    const baseRate = acType === 'split' ? 549 : 449;
    const extraMap: Record<AcServiceType, number> = { 'jet-clean': 0, 'gas-check': 299, install: 899, uninstall: 499, repair: 249 };
    const extra = extraMap[serviceType];
    let total = (baseRate + extra) * units;
    if (units > 1) total -= (units - 1) * 50;
    const label = `${units}× ${acType === 'split' ? 'Split AC' : 'Window AC'} (${serviceType.replace('-', ' ')})`;
    onCalc(total, Math.round(total * 1.3), label, { 'AC Type': acType, Units: units, 'Service': serviceType }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acType, serviceType, units]);

  return (
    <div className="space-y-5">
      <SectionHeading step={1} title="Select AC Model & Units" subtitle="Power jet foam cleaning with waterproof protection jacket." />
      <div className="grid grid-cols-2 gap-3">
        <OptionCard label="Split AC" desc="Indoor wall unit + outdoor condenser" selected={acType === 'split'} onClick={() => setAcType('split')} />
        <OptionCard label="Window AC" desc="Single chassis slide-out wash" selected={acType === 'window'} onClick={() => setAcType('window')} />
      </div>
      <CounterRow label="Number of AC Units" subtitle="Save ₹50 on each additional AC serviced" value={units} onChange={setUnits} />
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Service Scope</h4>
        <div className="space-y-1.5">
          {[
            { id: 'jet-clean', label: 'Power Jet Deep Clean & Odor Removal', extra: 'Included in Base' },
            { id: 'gas-check', label: 'Digital Refrigerant Gas Check & Leak Fix', extra: '+₹299' },
            { id: 'repair', label: 'Drain Dripping / Sound Diagnostic', extra: '+₹249' },
            { id: 'install', label: 'Complete New AC Installation', extra: '+₹899' },
            { id: 'uninstall', label: 'Safe AC Uninstallation & Gas Lock', extra: '+₹499' },
          ].map(opt => (
            <button key={opt.id} type="button" onClick={() => setServiceType(opt.id as AcServiceType)}
              className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${serviceType === opt.id ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              <span>{opt.label}</span>
              <span className={`text-[11px] font-semibold ${serviceType === opt.id ? 'text-emerald-400' : 'text-slate-500'}`}>{opt.extra}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── 4. WASHING MACHINE / APPLIANCE REPAIR ─────────────────────────────────────
type WmScope = 'descaling' | 'drainage' | 'vibration' | 'pcb';
const WashingMachineCustomizer: React.FC<{ onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ onCalc }) => {
  const [loadType, setLoadType] = useState<'front' | 'top'>('front');
  const [automation, setAutomation] = useState<'automatic' | 'semi'>('automatic');
  const [scope, setScope] = useState<WmScope>('descaling');

  useEffect(() => {
    let price = loadType === 'front' ? 499 : 399;
    if (automation === 'semi') price -= 50;
    const scopeExtra: Record<WmScope, number> = { descaling: 0, drainage: 299, vibration: 249, pcb: 349 };
    price += scopeExtra[scope];
    const label = `${loadType === 'front' ? 'Front Load' : 'Top Load'} (${automation === 'semi' ? 'Semi-Auto' : 'Fully Auto'}) Washing Machine`;
    onCalc(price, Math.round(price * 1.35), label, { Loading: loadType, Automation: automation, Issue: scope }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadType, automation, scope]);

  return (
    <div className="space-y-5">
      <SectionHeading step={1} title="Select Machine Configuration" subtitle="Certified technicians across LG, Samsung, Bosch, IFB & Whirlpool." />
      <div className="grid grid-cols-2 gap-3">
        <OptionCard label="Front Load" desc="Horizontal drum with gasket" selected={loadType === 'front'} onClick={() => setLoadType('front')} />
        <OptionCard label="Top Load" desc="Vertical agitator or pulsator" selected={loadType === 'top'} onClick={() => setLoadType('top')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OptionCard label="Fully Automatic" selected={automation === 'automatic'} onClick={() => setAutomation('automatic')} />
        <OptionCard label="Semi-Automatic" selected={automation === 'semi'} onClick={() => setAutomation('semi')} />
      </div>
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Primary Problem or Service Needed</h4>
        <div className="space-y-1.5">
          {[
            { id: 'descaling', label: 'Periodic Descaling & Complete Hygiene Tune-Up', extra: 'Included' },
            { id: 'drainage', label: 'Water Not Draining / Inlet Flow Blocked', extra: '+₹299' },
            { id: 'vibration', label: 'Violent Shaking, Thumping or Noise During Spin', extra: '+₹249' },
            { id: 'pcb', label: 'Machine Not Powering On / PCB Error Code', extra: '+₹349' },
          ].map(opt => (
            <button key={opt.id} type="button" onClick={() => setScope(opt.id as WmScope)}
              className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${scope === opt.id ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              <span>{opt.label}</span>
              <span className={`text-[11px] font-semibold ${scope === opt.id ? 'text-emerald-400' : 'text-slate-500'}`}>{opt.extra}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── 5. PEST CONTROL ──────────────────────────────────────────────────────────
const PestCustomizer: React.FC<{ basePrice: number; onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ basePrice, onCalc }) => {
  const [bhk, setBhk] = useState<'1bhk' | '2bhk' | '3bhk' | 'villa'>('2bhk');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [addons, setAddons] = useState<string[]>([]);

  const bhkPrices = { '1bhk': basePrice, '2bhk': Math.round(basePrice * 1.3), '3bhk': Math.round(basePrice * 1.6), villa: Math.round(basePrice * 2.2) };
  const severityMultiplier = { low: 1, medium: 1.15, high: 1.35 };

  useEffect(() => {
    let price = Math.round(bhkPrices[bhk] * severityMultiplier[severity]);
    const ao: string[] = [];
    if (addons.includes('bedbug')) { price += 799; ao.push('Bedbug Treatment'); }
    if (addons.includes('termite')) { price += 1499; ao.push('Termite Barrier'); }
    if (addons.includes('mosquito')) { price += 499; ao.push('Mosquito Fogging'); }
    const label = `${bhk.toUpperCase()} Cockroach & Ant Gel Treatment (${severity} infestation)`;
    onCalc(price, Math.round(price * 1.43), label, { Property: bhk.toUpperCase(), Severity: severity }, ao);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bhk, severity, addons]);

  const toggleAddon = (id: string) => setAddons(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <Bug size={15} className="text-amber-700 shrink-0" />
        <p className="text-xs text-amber-800 font-medium">100% odorless Bayer Maxforce gel. No need to vacate or empty kitchen cupboards.</p>
      </div>
      <SectionHeading step={1} title="Select Property Size" subtitle="Price scales with home size and number of infestation zones." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: '1bhk', label: '1 BHK', desc: '1 Kitchen + 1 Bath' },
          { id: '2bhk', label: '2 BHK', desc: '1 Kitchen + 2 Bath' },
          { id: '3bhk', label: '3 BHK', desc: '1 Kitchen + 3 Bath' },
          { id: 'villa', label: 'Villa / Duplex', desc: 'Full property treatment' },
        ].map(item => (
          <OptionCard key={item.id} label={item.label} desc={item.desc} selected={bhk === item.id} onClick={() => setBhk(item.id as typeof bhk)} />
        ))}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Infestation Severity Level</h4>
        <div className="grid grid-cols-3 gap-2">
          <OptionCard label="Low" desc="Occasional sightings, 1–2 areas" selected={severity === 'low'} onClick={() => setSeverity('low')} />
          <OptionCard label="Medium" desc="Frequent, multiple rooms" selected={severity === 'medium'} onClick={() => setSeverity('medium')} />
          <OptionCard label="High" desc="Heavy infestation throughout" selected={severity === 'high'} onClick={() => setSeverity('high')} />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-1.5">3. Additional Pest Treatments (Optional)</h4>
        <div className="space-y-2">
          <AddonRow label="Bedbug Deep Heat Extermination" price={799} checked={addons.includes('bedbug')} onToggle={() => toggleAddon('bedbug')} />
          <AddonRow label="Anti-Termite Perimeter Barrier" price={1499} checked={addons.includes('termite')} onToggle={() => toggleAddon('termite')} />
          <AddonRow label="Mosquito & Drain Fly Fogging" price={499} checked={addons.includes('mosquito')} onToggle={() => toggleAddon('mosquito')} />
        </div>
      </div>
    </div>
  );
};

// ── 6. PLUMBING ──────────────────────────────────────────────────────────────
type PlumbIssue = 'leakage' | 'blockage' | 'tap-replace' | 'pipe' | 'geyser';
const PlumbingCustomizer: React.FC<{ basePrice: number; onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ basePrice, onCalc }) => {
  const [issue, setIssue] = useState<PlumbIssue>('leakage');
  const [items, setItems] = useState(1);

  const issueExtra: Record<PlumbIssue, number> = { leakage: 0, blockage: 50, 'tap-replace': 100, pipe: 200, geyser: 250 };
  const issueLabel: Record<PlumbIssue, string> = {
    leakage: 'Leaking Tap / Shower Mixer Repair',
    blockage: 'Drain Pipe Unclogging & Flush',
    'tap-replace': 'Tap / Valve Replacement',
    pipe: 'Exposed Pipe Fitting or Relocation',
    geyser: 'Geyser / Water Heater Inspection',
  };

  useEffect(() => {
    const price = (basePrice + issueExtra[issue]) * items;
    const label = `${items}× ${issueLabel[issue]}`;
    onCalc(price, Math.round(price * 1.6), label, { Issue: issueLabel[issue], Items: items }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue, items]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <Droplets size={15} className="text-blue-700 shrink-0" />
        <p className="text-xs text-blue-800 font-medium">Includes up to 60 minutes of certified plumber labor. Parts cost extra if required.</p>
      </div>
      <SectionHeading step={1} title="Select Plumbing Issue" subtitle="Technician will inspect and fix the selected issue." />
      <div className="space-y-1.5">
        {(Object.keys(issueLabel) as PlumbIssue[]).map(k => (
          <button key={k} type="button" onClick={() => setIssue(k)}
            className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${issue === k ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span>{issueLabel[k]}</span>
            <span className={`text-[11px] font-semibold ${issue === k ? 'text-emerald-400' : 'text-slate-500'}`}>
              {issueExtra[k] > 0 ? `+₹${issueExtra[k]}` : 'Base Rate'}
            </span>
          </button>
        ))}
      </div>
      <CounterRow label="Number of Points / Items" subtitle="Each additional item billed at same rate" value={items} onChange={setItems} max={10} />
    </div>
  );
};

// ── 7. ELECTRICIAN ───────────────────────────────────────────────────────────
type ElecIssue = 'diagnostic' | 'switch' | 'fan' | 'light' | 'mcb' | 'inverter';
const ElectricianCustomizer: React.FC<{ basePrice: number; onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ basePrice, onCalc }) => {
  const [issue, setIssue] = useState<ElecIssue>('diagnostic');
  const [points, setPoints] = useState(1);

  const issueExtra: Record<ElecIssue, number> = { diagnostic: 0, switch: 50, fan: 100, light: 50, mcb: 150, inverter: 200 };
  const issueLabel: Record<ElecIssue, string> = {
    diagnostic: 'General Electrical Diagnostics & Safety Check',
    switch: 'Switchboard / Socket Replacement or Repair',
    fan: 'Ceiling Fan Installation / Speed Issue Fix',
    light: 'Light Fitting / Chandelier Installation',
    mcb: 'MCB Tripping / Short Circuit Diagnosis',
    inverter: 'Inverter / UPS Wiring & Battery Check',
  };

  useEffect(() => {
    const price = (basePrice + issueExtra[issue]) * points;
    const label = `${points}× ${issueLabel[issue]}`;
    onCalc(price, Math.round(price * 1.6), label, { Service: issueLabel[issue], Points: points }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue, points]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <Zap size={15} className="text-yellow-700 shrink-0" />
        <p className="text-xs text-yellow-800 font-medium">State-licensed wireman. Includes up to 2 installations or 60 minutes of labor.</p>
      </div>
      <SectionHeading step={1} title="Select Electrical Service" subtitle="Technician brings multimeter, safety kit, and standard consumables." />
      <div className="space-y-1.5">
        {(Object.keys(issueLabel) as ElecIssue[]).map(k => (
          <button key={k} type="button" onClick={() => setIssue(k)}
            className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${issue === k ? 'border-slate-900 bg-slate-900 text-white font-bold' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span>{issueLabel[k]}</span>
            <span className={`text-[11px] font-semibold ${issue === k ? 'text-emerald-400' : 'text-slate-500'}`}>
              {issueExtra[k] > 0 ? `+₹${issueExtra[k]}` : 'Base Rate'}
            </span>
          </button>
        ))}
      </div>
      <CounterRow label="Number of Points / Fittings" subtitle="Additional points billed at the same rate" value={points} onChange={setPoints} max={10} />
    </div>
  );
};

// ── 8. BATHROOM / KITCHEN SPA ─────────────────────────────────────────────────
const BathroomCustomizer: React.FC<{ basePrice: number; onCalc: (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => void }> = ({ basePrice, onCalc }) => {
  const [bathrooms, setBathrooms] = useState(1);
  const [scope, setScope] = useState<'standard' | 'premium'>('standard');
  const [addons, setAddons] = useState<string[]>([]);

  useEffect(() => {
    const scopeAdd = scope === 'premium' ? 300 : 0;
    let price = (basePrice + scopeAdd) * bathrooms;
    const ao: string[] = [];
    if (addons.includes('grout')) { price += 299; ao.push('Grout Recoat'); }
    if (addons.includes('chimney')) { price += 799; ao.push('Chimney Degreasing'); }
    if (addons.includes('glass')) { price += 199; ao.push('Glass Polish'); }
    const label = `${bathrooms} Bathroom${bathrooms > 1 ? 's' : ''} ${scope === 'premium' ? 'Premium' : 'Standard'} Spa`;
    onCalc(price, Math.round(price * 1.5), label, { Bathrooms: bathrooms, Package: scope }, ao);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bathrooms, scope, addons]);

  const toggleAddon = (id: string) => setAddons(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-50 border border-cyan-200">
        <Bath size={15} className="text-cyan-700 shrink-0" />
        <p className="text-xs text-cyan-800 font-medium">pH-controlled eco descalers. Safe for marble, chrome, and glass shower partitions.</p>
      </div>
      <SectionHeading step={1} title="Number of Bathrooms" subtitle="Each bathroom cleaned with full tile, tap & toilet treatment." />
      <CounterRow label="Bathrooms to Clean" subtitle="₹599 per standard bathroom" value={bathrooms} onChange={setBathrooms} max={6} />
      <div>
        <h4 className="text-xs font-bold text-slate-900 mb-2">2. Cleaning Package</h4>
        <div className="grid grid-cols-2 gap-3">
          <OptionCard label="Standard" desc="Tile scrub, tap descale, toilet sanitize" selected={scope === 'standard'} onClick={() => setScope('standard')} />
          <OptionCard label="Premium" desc="+ Mirror polish, exhaust fan, grout deep clean (+₹300)" selected={scope === 'premium'} onClick={() => setScope('premium')} />
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2">3. Kitchen Add-Ons (Optional)</h4>
        <div className="space-y-2">
          <AddonRow label="Anti-Mold Floor Tile Grout Touchup" price={299} checked={addons.includes('grout')} onToggle={() => toggleAddon('grout')} />
          <AddonRow label="Kitchen Chimney Baffle Filter Degreasing" price={799} checked={addons.includes('chimney')} onToggle={() => toggleAddon('chimney')} />
          <AddonRow label="Glass Shower Partition Polish" price={199} checked={addons.includes('glass')} onToggle={() => toggleAddon('glass')} />
        </div>
      </div>
    </div>
  );
};

// ── 9. GENERIC FIXED PRICE (no customization) ─────────────────────────────────
const FixedPriceDisplay: React.FC<{ basePrice: number; serviceTitle: string }> = ({ basePrice, serviceTitle }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
      <p className="text-xs text-slate-700 font-medium">This is a fixed-price service. No additional customization required — the price shown includes everything.</p>
    </div>
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">What You Get</div>
      <div className="mt-2 text-sm font-bold text-slate-900">{serviceTitle}</div>
      <div className="mt-1 text-2xl font-extrabold text-[#176B52]">{BRAND_CONFIG.currency.symbol}{basePrice}</div>
      <div className="mt-1 text-xs text-slate-500">All-inclusive fixed price. Pay after service.</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT — routes by categoryId, never by slug substring matching
───────────────────────────────────────────────────────────────────────────── */

export const ServiceCustomizerStudio: React.FC<ServiceCustomizerStudioProps> = ({
  serviceSlug,
  categoryId,
  basePrice,
  onChange,
  onProceedToBooking,
}) => {
  // Internal price state — updated by whichever sub-customizer is active
  const [price, setPrice] = useState(basePrice);
  const [originalPrice, setOriginalPrice] = useState(Math.round(basePrice * 1.35));
  const [summaryLabel, setSummaryLabel] = useState('');
  const [details, setDetails] = useState<Record<string, string | number>>({});
  const [addOns, setAddOns] = useState<string[]>([]);

  // Default label when no customizer fires
  const defaultLabel = summaryLabel || serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const handleCalc = (p: number, op: number, label: string, d: Record<string, string | number>, ao: string[]) => {
    setPrice(p);
    setOriginalPrice(op);
    setSummaryLabel(label);
    setDetails(d);
    setAddOns(ao);
  };

  // On mount, publish initial calculated price to parent
  useEffect(() => {
    onChange({ calculatedPrice: price, originalPrice, summaryLabel: defaultLabel, details, selectedAddOns: addOns });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, originalPrice, summaryLabel]);

  const handleProceed = () => {
    onChange({ calculatedPrice: price, originalPrice, summaryLabel: defaultLabel, details, selectedAddOns: addOns });
    onProceedToBooking();
  };

  /**
   * Route to the correct customizer using categoryId (authoritative) with
   * slug as a fallback for backward compatibility.
   */
  const cat = categoryId ?? '';
  const slug = serviceSlug ?? '';

  const renderCustomizer = () => {
    // Authoritative routing by categoryId
    if (cat === 'cat-sofa') return <SofaCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (cat === 'cat-cleaning') return <HomeCustomizer onCalc={handleCalc} />;
    if (cat === 'cat-ac') return <AcCustomizer onCalc={handleCalc} />;
    if (cat === 'cat-appliances') return <WashingMachineCustomizer onCalc={handleCalc} />;
    if (cat === 'cat-pest') return <PestCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (cat === 'cat-plumbing') return <PlumbingCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (cat === 'cat-electrician') return <ElectricianCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (cat === 'cat-bathroom') return <BathroomCustomizer basePrice={basePrice} onCalc={handleCalc} />;

    // Slug-based fallback (safe — no substring ambiguity)
    if (slug === 'sofa-deep-cleaning' || slug.startsWith('sofa-')) return <SofaCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (slug === '2bhk-home-deep-cleaning' || slug.endsWith('-home-deep-cleaning')) return <HomeCustomizer onCalc={handleCalc} />;
    if (slug === 'ac-power-jet-servicing' || slug.startsWith('ac-')) return <AcCustomizer onCalc={handleCalc} />;
    if (slug === 'washing-machine-service-repair' || slug.startsWith('washing-')) return <WashingMachineCustomizer onCalc={handleCalc} />;
    if (slug === 'cockroach-pest-control' || slug.includes('pest-control')) return <PestCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (slug === 'plumbing-leakage-repair' || slug.startsWith('plumbing-')) return <PlumbingCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (slug === 'electrician-service-repair' || slug.startsWith('electrician-')) return <ElectricianCustomizer basePrice={basePrice} onCalc={handleCalc} />;
    if (slug === 'bathroom-deep-cleaning' || slug === 'kitchen-chimney-degreasing' || slug.startsWith('bathroom-') || slug.startsWith('kitchen-')) return <BathroomCustomizer basePrice={basePrice} onCalc={handleCalc} />;

    // Truly unknown service — show fixed price view
    return <FixedPriceDisplay basePrice={basePrice} serviceTitle={defaultLabel} />;
  };

  const discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      {renderCustomizer()}

      {/* Dynamic Price & Booking Confirmation Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Fixed Price</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900">{BRAND_CONFIG.currency.symbol}{price}</span>
            <span className="text-xs text-slate-400 line-through">{BRAND_CONFIG.currency.symbol}{originalPrice}</span>
            {discountPct > 0 && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">{discountPct}% OFF</span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 mt-1">{defaultLabel}</div>
        </div>
        <button
          type="button"
          onClick={handleProceed}
          className="px-6 py-3 rounded-xl bg-[#176B52] hover:bg-[#135742] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <span>Continue with this Package</span>
          <Check size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
