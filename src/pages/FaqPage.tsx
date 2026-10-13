import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, ArrowRight, Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Booking & Slots',
    question: 'How far in advance can I book a service appointment?',
    answer: 'You can book appointments up to 7 days in advance or book express same-day slots as quick as 60 minutes prior, depending on local technician availability in your city.'
  },
  {
    category: 'Booking & Slots',
    question: 'Can I reschedule or cancel my booking without penalty?',
    answer: 'Yes! You can reschedule or cancel your appointment free of charge up to 2 hours before the scheduled time slot through the "My Bookings" page or by calling our customer care.'
  },
  {
    category: 'Booking & Slots',
    question: 'Do I need to be home for the entire duration of the service?',
    answer: 'An adult must be present at the start of the appointment to grant entry, specify preferences, and inspect the home, and at the end of the appointment to sign off on completion. During work, you are free to attend to your own tasks.'
  },
  {
    category: 'Quality & 30-Day Warranty',
    question: 'How does the 30-Day Free Rework Guarantee work?',
    answer: 'If you are dissatisfied with any cleaning or an appliance repair problem recurs within 30 days, simply raise a rework request via your booking page or call our helpline. A senior inspection team will revisit and fix it with zero service or inspection fee.'
  },
  {
    category: 'Quality & 30-Day Warranty',
    question: 'What cleaning machines and chemicals do the technicians use?',
    answer: 'We exclusively deploy professional industrial machines—including Kärcher wet/dry extractors and single-disc scrubbers—paired with Diversey hospital-grade eco-friendly concentrates that are non-toxic, pet-safe, and baby-safe.'
  },
  {
    category: 'Pricing & Payment',
    question: 'Do I have to pay upfront before the service is completed?',
    answer: 'No advance payment is mandatory! You can select "Cash Post-Service" during checkout and pay via Cash or UPI directly to the technician only after you have inspected and approved the finished job.'
  },
  {
    category: 'Pricing & Payment',
    question: 'Are there any hidden travel charges or inspection surcharges?',
    answer: 'Never. All prices displayed on HomeEase are inclusive of technician travel, machine mobilization, and standard labor. You will receive an official digital tax invoice.'
  },
  {
    category: 'Safety & Insurance',
    question: 'How are technicians verified and background checked?',
    answer: 'Every service professional undergoes police criminal record verification, biometric government ID authentication (Aadhaar), reference checks, and mandatory skill evaluations before being allowed into customers\' homes.'
  },
  {
    category: 'Safety & Insurance',
    question: 'What is the ₹10,000 damage insurance policy?',
    answer: 'In the extremely rare event of accidental damage during an active service, HomeEase covers repair or replacement costs up to ₹10,000 under our comprehensive customer safety charter.'
  }
];

export const FaqPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['All', 'Booking & Slots', 'Quality & 30-Day Warranty', 'Pricing & Payment', 'Safety & Insurance'];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCat = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <HelpCircle size={12} />
            <span>Got Questions?</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Everything you need to know about booking, guarantees, technician hygiene, and payments.
          </p>

          {/* Search Input */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. refund, warranty, machines)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 text-center space-y-3">
          <h3 className="font-bold text-slate-900 text-base">Still have questions?</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Our customer delight specialists are available via live chat, phone, and WhatsApp from 7 AM to 10 PM.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Contact Support
            </Link>
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Explore Services
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
