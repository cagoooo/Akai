import type { Plugin } from 'vite';

export const FIREBASE_PUBLIC_PAGES: readonly string[];

export function injectFirebasePublicConfig(
  html: string,
  environment: Readonly<Record<string, string | undefined>>,
): string;

export function firebasePublicConfigPlugin(): Plugin;
