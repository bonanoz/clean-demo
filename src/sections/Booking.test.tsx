import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Booking } from '@/sections/Booking'
import { carClasses, services } from '@/data/services'
import { timeSlots } from '@/lib/booking'
import { expectValidPhotos, nameIs, norm } from '@/test/helpers'

type User = ReturnType<typeof userEvent.setup>

// Подписи полей ищем без учёта регистра: «Имя», «Телефон», «Услуга», «Класс машины», «Дата», «Время», «Комментарий».
const field = {
  name: () => screen.getByLabelText(/имя/i) as HTMLInputElement,
  phone: () => screen.getByLabelText(/телефон/i) as HTMLInputElement,
  service: () => screen.getByLabelText(/услуг/i) as HTMLSelectElement,
  carClass: () => screen.getByLabelText(/класс машины/i) as HTMLSelectElement,
  date: () => screen.getByLabelText(/дата/i) as HTMLInputElement,
  time: () => screen.getByLabelText(/время/i) as HTMLSelectElement,
  comment: () => screen.getByLabelText(/комментарий/i) as HTMLTextAreaElement,
  consent: () => screen.getByRole('checkbox') as HTMLInputElement,
}

const ERR = {
  name: 'Укажите имя',
  phone: 'Введите номер в формате +7 900 000-00-00',
  service: 'Выберите услугу',
  carClass: 'Выберите класс машины',
  date: 'Выберите дату не раньше сегодняшней',
  dateFar: 'Запись открыта на 60 дней вперёд',
  time: 'Выберите время',
  consent: 'Нужно согласие на обработку данных',
  comment: 'Не больше 500 символов',
}

let fetchSpy: MockInstance<typeof fetch>
let container: HTMLElement

beforeEach(() => {
  // «Сейчас» — пятница, 30 октября 2026, 12:00. Завтра — 2026-10-31.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 30, 12, 0, 0))
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null))
  container = render(<Booking />).container
})

afterEach(() => {
  fetchSpy.mockRestore()
  vi.useRealTimers()
})

const submit = () =>
  within(container.querySelector('form')!)
    .getAllByRole('button')
    .find((b) => (b as HTMLButtonElement).type === 'submit')!

/** Текст элементов, на которые ссылается aria-describedby. */
const described = (el: Element) =>
  norm(
    (el.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' '),
  )

async function fillValid(user: User, over: { date?: string; time?: string } = {}) {
  await user.type(field.name(), 'Иван')
  await user.type(field.phone(), '+7 (900) 123-45-67')
  await user.selectOptions(field.service(), 'ceramic')
  await user.selectOptions(field.carClass(), 'suv')
  fireEvent.change(field.date(), { target: { value: over.date ?? '2026-10-31' } })
  await user.selectOptions(field.time(), over.time ?? '10:00')
  await user.click(field.consent())
}

describe('E5: Booking, содержимое', () => {
  it('секция #booking с h2 «Запишитесь на мойку сегодня»', () => {
    const section = container.querySelector<HTMLElement>('section#booking')
    expect(section, 'нет <section id="booking">').not.toBeNull()
    expect(within(section!).getByRole('heading', { level: 2, name: nameIs('Запишитесь на мойку сегодня') })).toBeInTheDocument()
  })

  it('поля формы: нативные контролы нужных типов', () => {
    expect(field.name().tagName).toBe('INPUT')
    expect(field.phone().tagName).toBe('INPUT')
    expect(field.service().tagName).toBe('SELECT')
    expect(field.carClass().tagName).toBe('SELECT')
    expect(field.date()).toHaveAttribute('type', 'date')
    expect(field.time().tagName).toBe('SELECT')
    expect(field.comment().tagName).toBe('TEXTAREA')
    expect(field.consent()).toHaveAttribute('type', 'checkbox')
  })

  it('списки услуг, классов и времени берутся из данных; в начале ничего не выбрано', () => {
    const values = (select: HTMLSelectElement) =>
      within(select)
        .getAllByRole('option')
        .map((o) => (o as HTMLOptionElement).value)
        .filter(Boolean)
    expect(values(field.service())).toEqual(services.map((s) => s.id))
    expect(values(field.carClass())).toEqual(carClasses.map((c) => c.id))
    expect(values(field.time())).toEqual([...timeSlots])

    expect(field.service()).toHaveValue('')
    expect(field.carClass()).toHaveValue('')
    expect(field.time()).toHaveValue('')
    expect(field.consent()).not.toBeChecked()

    const serviceOptions = within(field.service()).getAllByRole('option').map((o) => norm(o.textContent))
    for (const s of services) {
      expect(serviceOptions.some((t) => t.includes(norm(s.title))), s.title).toBe(true)
    }
  })

  it('вертикальное фото booking-car: alt, width, height, lazy', () => {
    const imgs = expectValidPhotos(container, 1)
    const car = imgs.find((img) => img.getAttribute('src')?.startsWith('/images/booking-car-'))
    expect(car, 'нет booking-car').toBeDefined()
    expect(car).toHaveAttribute('loading', 'lazy')
  })
})

