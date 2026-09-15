-- Trilha de Estudos V8 Professional
-- Multiusuário + sincronização por user_id + caixa individual para ChatGPT
-- Execute este arquivo no Supabase > SQL Editor.

begin;

-- -----------------------------------------------------------------------------
-- 1) Tabela de sincronização atual: garante isolamento por usuário
-- -----------------------------------------------------------------------------
create table if not exists public.trilha_items_v5 (
  user_id uuid not null default auth.uid(),
  id text not null,
  bucket text not null,
  payload text,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.trilha_items_v5 add column if not exists user_id uuid;
alter table public.trilha_items_v5 add column if not exists id text;
alter table public.trilha_items_v5 add column if not exists bucket text;
alter table public.trilha_items_v5 add column if not exists payload text;
alter table public.trilha_items_v5 add column if not exists updated_at bigint default 0;
alter table public.trilha_items_v5 add column if not exists deleted boolean default false;
alter table public.trilha_items_v5 alter column user_id set default auth.uid();

create unique index if not exists trilha_items_v5_user_id_id_bucket_uq
  on public.trilha_items_v5(user_id, id, bucket);
create index if not exists trilha_items_v5_user_bucket_updated_idx
  on public.trilha_items_v5(user_id, bucket, updated_at);

alter table public.trilha_items_v5 enable row level security;

-- Esta tabela pertence somente à Trilha. Remove políticas antigas da V5/V7 para
-- evitar que uma política permissiva antiga anule o isolamento por user_id.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
     where schemaname='public' and tablename='trilha_items_v5'
  loop
    execute format('drop policy if exists %I on public.trilha_items_v5', p.policyname);
  end loop;
end $$;

drop policy if exists "trilha_items_v5_select_own" on public.trilha_items_v5;
drop policy if exists "trilha_items_v5_insert_own" on public.trilha_items_v5;
drop policy if exists "trilha_items_v5_update_own" on public.trilha_items_v5;
drop policy if exists "trilha_items_v5_delete_own" on public.trilha_items_v5;

create policy "trilha_items_v5_select_own"
  on public.trilha_items_v5 for select
  using (auth.uid() = user_id);
create policy "trilha_items_v5_insert_own"
  on public.trilha_items_v5 for insert
  with check (auth.uid() = user_id);
create policy "trilha_items_v5_update_own"
  on public.trilha_items_v5 for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "trilha_items_v5_delete_own"
  on public.trilha_items_v5 for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 1.1) Migração segura de dados antigos (V5/V7 -> V8)
-- Registros antigos podem não ter user_id. O app chama esta função após o login
-- e só reivindica linhas do bucket conhecido pela senha de sincronização.
-- -----------------------------------------------------------------------------
create or replace function public.trilha_claim_legacy(p_bucket text)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer := 0;
begin
  if v_uid is null then
    raise exception 'autenticacao obrigatoria';
  end if;
  if p_bucket is null or length(trim(p_bucket)) < 16 then
    raise exception 'bucket invalido';
  end if;

  update public.trilha_items_v5
     set user_id = v_uid
   where user_id is null
     and bucket = trim(p_bucket);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.trilha_claim_legacy(text) from public;
grant execute on function public.trilha_claim_legacy(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2) Código individual do Cadastro Direto pelo ChatGPT
--    O código não é o UUID do usuário; ele só mapeia para o user_id internamente.
-- -----------------------------------------------------------------------------
create table if not exists public.trilha_ai_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  integration_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trilha_ai_profiles enable row level security;

drop policy if exists "trilha_ai_profiles_select_own" on public.trilha_ai_profiles;
drop policy if exists "trilha_ai_profiles_insert_own" on public.trilha_ai_profiles;
drop policy if exists "trilha_ai_profiles_update_own" on public.trilha_ai_profiles;

create policy "trilha_ai_profiles_select_own"
  on public.trilha_ai_profiles for select
  using (auth.uid() = user_id);
