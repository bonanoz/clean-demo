import { ArrowUpRight, CarFront, ShieldCheck } from 'lucide-react'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { Photo } from '@/components/kit/Photo'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { typo } from '@/lib/typo'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="shell py-(--section-y)">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <Reveal as="p" className="type-lead text-fog lg:col-span-5">
          {typo('Чтобы машина выглядела как из салона — ')}
          <span className="inline-flex items-center gap-1.5 align-bottom font-display whitespace-nowrap text-paper">
            <CarFront aria-hidden="true" className="size-5 text-sage-bright" strokeWidth={1.75} />
            <span>
              clean<span className="text-fog">.cars</span>
            </span>
          </span>
        </Reveal>
        <SectionHeading id="about-title" label="[О НАС]" title="Машине мало обычной мойки" className="lg:col-span-7 lg:items-end lg:text-right" />
      </div>

      <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[5fr_3.5fr_3.5fr]">
        <Reveal className="h-full">
          <NotchCard className="hover-lift flex h-full min-h-72 flex-col justify-between gap-8 p-6 pt-12 lg:min-h-[26rem] lg:px-8">
            <MonoLabel>[01] / ХИМИЯ И ОБОРУДОВАНИЕ</MonoLabel>
            <div className="flex flex-col gap-4">
              <h3 className="type-h3">{typo('Профессиональная химия и оборудование')}</h3>
              <p className="type-body text-fog">
                {typo(
                  'Состав подбираем под материал: отдельно для лака, кожи и пластика. Полируем машинками и защищаем керамикой.',
                )}
              </p>
            </div>
          </NotchCard>
        </Reveal>

        <Reveal index={1} className="h-full">
          <NotchCard notch="top-left" className="hover-lift flex h-full min-h-72 flex-col justify-between gap-8 bg-ink-3 p-6 pt-12 lg:min-h-[26rem]">
            <div className="flex items-start justify-between gap-4">
              <MonoLabel>[02] / ЛАК</MonoLabel>
              <ShieldCheck aria-hidden="true" className="size-6 shrink-0 text-sage-bright" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="type-h3">{typo('Безопасно для лака')}</h3>
              <p className="type-body text-fog">
                {typo('Предмойка без касания, мойка двумя вёдрами и сушка микрофиброй: песок и грязь не царапают лак.')}
              </p>
              <a href="#services" className="type-ui -mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-sage-bright">
                Подробнее
                <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
              </a>
            </div>
          </NotchCard>
        </Reveal>

        {/* Клип — на обёртке Reveal, параллакс — на img внутри маски: на одном элементе они спорят за scale. */}
        <Reveal variant="clip" index={2} className="h-full">
          <div className="hover-zoom aspect-[4/3] h-full overflow-hidden rounded-card lg:aspect-auto">
            <Photo
              name="about-studio"
              alt="Чёрный седан с включёнными фарами на подземной парковке"
              sizes="(min-width: 1024px) 28vw, 100vw"
              className="parallax size-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
