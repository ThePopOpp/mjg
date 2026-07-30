import Link from "next/link";
import { CalendarClock, FileText, Plus, Send } from "lucide-react";
import { BlogPostViews, type BlogPostRow } from "@/components/blog-posts/blog-post-views";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogAdminData, normalizePostTags } from "@/lib/content/blog";

export default async function BlogPostsPage() {
  const data = await getBlogAdminData();
  const posts = data.posts as any[];
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const emailLinked = posts.filter((post) => post.linked_email_template_id).length;

  const rows: BlogPostRow[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? null,
    status: post.status,
    featured_image_url: post.featured_image_url ?? null,
    author_name: post.author_name ?? null,
    category_name: post.category?.name ?? null,
    tags: normalizePostTags(post).map((t: any) => ({ id: t.id, name: t.name })),
    date: post.publish_at ?? post.created_at ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader title="Blog Posts" description="Create, schedule, deploy, hide, archive, and convert posts into email templates." />
        <Button asChild>
          <Link href="/dashboard/blog-posts/new">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Published" value={published} icon={FileText} detail="Live on Resources" />
        <SummaryCard title="Drafts" value={drafts} icon={FileText} detail="Needs review" />
        <SummaryCard title="Scheduled" value={scheduled} icon={CalendarClock} detail="Future publish dates" />
        <SummaryCard title="Email-ready" value={emailLinked} icon={Send} detail="Linked templates" />
      </div>

      {posts.length ? <BlogPostViews posts={rows} /> : null}

      {!posts.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No blog posts yet. Create the first Stewardship Blueprint resource.</CardContent>
        </Card>
      ) : null}

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}

function SummaryCard({ title, value, detail, icon: Icon }: { title: string; value: number; detail: string; icon: any }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="rounded-md bg-muted p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
