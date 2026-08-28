-- Öğrenci onboarding (ilk kayıt) profil bilgileri
create table if not exists public.student_profiles (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null unique,
  height_cm numeric(5,1),
  birth_date date,
  gender text check (gender in ('male', 'female')),
  experience text check (experience in ('beginner', '1-3years', '3plus')),
  goal text check (goal in ('muscle_gain', 'fat_loss', 'recomposition', 'strength')),
  initial_weight numeric(5,1),
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  neck_cm numeric(5,1),
  right_upper_arm_cm numeric(5,1),
  left_upper_arm_cm numeric(5,1),
  right_thigh_cm numeric(5,1),
  left_thigh_cm numeric(5,1),
  right_calf_cm numeric(5,1),
  left_calf_cm numeric(5,1),
  body_fat_percentage numeric(4,1),
  photo_front_path text,
  photo_side_path text,
  photo_back_path text,
  injuries text,
  supplements text,
  onboarding_completed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.student_profiles enable row level security;

create policy "Öğrenci kendi profilini görebilir"
  on public.student_profiles for select
  using (auth.uid() = student_id);

create policy "Öğrenci kendi profilini oluşturabilir"
  on public.student_profiles for insert
  with check (auth.uid() = student_id);

create policy "Öğrenci kendi profilini güncelleyebilir"
  on public.student_profiles for update
  using (auth.uid() = student_id);

create policy "Koç kendi öğrencilerinin profillerini görebilir"
  on public.student_profiles for select
  using (
    exists (
      select 1 from public.coach_students
      where coach_students.coach_id = auth.uid()
        and coach_students.student_id = student_profiles.student_id
    )
  );
