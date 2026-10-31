import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typo } from '@/lib/typo'

/** Моно-метка вида `[УСЛУГА] [01] / ХИМЧИСТКА САЛОНА`. Строку сама пропускает через typo(). */
export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('type-label block text-fog-dim', className)}>
      {typeof children === 'string' ? typo(children) : children}
    </span>
  )
}
