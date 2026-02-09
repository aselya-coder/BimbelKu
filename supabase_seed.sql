-- FIX & SEED SCRIPT
-- Jalankan script ini di Supabase SQL Editor.
-- Script ini akan:
-- 1. Menambahkan "Unique Constraint" agar data tidak bisa dobel.
-- 2. Mengisi data default (Seed) secara idempoten (ON CONFLICT DO UPDATE/DO NOTHING).

-- ==========================================
-- 1. PENGAMAN & PERAPIHAN DATA
-- ==========================================
-- Tidak melakukan TRUNCATE agar data yang sudah ada tidak hilang

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

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'partner_locations' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE public.partner_locations ADD COLUMN city_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'partner_locations_city_id_fkey') THEN
    ALTER TABLE public.partner_locations
    ADD CONSTRAINT partner_locations_city_id_fkey
    FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Testimonials: Hapus duplikat lalu pasang constraint unik (name, content)
-- Hapus duplikat (menyisakan satu entri untuk kombinasi nama+content)
DELETE FROM public.testimonials t
USING public.testimonials t2
WHERE t.name = t2.name
  AND COALESCE(t.content, '') = COALESCE(t2.content, '')
  AND t.id > t2.id;

-- Pasang constraint unik jika belum ada
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'testimonials_name_content_key') THEN
    ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_name_content_key UNIQUE (name, content);
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
    INSERT INTO public.partner_locations (city_id, name, address, operating_hours, maps_link, latitude, longitude, is_active)
    VALUES (jakarta_id, 'Cafe Terdekat Jakarta Selatan', 'Jl. Senopati No. 10', '08:00 - 22:00', 'https://maps.google.com', -6.2294, 106.8166, true)
    ON CONFLICT (city_id, name) DO UPDATE SET
      address = EXCLUDED.address,
      operating_hours = EXCLUDED.operating_hours,
      maps_link = EXCLUDED.maps_link,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      is_active = EXCLUDED.is_active;
    
    INSERT INTO public.partner_locations (city_id, name, address, operating_hours, maps_link, latitude, longitude, is_active)
    VALUES (jakarta_id, 'Cafe Terdekat Blok M', 'Jl. Sultan Hasanudin', '09:00 - 23:00', 'https://maps.google.com', -6.2443, 106.7990, true)
    ON CONFLICT (city_id, name) DO UPDATE SET
      address = EXCLUDED.address,
      operating_hours = EXCLUDED.operating_hours,
      maps_link = EXCLUDED.maps_link,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      is_active = EXCLUDED.is_active;
  END IF;
END $$;

DO $$
DECLARE
  jakarta_id uuid;
  bandung_id uuid;
  surabaya_id uuid;
BEGIN
  SELECT id INTO jakarta_id FROM public.cities WHERE name = 'Jakarta';
  SELECT id INTO bandung_id FROM public.cities WHERE name = 'Bandung';
  SELECT id INTO surabaya_id FROM public.cities WHERE name = 'Surabaya';

  UPDATE public.partner_locations SET city_id = jakarta_id
  WHERE city_id IS NULL AND (
    name ILIKE '%jakarta%' OR address ILIKE '%jakarta%' OR
    (latitude BETWEEN -6.5 AND -6.0 AND longitude BETWEEN 106.6 AND 107.2)
  );

  UPDATE public.partner_locations SET city_id = bandung_id
  WHERE city_id IS NULL AND (
    name ILIKE '%bandung%' OR address ILIKE '%bandung%' OR
    (latitude BETWEEN -7.05 AND -6.75 AND longitude BETWEEN 107.5 AND 107.75)
  );

  UPDATE public.partner_locations SET city_id = surabaya_id
  WHERE city_id IS NULL AND (
    name ILIKE '%surabaya%' OR address ILIKE '%surabaya%' OR
    (latitude BETWEEN -7.45 AND -7.15 AND longitude BETWEEN 112.6 AND 112.85)
  );

  UPDATE public.partner_locations SET is_active = true WHERE city_id IS NOT NULL;
