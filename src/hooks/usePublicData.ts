
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/lib/mockService";
import { supabase } from "@/integrations/supabase/client";
import { CITY_CENTERS } from "@/lib/constants";
import { haversineDistance } from "@/lib/utils";
import type { Subject, EducationLevel, City, TutoringPackage, PartnerLocation, Testimonial, Schedule } from "@/types/database";

// Check if Supabase is configured
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY);

// Initialize mock data if Supabase is not configured
if (!isSupabaseConfigured) {
  mockService.initialize();
}

// Fetch all active subjects
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("subjects")
            .select("*")
            .eq("is_active", true)
            .order("name");
          if (error) throw error;
          return data as Subject[];
        } catch {
          // fallback
        }
      }
      // Fallback to mock
      return mockService.subjects.getAll().filter(s => s.is_active);
    },
  });
}

// Fetch all education levels
export function useEducationLevels() {
  return useQuery({
    queryKey: ["education_levels"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("education_levels")
          .select("*")
          .order("sort_order");
        if (error) throw error;
        return data as EducationLevel[];
      }
      return mockService.educationLevels.getAll();
    },
  });
}

// Fetch all active cities
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("cities")
            .select("*")
            .eq("is_active", true)
            .order("name");
          if (error) throw error;
          return data as City[];
        } catch {
          // fallback
        }
      }
      return mockService.cities.getAll().filter(c => c.is_active);
    },
  });
}

// Fetch all active partner locations
export function usePartnerLocations(cityId?: string) {
  return useQuery({
    queryKey: ["partner_locations", cityId],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from("partner_locations")
            .select("*, city:cities(*)")
            .eq("is_active", true);
          
          if (cityId) {
            query = query.eq("city_id", cityId);
          }

          const { data, error } = await query;
          if (error) throw error;
          const locations = (data as PartnerLocation[]) || [];

        let userCoords: { lat: number; lng: number } | null = null;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator?.geolocation) return reject(new Error("geolocation_unavailable"));
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch { void 0; }

        let ref: { lat: number; lng: number } | null = null;
        if (userCoords) {
          ref = userCoords;
        } else if (cityId) {
          const cityName = locations[0]?.city?.name;
          const center = cityName ? CITY_CENTERS[cityName] : undefined;
          if (center) ref = center;
        }

        if (ref) {
          for (const loc of locations) {
            if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
              loc.distance_km = haversineDistance(ref.lat, ref.lng, loc.latitude, loc.longitude);
            }
          }
          locations.sort((a, b) => {
            const da = typeof a.distance_km === "number" ? a.distance_km : Number.POSITIVE_INFINITY;
            const db = typeof b.distance_km === "number" ? b.distance_km : Number.POSITIVE_INFINITY;
            return da - db;
          });
        }

        return locations;
        } catch {
          // fallback below
        }
      }

      const locations = mockService.locations.getAll().filter(l => l.is_active);
      const cities = mockService.cities.getAll();
      
      const joinedLocations = locations.map(loc => ({
        ...loc,
        city: cities.find(c => c.id === loc.city_id)
      }));

      if (cityId) {
        const filtered = joinedLocations.filter(l => l.city_id === cityId);

        let userCoords: { lat: number; lng: number } | null = null;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator?.geolocation) return reject(new Error("geolocation_unavailable"));
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch { void 0; }

        let ref: { lat: number; lng: number } | null = null;
        if (userCoords) {
          ref = userCoords;
        } else {
          const cityName = filtered[0]?.city?.name;
          const center = cityName ? CITY_CENTERS[cityName] : undefined;
          if (center) ref = center;
        }

        if (ref) {
          for (const loc of filtered) {
            if (typeof loc.latitude === "number" && typeof loc.longitude === "number") {
              loc.distance_km = haversineDistance(ref.lat, ref.lng, loc.latitude, loc.longitude);
            }
          }
          filtered.sort((a, b) => {
            const da = typeof a.distance_km === "number" ? a.distance_km : Number.POSITIVE_INFINITY;
            const db = typeof b.distance_km === "number" ? b.distance_km : Number.POSITIVE_INFINITY;
            return da - db;
          });
        }

        return filtered;
      }
      return joinedLocations;
    },
  });
}

// Fetch active testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .eq("is_active", true)
            .limit(6);
          if (error) throw error;
          return data as Testimonial[];
        } catch {
          // fallback
        }
      }
      return mockService.testimonials.getAll()
        .filter(t => t.is_active)
        .slice(0, 6);
    },
  });
}

// Fetch tutoring packages with filters
interface PackageFilters {
  subject_id?: string;
  level_id?: string;
  city_id?: string;
  mode?: "online" | "offline";
  system?: "private" | "group";
  place?: "student_home" | "partner_cafe";
  location_id?: string;
}

export function usePackages(filters?: PackageFilters) {
  return useQuery({
    queryKey: ["packages", filters],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from("tutoring_packages")
            .select(`
              *,
              subject:subjects(*),
              level:education_levels(*),
              city:cities(*),
              location:partner_locations(*)
            `)
            .eq("is_active", true);

          if (filters?.subject_id) query = query.eq("subject_id", filters.subject_id);
          if (filters?.level_id) query = query.eq("level_id", filters.level_id);
          if (filters?.city_id) query = query.eq("city_id", filters.city_id);
          if (filters?.mode) query = query.eq("mode", filters.mode);
          if (filters?.system) query = query.eq("system", filters.system);
          if (filters?.place) query = query.eq("place", filters.place);
          if (filters?.location_id) query = query.eq("location_id", filters.location_id);

          const { data, error } = await query;
          if (error) throw error;
          return data as TutoringPackage[];
        } catch {
          // fallback
        }
      }

      let packages = mockService.packages.getAll().filter(p => p.is_active);

      if (filters?.subject_id) {
        packages = packages.filter(p => p.subject_id === filters.subject_id);
      }
      if (filters?.level_id) {
        packages = packages.filter(p => p.level_id === filters.level_id);
      }
      if (filters?.city_id) {
        packages = packages.filter(p => p.city_id === filters.city_id);
      }
      if (filters?.mode) {
        packages = packages.filter(p => p.mode === filters.mode);
      }
      if (filters?.system) {
        packages = packages.filter(p => p.system === filters.system);
      }
      if (filters?.place) {
        packages = packages.filter(p => p.place === filters.place);
      }
      if (filters?.location_id) {
        packages = packages.filter(p => String(p.location_id) === String(filters.location_id));
      }

      return packages;
    },
  });
}

// Fetch single package by ID
export function usePackage(id: string) {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("tutoring_packages")
            .select(`
              *,
              subject:subjects(*),
              level:education_levels(*),
              city:cities(*),
              location:partner_locations(*)
            `)
            .eq("id", id)
            .single();
          
          if (error) throw error;
          return data as TutoringPackage;
        } catch {
          // fallback
        }
      }
      return mockService.packages.get(id);
    },
    enabled: !!id,
  });
}

export function useSchedules(packageId: string) {
  return useQuery({
    queryKey: ["schedules", packageId],
    enabled: !!packageId,
    queryFn: async () => {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from("schedules")
            .select("*")
            .eq("package_id", packageId)
            .eq("is_available", true)
            .order("day_of_week")
            .order("start_time");
          if (error) throw error;
          return (data as Schedule[]) || [];
        } catch {
          return [] as Schedule[];
        }
      }
      return [] as Schedule[];
    },
  });
}
