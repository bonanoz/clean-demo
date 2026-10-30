import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type NotchCardProps = ComponentProps<'div'> & { notch?: 'top-right' | 'top-left' }

/**
 * Карточка-«папка»: угол опущен плавной ступенькой, как вкладка. Форма — маска (.notch-card
 * в index.css), поэтому вырез прозрачный на любом фоне. Под вырезом остаётся
 * var(--notch-h) пустого места: верхний отступ содержимого делайте не меньше.
 */
export function NotchCard({ notch = 'top-right', className, ...rest }: NotchCardProps) {
  return <div data-notch={notch} className={cn('notch-card rounded-card bg-ink-2', className)} {...rest} />
}
