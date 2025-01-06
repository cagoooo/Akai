import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ShareURLOptions {
  url: string;
  title: string;
  description?: string;
}

export function generateShareUrls(options: ShareURLOptions) {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedTitle = encodeURIComponent(options.title);
  const encodedDescription = options.description ? encodeURIComponent(options.description) : '';

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
  };
}