// WhatsApp number for admin contact (change this to your actual number)
export const ADMIN_WHATSAPP_NUMBER = "6281234567890";
export const ADMIN_WHATSAPP_KEY = "bimbelku_admin_whatsapp";
export const getAdminWhatsAppNumber = (): string => {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(ADMIN_WHATSAPP_KEY)) || "";
  return v || ADMIN_WHATSAPP_NUMBER;
};
export const setAdminWhatsAppNumber = (num: string): void => {
  const cleaned = (num || "").replace(/[^0-9]/g, "");
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(ADMIN_WHATSAPP_KEY, cleaned);
  }
};

// App name
export const APP_NAME = "BimbelKu";

// Default session duration in minutes
export const DEFAULT_SESSION_DURATION = 90;

// Days of week mapping
export const DAYS_OF_WEEK = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
] as const;

// Learning modes
export const LEARNING_MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
] as const;

// Learning places
export const LEARNING_PLACES = [
  { value: "student_home", label: "Rumah Siswa" },
  { value: "partner_cafe", label: "Cafe" },
] as const;

// Learning systems
export const LEARNING_SYSTEMS = [
  { value: "private", label: "Private" },
  { value: "group", label: "Grup" },
] as const;

// Registration statuses
export const REGISTRATION_STATUSES = [
  { value: "new", label: "Baru", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Sudah Dihubungi", color: "bg-yellow-100 text-yellow-800" },
  { value: "active", label: "Aktif", color: "bg-green-100 text-green-800" },
  { value: "completed", label: "Selesai", color: "bg-gray-100 text-gray-800" },
] as const;

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Jakarta: { lat: -6.2088, lng: 106.8456 },
  Bandung: { lat: -6.9175, lng: 107.6191 },
  Surabaya: { lat: -7.2458, lng: 112.7378 },
};

// Appearance settings
export type AppearanceSettings = {
  theme: "light" | "dark";
  primary: string;
  accent: string;
  radius: string;
  sidebarBackground: string;
  sidebarAccent: string;
  gradientPrimary: string;
  gradientAccent: string;
  gradientHero: string;
};

export const APPEARANCE_KEY = "bimbelku_appearance";

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "light",
  primary: "174 60% 40%",
  accent: "16 85% 60%",
  radius: "0.75rem",
  sidebarBackground: "220 20% 14%",
  sidebarAccent: "220 20% 20%",
  gradientPrimary: "linear-gradient(135deg, hsl(174 60% 40%) 0%, hsl(174 70% 50%) 100%)",
  gradientAccent: "linear-gradient(135deg, hsl(16 85% 60%) 0%, hsl(30 90% 55%) 100%)",
  gradientHero: "linear-gradient(180deg, hsl(174 40% 97%) 0%, hsl(0 0% 100%) 100%)",
};

export const getAppearanceSettings = (): AppearanceSettings => {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(APPEARANCE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
      return { ...DEFAULT_APPEARANCE, ...parsed };
    }
  } catch (_err) {
    return DEFAULT_APPEARANCE;
  }
  return DEFAULT_APPEARANCE;
};

export const applyAppearanceSettings = (settings?: AppearanceSettings): void => {
  const s = settings || getAppearanceSettings();
  const root = document.documentElement;
  if (s.theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
  root.style.setProperty("--primary", s.primary);
  root.style.setProperty("--accent", s.accent);
  root.style.setProperty("--radius", s.radius);
  root.style.setProperty("--ring", s.primary);
  root.style.setProperty("--sidebar-primary", s.primary);
  root.style.setProperty("--sidebar-background", s.sidebarBackground);
  root.style.setProperty("--sidebar-accent", s.sidebarAccent);
  root.style.setProperty("--gradient-primary", s.gradientPrimary);
  root.style.setProperty("--gradient-accent", s.gradientAccent);
  root.style.setProperty("--gradient-hero", s.gradientHero);
};

export const setAppearanceSettings = (partial: Partial<AppearanceSettings>): AppearanceSettings => {
  const current = getAppearanceSettings();
  const merged: AppearanceSettings = { ...current, ...partial };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(merged));
  }
  applyAppearanceSettings(merged);
  return merged;
};

export const COLOR_PRESETS: { key: string; label: string; primary: string; accent: string }[] = [
  { key: "teal", label: "Teal", primary: "174 60% 40%", accent: "16 85% 60%" },
  { key: "blue", label: "Biru", primary: "220 90% 55%", accent: "200 90% 55%" },
  { key: "purple", label: "Ungu", primary: "270 60% 55%", accent: "300 75% 55%" },
  { key: "green", label: "Hijau", primary: "152 60% 45%", accent: "140 70% 50%" },
  { key: "orange", label: "Oranye", primary: "30 90% 55%", accent: "16 85% 60%" },
];

export const SIDEBAR_PRESETS: { key: string; label: string; background: string; accent: string }[] = [
  { key: "default", label: "Default", background: "220 20% 14%", accent: "220 20% 20%" },
  { key: "darker", label: "Lebih Gelap", background: "220 25% 6%", accent: "220 25% 14%" },
  { key: "teal", label: "Teal", background: "174 40% 16%", accent: "174 40% 22%" },
  { key: "black", label: "Hitam", background: "0 0% 8%", accent: "0 0% 14%" },
];

export const GRADIENT_PRESETS: { key: string; label: string; primary: string; accent: string; hero: string }[] = [
  {
    key: "default",
    label: "Default",
    primary: "linear-gradient(135deg, hsl(174 60% 40%) 0%, hsl(174 70% 50%) 100%)",
    accent: "linear-gradient(135deg, hsl(16 85% 60%) 0%, hsl(30 90% 55%) 100%)",
    hero: "linear-gradient(180deg, hsl(174 40% 97%) 0%, hsl(0 0% 100%) 100%)",
  },
  {
    key: "soft",
    label: "Lembut",
    primary: "linear-gradient(135deg, hsl(174 40% 50%) 0%, hsl(174 60% 60%) 100%)",
    accent: "linear-gradient(135deg, hsl(16 70% 65%) 0%, hsl(30 80% 60%) 100%)",
    hero: "linear-gradient(180deg, hsl(174 30% 98%) 0%, hsl(0 0% 100%) 100%)",
  },
  {
    key: "bold",
    label: "Tegas",
    primary: "linear-gradient(135deg, hsl(174 70% 38%) 0%, hsl(174 80% 48%) 100%)",
    accent: "linear-gradient(135deg, hsl(16 90% 55%) 0%, hsl(30 95% 50%) 100%)",
    hero: "linear-gradient(180deg, hsl(174 40% 96%) 0%, hsl(0 0% 100%) 100%)",
  },
  {
    key: "none",
    label: "Tanpa Gradient",
    primary: "none",
    accent: "none",
    hero: "none",
  },
];
