import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="shell py-(--section-y)">
      <SectionHeading id="faq-title" label="[ВОПРОСЫ]" title="Частые вопросы" />
    </section>
  )
}
