import Link from "next/link";
import { CalendarClock, FileText, Plus, Send, Tags } from "lucide-react";
import { BlogPostActions } from "@/components/blog-posts/blog-post-actions";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogAdminData, normalizePostTags } from "@/lib/content/blog";

export default async function BlogPostsPage() {
  const data = await getBlogAdminData();
  const posts = data.posts as any[];
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const emailLinked = posts.filter((post) => post.linked_email_template_id).length;

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

      <div className="grid gap-4 xl:grid-cols-2">
        {posts.map((post) => {
          const tags = normalizePostTags(post);
          return (
            <Card key={post.id} className="overflow-hidden">
              {post.featured_image_url ? (
                <div className="relative aspect-[16/7] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.featured_image_url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">
                      <Link className="hover:underline" href={`/dashboard/blog-posts/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription>
                      /resources/{post.slug} · {post.author_name ?? "Michael J. Gauthier"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{post.excerpt || "No excerpt yet."}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {post.category?.name ? <span className="rounded-md bg-muted px-2 py-1">{post.category.name}</span> : null}
                  {tags.map((tag: any) => <span key={tag.id} className="rounded-md bg-muted px-2 py-1"><Tags className="mr-1 inline h-3 w-3" />{tag.name}</span>)}
                </div>
                <BlogPostActions postId={post.id} slug={post.slug} title={post.title} />
              </CardContent>
            </Card>
          );
        })}
      </div>

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
