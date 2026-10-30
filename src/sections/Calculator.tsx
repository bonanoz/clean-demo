import { useState } from 'react'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { carClasses, services, type CarClassId } from '@/data/services'
import { formatRub } from '@/lib/format'
import { calculatePrice } from '@/lib/price'
import { typo } from '@/lib/typo'

// Нативные radio и checkbox без системного вида. Смена состояния — только цвет за --dur-ui
// (transition-colors берёт длительность и кривую из токенов), без сдвигов и масштаба.
const choice =
  'flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-ink-2 p-4 transition-colors hover:border-fog-dim has-checked:border-sage-bright has-checked:bg-ink-3'
const control =
  'grid size-5 shrink-0 appearance-none place-content-center border border-fog-dim bg-ink-1 transition-colors checked:border-sage-bright checked:bg-sage-bright'
const radio = `${control} rounded-full before:size-2 before:rounded-full before:bg-transparent before:transition-colors checked:before:bg-ink-0`
const checkbox = `${control} rounded-md before:-mt-0.5 before:h-2.5 before:w-1.5 before:rotate-45 before:border-r-2 before:border-b-2 before:border-transparent before:transition-colors checked:before:border-ink-0`

export function Calculator() {
  const [carClass, setCarClass] = useState<CarClassId>('sedan')
  const [picked, setPicked] = useState<readonly string[]>(['wash'])

  const total = calculatePrice(carClass, picked)
  const toggle = (id: string) => setPicked((now) => (now.includes(id) ? now.filter((x) => x !== id) : [...now, id]))

  return (
    <section id="calculator" aria-labelledby="calculator-title" className="shell py-(--section-y)">
      <SectionHeading id="calculator-title" label="[ЦЕНЫ]" title="Рассчитайте цену" />

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_24rem] lg:gap-6">
        <Reveal className="flex min-w-0 flex-col gap-8">
          <fieldset className="min-w-0">
            <legend className="mb-3">
              <MonoLabel>
                <span aria-hidden="true">[01] / </span>Класс машины
              </MonoLabel>
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {carClasses.map((c) => (
                <label key={c.id} className={choice}>
                  <input
                    type="radio"
                    name="car-class"
                    value={c.id}
                    checked={carClass === c.id}
                    onChange={() => setCarClass(c.id)}
                    className={radio}
                  />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="type-ui text-paper">{typo(c.label)}</span>
                    <span className="type-label text-fog-dim">цена ×{String(c.multiplier).replace('.', ',')}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="mb-3">
              <MonoLabel>
                <span aria-hidden="true">[02] / </span>Услуги
              </MonoLabel>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <label key={s.id} className={choice}>
                  <input
                    type="checkbox"
                    name="service"
                    value={s.id}
                    checked={picked.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className={checkbox}
                  />
                  <span className="type-ui flex-1 text-paper">{typo(s.title)}</span>
                  <span className="type-small font-mono tabular-nums text-fog">{formatRub(calculatePrice(carClass, [s.id]))}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Reveal>

        <Reveal index={1} className="min-w-0">
          <NotchCard notch="top-left" className="flex h-full flex-col justify-between gap-8 bg-sage p-6 pt-12 text-on-sage">
            <div className="flex flex-col gap-3">
              <span id="calculator-total-label" className="type-label">
                Итого
              </span>
              <output aria-live="polite" aria-labelledby="calculator-total-label" className="type-price block">
                {/* Новый span на каждое значение: @starting-style проигрывается только у вставленного элемента,
                    а сам <output> остаётся на месте, иначе экранный диктор не услышит смену. */}
                <span
                  key={total}
                  className="inline-block transition-[opacity,translate] duration-(--dur-ui) ease-out starting:opacity-0 motion-safe:starting:translate-y-[40%]"
                >
                  {formatRub(total)}
                </span>
              </output>
              {/* своя живая область: подсказку «Выберите хотя бы одну услугу» диктор читает вместе с «0 ₽» */}
              <div aria-live="polite" className="type-small min-h-[3em]">
                {total === 0 ? <p>{typo('Выберите хотя бы одну услугу')}</p> : <p>{typo('Точную цену назовём после осмотра машины.')}</p>}
              </div>
            </div>
            <a href="#booking" className="btn btn-primary self-start">
              Записаться
            </a>
          </NotchCard>
        </Reveal>
      </div>
    </section>
  )
}
