// Размеры 1600-версии из public/images: Photo ставит их в width/height, чтобы не было скачка вёрстки.
export const images = {
  'hero-main': { width: 1600, height: 1000 },
  'hero-car': { width: 1600, height: 755 },
  'hero-wheel': { width: 1600, height: 2000 },
  'hero-front': { width: 1600, height: 1200 },
  'hero-interior': { width: 1600, height: 2000 },
  'about-studio': { width: 1600, height: 1200 },
  'interior-seats': { width: 1600, height: 2000 },
  'interior-console': { width: 1600, height: 2000 },
  'interior-cleaning': { width: 1600, height: 1200 },
  'exterior-foam': { width: 1600, height: 1200 },
  'coating': { width: 1600, height: 2000 },
  'compare-before': { width: 1600, height: 1000 },
  'compare-after': { width: 1600, height: 1000 },
  'booking-car': { width: 1600, height: 2133 },
} as const

export type ImageName = keyof typeof images
