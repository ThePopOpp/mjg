-- Email templates: explicit "test" flag so scratch / test emails are clearly
-- separated from real, production templates in the Templates manager. Existing
-- rows default to false (treated as real). Purely additive + backward
-- compatible — nothing reads this column until the UI toggle is used.

alter table public.email_templates
  add column if not exists is_test boolean not null default false;

create index if not exists email_templates_is_test_idx on public.email_templates(is_test);
