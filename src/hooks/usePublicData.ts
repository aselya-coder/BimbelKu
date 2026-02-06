
import { useQuery } from "@tanstack/react-query";
import { mockService } from "@/lib/mockService";
import type { Subject, EducationLevel, City, TutoringPackage, PartnerLocation, Testimonial } from "@/types/database";

// Initialize data on load
mockService.initialize();

// Fetch all active subjects
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      // Filter active subjects only
      return mockService.subjects.getAll().filter(s => s.is_active);
    },
  });
}

// Fetch all education levels
export function useEducationLevels() {
  return useQuery({
    queryKey: ["education_levels"],
    queryFn: async () => {
      return mockService.educationLevels.getAll();
    },
  });
}

// Fetch all active cities
export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      return mockService.cities.getAll().filter(c => c.is_active);
    },
  });
}

// Fetch all active partner locations
export function usePartnerLocations(cityId?: string) {
  return useQuery({
    queryKey: ["partner_locations", cityId],
    queryFn: async () => {
      let locations = mockService.locations.getAll().filter(l => l.is_active);
      const cities = mockService.cities.getAll();
      
      // Join with city data
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
      return mockService.packages.get(id);
    },
    enabled: !!id,
  });
}
