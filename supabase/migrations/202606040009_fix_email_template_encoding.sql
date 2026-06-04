create or replace function pg_temp.mjg_repair_mojibake(value text)
returns text
language plpgsql
as $$
begin
  if value is null then
    return null;
  end if;

  begin
    return convert_from(convert_to(value, 'WIN1252'), 'UTF8');
  exception when others then
    return value;
  end;
end;
$$;

update public.email_templates
set
  subject = pg_temp.mjg_repair_mojibake(subject),
  preheader = pg_temp.mjg_repair_mojibake(preheader),
  html_body = pg_temp.mjg_repair_mojibake(html_body),
  text_body = pg_temp.mjg_repair_mojibake(text_body),
  updated_at = now()
where
  subject like '%' || chr(226) || '%' or subject like '%' || chr(194) || '%' or
  preheader like '%' || chr(226) || '%' or preheader like '%' || chr(194) || '%' or
  html_body like '%' || chr(226) || '%' or html_body like '%' || chr(194) || '%' or
  text_body like '%' || chr(226) || '%' or text_body like '%' || chr(194) || '%';

update public.email_journey_events
set
  subject = pg_temp.mjg_repair_mojibake(subject),
  updated_at = now()
where subject like '%' || chr(226) || '%' or subject like '%' || chr(194) || '%';
