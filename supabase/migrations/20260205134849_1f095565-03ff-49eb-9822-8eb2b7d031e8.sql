-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- RLS policy for user_roles (only admins can manage)
CREATE POLICY "Admins can manage user_roles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subjects"
ON public.subjects
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage subjects"
ON public.subjects
FOR ALL
USING (public.is_admin());

-- Create education_levels table
CREATE TABLE public.education_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.education_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view education levels"
ON public.education_levels
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage education levels"
ON public.education_levels
FOR ALL
USING (public.is_admin());

-- Insert default education levels
INSERT INTO public.education_levels (name, code, sort_order) VALUES
  ('SD', 'sd', 1),
  ('SMP', 'smp', 2),
  ('SMA', 'sma', 3),
  ('Umum', 'umum', 4);

-- Create cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active cities"
ON public.cities
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage cities"
ON public.cities
FOR ALL
USING (public.is_admin());

-- Create partner_locations table
CREATE TABLE public.partner_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  operating_hours TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active locations"
ON public.partner_locations
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage locations"
ON public.partner_locations
FOR ALL
USING (public.is_admin());

-- Create learning mode enum
CREATE TYPE public.learning_mode AS ENUM ('online', 'offline');

-- Create learning place enum
CREATE TYPE public.learning_place AS ENUM ('student_home', 'partner_cafe');

-- Create learning system enum
CREATE TYPE public.learning_system AS ENUM ('private', 'group');

-- Create tutoring_packages table
CREATE TABLE public.tutoring_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  level_id UUID REFERENCES public.education_levels(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.partner_locations(id) ON DELETE SET NULL,
  mode learning_mode NOT NULL,
  place learning_place,
  system learning_system NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  session_duration INTEGER NOT NULL DEFAULT 90,
  total_sessions INTEGER NOT NULL DEFAULT 8,
  group_quota INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutoring_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
ON public.tutoring_packages
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage packages"
ON public.tutoring_packages
FOR ALL
USING (public.is_admin());

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.tutoring_packages(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_students INTEGER,
  current_students INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available schedules"
ON public.schedules
FOR SELECT
USING (is_available = true OR public.is_admin());

CREATE POLICY "Admins can manage schedules"
ON public.schedules
FOR ALL
USING (public.is_admin());

-- Create registration status enum
CREATE TYPE public.registration_status AS ENUM ('new', 'contacted', 'active', 'completed');

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.tutoring_packages(id) ON DELETE SET NULL NOT NULL,
  student_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  preferred_schedule TEXT,
  detailed_location TEXT,
  status registration_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a registration (public form)
CREATE POLICY "Anyone can submit registration"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage registrations
CREATE POLICY "Admins can view registrations"
ON public.registrations
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
USING (public.is_admin());

-- Create testimonials table (admin managed)
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (public.is_admin());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.tutoring_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();