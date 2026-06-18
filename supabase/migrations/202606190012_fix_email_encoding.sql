-- Fix UTF-8 mojibake in email templates
-- Caused by Windows-1252 interpretation of UTF-8 bytes.
-- Most common patterns from smart-quote pasting in word processors.
-- Order matters: more specific sequences are replaced first (inner calls),
-- bare â€ (right double quote) is replaced last (outer call).

DO $$
DECLARE
  cols TEXT[] := ARRAY['html_body', 'text_body', 'subject', 'preheader'];
  col  TEXT;
  sql  TEXT;
BEGIN
  FOREACH col IN ARRAY cols LOOP
    sql := format(
      $f$
      UPDATE email_templates SET %I =
        replace(replace(replace(replace(replace(replace(replace(replace(replace(%I,
          'â€"',  '—'),   -- U+2014 em dash
          'â€"',  '–'),   -- U+2013 en dash
          'â€˜',  '''),   -- U+2018 left single quote
          'â€™',  '''),   -- U+2019 right single quote / apostrophe
          'â€œ',  '"'),   -- U+201C left double quote
          'â€¦',  '…'),   -- U+2026 ellipsis
          'â€¢',  '•'),   -- U+2022 bullet
          'Â ',   ' '),   -- U+00A0 non-breaking space
          'â€',   '"')    -- U+201D right double quote (bare, handled last)
      WHERE %I IS NOT NULL
        AND (%I LIKE '%%â€%%' OR %I LIKE '%%Â %%')
      $f$,
      col, col, col, col, col
    );
    EXECUTE sql;
  END LOOP;
END $$;
