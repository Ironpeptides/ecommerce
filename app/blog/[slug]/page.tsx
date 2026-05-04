import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const blogsDir = path.join(process.cwd(), "content/blogs");
  const files = fs.readdirSync(blogsDir);
  return files.map((file) => ({
    slug: file.replace(".html", ""),
  }));
}

export default async function BlogPost({ params }: Props) {
  // Resolve the Promise to get the actual slug
  const { slug } = await params;

  const filePath = path.join(process.cwd(), "content", "blogs", `${slug}.html`);

  if (!fs.existsSync(filePath)) notFound();

  const htmlContent = fs.readFileSync(filePath, "utf-8");

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </main>
  );
}