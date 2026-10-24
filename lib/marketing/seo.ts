import type { Metadata } from "next";
import type { SeoContent } from "./content/scopes/shared";

/**
 * Page metadata from a scope's editable `_seo` section. The title is used bare
 * on the homepage and through the "%s | Michael J. Gauthier" template elsewhere.
 * `preview` pages are never indexed and point their canonical at the real page.
 */
export function marketingMetadata(seo: SeoContent, path: string, opts: { preview?: boolean; home?: boolean } = {}): Metadata {
  const image = seo.ogImage?.src ? [{ url: seo.ogImage.src, alt: seo.ogImage.alt }] : undefined;
  return {
    title: opts.home ? { absolute: seo.title } : seo.title,
    description: seo.description || undefined,
    alternates: { canonical: path },
    robots: opts.preview || seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title: seo.title, description: seo.description || undefined, url: path, images: image },
    twitter: { title: seo.title, description: seo.description || undefined, images: image?.map((i) => i.url) },
  };
}
