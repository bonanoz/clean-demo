import { cn } from '@/lib/utils'
import { MonoLabel } from './MonoLabel'
import { Reveal } from './Reveal'
import { SplitWords } from './SplitWords'

type SectionHeadingProps = { label: string; title: string; id: string; className?: string }

/** Метка и h2 секции; id заголовка — для aria-labelledby у <section>. */
export function SectionHeading({ label, title, id, className }: SectionHeadingProps) {
  return (
    <Reveal className={cn('flex flex-col gap-4', className)}>
      <MonoLabel>{label}</MonoLabel>
      <SplitWords id={id} text={title} className="type-h2" />
    </Reveal>
  )
}
