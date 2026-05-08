import fs from "fs";
import path from "path";
import Link from "next/link";
import { BlogSearch } from "@/components/blogs/blog-search";

// Get blogs with metadata from the file system
function getBlogPosts() {
  const blogsDir = path.join(process.cwd(), "content/blogs");
  const files = fs.readdirSync(blogsDir);

  const posts = files
    .map((file) => {
      const slug = file.replace(".html", "");
      const filePath = path.join(blogsDir, file);
      const stats = fs.statSync(filePath);
      return {
        slug,
        title: file.replace(".html", "").replace(/-/g, " "),
        date: stats.mtime.toISOString(), // last modified time
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // newest first

  return posts;
}

export default function BlogIndex() {
  const posts = getBlogPosts();
  const featuredPost = posts[0]; // most recent as featured

  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest">
          Blog
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team.
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Featured
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 capitalize group-hover:text-blue-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  {new Date(featuredPost.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-5xl hidden md:block opacity-20 group-hover:opacity-40 transition-opacity">
                📌
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Search + Grid */}
      <BlogSearch posts={posts} />
    </main>
  );
}