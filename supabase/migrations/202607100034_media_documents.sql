-- Allow "document" media assets (Resources tab in Media Studio).
-- Documents are PDFs, images, office docs, etc. uploaded by the team as
-- reference material / feature requests.

alter table public.media_assets
  drop constraint if exists media_assets_asset_type_check;

alter table public.media_assets
  add constraint media_assets_asset_type_check
  check (asset_type in ('audio', 'video', 'photo', 'gallery', 'document'));
