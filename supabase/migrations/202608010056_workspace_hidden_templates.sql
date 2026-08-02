-- Lets Super Admins hide (delete) built-in Workspace templates from the gallery.
-- Templates are code-defined; hiding is persisted here and is reversible (restore).

create table if not exists public.workspace_hidden_templates (
  template_id text primary key,
  hidden_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.workspace_hidden_templates enable row level security;
drop policy if exists "workspace_hidden_templates_read" on public.workspace_hidden_templates;
create policy "workspace_hidden_templates_read" on public.workspace_hidden_templates for select using (public.can_access_dashboard());
drop policy if exists "workspace_hidden_templates_write" on public.workspace_hidden_templates;
create policy "workspace_hidden_templates_write" on public.workspace_hidden_templates for all using (public.can_manage_users()) with check (public.can_manage_users());

-- Per-user favorite templates (star), so favorites sort to the front of the gallery.
create table if not exists public.workspace_template_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, template_id)
);

alter table public.workspace_template_favorites enable row level security;
drop policy if exists "workspace_template_favorites_read" on public.workspace_template_favorites;
create policy "workspace_template_favorites_read" on public.workspace_template_favorites for select using (public.can_access_dashboard());
drop policy if exists "workspace_template_favorites_write" on public.workspace_template_favorites;
create policy "workspace_template_favorites_write" on public.workspace_template_favorites for all using (public.can_manage_users()) with check (public.can_manage_users());
