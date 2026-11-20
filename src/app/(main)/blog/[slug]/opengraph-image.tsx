import { notFound } from "next/navigation";
import { SITE_NAME } from "@/lib/site";
import { SHARE_IMAGE_SIZE, shareImage } from "@/lib/shareImage";
import { getAllBlogPosts, getBlogPost } from "../../data/blogPosts";

export const alt = `Blog post by ${SITE_NAME}`;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getAllBlogPosts().map(({ slug }) => ({ slug }));
}

export default async function PostOpenGraphImage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  return shareImage({ title: post.title, subtitle: `${SITE_NAME} · Blog` });
}
