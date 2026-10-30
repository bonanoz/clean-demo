import { render, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '@/sections/Footer'
import { site } from '@/data/site'
import { nameHas } from '@/test/helpers'

afterEach(() => {
  vi.useRealTimers()
})

function renderFooter() {
  const { container } = render(<Footer />)
  const footer = container.querySelector<HTMLElement>('#contacts')
  expect(footer, 'нет элемента с id="contacts"').not.toBeNull()
  return footer!
}

describe('E5: Footer', () => {
  it('это подвал страницы (contentinfo) с id="contacts"', () => {
    const footer = renderFooter()
    expect(footer.tagName).toBe('FOOTER')
  })

  it('почта и телефон — рабочие ссылки', () => {
    const footer = renderFooter()
    const hrefs = within(footer).getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('mailto:hello@cleancars.example')
    expect(hrefs).toContain('tel:+79000000000')
  })

  it('адрес и часы работы', () => {
    const footer = renderFooter()
    expect(footer).toHaveTextContent('Москва, ул. Примерная, 1')
    expect(footer).toHaveTextContent('Ежедневно 9:00–21:00')
  })

  it('соцсети — ссылки с aria-label', () => {
    const footer = renderFooter()
    for (const { label } of site.socials) {
      const link = within(footer).getByRole('link', { name: nameHas(label) })
      expect(link.getAttribute('aria-label'), label).toBeTruthy()
    }
  })

  it('быстрые ссылки: не меньше шести якорей на разделы страницы', () => {
    const footer = renderFooter()
    const anchors = within(footer)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => /^#[a-z]/.test(href))
    expect(anchors.length).toBeGreaterThanOrEqual(6)
  })

  it('«© clean.cars» и текущий год', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2031, 0, 15, 12, 0, 0))
    const footer = renderFooter()
    expect(footer).toHaveTextContent('©')
    expect(footer).toHaveTextContent('clean.cars')
    expect(footer).toHaveTextContent('2031')
  })
})
