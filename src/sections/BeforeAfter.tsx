import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function BeforeAfter() {
  return (
    <section id="results" aria-labelledby="results-title" className="shell py-(--section-y)">
      <SectionHeading id="results-title" label="[РЕЗУЛЬТАТ]" title="До и после химчистки" />
    </section>
  )
}
