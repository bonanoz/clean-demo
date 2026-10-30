import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { images } from '@/data/images'

const imagesDir = join(import.meta.dirname, '..', '..', 'public', 'images')
const KB = 1024

const names = [
  'hero-main',
  'hero-wheel',
  'hero-front',
  'hero-interior',
  'about-studio',
  'interior-seats',
  'interior-console',
  'interior-cleaning',
  'exterior-foam',
  'coating',
  'compare-before',
  'compare-after',
  'booking-car',
]
const files = names.flatMap((name) =>
  [640, 1024, 1600].flatMap((w) => ['avif', 'webp'].map((ext) => `${name}-${w}.${ext}`)),
)

describe('E2: images', () => {
  it('в списке 13 имён и 78 файлов', () => {
    expect(names).toHaveLength(13)
    expect(files).toHaveLength(78)
  })

  it.each(names)('%s: 6 файлов на месте, каждый не тяжелее 250 КБ', (name) => {
    for (const w of [640, 1024, 1600]) {
      for (const ext of ['avif', 'webp']) {
        const path = join(imagesDir, `${name}-${w}.${ext}`)
        expect(existsSync(path), `нет файла ${name}-${w}.${ext}`).toBe(true)
        const size = statSync(path).size
        expect(size, `${name}-${w}.${ext} пустой`).toBeGreaterThan(0)
        expect(size, `${name}-${w}.${ext} тяжелее 250 КБ`).toBeLessThanOrEqual(250 * KB)
      }
    }
  })

  it('hero-main-1024.avif (LCP) не тяжелее 120 КБ', () => {
    expect(statSync(join(imagesDir, 'hero-main-1024.avif')).size).toBeLessThanOrEqual(120 * KB)
  })

  it('расширение соответствует формату файла', () => {
    for (const file of files) {
      const buf = readFileSync(join(imagesDir, file))
      if (file.endsWith('.webp')) {
        expect(buf.subarray(0, 4).toString('latin1'), file).toBe('RIFF')
        expect(buf.subarray(8, 12).toString('latin1'), file).toBe('WEBP')
      } else {
        expect(buf.subarray(4, 8).toString('latin1'), file).toBe('ftyp')
        expect(buf.subarray(8, 32).toString('latin1'), file).toMatch(/avif|avis/)
      }
    }
  })

  it('манифест содержит все 13 имён с положительными целыми width и height', () => {
    for (const name of names) {
      expect(images, `нет ${name} в манифесте`).toHaveProperty(name)
      const { width, height } = images[name as keyof typeof images]
      expect(Number.isInteger(width) && width > 0, `${name}.width`).toBe(true)
      expect(Number.isInteger(height) && height > 0, `${name}.height`).toBe(true)
    }
  })
})
