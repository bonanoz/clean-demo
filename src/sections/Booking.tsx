import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: секцию собирает эпик волны 2.
export function Booking() {
  return (
    <section id="booking" aria-labelledby="booking-title" className="shell py-(--section-y)">
      <SectionHeading id="booking-title" label="[ЗАПИСЬ]" title="Запишитесь на мойку сегодня" />
    </section>
  )
}
