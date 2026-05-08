"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Post = {
  slug: string;
  title: string;
  date: string;
};

export function BlogSearch({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const filtered = posts.filter((post) =>
    post.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Post grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-5 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-white capitalize group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <time className="text-xs text-gray-500 mt-2 block">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">
          No posts match your search.
        </p>
      )}
    </div>
  );
}