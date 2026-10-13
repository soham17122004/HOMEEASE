// Central Brand and Business Configuration for Junagadh, Gujarat
// Inspired by Urban Company's clean, transparent home services model

export const BRAND_CONFIG = {
  name: "HomeEase",
  tagline: "Expert Home Services, Right at Your Doorstep",
  description: "Junagadh's trusted platform for verified home deep cleaning, sofa shampooing, AC servicing, appliance repair, and hygiene maintenance across Junagadh city.",
  foundedYear: 2024,
  currency: {
    symbol: "₹",
    code: "INR",
  },
  contact: {
    phone: "+91 90165 26419",
    emergencyPhone: "+91 90165 26419",
    whatsapp: "9016526419",
    whatsappUrl: "https://wa.me/919016526419",
    email: "support@homeease.in",
    supportEmail: "helpdesk@homeease.in",
    address: "HomeEase Service Hub, Zanzarda Road, Junagadh, Gujarat 362002",
    operatingHours: "8:00 AM – 8:00 PM (All 7 Days)",
  },
  trustMetrics: {
    happyCustomers: "3,800+",
    verifiedPros: "45+",
    averageRating: "4.88",
    citiesCovered: "Junagadh, Gujarat",
  },
  primaryCity: {
    id: "junagadh",
    name: "Junagadh",
    state: "Gujarat",
    pincodes: ["362001", "362002", "362003", "362004", "362015"],
    localities: [
      "Moti Baug",
      "Zanzarda Road",
      "Joshipura",
      "Kalva Chowk",
      "Timbavadi",
      "Bilkha Road",
      "Majevadi Gate",
      "College Road",
      "Gandhi Chowk",
      "Dipanjali",
      "Dolatpara",
      "Madhuram"
    ],
  },
  supportedCities: [
    { id: "junagadh", name: "Junagadh", state: "Gujarat", isPopular: true, isActive: true },
  ],
  serviceGuarantees: [
    {
      title: "Verified Background Checks",
      description: "Police-verified and skill-certified technicians with 3+ years experience.",
      icon: "ShieldCheck",
    },
    {
      title: "30-Day Service Guarantee",
      description: "Hassle-free rework at zero cost if you are not 100% satisfied.",
      icon: "BadgeCheck",
    },
    {
      title: "Transparent Upfront Pricing",
      description: "Fixed rates with zero hidden charges. Itemized invoice before work begins.",
      icon: "Receipt",
    },
    {
      title: "₹10,000 Damage Insurance",
      description: "Complete coverage against accidental damage while service is in progress.",
      icon: "Umbrella",
    },
  ],
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
  },
  fees: {
    taxRatePercentage: 18, // GST
    platformFee: 49,
    freePlatformFeeThreshold: 999,
  }
};
