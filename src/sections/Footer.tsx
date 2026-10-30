import { SectionHeading } from '@/components/kit/SectionHeading'

// Заглушка E1: подвал собирает E5.
export function Footer() {
  return (
    <footer id="contacts" aria-labelledby="contacts-title" className="shell border-t border-line py-(--section-y)">
      <SectionHeading id="contacts-title" label="[КОНТАКТЫ]" title="Как нас найти" />
    </footer>
  )
}
