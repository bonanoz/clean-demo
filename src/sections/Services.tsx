import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="shell py-(--section-y)">
      <SectionHeading id="services-title" label="[УСЛУГИ]" title="От мойки кузова до полного детейлинга" />
    </section>
  )
}
