import { describe, expect, it } from 'vitest'
import { normalizePhone, timeSlots, validateBooking, type BookingValues } from '@/lib/booking'

// «Сейчас»: пятница, 30 октября 2026, 12:00 по местному времени (компоненты даты — локальные).
const noon = new Date(2026, 9, 30, 12, 0, 0)

const valid: BookingValues = {
  name: 'Иван',
  phone: '+7 (900) 123-45-67',
  serviceId: 'wash',
  carClass: 'sedan',
  date: '2026-10-31',
  time: '10:00',
  comment: '',
  consent: true,
}

const empty: BookingValues = { name: '', phone: '', serviceId: '', carClass: '', date: '', time: '', comment: '', consent: false }

const errorsFor = (patch: Partial<BookingValues>, now: Date = noon) => validateBooking({ ...valid, ...patch }, now)

describe('E5: timeSlots', () => {
  it('12 часовых слотов с 09:00 до 20:00', () => {
    expect(timeSlots).toEqual(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'])
  })
})

describe('E5: normalizePhone', () => {
  it.each(['+7 (900) 123-45-67', '89001234567', '9001234567', '+7 900 123 45 67', '+79001234567', ' 8 (900) 123-45-67 '])(
    '%s → +79001234567',
    (input) => {
      expect(normalizePhone(input)).toBe('+79001234567')
    },
  )

  it.each(['12345', '+7 900 123 45 6', '+7 900 123 45 678', 'abc', '+7 900 123 45 6a', ''])('%j → null', (input) => {
    expect(normalizePhone(input)).toBeNull()
  })
})

describe('E5: validateBooking', () => {
  it('корректные данные дают пустой объект', () => {
    expect(validateBooking(valid, noon)).toEqual({})
  })

  it('пустая форма: ошибки у всех обязательных полей, у комментария нет', () => {
    const errors = validateBooking(empty, noon)
    expect(Object.keys(errors).sort()).toEqual(['carClass', 'consent', 'date', 'name', 'phone', 'serviceId', 'time'])
    expect(errors).toMatchObject({
      name: 'Укажите имя',
      phone: 'Введите номер в формате +7 900 000-00-00',
      serviceId: 'Выберите услугу',
      carClass: 'Выберите класс машины',
      date: 'Выберите дату не раньше сегодняшней',
      time: 'Выберите время',
      consent: 'Нужно согласие на обработку данных',
    })
  })

  it('не меняет переданную дату', () => {
    const now = new Date(2026, 9, 30, 12, 0, 0)
    const before = now.getTime()
    validateBooking(valid, now)
    expect(now.getTime()).toBe(before)
  })

  describe('имя', () => {
    it('границы 2–60 символов после trim', () => {
      expect(errorsFor({ name: 'Ив' }).name).toBeUndefined()
      expect(errorsFor({ name: 'а'.repeat(60) }).name).toBeUndefined()
      expect(errorsFor({ name: 'а'.repeat(61) }).name).toBe('Укажите имя')
      expect(errorsFor({ name: 'И' }).name).toBe('Укажите имя')
    })

    it('пробелы по краям не считаются', () => {
      expect(errorsFor({ name: '   ' }).name).toBe('Укажите имя')
      expect(errorsFor({ name: '  И  ' }).name).toBe('Укажите имя')
      expect(errorsFor({ name: '  Ив  ' }).name).toBeUndefined()
    })
  })

  describe('телефон', () => {
    it('неверный номер даёт ошибку', () => {
      expect(errorsFor({ phone: '12345' }).phone).toBe('Введите номер в формате +7 900 000-00-00')
      expect(errorsFor({ phone: 'abc' }).phone).toBe('Введите номер в формате +7 900 000-00-00')
    })

    it('любой допустимый формат проходит', () => {
      expect(errorsFor({ phone: '89001234567' }).phone).toBeUndefined()
      expect(errorsFor({ phone: '9001234567' }).phone).toBeUndefined()
    })
  })

  describe('услуга и класс', () => {
    it('id вне списка — ошибка', () => {
      expect(errorsFor({ serviceId: 'nope' }).serviceId).toBe('Выберите услугу')
      expect(errorsFor({ carClass: 'nope' }).carClass).toBe('Выберите класс машины')
    })

    it('все id из данных проходят', () => {
      for (const serviceId of ['wash', 'engine', 'interior', 'leather', 'polish', 'ceramic']) {
        expect(errorsFor({ serviceId }).serviceId).toBeUndefined()
      }
      for (const carClass of ['sedan', 'crossover', 'suv']) {
        expect(errorsFor({ carClass }).carClass).toBeUndefined()
      }
    })
  })

  describe('дата', () => {
    it('вчера — ошибка', () => {
      expect(errorsFor({ date: '2026-10-29' }).date).toBe('Выберите дату не раньше сегодняшней')
    })

    it('сегодня — можно (время позже текущего)', () => {
      expect(errorsFor({ date: '2026-10-30', time: '16:00' }).date).toBeUndefined()
    })

    it('now + 60 дней — можно, now + 61 день — ошибка', () => {
      expect(errorsFor({ date: '2026-12-29' }).date).toBeUndefined()
      expect(errorsFor({ date: '2026-12-30' }).date).toBe('Запись открыта на 60 дней вперёд')
    })

    it('не YYYY-MM-DD или несуществующая дата — ошибка', () => {
      expect(errorsFor({ date: '31.10.2026' }).date).toBeTruthy()
      expect(errorsFor({ date: 'завтра' }).date).toBeTruthy()
      expect(errorsFor({ date: '2026-11-31' }).date).toBeTruthy()
    })

    it('«сегодня» считается по местному времени, а не по UTC', () => {
      const justAfterMidnight = new Date(2026, 9, 30, 0, 30, 0)
      expect(errorsFor({ date: '2026-10-29' }, justAfterMidnight).date).toBe('Выберите дату не раньше сегодняшней')
      expect(errorsFor({ date: '2026-10-30', time: '09:00' }, justAfterMidnight)).toEqual({})

      const lateEvening = new Date(2026, 9, 30, 23, 30, 0)
      expect(errorsFor({ date: '2026-10-31', time: '09:00' }, lateEvening)).toEqual({})
    })
  })

  describe('время', () => {
    it('значение вне слотов — ошибка', () => {
      expect(errorsFor({ time: '09:30' }).time).toBe('Выберите время')
      expect(errorsFor({ time: '21:00' }).time).toBe('Выберите время')
      expect(errorsFor({ time: '' }).time).toBe('Выберите время')
    })

    it('все слоты на завтра проходят', () => {
      for (const time of timeSlots) {
        expect(errorsFor({ time }).time).toBeUndefined()
      }
    })

    it('сегодня в 15:30: слот 15:00 — ошибка, 16:00 — можно', () => {
      const now = new Date(2026, 9, 30, 15, 30, 0)
      expect(errorsFor({ date: '2026-10-30', time: '15:00' }, now).time).toBeTruthy()
      expect(errorsFor({ date: '2026-10-30', time: '16:00' }, now).time).toBeUndefined()
    })

    it('сегодня ровно в 16:00: слот 16:00 уже нельзя, 17:00 можно', () => {
      const now = new Date(2026, 9, 30, 16, 0, 0)
      expect(errorsFor({ date: '2026-10-30', time: '16:00' }, now).time).toBeTruthy()
      expect(errorsFor({ date: '2026-10-30', time: '17:00' }, now).time).toBeUndefined()
    })

    it('сегодня вечером после последнего слота нет доступного времени', () => {
      const now = new Date(2026, 9, 30, 21, 30, 0)
      expect(errorsFor({ date: '2026-10-30', time: '20:00' }, now).time).toBeTruthy()
    })

    it('на завтра ограничение по часу не действует', () => {
      const now = new Date(2026, 9, 30, 15, 30, 0)
      expect(errorsFor({ date: '2026-10-31', time: '09:00' }, now).time).toBeUndefined()
    })
  })

  describe('согласие и комментарий', () => {
    it('без согласия — ошибка', () => {
      expect(errorsFor({ consent: false }).consent).toBe('Нужно согласие на обработку данных')
    })

    it('комментарий до 500 символов', () => {
      expect(errorsFor({ comment: 'а'.repeat(500) }).comment).toBeUndefined()
      expect(errorsFor({ comment: 'а'.repeat(501) }).comment).toBe('Не больше 500 символов')
    })
  })
})
