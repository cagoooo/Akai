import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/hooks/use-toast"

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