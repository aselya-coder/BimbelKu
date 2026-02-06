// WhatsApp number for admin contact (change this to your actual number)
export const ADMIN_WHATSAPP_NUMBER = "6281234567890";

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
  { value: "partner_cafe", label: "Cafe Terdekat" },
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
