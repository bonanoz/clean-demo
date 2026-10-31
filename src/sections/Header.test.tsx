import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Header } from '@/sections/Header'
import { nav, site } from '@/data/site'
import { nameIs, norm } from '@/test/helpers'

describe('E1: Header', () => {
  it('это баннер с логотипом clean.cars', () => {
    render(<Header />)
    const banner = screen.getByRole('banner')
    expect(banner).toHaveTextContent('clean.cars')
  })

  it('ссылка на телефон tel:+79000000000 с номером в тексте', () => {
    render(<Header />)
    const phone = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === site.phoneHref)
    expect(phone.length).toBeGreaterThanOrEqual(1)
    expect(norm(phone[0].textContent)).toContain('+7 (900) 000-00-00')
  })

  it('ссылка «Записаться» ведёт на #booking', () => {
    render(<Header />)
    const cta = screen.getAllByRole('link', { name: nameIs('Записаться') })
    expect(cta.length).toBeGreaterThanOrEqual(1)
    for (const a of cta) expect(a).toHaveAttribute('href', '#booking')
  })

  it('все пункты навигации на месте и ведут на свои якоря', () => {
    render(<Header />)
    expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1)
    for (const item of nav) {
      const links = screen.getAllByRole('link', { name: nameIs(item.label) })
      expect(links.some((a) => a.getAttribute('href') === item.href), `${item.label} → ${item.href}`).toBe(true)
    }
  })
})

describe('E1: Header, мобильное меню', () => {
  // Кнопка меню — единственная кнопка с aria-expanded в шапке.
  const burger = () => screen.getByRole('button', { expanded: false })

  it('у кнопки меню есть доступное имя', () => {
    render(<Header />)
    expect(burger()).toHaveAccessibleName()
  })

  it('aria-expanded переключается false → true → false', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const button = burger()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('Escape закрывает меню и возвращает фокус на кнопку', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const button = burger()
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // фокус уходит внутрь меню: Escape должен работать и оттуда
    screen.getAllByRole('link', { name: nameIs('Услуги') }).at(-1)!.focus()
    expect(button).not.toHaveFocus()

    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('Escape при закрытом меню ничего не меняет', async () => {
    const user = userEvent.setup()
    render(<Header />)
    const button = burger()
    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
