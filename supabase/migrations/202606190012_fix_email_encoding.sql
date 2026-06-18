-- Fix Windows-1252 mojibake in email templates.
-- Root cause: smart-quote characters (em dashes, curly quotes, etc.) were stored
-- as their UTF-8 byte sequences misinterpreted through Windows-1252, producing
-- garbled multi-character sequences like "â€"" instead of "—".
--
-- All search / replacement values use chr() with decimal Unicode code points
-- to avoid any file-encoding ambiguity in the SQL parser.
--
-- Mojibake mapping (UTF-8 bytes decoded as Windows-1252):
--   U+2014 — (em dash)         E2 80 94  →  chr(226)||chr(8364)||chr(8221)
--   U+2013 – (en dash)         E2 80 93  →  chr(226)||chr(8364)||chr(8220)
--   U+2018 ' (left  sq-quote)  E2 80 98  →  chr(226)||chr(8364)||chr(732)
--   U+2019 ' (right sq-quote)  E2 80 99  →  chr(226)||chr(8364)||chr(8482)
--   U+201C " (left  dq-quote)  E2 80 9C  →  chr(226)||chr(8364)||chr(339)
--   U+2026 … (ellipsis)        E2 80 A6  →  chr(226)||chr(8364)||chr(166)
--   U+2022 • (bullet)          E2 80 A2  →  chr(226)||chr(8364)||chr(162)
--   U+00A0   (NBSP)            C2 A0     →  chr(194)||chr(160)
--   U+201D " (right dq-quote)  E2 80 9D  →  chr(226)||chr(8364)  [0x9D undefined in cp1252]

DO $$
DECLARE
  -- Run the same nested replace() chain on every affected column.
  -- Specific 3-char sequences are handled innermost (first); the bare
  -- 2-char catch-all for right double-quote runs outermost (last).
  fix TEXT;
BEGIN
  -- Build the fix expression as a reusable text snippet (column placeholder = COLIDX)
  -- We will substitute the real column name via format().

  -- Apply to html_body
  UPDATE email_templates
  SET html_body = replace(replace(replace(replace(replace(replace(replace(replace(replace(
    html_body,
    chr(226)||chr(8364)||chr(8221), chr(8212)),   -- â€" -> em dash
    chr(226)||chr(8364)||chr(8220), chr(8211)),   -- â€" -> en dash
    chr(226)||chr(8364)||chr(732),  chr(8216)),   -- â€˜ -> left single quote
    chr(226)||chr(8364)||chr(8482), chr(8217)),   -- â€™ -> right single quote
    chr(226)||chr(8364)||chr(339),  chr(8220)),   -- â€œ -> left double quote
    chr(226)||chr(8364)||chr(166),  chr(8230)),   -- â€¦ -> ellipsis
    chr(226)||chr(8364)||chr(162),  chr(8226)),   -- â€¢ -> bullet
    chr(194)||chr(160),             ' '),         -- Â + NBSP -> space
    chr(226)||chr(8364),            chr(8221))    -- â€  -> right double quote (catch-all)
  WHERE html_body IS NOT NULL;

  -- Apply to text_body
  UPDATE email_templates
  SET text_body = replace(replace(replace(replace(replace(replace(replace(replace(replace(
    text_body,
    chr(226)||chr(8364)||chr(8221), chr(8212)),
    chr(226)||chr(8364)||chr(8220), chr(8211)),
    chr(226)||chr(8364)||chr(732),  chr(8216)),
    chr(226)||chr(8364)||chr(8482), chr(8217)),
    chr(226)||chr(8364)||chr(339),  chr(8220)),
    chr(226)||chr(8364)||chr(166),  chr(8230)),
    chr(226)||chr(8364)||chr(162),  chr(8226)),
    chr(194)||chr(160),             ' '),
    chr(226)||chr(8364),            chr(8221))
  WHERE text_body IS NOT NULL;

  -- Apply to subject
  UPDATE email_templates
  SET subject = replace(replace(replace(replace(replace(replace(replace(replace(replace(
    subject,
    chr(226)||chr(8364)||chr(8221), chr(8212)),
    chr(226)||chr(8364)||chr(8220), chr(8211)),
    chr(226)||chr(8364)||chr(732),  chr(8216)),
    chr(226)||chr(8364)||chr(8482), chr(8217)),
    chr(226)||chr(8364)||chr(339),  chr(8220)),
    chr(226)||chr(8364)||chr(166),  chr(8230)),
    chr(226)||chr(8364)||chr(162),  chr(8226)),
    chr(194)||chr(160),             ' '),
    chr(226)||chr(8364),            chr(8221))
  WHERE subject IS NOT NULL;

  -- Apply to preheader (may be null / not present on older rows — WHERE guards it)
  UPDATE email_templates
  SET preheader = replace(replace(replace(replace(replace(replace(replace(replace(replace(
    preheader,
    chr(226)||chr(8364)||chr(8221), chr(8212)),
    chr(226)||chr(8364)||chr(8220), chr(8211)),
    chr(226)||chr(8364)||chr(732),  chr(8216)),
    chr(226)||chr(8364)||chr(8482), chr(8217)),
    chr(226)||chr(8364)||chr(339),  chr(8220)),
    chr(226)||chr(8364)||chr(166),  chr(8230)),
    chr(226)||chr(8364)||chr(162),  chr(8226)),
    chr(194)||chr(160),             ' '),
    chr(226)||chr(8364),            chr(8221))
  WHERE preheader IS NOT NULL;

END $$;
