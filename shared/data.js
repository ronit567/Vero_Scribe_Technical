// vero — patient booking data
// Physicians + slot generator (deterministic from date so it's stable)

const PHYSICIANS = [
  {
    id: "okonkwo",
    name: "Dr. Adaeze Okonkwo",
    initials: "AO",
    credentials: "MD",
    specialty: "Family Medicine",
    subspecialty: "Adult & adolescent",
    boardCert: "American Board of Family Medicine",
    years: 12,
    rating: 4.9,
    reviews: 312,
    location: "Yorkville Medical Centre — 220 Yonge St, Toronto",
    distanceMi: 2.1,
    languages: ["English", "Igbo", "French"],
    accepting: true,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 0, // days from today
    bio: "Dr. Okonkwo focuses on long-term primary care for adults and adolescents, with particular interest in preventive medicine, chronic disease management, and women's health. She partners closely with patients to set practical, evidence-based health goals.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna", "United Healthcare"],
  },
  {
    id: "lindqvist",
    name: "Dr. Marcus Lindqvist",
    initials: "ML",
    credentials: "MD, MPH",
    specialty: "Internal Medicine",
    subspecialty: "Preventive care",
    boardCert: "American Board of Internal Medicine",
    years: 18,
    rating: 4.8,
    reviews: 488,
    location: "Mississauga Family Clinic — 401 Hurontario St, Mississauga",
    distanceMi: 14.5,
    languages: ["English", "Swedish"],
    accepting: true,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 1,
    bio: "Dr. Lindqvist treats the full range of adult medicine, with a focus on cardiovascular risk, metabolic health, and preventive screening. He completed his residency at Johns Hopkins and a public health fellowship at Karolinska.",
    insurance: ["BlueCross PPO", "Aetna", "Kaiser", "Medicare"],
  },
  {
    id: "iyengar",
    name: "Dr. Priya Iyengar",
    initials: "PI",
    credentials: "MD, FAAD",
    specialty: "Dermatology",
    subspecialty: "Medical & cosmetic",
    boardCert: "American Board of Dermatology",
    years: 9,
    rating: 4.9,
    reviews: 226,
    location: "Markham Medical Arts — 78 Highway 7 E, Markham",
    distanceMi: 22.0,
    languages: ["English", "Tamil", "Hindi"],
    accepting: true,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 2,
    bio: "Board-certified dermatologist treating skin conditions across all ages — from acne and eczema to skin cancer screening and surgical dermatology.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna"],
  },
  {
    id: "vega",
    name: "Dr. Tomás Vega",
    initials: "TV",
    credentials: "MD, FACC",
    specialty: "Cardiology",
    subspecialty: "Preventive cardiology",
    boardCert: "American Board of Internal Medicine — Cardiovascular Disease",
    years: 22,
    rating: 4.7,
    reviews: 174,
    location: "Oakville Cardiology — 1100 Lakeshore Rd E, Oakville",
    distanceMi: 28.4,
    languages: ["English", "Spanish", "Portuguese"],
    accepting: true,
    visitTypes: ["in-person"],
    nextAvail: 4,
    bio: "Dr. Vega specializes in preventive cardiology, lipid management, and adult congenital heart disease.",
    insurance: ["BlueCross PPO", "Aetna", "Medicare"],
  },
  {
    id: "reiss",
    name: "Dr. Hannah Reiss",
    initials: "HR",
    credentials: "MD",
    specialty: "Pediatrics",
    subspecialty: "Newborn — 18 yrs",
    boardCert: "American Board of Pediatrics",
    years: 14,
    rating: 5.0,
    reviews: 401,
    location: "Yorkville Medical Centre — 220 Yonge St, Toronto",
    distanceMi: 2.1,
    languages: ["English", "Hebrew"],
    accepting: true,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 0,
    bio: "Dr. Reiss provides primary care for newborns through young adults, with strong interests in developmental milestones, behavioral health, and adolescent medicine.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna", "United Healthcare", "Kaiser"],
  },
  {
    id: "park",
    name: "Dr. Joon-ho Park",
    initials: "JP",
    credentials: "MD, PhD",
    specialty: "Endocrinology",
    subspecialty: "Diabetes & thyroid",
    boardCert: "American Board of Internal Medicine — Endocrinology",
    years: 16,
    rating: 4.8,
    reviews: 209,
    location: "Markham Medical Arts — 78 Highway 7 E, Markham",
    distanceMi: 22.0,
    languages: ["English", "Korean"],
    accepting: false,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 9,
    bio: "Dr. Park focuses on type 1 and type 2 diabetes, thyroid disease, and adrenal disorders. He runs an integrated CGM program for newly-diagnosed patients.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna"],
  },
  {
    id: "whitcomb",
    name: "Dr. Eleanor Whitcomb",
    initials: "EW",
    credentials: "MD",
    specialty: "Psychiatry",
    subspecialty: "Adult psychiatry",
    boardCert: "American Board of Psychiatry & Neurology",
    years: 11,
    rating: 4.9,
    reviews: 158,
    location: "Mississauga Family Clinic — 401 Hurontario St, Mississauga",
    distanceMi: 14.5,
    languages: ["English"],
    accepting: true,
    visitTypes: ["in-person"],
    nextAvail: 3,
    bio: "Dr. Whitcomb provides medication management and therapy for adults navigating anxiety, depression, ADHD, and life transitions. All visits are virtual.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna", "Out-of-network"],
  },
  {
    id: "haddad",
    name: "Dr. Samira Haddad",
    initials: "SH",
    credentials: "MD, FACOG",
    specialty: "OB-GYN",
    subspecialty: "Women's health",
    boardCert: "American Board of Obstetrics & Gynecology",
    years: 13,
    rating: 4.8,
    reviews: 287,
    location: "Mississauga Family Clinic — 401 Hurontario St, Mississauga",
    distanceMi: 14.5,
    languages: ["English", "Arabic", "French"],
    accepting: true,
    visitTypes: ["in-person", "virtual"],
    nextAvail: 2,
    bio: "Dr. Haddad cares for women across the lifespan — annual exams, contraception, pregnancy, and menopause management.",
    insurance: ["BlueCross PPO", "Aetna", "Cigna", "United Healthcare"],
  },
];

