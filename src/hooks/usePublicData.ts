
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/lib/mockService";
import { supabase } from "@/integrations/supabase/client";
import type { Subject, EducationLevel, City, TutoringPackage, PartnerLocation, Testimonial } from "@/types/database";

// Check if Supabase is configured
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("is_active", true)
          .order("name");
        if (error) throw error;
        return data as Subject[];
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
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .eq("is_active", true)
          .order("name");
        if (error) throw error;
        return data as City[];
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
        let query = supabase
          .from("partner_locations")
          .select("*, city:cities(*)")
          .eq("is_active", true);
        
        if (cityId) {
          query = query.eq("city_id", cityId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as PartnerLocation[];
      }

      let locations = mockService.locations.getAll().filter(l => l.is_active);
      const cities = mockService.cities.getAll();
      
      const joinedLocations = locations.map(loc => ({
        ...loc,
        city: cities.find(c => c.id === loc.city_id)
      }));

      if (cityId) {
        return joinedLocations.filter(l => l.city_id === cityId);
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
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .limit(6);
        if (error) throw error;
        return data as Testimonial[];
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
}

export function usePackages(filters?: PackageFilters) {
  return useQuery({
    queryKey: ["packages", filters],
    queryFn: async () => {
      if (isSupabaseConfigured) {
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

        const { data, error } = await query;
        if (error) throw error;
        return data as TutoringPackage[];
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
      }
      return mockService.packages.get(id);
    },
    enabled: !!id,
  });
}
