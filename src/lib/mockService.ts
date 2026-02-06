
import { 
  Subject, 
  EducationLevel, 
  City, 
  PartnerLocation, 
  TutoringPackage, 
  Testimonial,
  Registration
} from "@/types/database";

// Initial Mock Data
const MOCK_SUBJECTS: Subject[] = [
  { id: "1", name: "Matematika", description: "Pelajaran Matematika", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "2", name: "Fisika", description: "Pelajaran Fisika", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "3", name: "Kimia", description: "Pelajaran Kimia", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "4", name: "Biologi", description: "Pelajaran Biologi", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "5", name: "Bahasa Inggris", description: "Pelajaran Bahasa Inggris", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const MOCK_LEVELS: EducationLevel[] = [
  { id: "1", name: "SD", code: "sd", sort_order: 1 },
  { id: "2", name: "SMP", code: "smp", sort_order: 2 },
  { id: "3", name: "SMA", code: "sma", sort_order: 3 },
  { id: "4", name: "Umum", code: "umum", sort_order: 4 },
];

const MOCK_CITIES: City[] = [
  { id: "1", name: "Jakarta", is_active: true, created_at: new Date().toISOString() },
  { id: "2", name: "Bandung", is_active: true, created_at: new Date().toISOString() },
  { id: "3", name: "Surabaya", is_active: true, created_at: new Date().toISOString() },
];

const MOCK_LOCATIONS: PartnerLocation[] = [
  { 
    id: "1", 
    city_id: "1", 
    name: "Cafe Belajar Jakarta Selatan", 
    address: "Jl. Senopati No. 10", 
    operating_hours: "08:00 - 22:00",
    maps_link: "https://maps.google.com",  
    is_active: true, 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  }
];

const MOCK_PACKAGES: TutoringPackage[] = [
  {
    id: "1",
    name: "Paket Private Matematika SMA",
    slug: "paket-private-matematika-sma",
    description: "Belajar matematika intensif one-on-one",
    price: 1500000,
    session_duration: 90,
    total_sessions: 8,
    is_active: true,
    subject_id: "1",
    level_id: "3",
    city_id: "1",
    location_id: null,
    mode: "offline",
    place: "student_home",
    system: "private",
    group_quota: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    features: ["Modul Lengkap", "Try Out Bulanan", "Konsultasi PR"]
  }
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Budi Santoso",
    role: "Siswa SMA",
    content: "BimbelKu sangat membantu saya memahami materi pelajaran dengan lebih baik.",
    rating: 5,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// Local Storage Keys
const KEYS = {
  SUBJECTS: "bimbelku_subjects",
  LEVELS: "bimbelku_levels",
  CITIES: "bimbelku_cities",
  LOCATIONS: "bimbelku_locations",
  PACKAGES: "bimbelku_packages",
  TESTIMONIALS: "bimbelku_testimonials",
  REGISTRATIONS: "bimbelku_registrations"
};

// Initialize Data if Empty
const initializeData = () => {
  if (!localStorage.getItem(KEYS.SUBJECTS)) localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(MOCK_SUBJECTS));
  if (!localStorage.getItem(KEYS.LEVELS)) localStorage.setItem(KEYS.LEVELS, JSON.stringify(MOCK_LEVELS));
  if (!localStorage.getItem(KEYS.CITIES)) localStorage.setItem(KEYS.CITIES, JSON.stringify(MOCK_CITIES));
  if (!localStorage.getItem(KEYS.LOCATIONS)) localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(MOCK_LOCATIONS));
  if (!localStorage.getItem(KEYS.PACKAGES)) localStorage.setItem(KEYS.PACKAGES, JSON.stringify(MOCK_PACKAGES));
  if (!localStorage.getItem(KEYS.TESTIMONIALS)) localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(MOCK_TESTIMONIALS));
  if (!localStorage.getItem(KEYS.REGISTRATIONS)) localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify([]));
};

// Generic Helper to Get Data
const getData = <T>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

