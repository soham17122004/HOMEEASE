import { Category, Service, Review, Coupon, Booking } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-cleaning',
    name: 'Home Deep Cleaning',
    slug: 'home-cleaning',
    description: 'Thorough, spotless deep cleaning for apartments, villas, and kitchens.',
    iconName: 'Sparkles',
    imageUrl: '/images/services/home-cleaning.jpg',
    serviceCount: 5,
    isPopular: true,
  },
  {
    id: 'cat-sofa',
    name: 'Sofa & Upholstery Care',
    slug: 'sofa-carpet-care',
    description: 'Steam extraction, fabric shampooing, and spot removal for sofas & mattresses.',
    iconName: 'Armchair',
    imageUrl: '/images/services/sofa-cleaning.jpg',
    serviceCount: 4,
    isPopular: true,
  },
  {
    id: 'cat-ac',
    name: 'AC Servicing & Repair',
    slug: 'ac-servicing',
    description: 'Jet-pump washing, gas top-up, PCB diagnostic, and coil cleaning.',
    iconName: 'Wind',
    imageUrl: '/images/services/ac-repair.jpg',
    serviceCount: 4,
    isPopular: true,
  },
  {
    id: 'cat-appliances',
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Certified repair for washing machines, refrigerators, microwaves, and RO purifiers.',
    iconName: 'Wrench',
    imageUrl: '/images/services/washing-machine.jpg',
    serviceCount: 6,
    isPopular: true,
  },
  {
    id: 'cat-bathroom',
    name: 'Kitchen & Bathroom Spa',
    slug: 'kitchen-bathroom',
    description: 'Tile descaling, oil grime removal, chimney de-greasing, and mirror polishing.',
    iconName: 'Bath',
    imageUrl: '/images/services/bathroom-cleaning.jpg',
    serviceCount: 3,
    isPopular: false,
  },
  {
    id: 'cat-electrician',
    name: 'Electrician Services',
    slug: 'electrician-services',
    description: 'Switchboard fixes, chandelier & fan fittings, short circuit diagnostic.',
    iconName: 'Zap',
    imageUrl: '/images/services/electrician.jpg',
    serviceCount: 4,
    isPopular: false,
  },
  {
    id: 'cat-plumbing',
    name: 'Plumbing Solutions',
    slug: 'plumbing-solutions',
    description: 'Leakage detection, tap replacement, pipe unclogging, and sanitary fittings.',
    iconName: 'Droplets',
    imageUrl: '/images/services/plumbing.jpg',
    serviceCount: 4,
    isPopular: false,
  },
  {
    id: 'cat-pest',
    name: 'Pest Control',
    slug: 'pest-control',
    description: 'Odorless cockroach gel, anti-termite barrier, bedbug deep extermination.',
    iconName: 'ShieldAlert',
    imageUrl: '/images/services/pest-control.jpg',
    serviceCount: 3,
    isPopular: false,
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-sofa-deep',
    categoryId: 'cat-sofa',
    categorySlug: 'sofa-carpet-care',
    title: '3-Seater Fabric Sofa Deep Cleaning & Sanitization',
    slug: 'sofa-deep-cleaning',
    shortDescription: 'Industrial injection-extraction foam wash with germicidal sanitization.',
    description: 'Our certified upholstery specialists use German wet-vacuum extraction and neutral pH fabric conditioners. Safely lifts deep seated sweat stains, pet odors, food spills, and dust mites without fabric discoloration.',
    price: 447,
    originalPrice: 599,
    durationMinutes: 75,
    rating: 4.88,
    reviewCount: 384,
    imageUrl: '/images/services/sofa-cleaning.jpg',
    galleryUrls: [
      '/images/services/sofa-cleaning.jpg',
      '/images/services/home-cleaning.jpg'
    ],
    isPopular: true,
    isActive: true,
    includedItems: [
      'Dry vacuuming of frame, backrest, crevices & cushions',
      'Eco-friendly shampoo foam scrub applied with soft rotary pad',
      'Industrial wet extraction to suck out grime and water',
      'Anti-odor citrus conditioning mist',
      'Drying time advice (usually 2-3 hours under fan)'
    ],
    excludedItems: [
      'Leather polishing (choose leather sofa care package)',
      'Severe ink or bleach permanent damage correction'
    ],
    faqList: [
      {
        question: 'How long will it take for the sofa to dry?',
        answer: 'Because we use high-power wet extraction, 85% of water is sucked out instantly. The sofa will be dry and ready to sit on within 2 to 3 hours with ceiling fans on.'
      },
      {
        question: 'Are the cleaning chemicals safe for infants and pets?',
        answer: 'Yes! We only utilize certified biodegradable, pet-safe, non-toxic organic shampoo concentrates.'
      }
    ],
    addOns: [
      { id: 'addon-cushion', name: '4 Additional Throw Cushions Deep Wash', price: 199, durationMinutes: 15 },
      { id: 'addon-scotchgard', name: 'Fabric Nano-Shield Stain Guard Layer', price: 349, durationMinutes: 10 },
      { id: 'addon-sofa-stool', name: 'Single Ottoman / Footstool Wash', price: 149, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-home-deep',
    categoryId: 'cat-cleaning',
    categorySlug: 'home-cleaning',
    title: 'Complete 2 BHK Home Deep Cleaning',
    slug: '2bhk-home-deep-cleaning',
    shortDescription: '3-person crew with single-disc floor scrubbers, vacuuming, and kitchen & bath descaling.',
    description: 'Comprehensive top-to-bottom hygienic makeover for your home. Includes balcony scrubbing, window track brushing, cobweb removal, doors & switches degreasing, bathroom descaling, and floor machine buffing.',
    price: 3499,
    originalPrice: 4899,
    durationMinutes: 240,
    rating: 4.91,
    reviewCount: 612,
    imageUrl: '/images/services/home-cleaning.jpg',
    galleryUrls: [
      '/images/services/home-cleaning.jpg',
      '/images/services/kitchen-cleaning.jpg',
      '/images/services/bathroom-cleaning.jpg'
    ],
    isPopular: true,
    isActive: true,
    includedItems: [
      '2 Bathrooms: Tile descaling, toilet bowl sanitization, tap chrome shine',
      'Kitchen: Chimney exterior degreasing, slab scrubbing, cabinet facade cleaning',
      'Bedrooms & Living Room: Wardrobe exterior, ceiling fans, switchboards, doors',
      'Flooring: Single disc mechanical buffing machine scrub & dry mop',
      'Windows & Balcony: Sliding track suction & glass buffing'
    ],
    excludedItems: [
      'Inside empty kitchen cabinets (available as add-on)',
      'Terrace or roof area cleaning'
    ],
    faqList: [
      {
        question: 'Do I need to provide buckets or cleaning supplies?',
        answer: 'Not at all. Our team brings heavy-duty vacuum machines, single disc buffers, microfiber cloths, ladders, and government-approved Diversey cleaning agents.'
      },
      {
        question: 'Do I need to vacate the house during cleaning?',
        answer: 'No, you are welcome to stay at home or supervise if you prefer. We work systematically room by room.'
      }
    ],
    addOns: [
      { id: 'addon-kitchen-internal', name: 'Internal Kitchen Cabinets Cleaning', price: 499, durationMinutes: 30 },
      { id: 'addon-fridge-clean', name: 'Refrigerator Deep Interior Sanitization', price: 299, durationMinutes: 20 },
      { id: 'addon-balcony-extra', name: 'Additional Utility Balcony Scrub', price: 199, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-ac-jet',
    categoryId: 'cat-ac',
    categorySlug: 'ac-servicing',
    title: 'AC Power Jet Servicing & Cooling Boost',
    slug: 'ac-power-jet-servicing',
    shortDescription: 'High-pressure water jet cleaning with AC waterproof jacket, blower wash, & gas check.',
    description: 'Deep clean your split AC cooling coils, blower wheel, and outdoor unit with our no-spill waterproof canopy and high-pressure jet pump. Eliminates musty odors, restores airflow, and slashes electricity bills by up to 20%.',
    price: 549,
    originalPrice: 899,
    durationMinutes: 45,
    rating: 4.87,
    reviewCount: 1042,
    imageUrl: '/images/services/ac-repair.jpg',
    galleryUrls: [
      '/images/services/ac-repair.jpg',
      '/images/services/electrician.jpg'
    ],
    isPopular: true,
    isActive: true,
    includedItems: [
      'Waterproof collection jacket mounted to protect your indoor walls and floor',
      'High-pressure pump wash for indoor evaporator coils & rotary blower',
      'Filter and front cowl foam washing',
      'Condenser coil jet flush (outdoor unit)',
      'Free digital refrigerant gas pressure & amp draw check',
      'Drainage pipe clearing to prevent water dripping'
    ],
    excludedItems: [
      'Refrigerant gas refill (available if low pressure is diagnosed)',
      'PCB circuit repair / replacement'
    ],
    faqList: [
      {
        question: 'Will water splash onto my bedroom walls or wallpaper?',
        answer: 'Never. We enclose the entire split unit in a sealed industrial drain jacket that funnels all runoff straight into a dedicated collection bucket.'
      },
      {
        question: 'Does this service improve cooling?',
        answer: 'Significantly. Removing stubborn fungal buildup on the inner blower and coil instantly drops discharge air temperature by 2-4°C and doubles airflow velocity.'
      }
    ],
    addOns: [
      { id: 'addon-ac-gas', name: 'AC Gas Top-Up (R32 / R410A)', price: 1199, durationMinutes: 30 },
      { id: 'addon-anti-rust', name: 'Anti-Rust Protective Spray on Outdoor Coil', price: 249, durationMinutes: 10 }
    ]
  },
  {
    id: 'srv-washing-machine',
    categoryId: 'cat-appliances',
    categorySlug: 'appliance-repair',
    title: 'Washing Machine Full Diagnostic & Scale Removal Spa',
    slug: 'washing-machine-service-repair',
    shortDescription: 'Drum descaling, filter flushing, vibration check & motor inspection.',
    description: 'Restore wash hygiene and protect clothes from musty lint smells. Our appliance specialists dismantle the agitator, descale lime buildup from hard water, clear drain pumps, and verify belt tension.',
    price: 499,
    originalPrice: 799,
    durationMinutes: 60,
    rating: 4.82,
    reviewCount: 295,
    imageUrl: '/images/services/washing-machine.jpg',
    galleryUrls: [
      '/images/services/washing-machine.jpg',
      '/images/services/ac-repair.jpg'
    ],
    isPopular: true,
    isActive: true,
    includedItems: [
      'Dual cycle high-temperature citric acid scale dissolution',
      'Drain coin trap and inlet mesh filter debris clearance',
      'Detergent dispenser tray mold scrub',
      'Spin drum balance check & shock absorber vibration test',
      'Door gasket rubber antimicrobial sanitization'
    ],
    excludedItems: [
      'Hardware parts (drain motor, clutch, PCB) if replacement is needed'
    ],
    faqList: [
      {
        question: 'Is this suitable for both front load and top load machines?',
        answer: 'Yes, our technicians are certified across LG, Samsung, Bosch, Whirlpool, and IFB front and top-load variants.'
      }
    ],
    addOns: [
      { id: 'addon-drain-pipe', name: 'Heavy-Duty Reinforced Drain Pipe Replacement', price: 299, durationMinutes: 15 },
      { id: 'addon-descaler-pack', name: 'Pack of 3 Maintenance Descaler Sachets', price: 349, durationMinutes: 5 }
    ]
  },
  {
    id: 'srv-bath-deep',
    categoryId: 'cat-bathroom',
    categorySlug: 'kitchen-bathroom',
    title: 'Bathroom Intensive Descaling & Tile Scrubbing',
    slug: 'bathroom-deep-cleaning',
    shortDescription: 'Hard water salt removal, chrome tap buffing, toilet bowl sanitization.',
    description: 'Remove stubborn yellow limescale, water marks, and fungal soap residue from tiles, glass shower partitions, and sanitary ware using non-corrosive specialty descalers.',
    price: 599,
    originalPrice: 899,
    durationMinutes: 60,
    rating: 4.85,
    reviewCount: 450,
    imageUrl: '/images/services/bathroom-cleaning.jpg',
    galleryUrls: [
      '/images/services/bathroom-cleaning.jpg',
      '/images/services/kitchen-cleaning.jpg'
    ],
    isPopular: true,
    isActive: true,
    includedItems: [
      'Tile wall scrub and floor grout machine scrubbing',
      'Hard water scale removal from shower partition & mirrors',
      'CP tap & shower fixture descaling and chrome polishing',
      'Toilet commode deep rim brush & germicidal disinfection',
      'Exhaust fan and geyser exterior wipedown'
    ],
    excludedItems: [
      'Plumbing repairs or broken tile grouting'
    ],
    faqList: [
      {
        question: 'Will acidic chemicals damage my taps or marble?',
        answer: 'We never use harsh muriatic acid. We strictly use pH-controlled eco-descalers specially formulated to preserve chrome plating and sensitive natural stone.'
      }
    ],
    addOns: [
      { id: 'addon-grout-recoat', name: 'Anti-Mold Floor Tile Grout Touchup', price: 299, durationMinutes: 20 }
    ]
  },
  {
    id: 'srv-chimney-clean',
    categoryId: 'cat-bathroom',
    categorySlug: 'kitchen-bathroom',
    title: 'Kitchen Chimney & Gas Hob Degreasing',
    slug: 'kitchen-chimney-degreasing',
    shortDescription: 'Baffle filter chemical immersion, oil collector degrease, and blower wash.',
    description: 'Restore chimney suction power and prevent grease fire hazards. Includes complete immersion cleaning of baffle/mesh filters in hot caustic degreasers and burner nozzle cleaning for gas stoves.',
    price: 799,
    originalPrice: 1199,
    durationMinutes: 75,
    rating: 4.89,
    reviewCount: 228,
    imageUrl: '/images/services/kitchen-cleaning.jpg',
    galleryUrls: [
      '/images/services/kitchen-cleaning.jpg',
      '/images/services/home-cleaning.jpg'
    ],
    isPopular: false,
    isActive: true,
    includedItems: [
      'Removal and chemical bath of baffle/mesh filters',
      'Oil collector tray draining and degreasing',
      'Chimney hood stainless steel buffing',
      'Stove brass burners descaling for optimal blue flame'
    ],
    excludedItems: [
      'Motor dismantling or duct pipe replacement'
    ],
    faqList: [
      {
        question: 'Why is my chimney making noise and vibrating?',
        answer: 'Thick solidified grease clings unevenly to the rotary blower impeller. Degreasing brings it back to quiet balance.'
      }
    ]
  },
  {
    id: 'srv-electric-repair',
    categoryId: 'cat-electrician',
    categorySlug: 'electrician-services',
    title: 'General Electrician Diagnostic & Repair (60 Mins)',
    slug: 'electrician-service-repair',
    shortDescription: 'Certified electrician for switchboards, MCB tripping, ceiling fans & lightings.',
    description: 'On-demand troubleshooting for residential electrical systems. Covers switch replacement, short circuit diagnosis, fan regulator fix, or hanging modern chandeliers with precision leveling.',
    price: 249,
    originalPrice: 399,
    durationMinutes: 60,
    rating: 4.83,
    reviewCount: 520,
    imageUrl: '/images/services/electrician.jpg',
    galleryUrls: [
      '/images/services/electrician.jpg',
      '/images/services/ac-repair.jpg'
    ],
    isPopular: false,
    isActive: true,
    includedItems: [
      'Up to 60 minutes of certified electrician labor',
      'Inspection of wiring, load balance, and fuse boxes',
      'Installation or repair of up to 2 appliances/switches',
      'Digital multimeter safety diagnostics'
    ],
    excludedItems: [
      'Hardware spare parts cost (switches, cables, capacitors)'
    ],
    faqList: [
      {
        question: 'Are your electricians licensed?',
        answer: 'Yes, all technicians carry state wireman certification and safety gloves/insulation equipment.'
      }
    ]
  },
  {
    id: 'srv-plumb-leak',
    categoryId: 'cat-plumbing',
    categorySlug: 'plumbing-solutions',
    title: 'Plumber Consultation & Leakage Repair (60 Mins)',
    slug: 'plumbing-leakage-repair',
    shortDescription: 'Fix leaking taps, shower mixers, sink drain traps, and cistern valves.',
    description: 'Skilled plumbers equipped with pipe wrenches, Teflon tapes, and washer kits to swiftly stop water wastage, repair dripping mixers, or unblock sluggish drain traps.',
    price: 249,
    originalPrice: 399,
    durationMinutes: 60,
    rating: 4.81,
    reviewCount: 412,
    imageUrl: '/images/services/plumbing.jpg',
    galleryUrls: [
      '/images/services/plumbing.jpg',
      '/images/services/bathroom-cleaning.jpg'
    ],
    isPopular: false,
    isActive: true,
    includedItems: [
      '60 minutes of expert plumbing diagnosis and repair',
      'Tap washer replacement and cartridge inspection',
      'Waste pipe blockage clearance',
      'Pressure test for fittings'
    ],
    excludedItems: [
      'Concealed wall pipe breaking or replacement parts'
    ],
    faqList: [
      {
        question: 'What if spare parts are required?',
        answer: 'The plumber will show you the exact broken part. You can either purchase it directly or let the technician fetch it with an official store bill.'
      }
    ]
  },
  {
    id: 'srv-pest-cockroach',
    categoryId: 'cat-pest',
    categorySlug: 'pest-control',
    title: 'Cockroach & Ant Shield Gel Treatment',
    slug: 'cockroach-pest-control',
    shortDescription: '100% odorless Bayer gel baiting with zero kitchen vacating required.',
    description: 'Say goodbye to cockroaches and sugar ants without emptying your kitchen cupboards. We apply micro-dots of Bayer Maxforce cockroach gel bait in dark cabinet corners, sink hinges, and appliances.',
    price: 699,
    originalPrice: 999,
    durationMinutes: 45,
    rating: 4.90,
    reviewCount: 310,
    imageUrl: '/images/services/pest-control.jpg',
    galleryUrls: [
      '/images/services/pest-control.jpg',
      '/images/services/kitchen-cleaning.jpg'
    ],
    isPopular: false,
    isActive: true,
    includedItems: [
      'Bayer Maxforce gel dot placement in all kitchen nooks & electrical motors',
      'Drain fly treatment with larvicide granule flush',
      'Ant control chalk and barrier baiting',
      '90-day warranty with free follow-up revisit if pests return'
    ],
    excludedItems: [
      'Bedbug or termite eradication (separate specialized treatment)'
    ],
    faqList: [
      {
        question: 'Do I need to leave the house or pack my dishes?',
        answer: 'No! The gel is odorless, non-airborne, and applied strictly in hidden hinges. No need to remove utensils.'
      }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    serviceId: 'srv-sofa-deep',
    serviceTitle: '3-Seater Fabric Sofa Deep Cleaning',
    userId: 'usr-1',
    userName: 'Priya Sharma',
    rating: 5,
    comment: 'The team arrived right on the dot at 10 AM. Our beige velvet sofa had food and coffee stains from our toddler that we thought were permanent. The wet extraction machine made it look literally showroom new. Extremely courteous professional!',
    createdAt: '2026-10-04T14:20:00Z',
    verifiedBooking: true,
  },
  {
    id: 'rev-2',
    serviceId: 'srv-ac-jet',
    serviceTitle: 'AC Power Jet Servicing',
    userId: 'usr-2',
    userName: 'Vikramaditya Roy',
    rating: 5,
    comment: 'The waterproof jacket they attached prevented even a single drop from staining my textured bedroom wall. The jet wash washed out black sludge from the blower. Cooling has doubled and electricity unit consumption has noticeably dropped!',
    createdAt: '2026-10-06T11:15:00Z',
    verifiedBooking: true,
  },
  {
    id: 'rev-3',
    serviceId: 'srv-home-deep',
    serviceTitle: 'Complete 2 BHK Home Deep Cleaning',
    userId: 'usr-3',
    userName: 'Ananya Deshmukh',
    rating: 5,
    comment: 'Booked this before Diwali guests arrived. 3 technicians spent 4 hours rigorously scrubbing every corner, especially the bathroom lime stains and balcony sliding tracks. Completely transformed our home. Worth every single rupee!',
    createdAt: '2026-10-08T18:45:00Z',
    verifiedBooking: true,
  },
  {
    id: 'rev-4',
    serviceId: 'srv-washing-machine',
    serviceTitle: 'Washing Machine Scale Removal Spa',
    userId: 'usr-4',
    userName: 'Rohan Mehta',
    rating: 4,
    comment: 'Very professional technician. He disassembled the drain valve and removed clumps of coins and lint that were causing vibration during spin mode. Smooth booking process.',
    createdAt: '2026-10-09T09:30:00Z',
    verifiedBooking: true,
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'FIRST50',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 499,
    maxDiscount: 200,
    description: '15% OFF on your very first HomeEase booking up to ₹200',
  },
  {
    code: 'CLEAN200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 1499,
    description: 'Flat ₹200 OFF on orders above ₹1,499',
  },
  {
    code: 'FESTIVE15',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 1999,
    maxDiscount: 500,
    description: 'Festive Season Special: 20% OFF up to ₹500',
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];