create policy "trilha_ai_profiles_insert_own"
  on public.trilha_ai_profiles for insert
  with check (auth.uid() = user_id);
create policy "trilha_ai_profiles_update_own"
  on public.trilha_ai_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3) Caixa individual para cadastros enviados por IA
-- -----------------------------------------------------------------------------
create table if not exists public.trilha_ai_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  source text not null default 'chatgpt',
  status text not null default 'pending' check (status in ('pending','reviewing','consumed','cancelled')),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create index if not exists trilha_ai_inbox_user_status_created_idx
  on public.trilha_ai_inbox(user_id, status, created_at);

alter table public.trilha_ai_inbox enable row level security;

drop policy if exists "trilha_ai_inbox_select_own" on public.trilha_ai_inbox;
drop policy if exists "trilha_ai_inbox_insert_own" on public.trilha_ai_inbox;
drop policy if exists "trilha_ai_inbox_update_own" on public.trilha_ai_inbox;
drop policy if exists "trilha_ai_inbox_delete_own" on public.trilha_ai_inbox;

create policy "trilha_ai_inbox_select_own"
  on public.trilha_ai_inbox for select
  using (auth.uid() = user_id);
create policy "trilha_ai_inbox_insert_own"
  on public.trilha_ai_inbox for insert
  with check (auth.uid() = user_id);
create policy "trilha_ai_inbox_update_own"
  on public.trilha_ai_inbox for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "trilha_ai_inbox_delete_own"
  on public.trilha_ai_inbox for delete
  using (auth.uid() = user_id);

-- Endpoint preparado para uma integração futura/externa usar apenas o código individual.
-- O código funciona como segredo de integração; não publique-o.
create or replace function public.trilha_ai_enqueue(p_code text, p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid;
  v_id uuid;
begin
  if p_code is null or length(trim(p_code)) < 20 then
    raise exception 'codigo de integracao invalido';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text) > 250000 then
    raise exception 'payload invalido ou muito grande';
  end if;

  select user_id into v_user
    from public.trilha_ai_profiles
   where integration_code = trim(p_code)
   limit 1;

  if v_user is null then
    raise exception 'codigo de integracao nao encontrado';
  end if;

  -- Proteção simples contra spam caso o código seja exposto.
  if (select count(*) from public.trilha_ai_inbox
       where user_id = v_user and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'limite temporario de envios atingido';
  end if;

  insert into public.trilha_ai_inbox(user_id, payload, source, status)
  values (v_user, p_payload, 'chatgpt', 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.trilha_ai_enqueue(text, jsonb) from public;
grant execute on function public.trilha_ai_enqueue(text, jsonb) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4) Arquivos: cada caminho começa pelo UUID do usuário
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trilha-files','trilha-files',false)
on conflict (id) do update set public = false;

-- Remove somente políticas antigas relacionadas ao bucket da Trilha; não toca em
-- políticas de outros buckets/projetos que possam existir no mesmo Supabase.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
     where schemaname='storage' and tablename='objects'
       and (coalesce(qual,'') ilike '%trilha-files%' or coalesce(with_check,'') ilike '%trilha-files%')
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

drop policy if exists "trilha_files_select_own_v8" on storage.objects;
drop policy if exists "trilha_files_insert_own_v8" on storage.objects;
drop policy if exists "trilha_files_update_own_v8" on storage.objects;
drop policy if exists "trilha_files_delete_own_v8" on storage.objects;

create policy "trilha_files_select_own_v8"
  on storage.objects for select
  using (
    bucket_id = 'trilha-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "trilha_files_insert_own_v8"
  on storage.objects for insert
  with check (
    bucket_id = 'trilha-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "trilha_files_update_own_v8"
  on storage.objects for update
  using (
    bucket_id = 'trilha-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'trilha-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "trilha_files_delete_own_v8"
  on storage.objects for delete
  using (
    bucket_id = 'trilha-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

commit;
