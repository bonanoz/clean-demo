import { carClasses, services } from '@/data/services'

export const timeSlots: readonly string[] = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`)

export type BookingValues = {
  name: string
  phone: string
  serviceId: string
  carClass: string
  date: string
  time: string
  comment: string
  consent: boolean
}

export type BookingErrors = Partial<Record<keyof BookingValues, string>>

const DAYS_AHEAD = 60
const DAY_MS = 86_400_000

/** `+7 (900) 123-45-67`, `8 900 123 45 67`, `9001234567` → `+79001234567`; остальное → null. */
export function normalizePhone(input: string): string | null {
  const text = input.trim()
  if (!/^\+?[\d\s()-]+$/.test(text)) return null
  const digits = text.replace(/\D/g, '')
  // С плюсом страна обязательна: «+7 900 123 45 6» — это 10 цифр, но не номер.
  if (text.startsWith('+')) return /^7\d{10}$/.test(digits) ? `+${digits}` : null
  if (/^[78]\d{10}$/.test(digits)) return `+7${digits.slice(1)}`
  return digits.length === 10 ? `+7${digits}` : null
}

/** Номер дня в календаре. Разница двух номеров не зависит от перехода на летнее время. */
const dayNumber = (year: number, month: number, day: number) => Date.UTC(year, month, day) / DAY_MS

/** `YYYY-MM-DD` → номер дня; несуществующие даты вроде `2026-11-31` → null. */
function parseDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])]
  const check = new Date(Date.UTC(year, month, day))
  const same = check.getUTCFullYear() === year && check.getUTCMonth() === month && check.getUTCDate() === day
  return same ? dayNumber(year, month, day) : null
}

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Границы для `<input type="date">`: сегодня по местному времени и через 60 дней. */
export const dateBounds = (now: Date) => ({
  min: iso(now),
  max: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + DAYS_AHEAD)),
})

export function validateBooking(values: BookingValues, now: Date): BookingErrors {
  const errors: BookingErrors = {}
  const name = values.name.trim()
  if (name.length < 2 || name.length > 60) errors.name = 'Укажите имя'
  if (!normalizePhone(values.phone)) errors.phone = 'Введите номер в формате +7 900 000-00-00'
  if (!services.some((s) => s.id === values.serviceId)) errors.serviceId = 'Выберите услугу'
  if (!carClasses.some((c) => c.id === values.carClass)) errors.carClass = 'Выберите класс машины'

  const day = parseDay(values.date)
  const ahead = day === null ? null : day - dayNumber(now.getFullYear(), now.getMonth(), now.getDate())
  if (ahead === null || ahead < 0) errors.date = 'Выберите дату не раньше сегодняшней'
  else if (ahead > DAYS_AHEAD) errors.date = 'Запись открыта на 60 дней вперёд'

  // Сегодня доступны только слоты позже текущего часа.
  const passed = ahead === 0 && Number(values.time.slice(0, 2)) <= now.getHours()
  if (!timeSlots.includes(values.time) || passed) errors.time = 'Выберите время'

  if (!values.consent) errors.consent = 'Нужно согласие на обработку данных'
  if (values.comment.length > 500) errors.comment = 'Не больше 500 символов'
  return errors
}
