import { Phone } from 'lucide-react'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { faq } from '@/data/faq'
import { site } from '@/data/site'
import { typo } from '@/lib/typo'

// Ключи animate-accordion-* уже висят в ui/accordion.tsx. Здесь подставляем на них токены
// (--dur-ui, --ease-out вместо встроенных 0.2s и ease-out) и выключаем высоту при reduce:
// остаётся только fade внутри (AccordionContent ниже). Высота анимируется только в аккордеоне (SPEC).
const itemMotion =
  '**:data-[slot=accordion-content]:ease-out **:data-[slot=accordion-content]:[--tw-animation-duration:var(--dur-ui)] motion-reduce:**:data-[slot=accordion-content]:animate-none'

export function Faq() {
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
        <Reveal>
          <Accordion type="single" collapsible className="border-t border-line">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`q${i}`} className={itemMotion}>
                <AccordionTrigger className="items-center gap-6 py-6 hover:text-sage-bright hover:no-underline **:data-[slot=accordion-trigger-icon]:size-5">
                  <span className="type-lead">{typo(item.q)}</span>
                </AccordionTrigger>
                <AccordionContent className="h-auto pb-6 transition-opacity ease-out starting:opacity-0">
                  <p className="type-body text-fog">{typo(item.a)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
