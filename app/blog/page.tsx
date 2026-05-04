import fs from "fs";
import path from "path";
import Link from "next/link";

export default function BlogIndex() {
  const blogsDir = path.join(process.cwd(), "content/blogs");
  const files = fs.readdirSync(blogsDir);

  const posts = files.map((file) => ({
    slug: file.replace(".html", ""),
    title: file.replace(".html", "").replace(/-/g, " "),
  }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 uppercase tracking-widest">Blog</h1>
      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block p-6 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
            >
              <span className="text-white font-bold capitalize text-lg">{post.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}