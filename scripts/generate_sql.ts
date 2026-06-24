import fs from 'fs';
import { COMPANIES, CATEGORIES } from '../lib/data';

const escapeSql = (str: any) => {
  if (typeof str === 'number') return str;
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = "-- Drop existing tables if needed\\n";
sql += "DROP TABLE IF EXISTS public.agents;\\n";
sql += "DROP TABLE IF EXISTS public.categories;\\n\\n";

sql += "-- Create profiles table\\n";
sql += "CREATE TABLE public.profiles (\\n";
sql += "  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\\n";
sql += "  full_name TEXT,\\n";
sql += "  email TEXT,\\n";
sql += "  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),\\n";
sql += "  is_admin BOOLEAN DEFAULT false,\\n";
sql += "  is_suspended BOOLEAN DEFAULT false,\\n";
sql += "  created_at TIMESTAMPTZ DEFAULT now(),\\n";
sql += "  updated_at TIMESTAMPTZ DEFAULT now()\\n";
sql += ");\\n\\n";

sql += "-- Enable RLS for profiles\\n";
sql += "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;\\n";
sql += 'CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);\\n';
sql += 'CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));\\n';
sql += 'CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);\\n\\n';

sql += "-- Create categories table\\n";
sql += "CREATE TABLE public.categories (\\n";
sql += "  id SERIAL PRIMARY KEY,\\n";
sql += "  name TEXT UNIQUE NOT NULL,\\n";
sql += "  icon TEXT NOT NULL,\\n";
sql += "  color TEXT NOT NULL,\\n";
sql += "  description TEXT\\n";
sql += ");\\n\\n";

sql += "-- Establish basic SELECT RLS for public read\\n";
sql += "ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;\\n";
sql += 'CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);\\n\\n';

sql += "-- Create agents table\\n";
sql += "CREATE TABLE public.agents (\\n";
sql += "  id SERIAL PRIMARY KEY,\\n";
sql += "  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,\\n";
sql += "  name TEXT NOT NULL,\\n";
sql += "  slug TEXT UNIQUE,\\n";
sql += "  founders TEXT,\\n";
sql += "  founder_linkedin TEXT,\\n";
sql += "  website TEXT,\\n";
sql += "  city TEXT,\\n";
sql += "  raw_industry TEXT,\\n";
sql += "  category TEXT REFERENCES public.categories(name),\\n";
sql += "  sub_category TEXT,\\n";
sql += "  one_liner TEXT,\\n";
sql += "  summary TEXT,\\n";
sql += "  description TEXT,\\n";
sql += "  logo_url TEXT,\\n";
sql += "  founded_year INTEGER,\\n";
sql += "  use_cases TEXT,\\n";
sql += "  pricing TEXT,\\n";
sql += "  rating DECIMAL(3,2) DEFAULT 0,\\n";
sql += "  reviews_count INTEGER DEFAULT 0,\\n";
sql += "  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),\\n";
sql += "  rejection_reason TEXT,\\n";
sql += "  is_verified BOOLEAN DEFAULT false,\\n";
sql += "  is_pinned_trending BOOLEAN DEFAULT false,\\n";
sql += "  trending_score NUMERIC DEFAULT 0,\\n";
sql += "  created_at TIMESTAMPTZ DEFAULT now(),\\n";
sql += "  updated_at TIMESTAMPTZ DEFAULT now()\\n";
sql += ");\\n\\n";

sql += "-- Establish basic SELECT RLS for public read\\n";
sql += "ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;\\n";
sql += 'CREATE POLICY "Enable read access for all users" ON public.agents FOR SELECT USING (true);\\n';
sql += 'CREATE POLICY "Vendors can manage their own agents" ON public.agents FOR ALL USING (auth.uid() = user_id);\\n\\n';

sql += "-- Function to handle new user profile creation\\n";
sql += "CREATE OR REPLACE FUNCTION public.handle_new_user()\\n";
sql += "RETURNS trigger AS $$\\n";
sql += "BEGIN\\n";
sql += "  INSERT INTO public.profiles (id, full_name, email, role, is_admin)\\n";
sql += "  VALUES (\\n";
sql += "    new.id,\\n";
sql += "    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),\\n";
sql += "    new.email,\\n";
sql += "    COALESCE(new.raw_user_meta_data->>'role', 'user'),\\n";
sql += "    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)\\n";
sql += "  );\\n";
sql += "  RETURN new;\\n";
sql += "END;\\n";
sql += "$$ LANGUAGE plpgsql SECURITY DEFINER;\\n\\n";

sql += "-- Trigger for new user signup\\n";
sql += "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;\\n";
sql += "CREATE TRIGGER on_auth_user_created\\n";
sql += "  AFTER INSERT ON auth.users\\n";
sql += "  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();\\n\\n";

sql += "-- Insert Categories\\n";
CATEGORIES.forEach(cat => {
  sql += "INSERT INTO public.categories (name, icon, color, description) VALUES (" + escapeSql(cat.name) + ", " + escapeSql(cat.icon) + ", " + escapeSql(cat.color) + ", " + escapeSql(cat.desc) + ");\\n";
});

sql += "\\n-- Insert Agents\\n";
COMPANIES.forEach(comp => {
  const slug = comp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  sql += "INSERT INTO public.agents (id, name, slug, founders, founder_linkedin, website, city, raw_industry, category, sub_category, summary, one_liner, description, founded_year, use_cases, pricing, rating, reviews_count) VALUES (" + 
    comp.id + ", " + 
    escapeSql(comp.name) + ", " + 
    escapeSql(slug) + ", " + 
    escapeSql(comp.founders) + ", " + 
    escapeSql(comp.founderLinkedin) + ", " + 
    escapeSql(comp.website) + ", " + 
    escapeSql(comp.city) + ", " + 
    escapeSql(comp.rawIndustry) + ", " + 
    escapeSql(comp.category) + ", " + 
    escapeSql(comp.subCategory) + ", " + 
    escapeSql(comp.summary) + ", " + 
    escapeSql(comp.summary) + ", " + // use summary as one_liner for seed
    escapeSql(comp.summary) + ", " + // use summary as description for seed
    comp.foundedYear + ", " + 
    escapeSql(comp.useCases) + ", " + 
    escapeSql(comp.pricing) + ", " + 
    comp.rating + ", " + 
    (comp.reviews || 0) + ");\\n";
});

sql += "\\n-- Update sequence for agents table\\n";
sql += "SELECT setval('agents_id_seq', (SELECT MAX(id) FROM public.agents));\\n";

fs.writeFileSync('./scripts/seed.sql', sql);
console.log('Successfully generated scripts/seed.sql!');