describe('E5: Booking, ошибки валидации', () => {
  it('пустая отправка: тексты ошибок, aria-invalid и aria-describedby у полей, фокус на первом', async () => {
    const user = userEvent.setup()
    await user.click(submit())

    const cases: Array<[() => HTMLElement, string]> = [
      [field.name, ERR.name],
      [field.phone, ERR.phone],
      [field.service, ERR.service],
      [field.carClass, ERR.carClass],
      [field.date, ERR.date],
      [field.time, ERR.time],
      [field.consent, ERR.consent],
    ]
    for (const [get, message] of cases) {
      const el = get()
      expect(el, message).toHaveAttribute('aria-invalid', 'true')
      expect(described(el), message).toContain(norm(message))
      expect(screen.getAllByText(message).length, `${message} не виден`).toBeGreaterThanOrEqual(1)
    }
    expect(field.comment()).not.toHaveAttribute('aria-invalid', 'true')
    expect(field.name()).toHaveFocus()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('фокус уходит на первое поле с ошибкой, а не на первое вообще', async () => {
    const user = userEvent.setup()
    await user.type(field.name(), 'Иван')
    await user.click(submit())
    expect(field.name()).not.toHaveAttribute('aria-invalid', 'true')
    expect(field.phone()).toHaveAttribute('aria-invalid', 'true')
    expect(field.phone()).toHaveFocus()
  })

  it('неверный телефон при остальных верных данных', async () => {
    const user = userEvent.setup()
    await fillValid(user)
    await user.clear(field.phone())
    await user.type(field.phone(), 'abc')
    await user.click(submit())
    expect(field.phone()).toHaveAttribute('aria-invalid', 'true')
    expect(described(field.phone())).toContain(norm(ERR.phone))
    expect(field.phone()).toHaveFocus()
    expect(field.name()).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('дата вчера и дата дальше чем через 60 дней', async () => {
    const user = userEvent.setup()
    await fillValid(user, { date: '2026-10-29' })
    await user.click(submit())
    expect(field.date()).toHaveAttribute('aria-invalid', 'true')
    expect(described(field.date())).toContain(norm(ERR.date))
    expect(field.date()).toHaveFocus()

    fireEvent.change(field.date(), { target: { value: '2026-12-30' } })
    await user.click(submit())
    expect(described(field.date())).toContain(norm(ERR.dateFar))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('сегодня на уже прошедшее время — ошибка у времени', async () => {
    const user = userEvent.setup()
    await fillValid(user, { date: '2026-10-30', time: '09:00' })
    await user.click(submit())
    expect(field.time()).toHaveAttribute('aria-invalid', 'true')
    expect(described(field.time())).toContain(norm(ERR.time))
    expect(field.time()).toHaveFocus()
    expect(field.date()).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('комментарий длиннее 500 символов — ошибка', async () => {
    const user = userEvent.setup()
    await fillValid(user)
    fireEvent.change(field.comment(), { target: { value: 'а'.repeat(501) } })
    await user.click(submit())
    expect(field.comment()).toHaveAttribute('aria-invalid', 'true')
    expect(described(field.comment())).toContain(norm(ERR.comment))
    expect(field.comment()).toHaveFocus()
  })
})

describe('E5: Booking, успешная отправка', () => {
  it('role="status": «Заявка принята», услуга, дата и время; форма заменена; fetch не вызывался', async () => {
    const user = userEvent.setup()
    await fillValid(user)
    await user.click(submit())

    const status = screen.getByRole('status')
    const text = norm(status.textContent)
    expect(text).toContain('Заявка принята')
    expect(text).toContain('Керамическое покрытие')
    expect(text).toContain('10:00')
    expect(text).toMatch(/31\.10|31 октября|2026-10-31/)
    expect(container.querySelector('form')).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('ошибки прошлой попытки не мешают: исправили поля и отправили', async () => {
    const user = userEvent.setup()
    await user.click(submit())
    expect(screen.queryByRole('status')).toBeNull()

    await fillValid(user)
    await user.click(submit())
    expect(screen.getByRole('status')).toHaveTextContent('Заявка принята')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('«Записаться ещё раз» возвращает пустую форму', async () => {
    const user = userEvent.setup()
    await fillValid(user)
    await user.click(submit())
    await user.click(screen.getByRole('button', { name: nameIs('Записаться ещё раз') }))

    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('form')).not.toBeNull()
    expect(field.name()).toHaveValue('')
    expect(field.phone()).toHaveValue('')
    expect(field.service()).toHaveValue('')
    expect(field.carClass()).toHaveValue('')
    expect(field.date()).toHaveValue('')
    expect(field.time()).toHaveValue('')
    expect(field.comment()).toHaveValue('')
    expect(field.consent()).not.toBeChecked()
    expect(field.name()).not.toHaveAttribute('aria-invalid', 'true')
  })
})
