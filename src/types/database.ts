// Type definitions for database entities

export type LearningMode = "online" | "offline";
export type LearningPlace = "student_home" | "partner_cafe";
export type LearningSystem = "private" | "group";
export type RegistrationStatus = "new" | "contacted" | "active" | "completed";

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EducationLevel {
  id: string;
  name: string;
  code: string;
  sort_order: number;
}

export interface City {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface PartnerLocation {
  id: string;
  city_id: string;
  name: string;
  address: string;
  operating_hours: string | null;
  maps_link?: string | null;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  city?: City;
  distance_km?: number;
}

export interface TutoringPackage {
  id: string;
  name: string;
  slug?: string;
  subject_id: string;
  level_id: string;
  city_id: string;
  location_id: string | null;
  mode: LearningMode;
  place: LearningPlace | null;
  system: LearningSystem;
  price: number;
  session_duration: number;
  total_sessions: number;
  group_quota: number | null;
  description: string | null;
  features?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations
  subject?: Subject;
  level?: EducationLevel;
  city?: City;
  location?: PartnerLocation;
}

export interface Schedule {
  id: string;
  package_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_students: number | null;
  current_students: number;
  is_available: boolean;
  created_at: string;
}

export interface Registration {
  id: string;
  package_id: string;
  student_name: string;
  whatsapp_number: string;
  email: string | null;
  city: string;
  preferred_schedule: string | null;
  detailed_location: string | null;
  status: RegistrationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  package?: TutoringPackage;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  created_at: string;
}

// Filter types for packages listing
export interface PackageFilters {
  subject_id?: string;
  level_id?: string;
  city_id?: string;
  mode?: LearningMode;
  system?: LearningSystem;
}
