import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="shell py-(--section-y)">
      <SectionHeading id="reviews-title" label="[ОТЗЫВЫ]" title="Что говорят клиенты" />
    </section>
  )
}
