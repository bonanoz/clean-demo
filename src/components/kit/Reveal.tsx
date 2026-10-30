import type { ElementType, HTMLAttributes } from 'react'
import { useInView } from '@/lib/use-in-view'

type RevealProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType
  variant?: 'up' | 'clip' | 'fade'
  /** Место в каскаде: задержка index × --stagger. */
  index?: number
}

/**
 * Появление при прокрутке, один раз. Скрытое состояние и переходы — в index.css ([data-reveal]).
 * Reveal — обёртка: ховер, параллакс и прочее движение вешайте на элемент внутри,
 * иначе их transition и transform спорят с переходом появления.
 */
export function Reveal({ as = 'div', variant = 'up', index = 0, style, children, ...rest }: RevealProps) {
  const Tag = as as 'div'
  const [ref, visible] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -10% 0px' })
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-visible={visible ? '' : undefined}
      style={index > 0 ? { ...style, transitionDelay: `calc(var(--stagger) * ${index})` } : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
