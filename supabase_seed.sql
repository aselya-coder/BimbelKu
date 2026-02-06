-- FIX & SEED SCRIPT
-- Jalankan script ini di Supabase SQL Editor.
-- Script ini akan:
-- 1. MENGHAPUS semua data yang ada (Reset) untuk menghilangkan duplikat.
-- 2. Menambahkan "Unique Constraint" agar data tidak bisa dobel lagi.
-- 3. Mengisi ulang data default (Seed).

-- ==========================================
-- 1. RESET DATA (HAPUS SEMUA)
-- ==========================================
TRUNCATE public.registrations, public.testimonials, public.schedules, public.tutoring_packages, public.partner_locations, public.cities, public.education_levels, public.subjects RESTART IDENTITY CASCADE;

-- ==========================================
-- 2. TAMBAHKAN PENGAMAN (UNIQUE CONSTRAINTS)
-- ==========================================

-- Cities: Nama kota harus unik
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cities_name_key') THEN
    ALTER TABLE public.cities ADD CONSTRAINT cities_name_key UNIQUE (name);
  END IF;
END $$;

-- Subjects: Nama mata pelajaran harus unik
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subjects_name_key') THEN
    ALTER TABLE public.subjects ADD CONSTRAINT subjects_name_key UNIQUE (name);
  END IF;
END $$;

-- Partner Locations: Nama lokasi di dalam satu kota harus unik
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_locations_city_name_key') THEN
    ALTER TABLE public.partner_locations ADD CONSTRAINT partner_locations_city_name_key UNIQUE (city_id, name);
  END IF;
END $$;

-- ==========================================
-- 3. ISI ULANG DATA (SEEDING)
-- ==========================================

-- Insert Subjects
INSERT INTO public.subjects (name, description, is_active) VALUES
('Matematika', 'Pelajaran Matematika', true),
('Fisika', 'Pelajaran Fisika', true),
('Kimia', 'Pelajaran Kimia', true),
('Biologi', 'Pelajaran Biologi', true),
('Bahasa Inggris', 'Pelajaran Bahasa Inggris', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Education Levels
INSERT INTO public.education_levels (name, code, sort_order) VALUES
('SD', 'sd', 1),
('SMP', 'smp', 2),
('SMA', 'sma', 3),
('Umum', 'umum', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert Cities
INSERT INTO public.cities (name, is_active) VALUES
('Jakarta', true),
('Bandung', true),
('Surabaya', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Partner Locations
DO $$
DECLARE
  jakarta_id uuid;
BEGIN
  SELECT id INTO jakarta_id FROM public.cities WHERE name = 'Jakarta';
  
  IF jakarta_id IS NOT NULL THEN
    INSERT INTO public.partner_locations (city_id, name, address, operating_hours, maps_link, is_active)
    VALUES (jakarta_id, 'Cafe Terdekat Jakarta Selatan', 'Jl. Senopati No. 10', '08:00 - 22:00', 'https://maps.google.com', true)
    ON CONFLICT (city_id, name) DO NOTHING;
  END IF;
END $$;

-- Insert Tutoring Packages
DO $$
DECLARE
  math_id uuid;
  english_id uuid;
  sma_id uuid;
  smp_id uuid;
  jakarta_id uuid;
  cafe_loc_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO math_id FROM public.subjects WHERE name = 'Matematika';
  SELECT id INTO english_id FROM public.subjects WHERE name = 'Bahasa Inggris';
  SELECT id INTO sma_id FROM public.education_levels WHERE code = 'sma';
  SELECT id INTO smp_id FROM public.education_levels WHERE code = 'smp';
  SELECT id INTO jakarta_id FROM public.cities WHERE name = 'Jakarta';
  SELECT id INTO cafe_loc_id FROM public.partner_locations WHERE name = 'Cafe Terdekat Jakarta Selatan';

  -- Insert Package 1: Private Matematika SMA
  -- Note: We check if it exists by slug to prevent duplicates in packages too
  -- But we didn't add unique constraint on slug yet in this script (it exists in schema line 48: slug text unique)
  
  IF math_id IS NOT NULL AND sma_id IS NOT NULL AND jakarta_id IS NOT NULL THEN
    INSERT INTO public.tutoring_packages (
      name, slug, description, price, session_duration, total_sessions, 
      is_active, subject_id, level_id, city_id, location_id, 
      mode, place, system, group_quota, features
    ) VALUES (
      'Paket Private Matematika SMA',
      'paket-private-matematika-sma',
      'Belajar matematika intensif one-on-one',
      1500000,
      90,
      8,
      true,
      math_id,
      sma_id,
      jakarta_id,
      null, 
      'offline',
      'student_home',
      'private',
      null,
      ARRAY['Modul Lengkap', 'Try Out Bulanan', 'Konsultasi PR']
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Insert Package 2: Grup Bahasa Inggris SMP
  IF english_id IS NOT NULL AND smp_id IS NOT NULL AND jakarta_id IS NOT NULL AND cafe_loc_id IS NOT NULL THEN
    INSERT INTO public.tutoring_packages (
      name, slug, description, price, session_duration, total_sessions, 
      is_active, subject_id, level_id, city_id, location_id, 
      mode, place, system, group_quota, features
    ) VALUES (
      'Paket Grup Bahasa Inggris SMP',
      'paket-grup-bahasa-inggris-smp',
      'Belajar Bahasa Inggris seru dalam grup kecil di cafe',
      750000,
      90,
      8,
      true,
      english_id,
      smp_id,
      jakarta_id,
      cafe_loc_id,
      'offline',
      'partner_cafe',
      'group',
      5,
      ARRAY['Conversation Club', 'Game Based Learning', 'Native Speaker Session']
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- Insert Testimonials
-- Testimonials don't have unique keys usually, so we might duplicate them if we run this often without truncate.
-- But since we TRUNCATE at start, it's fine.
INSERT INTO public.testimonials (name, role, content, rating, is_active) VALUES
('Andi Pratama', 'Siswa SMA', 'Bimbel ini sangat membantu saya memahami materi matematika yang sulit. Tutor sabar dan menjelaskan dengan jelas.', 5, true),
('Ibu Dewi', 'Orang Tua', 'Anak saya jadi lebih semangat belajar. Sistem pembelajaran yang fleksibel sangat cocok dengan jadwal kami.', 5, true),
('Rizky Hidayat', 'Siswa SMP', 'Saya suka belajar online di sini karena tutornya asyik dan materinya mudah dipahami.', 5, true);
