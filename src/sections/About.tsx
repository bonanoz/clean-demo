import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { typo } from '@/lib/typo'

// Заглушка E1: секцию собирает эпик волны 2.
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="shell py-(--section-y)">
      <SectionHeading id="about-title" label="[О НАС]" title="Машине мало обычной мойки" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <NotchCard className="hover-lift flex min-h-72 flex-col justify-between gap-6 p-6 pt-12">
          <MonoLabel>[01] / ХИМИЯ И ОБОРУДОВАНИЕ</MonoLabel>
          <h3 className="type-h3">{typo('Профессиональная химия и оборудование')}</h3>
        </NotchCard>
        <NotchCard notch="top-left" className="hover-lift flex min-h-72 flex-col justify-between gap-6 bg-sage p-6 pt-12 text-on-sage">
          <MonoLabel className="text-on-sage">[02] / ЛАК</MonoLabel>
          <h3 className="type-h3">{typo('Безопасно для лака')}</h3>
        </NotchCard>
      </div>
    </section>
  )
}