END $$;

-- Tambahkan lokasi untuk Bandung & Surabaya beserta koordinat
DO $$
DECLARE
  bandung_id uuid;
  surabaya_id uuid;
BEGIN
  SELECT id INTO bandung_id FROM public.cities WHERE name = 'Bandung';
  SELECT id INTO surabaya_id FROM public.cities WHERE name = 'Surabaya';

  IF bandung_id IS NOT NULL THEN
    INSERT INTO public.partner_locations (city_id, name, address, operating_hours, maps_link, latitude, longitude, is_active)
    VALUES (bandung_id, 'Cafe Terdekat Dago', 'Jl. Dago', '08:00 - 22:00', 'https://maps.google.com', -6.8899, 107.6100, true)
    ON CONFLICT (city_id, name) DO UPDATE SET
      address = EXCLUDED.address,
      operating_hours = EXCLUDED.operating_hours,
      maps_link = EXCLUDED.maps_link,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      is_active = EXCLUDED.is_active;
  END IF;

  IF surabaya_id IS NOT NULL THEN
    INSERT INTO public.partner_locations (city_id, name, address, operating_hours, maps_link, latitude, longitude, is_active)
    VALUES (surabaya_id, 'Cafe Terdekat Tunjungan', 'Jl. Tunjungan', '08:00 - 22:00', 'https://maps.google.com', -7.2569, 112.7344, true)
    ON CONFLICT (city_id, name) DO UPDATE SET
      address = EXCLUDED.address,
      operating_hours = EXCLUDED.operating_hours,
      maps_link = EXCLUDED.maps_link,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      is_active = EXCLUDED.is_active;
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
INSERT INTO public.testimonials (name, role, content, rating, is_active) VALUES
('Andi Pratama', 'Siswa SMA', 'Bimbel ini sangat membantu saya memahami materi matematika yang sulit. Tutor sabar dan menjelaskan dengan jelas.', 5, true),
('Ibu Dewi', 'Orang Tua', 'Anak saya jadi lebih semangat belajar. Sistem pembelajaran yang fleksibel sangat cocok dengan jadwal kami.', 5, true),
('Rizky Hidayat', 'Siswa SMP', 'Saya suka belajar online di sini karena tutornya asyik dan materinya mudah dipahami.', 5, true)
ON CONFLICT (name, content) DO NOTHING;

DO $$
DECLARE
  pkg_math uuid;
  pkg_english uuid;
BEGIN
  SELECT id INTO pkg_math FROM public.tutoring_packages WHERE slug = 'paket-private-matematika-sma';
  SELECT id INTO pkg_english FROM public.tutoring_packages WHERE slug = 'paket-grup-bahasa-inggris-smp';

  IF pkg_math IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.schedules WHERE package_id = pkg_math AND day_of_week = 6 AND start_time = '10:00' AND end_time = '12:00'
    ) THEN
      INSERT INTO public.schedules (package_id, day_of_week, start_time, end_time, max_students, is_available)
      VALUES (pkg_math, 6, '10:00', '12:00', NULL, true);
    END IF;
  END IF;

  IF pkg_english IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.schedules WHERE package_id = pkg_english AND day_of_week = 3 AND start_time = '16:00' AND end_time = '18:00'
    ) THEN
      INSERT INTO public.schedules (package_id, day_of_week, start_time, end_time, max_students, is_available)
      VALUES (pkg_english, 3, '16:00', '18:00', 8, true);
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.schedules WHERE package_id = pkg_english AND day_of_week = 5 AND start_time = '16:00' AND end_time = '18:00'
    ) THEN
      INSERT INTO public.schedules (package_id, day_of_week, start_time, end_time, max_students, is_available)
      VALUES (pkg_english, 5, '16:00', '18:00', 8, true);
    END IF;
  END IF;
END $$;
