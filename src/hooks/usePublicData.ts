import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Subject, EducationLevel, City, TutoringPackage, PartnerLocation, Testimonial } from "@/types/database";

// Fetch all active subjects
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as Subject[];
    },
  });
}

// Fetch all education levels
export function useEducationLevels() {
  return useQuery({
    queryKey: ["education_levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_levels")
        .select("*")
        .order("sort_order");
      
      if (error) throw error;
      return data as EducationLevel[];
    },
  });
}

// Fetch all active cities
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data as City[];
    },
  });
}

// Fetch all active partner locations
export function usePartnerLocations(cityId?: string) {
  return useQuery({
    queryKey: ["partner_locations", cityId],
    queryFn: async () => {
      let query = supabase
        .from("partner_locations")
        .select("*, city:cities(*)")
        .eq("is_active", true)
        .order("name");
      
      if (cityId) {
        query = query.eq("city_id", cityId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PartnerLocation[];
    },
  });
}

// Fetch active testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Testimonial[];
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
      let query = supabase
        .from("tutoring_packages")
        .select(`
          *,
          subject:subjects(*),
          level:education_levels(*),
          city:cities(*),
          location:partner_locations(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (filters?.subject_id) {
        query = query.eq("subject_id", filters.subject_id);
      }
      if (filters?.level_id) {
        query = query.eq("level_id", filters.level_id);
      }
      if (filters?.city_id) {
        query = query.eq("city_id", filters.city_id);
      }
      if (filters?.mode) {
        query = query.eq("mode", filters.mode);
      }
      if (filters?.system) {
        query = query.eq("system", filters.system);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TutoringPackage[];
    },
  });
}

// Fetch single package by ID
export function usePackage(id: string) {
  return useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
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
        .maybeSingle();

      if (error) throw error;
      return data as TutoringPackage | null;
    },
    enabled: !!id,
  });
}
