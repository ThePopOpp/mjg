import Link from "next/link";
import { BlogPostForm } from "@/components/blog-posts/blog-post-form";
import { SectionHeader } from "@/components/dashboard/section-header";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { getBlogAdminData } from "@/lib/content/blog";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const [data, profile] = await Promise.all([getBlogAdminData(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard/blog-posts">Back to Blog Posts</Link>
        <SectionHeader title="New Blog Post" description="Create a public Resource post and optionally convert it into an email template." />
      </div>
      <BlogPostForm actionToken={profile ? createAdminActionToken(profile) : ""} categories={data.categories as any[]} />
    </div>
  );
}