// Generic Helper to Save Data
const saveData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock Service API
export const mockService = {
  initialize: initializeData,
  
  subjects: {
    getAll: () => getData<Subject>(KEYS.SUBJECTS),
    get: (id: string) => getData<Subject>(KEYS.SUBJECTS).find(item => item.id === id),
    create: (data: Omit<Subject, "id" | "created_at" | "updated_at">) => {
      const items = getData<Subject>(KEYS.SUBJECTS);
      const newItem = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      saveData(KEYS.SUBJECTS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<Subject>) => {
      const items = getData<Subject>(KEYS.SUBJECTS);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
        saveData(KEYS.SUBJECTS, items);
        return items[index];
      }
      return null;
    },
    delete: (id: string) => {
      const items = getData<Subject>(KEYS.SUBJECTS).filter(item => item.id !== id);
      saveData(KEYS.SUBJECTS, items);
    }
  },

  educationLevels: {
    getAll: () => getData<EducationLevel>(KEYS.LEVELS),
  },

  cities: {
    getAll: () => getData<City>(KEYS.CITIES),
    create: (data: Omit<City, "id" | "created_at">) => {
      const items = getData<City>(KEYS.CITIES);
      const newItem = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      saveData(KEYS.CITIES, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<City>) => {
      const items = getData<City>(KEYS.CITIES);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        saveData(KEYS.CITIES, items);
        return items[index];
      }
      return null;
    },
    delete: (id: string) => {
      const items = getData<City>(KEYS.CITIES).filter(item => item.id !== id);
      saveData(KEYS.CITIES, items);
    }
  },

  locations: {
    getAll: () => getData<PartnerLocation>(KEYS.LOCATIONS),
    create: (data: Omit<PartnerLocation, "id" | "created_at" | "updated_at">) => {
      const items = getData<PartnerLocation>(KEYS.LOCATIONS);
      const newItem = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      saveData(KEYS.LOCATIONS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<PartnerLocation>) => {
      const items = getData<PartnerLocation>(KEYS.LOCATIONS);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
        saveData(KEYS.LOCATIONS, items);
        return items[index];
      }
      return null;
    },
    delete: (id: string) => {
      const items = getData<PartnerLocation>(KEYS.LOCATIONS).filter(item => item.id !== id);
      saveData(KEYS.LOCATIONS, items);
    }
  },

  packages: {
    getAll: () => {
      const pkgs = getData<TutoringPackage>(KEYS.PACKAGES);
      const subjects = getData<Subject>(KEYS.SUBJECTS);
      const levels = getData<EducationLevel>(KEYS.LEVELS);
      const cities = getData<City>(KEYS.CITIES);
      const locations = getData<PartnerLocation>(KEYS.LOCATIONS);

      return pkgs.map(pkg => ({
        ...pkg,
        subject: subjects.find(s => s.id === pkg.subject_id),
        level: levels.find(l => l.id === pkg.level_id),
        city: cities.find(c => c.id === pkg.city_id),
        location: pkg.location_id ? locations.find(l => l.id === pkg.location_id) : undefined
      }));
    },
    get: (id: string) => {
      const pkgs = getData<TutoringPackage>(KEYS.PACKAGES);
      const pkg = pkgs.find(p => p.id === id);
      if (!pkg) return null;

      const subjects = getData<Subject>(KEYS.SUBJECTS);
      const levels = getData<EducationLevel>(KEYS.LEVELS);
      const cities = getData<City>(KEYS.CITIES);
      const locations = getData<PartnerLocation>(KEYS.LOCATIONS);

      return {
        ...pkg,
        subject: subjects.find(s => s.id === pkg.subject_id),
        level: levels.find(l => l.id === pkg.level_id),
        city: cities.find(c => c.id === pkg.city_id),
        location: pkg.location_id ? locations.find(l => l.id === pkg.location_id) : undefined
      };
    },
    create: (data: Omit<TutoringPackage, "id" | "created_at" | "updated_at">) => {
      const items = getData<TutoringPackage>(KEYS.PACKAGES);
      const newItem = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      saveData(KEYS.PACKAGES, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<TutoringPackage>) => {
      const items = getData<TutoringPackage>(KEYS.PACKAGES);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data, updated_at: new Date().toISOString() };
        saveData(KEYS.PACKAGES, items);
        return items[index];
      }
      return null;
    },
    delete: (id: string) => {
      const items = getData<TutoringPackage>(KEYS.PACKAGES).filter(item => item.id !== id);
      saveData(KEYS.PACKAGES, items);
    }
  },

  registrations: {
    getAll: () => {
      const regs = getData<Registration>(KEYS.REGISTRATIONS);
      const pkgs = getData<TutoringPackage>(KEYS.PACKAGES);
      const subjects = getData<Subject>(KEYS.SUBJECTS);
      const levels = getData<EducationLevel>(KEYS.LEVELS);

      return regs.map(reg => {
        const pkg = pkgs.find(p => p.id === reg.package_id);
        const subject = pkg ? subjects.find(s => s.id === pkg.subject_id) : undefined;
        const level = pkg ? levels.find(l => l.id === pkg.level_id) : undefined;

        return {
          ...reg,
          package: pkg ? {
            ...pkg,
            name: pkg.name,
            subject: subject ? { name: subject.name } : undefined,
            level: level ? { name: level.name } : undefined
          } : undefined
        };
      });
    },
    create: (data: Omit<Registration, "id" | "created_at" | "updated_at" | "admin_notes"> & { admin_notes?: string | null }) => {
      const items = getData<Registration>(KEYS.REGISTRATIONS);
      const newItem: Registration = { 
        ...data, 
        id: crypto.randomUUID(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        admin_notes: data.admin_notes || null
      };
      saveData(KEYS.REGISTRATIONS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<Registration>) => {
      const items = getData<Registration>(KEYS.REGISTRATIONS);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        saveData(KEYS.REGISTRATIONS, items);
        return items[index];
      }
      return null;
    }
  },

  testimonials: {
    getAll: () => getData<Testimonial>(KEYS.TESTIMONIALS),
    create: (data: Omit<Testimonial, "id" | "created_at">) => {
      const items = getData<Testimonial>(KEYS.TESTIMONIALS);
      const newItem = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      saveData(KEYS.TESTIMONIALS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, data: Partial<Testimonial>) => {
      const items = getData<Testimonial>(KEYS.TESTIMONIALS);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        saveData(KEYS.TESTIMONIALS, items);
        return items[index];
      }
      return null;
    },
    delete: (id: string) => {
      const items = getData<Testimonial>(KEYS.TESTIMONIALS).filter(item => item.id !== id);
      saveData(KEYS.TESTIMONIALS, items);
    }
  }
};
