import { defineConfig, mergeConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import viteConfig from './vite.config';

const setupFile = fileURLToPath(new URL('./client/src/test/setup.ts', import.meta.url));

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: [setupFile],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: [
                    'node_modules/',
                    'client/src/test/',
                    '**/*.d.ts',
                    '**/*.config.*',
                    '**/mockData',
                    'dist/',
                ],
                thresholds: {
                    lines: 80,
                    functions: 80,
                    branches: 80,
                    statements: 80,
                },
            },
        },
    })
);
