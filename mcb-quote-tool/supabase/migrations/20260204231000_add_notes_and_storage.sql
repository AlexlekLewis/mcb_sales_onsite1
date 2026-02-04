-- Create storage buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;

-- Set up security policies for storage buckets
-- Allow authenticated users to upload and read their own files (or all files for now, as it's a sales tool)
create policy "Authenticated users can upload site photos"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'site-photos' );

create policy "Authenticated users can view site photos"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'site-photos' );

create policy "Authenticated users can upload voice notes"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'voice-notes' );

create policy "Authenticated users can view voice notes"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'voice-notes' );


-- Create notes table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid default auth.uid(),
  type text not null check (type in ('voice', 'photo', 'text')),
  content text, -- Transcript for voice, description/caption for photo, or body for text note
  file_path text, -- Path in storage bucket (e.g., 'images/123.png')
  customer_id uuid references public.customers(id), -- Optional link to a customer
  quote_id uuid references public.quotes(id) -- Optional link to a quote
);

-- Enable RLS
alter table public.notes enable row level security;

-- Policies for notes table
create policy "Enable read access for authenticated users"
  on public.notes for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on public.notes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Enable update access for users based on user_id"
  on public.notes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Enable delete access for users based on user_id"
  on public.notes for delete
  to authenticated
  using (auth.uid() = user_id);
