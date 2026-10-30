import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function Calculator() {
  return (
    <section id="calculator" aria-labelledby="calculator-title" className="shell py-(--section-y)">
      <SectionHeading id="calculator-title" label="[ЦЕНЫ]" title="Рассчитайте цену" />
    </section>
  )
}
