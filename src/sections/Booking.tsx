import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { Photo } from '@/components/kit/Photo'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { carClasses, services } from '@/data/services'
import { dateBounds, timeSlots, validateBooking, type BookingErrors, type BookingValues } from '@/lib/booking'
import { typo } from '@/lib/typo'
import { cn } from '@/lib/utils'

// Табличные цифры: телефон, дата и время не прыгают по ширине при вводе.
const control =
  'type-body w-full rounded-lg border border-line bg-ink-1 px-4 text-paper tabular-nums lining-nums scheme-dark placeholder:text-fog-dim aria-invalid:border-danger'
const input = cn(control, 'h-12')

const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })

type SelectProps = { id: string; name: string; placeholder: string; options: readonly { value: string; label: string }[] }

/** Нативный select: список и фокус делает браузер, шеврон рисуем сами. */
function Select({ id, name, placeholder, options, ...aria }: SelectProps) {
  return (
    <div className="relative">
      <select id={id} name={name} defaultValue="" className={cn(input, 'appearance-none pr-11')} {...aria}>
        <option value="">{typo(placeholder)}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typo(option.label)}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-fog" />
    </div>
  )
}

function Field({ name, label, error, className, children }: { name: string; label: ReactNode; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={`booking-${name}`} className="type-small text-fog">
        {label}
      </label>
      {children}
      {error && (
        <p id={`booking-${name}-error`} className="type-small text-danger">
          {typo(error)}
        </p>
      )}
    </div>
  )
}

type Sent = { service: string; date: string; time: string }