const REASONS = [
  { id: "annual",     title: "Annual physical",   desc: "Yearly check-up & screenings" },
  { id: "new",        title: "New concern",       desc: "Something new I'd like to discuss" },
  { id: "follow",     title: "Follow-up",         desc: "Continue care for an existing issue" },
  { id: "refill",     title: "Prescription",      desc: "Refill or adjust a medication" },
  { id: "labs",       title: "Lab results",       desc: "Review recent test results" },
  { id: "other",      title: "Something else",    desc: "I'll describe below" },
];

const SPECIALTIES = [
  "All specialties",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Dermatology",
  "Cardiology",
  "Endocrinology",
  "Psychiatry",
  "OB-GYN",
];

// Deterministic pseudo-random — same physician+date always yields the same slots.
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}
function seededRand(seed) {
  let s = seed;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489917);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

const MORNING_POOL   = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON_POOL = ["12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"];
const EVENING_POOL   = ["4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"];

function slotsFor(physicianId, dateISO) {
  const rng = seededRand(hashSeed(physicianId + ":" + dateISO));
  const isWeekend = [0, 6].includes(new Date(dateISO + "T00:00:00").getDay());
  const pick = (pool, prob) => pool.filter(() => rng() < prob);
  return {
    morning:   isWeekend ? [] : pick(MORNING_POOL, 0.45),
    afternoon: pick(AFTERNOON_POOL, isWeekend ? 0.2 : 0.55),
    evening:   isWeekend ? [] : pick(EVENING_POOL, 0.35),
  };
}

function physicianById(id) {
  return PHYSICIANS.find((p) => p.id === id);
}

const DEMO_PATIENT = {
  id: "p-bill",
  name: "Bill Sato",
  dob: "1989-08-04",
  memberId: "BC-4837-2210",
  phone: "•••• 4421",
  email: "bill@verohealth.example",
  initials: "BS",
};

window.PHYSICIANS = PHYSICIANS;
window.REASONS = REASONS;
window.SPECIALTIES = SPECIALTIES;
window.slotsFor = slotsFor;
window.physicianById = physicianById;
window.DEMO_PATIENT = DEMO_PATIENT;
