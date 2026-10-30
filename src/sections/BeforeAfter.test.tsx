import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BeforeAfter } from '@/sections/BeforeAfter'
import { expectValidPhotos, nameIs } from '@/test/helpers'

function renderResults() {
  const { container } = render(<BeforeAfter />)
  const section = container.querySelector<HTMLElement>('section#results')
  expect(section, 'нет <section id="results">').not.toBeNull()
  return section!
}

describe('E6: BeforeAfter', () => {
  it('h2 «До и после химчистки»', () => {
    const section = renderResults()
    expect(within(section).getByRole('heading', { level: 2, name: nameIs('До и после химчистки') })).toBeInTheDocument()
  })

  it('внутри слайдер «Сравнение до и после»', () => {
    const section = renderResults()
    const slider = within(section).getByRole('slider', { name: nameIs('Сравнение до и после') })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  it('подписи «До» и «После» вне заголовка', () => {
    const section = renderResults()
    for (const caption of ['До', 'После']) {
      const found = within(section).getAllByText(caption)
      expect(found.some((el) => !el.closest('h2')), `нет подписи «${caption}»`).toBe(true)
    }
  })

  it('фото compare-before и compare-after: разные непустые alt, размеры, /images/', () => {
    const section = renderResults()
    const imgs = expectValidPhotos(section, 2)
    const before = imgs.find((i) => i.getAttribute('src')?.startsWith('/images/compare-before-'))
    const after = imgs.find((i) => i.getAttribute('src')?.startsWith('/images/compare-after-'))
    expect(before, 'нет compare-before').toBeDefined()
    expect(after, 'нет compare-after').toBeDefined()
    expect(before!.getAttribute('alt')).not.toBe(after!.getAttribute('alt'))
    for (const img of [before!, after!]) expect(img).toHaveAttribute('loading', 'lazy')
  })
})
