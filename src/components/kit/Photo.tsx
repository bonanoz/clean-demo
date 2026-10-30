import { images, type ImageName } from '@/data/images'

const widths = [640, 1024, 1600]
const srcSet = (name: ImageName, ext: 'avif' | 'webp') =>
  widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ')

type PhotoProps = {
  name: ImageName
  alt: string
  /** Реальная ширина фото в вёрстке, например `(min-width: 1024px) 33vw, 100vw`. */
  sizes: string
  /** По умолчанию — из манифеста images. */
  width?: number
  height?: number
  /** Только для LCP-фото первого экрана: без lazy, fetchpriority="high". */
  priority?: boolean
  className?: string
}

export function Photo({ name, alt, sizes, width, height, priority = false, className }: PhotoProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
      <img
        src={`/images/${name}-1024.webp`}
        width={width ?? images[name].width}
        height={height ?? images[name].height}
        alt={alt}
        className={className}
        {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const, decoding: 'async' as const })}
      />
    </picture>
  )
}
