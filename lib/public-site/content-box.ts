/**
 * The marketing site's content box: the same max-width and gutters as the
 * navigation bar's inner container, so page content lines up with the logo on
 * the left and the theme toggle on the right.
 *
 * It lives in its own module, with no imports, on purpose. The obvious home is
 * components/public-site/site-shell.tsx — but that imports static-pages, which
 * reads the filesystem, so a `"use client"` component that wanted this one
 * string pulled node:fs into the browser bundle and the build failed with
 * "Reading from node:fs is not handled by plugins". A constant both sides need
 * belongs somewhere neither side has to pay for.
 */
export const SITE_CONTENT_BOX = "mx-auto w-full max-w-[1160px] px-8";
