import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type BookPage = {
  id: string;
  mediaAssetId: string | null;
  imageUrl: string | null;
  heading: string;
  body: string;
  order: number;
};

export type Book = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  coverColor: string;
  pageColor: string;
  accentColor: string;
  coverAssetId: string | null;
  coverImageUrl: string | null;
  status: string;
  order: number;
  pages: BookPage[];
};

export type BookInput = {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  coverColor?: string;
  pageColor?: string;
  accentColor?: string;
  coverAssetId?: string | null;
  status?: string;
  order?: number;
};

export type BookPageInput = {
  mediaAssetId?: string | null;
  imageUrl?: string | null;
  heading?: string;
  body?: string;
};

export type BookableAsset = {
  id: string;
  title: string;
  assetType: string;
  fileUrl: string;
};

function rowToPage(r: any): BookPage {
  return {
    id: r.id as string,
    mediaAssetId: r.media_asset_id ?? null,
    imageUrl: r.image_url ?? null,
    heading: r.heading ?? "",
    body: r.body ?? "",
    order: Number(r.sort_order ?? 0),
  };
}

function rowToBook(r: any, pageRows: any[], assetUrlById: Map<string, string>): Book {
  const coverAssetId = (r.cover_asset_id ?? null) as string | null;
  const pages = pageRows
    .filter((p) => p.book_id === r.id)
    .map(rowToPage)
    // A page's own image_url wins; otherwise fall back to the linked asset's current URL, so
    // re-uploading an asset refreshes every book that uses it.
    .map((p) => ({
      ...p,
      imageUrl: p.imageUrl || (p.mediaAssetId ? assetUrlById.get(p.mediaAssetId) ?? null : null),
    }))
    .sort((a, b) => a.order - b.order);

  return {
    id: r.id as string,
    title: r.title ?? "",
    slug: r.slug ?? "",
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    coverColor: r.cover_color ?? "#111111",
    pageColor: r.page_color ?? "#faf8f4",
    accentColor: r.accent_color ?? "#c9aa70",
    coverAssetId,
    coverImageUrl: coverAssetId ? assetUrlById.get(coverAssetId) ?? null : null,
    status: r.status ?? "draft",
    order: Number(r.sort_order ?? 0),
    pages,
  };
}

function bookInputToRow(input: BookInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) row[k] = v;
  };
  set("title", input.title);
  set("slug", input.slug);
  set("subtitle", input.subtitle);
  set("description", input.description);
  set("cover_color", input.coverColor);
  set("page_color", input.pageColor);
  set("accent_color", input.accentColor);
  set("cover_asset_id", input.coverAssetId);
  set("status", input.status);
  set("sort_order", input.order);
  return row;
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "book";
}

/** Uploaded image assets that can be dropped onto a book page, newest first. */
export async function listBookableAssets(): Promise<BookableAsset[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("media_assets")
    .select("id, title, asset_type, file_url, mime_type, updated_at")
    .in("asset_type", ["photo", "document"])
    .neq("status", "deleted")
    .not("file_url", "is", null)
    .order("updated_at", { ascending: false })
    .limit(200);

  return (data ?? [])
    // Only assets a texture can actually be drawn from.
    .filter((a) => !a.mime_type || String(a.mime_type).startsWith("image/"))
    .map((a) => ({
      id: a.id as string,
      title: (a.title as string) || "Untitled",
      assetType: a.asset_type as string,
      fileUrl: a.file_url as string,
    }));
}

export async function listBooks(): Promise<Book[]> {
  const supabase = createSupabaseAdminClient();
  const { data: books, error } = await supabase
    .from("media_books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!books?.length) return [];

  const { data: pages } = await supabase
    .from("media_book_pages")
    .select("*")
    .in(
      "book_id",
      books.map((b) => b.id),
    )
    .order("sort_order", { ascending: true });

  const assetIds = new Set<string>();
  for (const b of books) if (b.cover_asset_id) assetIds.add(b.cover_asset_id as string);
  for (const p of pages ?? []) if (p.media_asset_id) assetIds.add(p.media_asset_id as string);

  const assetUrlById = new Map<string, string>();
  if (assetIds.size) {
    const { data: assets } = await supabase
      .from("media_assets")
      .select("id, file_url")
      .in("id", [...assetIds]);
    for (const a of assets ?? []) {
      if (a.file_url) assetUrlById.set(a.id as string, a.file_url as string);
    }
  }

  return books.map((b) => rowToBook(b, pages ?? [], assetUrlById));
}

async function getBook(id: string): Promise<Book> {
  const found = (await listBooks()).find((b) => b.id === id);
  if (!found) throw new Error("Book not found.");
  return found;
}

export async function createBook(input: BookInput): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  const title = input.title?.trim() || "Untitled book";
  const row = {
    ...bookInputToRow(input),
    title,
    slug: input.slug?.trim() || `${slugify(title)}-${Date.now().toString(36)}`,
  };
  const { data, error } = await supabase.from("media_books").insert(row).select("*").single();
  if (error) throw error;
  return rowToBook(data, [], new Map());
}

export async function updateBook(id: string, input: BookInput): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  const row = bookInputToRow(input);
  if (Object.keys(row).length) {
    const { error } = await supabase
      .from("media_books")
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }
  return getBook(id);
}

export async function deleteBook(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("media_books").delete().eq("id", id);
  if (error) throw error;
}

/** Append a page to the end of a book. */
export async function addBookPage(bookId: string, input: BookPageInput): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  const { data: last } = await supabase
    .from("media_book_pages")
    .select("sort_order")
    .eq("book_id", bookId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = last?.length ? Number(last[0].sort_order) + 1 : 0;

  const { error } = await supabase.from("media_book_pages").insert({
    book_id: bookId,
    media_asset_id: input.mediaAssetId ?? null,
    image_url: input.imageUrl ?? null,
    heading: input.heading ?? "",
    body: input.body ?? "",
    sort_order: nextOrder,
  });
  if (error) throw error;
  return getBook(bookId);
}

export async function updateBookPage(bookId: string, pageId: string, input: BookPageInput): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.mediaAssetId !== undefined) row.media_asset_id = input.mediaAssetId;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.heading !== undefined) row.heading = input.heading;
  if (input.body !== undefined) row.body = input.body;

  const { error } = await supabase.from("media_book_pages").update(row).eq("id", pageId).eq("book_id", bookId);
  if (error) throw error;
  return getBook(bookId);
}

export async function deleteBookPage(bookId: string, pageId: string): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("media_book_pages").delete().eq("id", pageId).eq("book_id", bookId);
  if (error) throw error;
  return getBook(bookId);
}

/** Persist a full page order (ids in the order the user arranged them). */
export async function reorderBookPages(bookId: string, pageIds: string[]): Promise<Book> {
  const supabase = createSupabaseAdminClient();
  await Promise.all(
    pageIds.map((pageId, index) =>
      supabase.from("media_book_pages").update({ sort_order: index }).eq("id", pageId).eq("book_id", bookId),
    ),
  );
  return getBook(bookId);
}
