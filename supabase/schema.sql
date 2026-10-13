-- ==========================================================
-- HOMEEASE DATABASE SCHEMA (SUPABASE POSTGRESQL + RLS)
-- Production-Ready Schema with Row Level Security & Seed Data
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Trigger to create profile automatically on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon_name text not null default 'Sparkles',
  image_url text not null,
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Admins have full access to categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. SERVICES TABLE
create table if not exists public.services (
  id text primary key,
  category_id text references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  duration_minutes integer not null default 60,
  rating numeric(3, 2) not null default 4.8,
  review_count integer not null default 0,
  image_url text not null,
  gallery_urls text[] default array[]::text[],
  is_popular boolean default false,
  is_active boolean default true,
  included_items text[] default array[]::text[],
  excluded_items text[] default array[]::text[],
  faqs jsonb default '[]'::jsonb,
  add_ons jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;

create policy "Active services are viewable by everyone"
  on public.services for select
  using (is_active = true or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

create policy "Admins have full CRUD on services"
  on public.services for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. BOOKINGS TABLE (Extended with Precise Location Snapshot)
create table if not exists public.bookings (
  id text primary key,
  user_id text not null,
  booking_code text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null,
  discount_amount numeric(10, 2) default 0,
  platform_fee numeric(10, 2) default 49,
  tax_amount numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null,
  coupon_code text,
  address jsonb not null,
  -- Section C: Precise Location Snapshot Columns
  address_line text,
  apartment_or_house_number text,
  building_name text,
  floor_number text,
  landmark text,
  locality text,
  city text,
  district text,
  state text default 'Gujarat',
  postal_code text,
  country text default 'India',
  latitude numeric(10, 6) not null default 21.1418,
  longitude numeric(10, 6) not null default 72.7709,
  google_place_id text,
  location_accuracy_meters numeric(8, 2),
  location_confirmed boolean not null default true,
  location_instructions text,
  scheduled_date date not null,
  scheduled_time_slot text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  payment_method text not null default 'cash' check (payment_method in ('cash', 'upi', 'card')),
  notes text,
  assigned_professional jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

create policy "Users can view their own bookings"
  on public.bookings for select
  using (
    user_id = auth.uid()::text or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create bookings"
  on public.bookings for insert
  with check (true);

create policy "Users can cancel their pending bookings"
  on public.bookings for update
  using (
    user_id = auth.uid()::text or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4b. SERVICE AREAS TABLE (Gujarat Service Coverage Configuration)
create table if not exists public.service_areas (
  id text primary key,
  city text not null,
  district text not null,
  locality text not null,
  pincode text not null,
  is_active boolean not null default true,
  supported_service_categories text[] not null default array['cat-sofa', 'cat-cleaning', 'cat-ac', 'cat-appliances']::text[],
  latitude numeric(10, 6) not null,
  longitude numeric(10, 6) not null,
  radius_km numeric(5, 2) not null default 7.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.service_areas enable row level security;

create policy "Service areas are viewable by everyone"
  on public.service_areas for select
  using (true);

create policy "Admins can manage service areas"
  on public.service_areas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4c. SERVICE ENQUIRIES TABLE (Unsupported Gujarat Area Requests)
create table if not exists public.service_enquiries (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  service_category text not null,
  full_address text not null,
  city text,
  pincode text,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'contacted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.service_enquiries enable row level security;

create policy "Enquiries can be created by any user"
  on public.service_enquiries for insert
  with check (true);

create policy "Admins can view and manage service enquiries"
  on public.service_enquiries for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. REVIEWS TABLE
create table if not exists public.reviews (
  id text primary key,
  service_id text references public.services(id) on delete cascade,
  user_id text not null,
  user_name text not null,
  service_title text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified_booking boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Reviews are readable by everyone"
  on public.reviews for select
  using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

-- 6. COUPONS TABLE
create table if not exists public.coupons (
  code text primary key,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null,
  min_order_value numeric(10, 2) default 0,
  max_discount numeric(10, 2),
  description text not null,
  is_active boolean default true
);

alter table public.coupons enable row level security;

create policy "Coupons are viewable by authenticated or anon users"
  on public.coupons for select
  using (is_active = true);

-- Performance Indexes
create index if not exists idx_services_category on public.services(category_id);
create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_scheduled_date on public.bookings(scheduled_date);
