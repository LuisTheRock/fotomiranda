-- Run once in the Supabase SQL editor.
-- Sign-ups must be disabled (Authentication > Sign In / Providers) so "authenticated" means "the admin".

create table photos (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  category text not null check (category in ('casamento', 'casal', 'bebes')),
  blur text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table photos enable row level security;
create policy "public read" on photos for select using (true);
create policy "admin write" on photos for all to authenticated using (true) with check (true);

-- Public bucket: anyone can read, only the admin can write. JPEG only, 5 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'gallery');
create policy "admin delete" on storage.objects for delete to authenticated using (bucket_id = 'gallery');
