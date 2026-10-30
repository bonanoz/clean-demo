import { useState } from 'react'
import { Minus, Phone, Plus } from 'lucide-react'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { faq } from '@/data/faq'
import { site } from '@/data/site'
import { typo } from '@/lib/typo'

// Раскрытие: @starting-style на открытой панели (starting:), закрытие мгновенное — панель уходит в hidden.
// opacity работает всегда (при reduce тоже). Высота 0 → auto идёт только без reduce и только там,
// где есть interpolate-size: иначе starting:h-0 дал бы скачок в конце, поэтому всё в одном @supports.
const panel =
  'overflow-hidden transition-[height,opacity] duration-(--dur-ui) ease-out starting:opacity-0 motion-safe:supports-[interpolate-size:allow-keywords]:[interpolate-size:allow-keywords] motion-safe:supports-[interpolate-size:allow-keywords]:starting:h-0'

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" aria-labelledby="faq-title" className="shell py-(--section-y)">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading id="faq-title" label="[ВОПРОСЫ]" title="Частые вопросы" />
          <p className="type-lead text-fog">{typo('Не нашли свой вопрос? Позвоните, ответим.')}</p>
          <a href={site.phoneHref} className="btn btn-secondary tabular-nums lining-nums">
            <Phone aria-hidden="true" className="size-4 text-sage-bright" strokeWidth={1.75} />
            {site.phone}
          </a>
        </div>
        <Reveal className="border-t border-line">
          {faq.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 rounded-lg py-6 text-left transition-colors hover:text-sage-bright"
                  >
                    <span className="type-lead font-medium">{typo(item.q)}</span>
                    <Plus aria-hidden="true" className="size-5 shrink-0 text-fog group-aria-expanded:hidden" strokeWidth={1.75} />
                    <Minus aria-hidden="true" className="hidden size-5 shrink-0 text-fog group-aria-expanded:block" strokeWidth={1.75} />
                  </button>
                </h3>
                <div id={`faq-a${i}`} role="region" aria-labelledby={`faq-q${i}`} hidden={!isOpen} className={panel}>
                  <p className="type-body pb-6 text-fog">{typo(item.a)}</p>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
