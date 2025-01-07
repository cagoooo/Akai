import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/hooks/use-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ShareURLOptions {
  url: string;
  title: string;
  text?: string;
  description?: string;
  image?: string;
}

export function generateShareUrls(options: ShareURLOptions) {
  const params = new URLSearchParams();

  // 為每個平台添加必要的參數
  if (options.url) params.append('url', options.url);
  if (options.title) params.append('title', options.title);
  if (options.text) params.append('text', options.text);
  if (options.description) params.append('description', options.description);
  if (options.image) params.append('image', options.image);

  const twitterParams = new URLSearchParams();
  twitterParams.append('url', options.url);
  twitterParams.append('text', options.text || options.title);
  if (options.image) twitterParams.append('image', options.image);

  const facebookParams = new URLSearchParams();
  facebookParams.append('u', options.url);

  const linkedinParams = new URLSearchParams();
  linkedinParams.append('url', options.url);
  linkedinParams.append('title', options.title);
  if (options.description) linkedinParams.append('summary', options.description);

  const lineParams = new URLSearchParams();
  lineParams.append('url', options.url);
  if (options.text) lineParams.append('text', options.text);

  return {
    twitter: `https://twitter.com/intent/tweet?${twitterParams.toString()}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?${facebookParams.toString()}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&${linkedinParams.toString()}`,
    line: `https://social-plugins.line.me/lineit/share?${lineParams.toString()}`,
  };
}

// Error handling utilities
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '發生未知錯誤';
}

export function showErrorToast(error: unknown) {
  const message = formatErrorMessage(error);
  toast({
    title: '錯誤',
    description: message,
    variant: 'destructive',
  });
}

export function showSuccessToast(message: string) {
  toast({
    title: '成功',
    description: message,
  });
}

// API error handling wrapper
export async function handleApiRequest<T>(
  request: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    successMessage?: string;
  }
): Promise<T | undefined> {
  try {
    const data = await request();
    if (options?.successMessage) {
      showSuccessToast(options.successMessage);
    }
    options?.onSuccess?.(data);
    return data;
  } catch (error) {
    showErrorToast(error);
    return undefined;
  }
}