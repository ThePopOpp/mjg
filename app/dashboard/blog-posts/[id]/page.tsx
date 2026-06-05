import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPostActions } from "@/components/blog-posts/blog-post-actions";
import { BlogPostForm } from "@/components/blog-posts/blog-post-form";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { getBlogAdminData, getBlogPostById } from "@/lib/content/blog";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, data, profile] = await Promise.all([getBlogPostById(id), getBlogAdminData(), getCurrentProfile()]);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard/blog-posts">Back to Blog Posts</Link>
        <SectionHeader title={post.title} description="Edit, schedule, deploy, hide, archive, delete, or convert this post into an email template." />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post actions</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostActions postId={post.id} />
        </CardContent>
      </Card>

      <BlogPostForm actionToken={profile ? createAdminActionToken(profile) : ""} post={post} categories={data.categories as any[]} />
    </div>
  );
}
