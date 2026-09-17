-- Preferred format on the book waitlist becomes multi-select: someone may want the print
-- edition AND the audiobook. The original single-value `format_preference` column stays and
-- is kept in sync with the FIRST selection, so existing reads keep working; new code should
-- read `format_preferences`.
alter table public.book_waitlist_requests
  add column if not exists format_preferences text[] not null default '{}'::text[];

-- Backfill the array from the single column for rows captured before this change.
update public.book_waitlist_requests
set format_preferences = array[format_preference]
where format_preference is not null
  and (format_preferences is null or cardinality(format_preferences) = 0);

-- Guard the array contents to the same option set as the single column.
alter table public.book_waitlist_requests
  drop constraint if exists book_waitlist_requests_formats_check;
alter table public.book_waitlist_requests
  add constraint book_waitlist_requests_formats_check
  check (format_preferences <@ array['ebook', 'print', 'audiobook', 'any']::text[]);
