/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// cn/vite компилирует таблицы tailwind-merge только под классы из src (≈ −10 КБ gzip) и обновляет их в dev.
// Файл src/lib/cn-tables.ts генерируется; при конфликте merge — пересобрать: npx cn build --content "src/**/*.{ts,tsx}" -o src/lib/cn-tables.ts
import { cn } from 'cn/vite'

// GitHub Pages отдаёт сайт из подпапки bonanoz.github.io/clean-demo/; dev и тесты остаются от корня.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/clean-demo/' : '/',
  plugins: [react(), tailwindcss(), cn({ content: ['src/**/*.{ts,tsx}'], out: 'src/lib/cn-tables.ts' })],
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    passWithNoTests: true,
  },
}))
