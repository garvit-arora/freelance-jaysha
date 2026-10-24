-- Public archive viewing; authenticated owners retain exclusive edit rights.
drop policy if exists "Read own media" on public.memory_media;
drop policy if exists "Public archive viewing" on public.memory_media;
grant select on public.memory_media to anon, authenticated;
create policy "Public archive viewing" on public.memory_media for select to anon, authenticated using (true);
