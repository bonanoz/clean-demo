import { CompareSlider } from '@/components/compare-slider'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { typo } from '@/lib/typo'

export function BeforeAfter() {
  return (
    <section id="results" aria-labelledby="results-title" className="shell py-(--section-y)">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-end">
        <div className="flex flex-col gap-6">
          <SectionHeading id="results-title" label="[РЕЗУЛЬТАТ]" title="До и после мойки" />
          <p className="type-lead text-fog">
            {typo('Один кузов в одном ракурсе. Потяните ползунок или двигайте его стрелками, чтобы сравнить.')}
          </p>
        </div>
        <Reveal variant="clip">
          <CompareSlider
            before="compare-before"
            after="compare-after"
            beforeAlt="Porsche 911 до мойки: лак тусклый, на кузове и диске грязь и разводы"
            afterAlt="Тот же Porsche 911 после мойки: тёмно-зелёный лак блестит, диск чистый"
          />
        </Reveal>
      </div>
    </section>
  )
}