export function Booking() {
  const [errors, setErrors] = useState<BookingErrors>({})
  const [sent, setSent] = useState<Sent | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // Форма исчезла вместе с кнопкой: фокус переносим на подтверждение, чтобы его прочли и с клавиатуры.
  useEffect(() => {
    if (sent) statusRef.current?.focus()
  }, [sent])

  // Границы дат считаются в браузере: в разметке, собранной при сборке, осталась бы дата сборки.
  const [{ min, max }, setBounds] = useState<{ min?: string; max?: string }>({})
  useEffect(() => setBounds(dateBounds(new Date())), [])

  // aria-required — у всех полей, кроме комментария; aria-invalid и ссылка на текст ошибки — только у поля с ошибкой.
  const aria = (name: keyof BookingValues) => ({
    ...(name !== 'comment' && ({ 'aria-required': true } as const)),
    ...(errors[name] && ({ 'aria-invalid': true, 'aria-describedby': `booking-${name}-error` } as const)),
  })

  // Ошибка исчезает, как только поле начали править; новая проверка — только при отправке.
  const clearError = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as keyof BookingValues
    setErrors((prev) => {
      if (!(name in prev)) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const text = (key: keyof BookingValues) => String(data.get(key) ?? '')
    const values: BookingValues = {
      name: text('name'),
      phone: text('phone'),
      serviceId: text('serviceId'),
      carClass: text('carClass'),
      date: text('date'),
      time: text('time'),
      comment: text('comment'),
      consent: data.has('consent'),
    }
    const found = validateBooking(values, new Date())
    // Сначала обновляем DOM (aria-invalid, текст ошибки), потом фокус: так скринридер прочтёт поле уже с ошибкой.
    flushSync(() => setErrors(found))
    const first = Array.from(form.elements).find((el) => (el as HTMLInputElement).name in found)
    if (first) return (first as HTMLElement).focus()
    const [year, month, day] = values.date.split('-').map(Number)
    setSent({
      service: services.find((s) => s.id === values.serviceId)?.title ?? '',
      date: dayMonth.format(new Date(year, month - 1, day)),
      time: values.time,
    })
  }

  function again() {
    flushSync(() => setSent(null))
    nameRef.current?.focus()
  }

  return (
    <section id="booking" aria-labelledby="booking-title" className="shell py-(--section-y)">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading id="booking-title" label="[ЗАПИСЬ]" title="Запишитесь на мойку сегодня" />
          {!sent && (
            <p className="type-lead tabular-nums lining-nums text-fog">
              {typo(`Выберите услугу, дату и время: слоты каждый час с ${timeSlots[0]} до ${timeSlots.at(-1)}.`)}
            </p>
          )}

          {/* Reveal над обоими состояниями: «Записаться ещё раз» не должен заново скрывать и 700 мс проявлять форму. */}
          <Reveal>
            {sent ? (
              <div
                ref={statusRef}
                role="status"
                aria-labelledby="booking-sent-title"
                tabIndex={-1}
                // Подтверждение появляется за 250 мс (1,25 × --dur-ui); при reduce — только прозрачность за --dur-ui.
                className="flex flex-col gap-6 rounded-card border border-line bg-ink-2 p-6 outline-none transition-[opacity,translate] duration-[calc(var(--dur-ui)*1.25)] ease-out starting:opacity-0 motion-safe:starting:translate-y-2 motion-reduce:transition-[opacity] motion-reduce:duration-(--dur-ui) sm:p-8"
              >
                <h3 id="booking-sent-title" className="type-h3">
                  {typo('Заявка принята')}
                </h3>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <dt className="type-label text-fog-dim">Услуга</dt>
                    <dd className="type-body">{typo(sent.service)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="type-label text-fog-dim">Дата</dt>
                    <dd className="type-price">{typo(sent.date)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="type-label text-fog-dim">Время</dt>
                    <dd className="type-price">{sent.time}</dd>
                  </div>
                </dl>
                <button type="button" onClick={again} className="btn btn-secondary self-start">
                  {typo('Записаться ещё раз')}
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={onSubmit}
                onChange={clearError}
                className="grid gap-5 rounded-card border border-line bg-ink-2 p-6 sm:grid-cols-2 sm:p-8"
              >
                <Field name="name" label="Имя" error={errors.name}>
                  <input
                    ref={nameRef}
                    id="booking-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Иван"
                    className={input}
                    {...aria('name')}
                  />
                </Field>
                <Field name="phone" label="Телефон" error={errors.phone}>
                  <input
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 900 000-00-00"
                    className={input}
                    {...aria('phone')}
                  />
                </Field>
                <Field name="serviceId" label="Услуга" error={errors.serviceId}>
                  <Select
                    id="booking-serviceId"
                    name="serviceId"
                    placeholder="Выберите услугу"
                    options={services.map((s) => ({ value: s.id, label: s.title }))}
                    {...aria('serviceId')}
                  />
                </Field>
                <Field name="carClass" label="Класс машины" error={errors.carClass}>
                  <Select
                    id="booking-carClass"
                    name="carClass"
                    placeholder="Выберите класс"
                    options={carClasses.map((c) => ({ value: c.id, label: c.label }))}
                    {...aria('carClass')}
                  />
                </Field>
                <Field name="date" label="Дата" error={errors.date}>
                  <input id="booking-date" name="date" type="date" min={min} max={max} className={input} {...aria('date')} />
                </Field>
                <Field name="time" label="Время" error={errors.time}>
                  <Select
                    id="booking-time"
                    name="time"
                    placeholder="Выберите время"
                    options={timeSlots.map((slot) => ({ value: slot, label: slot }))}
                    {...aria('time')}
                  />
                </Field>
                <Field
                  name="comment"
                  label={
                    <>
                      Комментарий <span className="text-fog-dim">{typo('— если нужно')}</span>
                    </>
                  }
                  error={errors.comment}
                  className="sm:col-span-2"
                >
                  <textarea id="booking-comment" name="comment" rows={3} className={cn(control, 'min-h-28 resize-y py-3')} {...aria('comment')} />
                </Field>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="type-small flex items-start gap-3 py-1 text-fog">
                    <input
                      id="booking-consent"
                      name="consent"
                      type="checkbox"
                      className="mt-px size-5 shrink-0 accent-sage-bright scheme-dark"
                      {...aria('consent')}
                    />
                    <span>
                      {typo('Согласен на обработку')}{' '}
                      <a href="#" className="text-paper underline underline-offset-4">
                        {typo('персональных данных')}
                      </a>
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="booking-consent-error" className="type-small text-danger">
                      {typo(errors.consent)}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary w-full sm:col-span-2 sm:w-fit">
                  Записаться
                </button>
              </form>
            )}
          </Reveal>
        </div>

        {/* Клип на обёртке, параллакс на img: так их keyframes и переходы не спорят. */}
        <Reveal variant="clip" className="relative aspect-4/3 overflow-hidden rounded-card lg:aspect-auto">
          <Photo
            name="booking-car"
            alt="Серый спорткар сзади на мокрой брусчатке, кузов в разводах грязи"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="parallax absolute inset-0 size-full object-cover"
          />
        </Reveal>
      </div>
    </section>
  )
}
