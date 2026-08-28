-- Trigger fonksiyonunu güncelle - hem raw_user_meta_data hem user_metadata kontrol et
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.user_metadata->>'full_name',
      'İsimsiz'
    ),
    coalesce(
      new.raw_user_meta_data->>'role',
      new.user_metadata->>'role',
      'student'
    )
  );
  return new;
end;
$$;
