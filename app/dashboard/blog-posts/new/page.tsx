import Link from "next/link";
import { BlogPostForm } from "@/components/blog-posts/blog-post-form";
import { SectionHeader } from "@/components/dashboard/section-header";
import { getBlogAdminData } from "@/lib/content/blog";

export default async function NewBlogPostPage() {
  const data = await getBlogAdminData();

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard/blog-posts">Back to Blog Posts</Link>
        <SectionHeader title="New Blog Post" description="Create a public Resource post and optionally convert it into an email template." />
      </div>
      <BlogPostForm categories={data.categories as any[]} />
    </div>
  );
}
