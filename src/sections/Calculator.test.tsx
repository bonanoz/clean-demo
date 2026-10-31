import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Calculator } from '@/sections/Calculator'
import { carClasses, services } from '@/data/services'
import { nameIs, norm, re } from '@/test/helpers'

function renderCalculator() {
  const { container } = render(<Calculator />)
  const section = container.querySelector<HTMLElement>('section#calculator')
  expect(section, 'нет <section id="calculator">').not.toBeNull()
  // <output> может пересоздаваться при смене значения (@starting-style), поэтому каждый раз ищем заново.
  const output = () => {
    const el = section!.querySelector('output')
    expect(el, 'нет <output>').not.toBeNull()
    return el!
  }
  output()
  return { section: section!, output }
}

const radio = (label: string) => screen.getByLabelText(re(label)) as HTMLInputElement
const checkbox = (label: string) => screen.getByLabelText(re(label)) as HTMLInputElement

/** Сумма в <output>: первая цена вида «12 600 ₽», пробелы обычные. */
const total = (output: () => HTMLElement) => norm(output().textContent).match(/\d[\d ]*₽/)?.[0]

describe('E4: Calculator, начальное состояние', () => {
  it('выбран «Седан или хэтчбек», отмечена «Бережная мойка кузова», итог 1 500 ₽', () => {
    const { output } = renderCalculator()
    expect(radio('Седан или хэтчбек')).toBeChecked()
    expect(radio('Кроссовер')).not.toBeChecked()
    expect(radio('Внедорожник или минивэн')).not.toBeChecked()

    expect(checkbox('Бережная мойка кузова')).toBeChecked()
    for (const s of services.filter((s) => s.id !== 'wash')) {
      expect(checkbox(s.title), s.title).not.toBeChecked()
    }
    expect(total(output)).toBe('1 500 ₽')
  })

  it('радио и чекбоксы находятся по подписи для каждого класса и каждой услуги из данных', () => {
    renderCalculator()
    for (const c of carClasses) expect(radio(c.label), c.label).toHaveAttribute('type', 'radio')
    for (const s of services) expect(checkbox(s.title), s.title).toHaveAttribute('type', 'checkbox')
  })

  it('у <output> есть aria-live="polite" и подпись «Итого»', () => {
    const { section, output } = renderCalculator()
    expect(output()).toHaveAttribute('aria-live', 'polite')
    expect(within(section).getAllByText(/^Итого/).length).toBeGreaterThanOrEqual(1)
  })

  it('ссылка «Записаться» ведёт на #booking', () => {
    const { section } = renderCalculator()
    const links = within(section).getAllByRole('link', { name: nameIs('Записаться') })
    for (const a of links) expect(a).toHaveAttribute('href', '#booking')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('подсказки «Выберите хотя бы одну услугу» нет, пока что-то выбрано', () => {
    renderCalculator()
    expect(screen.queryByText('Выберите хотя бы одну услугу')).toBeNull()
  })
})

describe('E4: Calculator, пересчёт', () => {
  it('«Кроссовер» + «Химчистка салона» → 12 600 ₽', async () => {
    const user = userEvent.setup()
    const { output } = renderCalculator()
    await user.click(radio('Кроссовер'))
    await user.click(checkbox('Химчистка салона'))
    expect(radio('Кроссовер')).toBeChecked()
    expect(total(output)).toBe('12 600 ₽')
  })

  it('выбор класса снимает предыдущий и меняет цену', async () => {
    const user = userEvent.setup()
    const { output } = renderCalculator()
    await user.click(radio('Внедорожник или минивэн'))
    expect(radio('Внедорожник или минивэн')).toBeChecked()
    expect(radio('Седан или хэтчбек')).not.toBeChecked()
    expect(total(output)).toBe('2 100 ₽')

    await user.click(radio('Седан или хэтчбек'))
    expect(total(output)).toBe('1 500 ₽')
  })

  it('«Внедорожник» + керамика + полировка + мойка → 53 900 ₽ (и снятие услуги пересчитывает)', async () => {
    const user = userEvent.setup()
    const { output } = renderCalculator()
    await user.click(radio('Внедорожник или минивэн'))
    await user.click(checkbox('Керамическое покрытие'))
    await user.click(checkbox('Полировка кузова'))
    expect(total(output)).toBe('53 900 ₽')
    await user.click(checkbox('Бережная мойка кузова'))
    expect(total(output)).toBe('51 800 ₽')
  })

  it('сняты все галочки → 0 ₽ и подсказка «Выберите хотя бы одну услугу»', async () => {
    const user = userEvent.setup()
    const { section, output } = renderCalculator()
    await user.click(checkbox('Бережная мойка кузова'))
    expect(checkbox('Бережная мойка кузова')).not.toBeChecked()
    expect(total(output)).toBe('0 ₽')
    expect(within(section).getByText('Выберите хотя бы одну услугу')).toBeVisible()
  })

  it('после возврата к выбору подсказка исчезает', async () => {
    const user = userEvent.setup()
    const { output } = renderCalculator()
    await user.click(checkbox('Бережная мойка кузова'))
    await user.click(checkbox('Мойка двигателя'))
    expect(total(output)).toBe('2 500 ₽')
    expect(screen.queryByText('Выберите хотя бы одну услугу')).toBeNull()
  })

  it('управление с клавиатуры: пробел отмечает услугу', async () => {
    const user = userEvent.setup()
    const { output } = renderCalculator()
    checkbox('Мойка двигателя').focus()
    await user.keyboard(' ')
    expect(checkbox('Мойка двигателя')).toBeChecked()
    expect(total(output)).toBe('4 000 ₽')
  })
})
