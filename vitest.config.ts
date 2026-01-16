import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./client/src/test/setup.ts'],
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
