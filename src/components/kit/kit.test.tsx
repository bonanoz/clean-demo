import { act, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { Photo } from '@/components/kit/Photo'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { SplitWords } from '@/components/kit/SplitWords'
import { useInView } from '@/lib/use-in-view'
import { nameIs } from '@/test/helpers'

// IntersectionObserver, которым тест управляет вручную (мок из setup.ts срабатывает сразу).
type Entry = Partial<IntersectionObserverEntry>
class ControlledIO {
  static instances: ControlledIO[] = []
  constructor(
    private cb: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    ControlledIO.instances.push(this)
  }
  targets: Element[] = []
  observe(el: Element) {
    this.targets.push(el)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
  fire(isIntersecting: boolean) {
    const entries = this.targets.map((target) => ({ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }) as Entry)
    act(() => this.cb(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver))
  }
}

const originalIO = globalThis.IntersectionObserver
function useControlledIO() {
  ControlledIO.instances = []
  globalThis.IntersectionObserver = ControlledIO as unknown as typeof IntersectionObserver
}
afterEach(() => {
  globalThis.IntersectionObserver = originalIO
})

describe('E1: useInView', () => {
  function Probe(props: { once?: boolean; rootMargin?: string }) {
    const [ref, inView] = useInView<HTMLDivElement>(props)
    return (
      <div ref={ref} data-testid="probe">
        {inView ? 'in' : 'out'}
      </div>
    )
  }

  it('становится true, когда элемент пересёк viewport (мок IO из setup.ts)', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('in')
  })

  it('по умолчанию once: после ухода из viewport остаётся true', () => {
    useControlledIO()
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('out')
    ControlledIO.instances[0].fire(true)
    expect(screen.getByTestId('probe')).toHaveTextContent('in')
    ControlledIO.instances[0].fire(false)
    expect(screen.getByTestId('probe')).toHaveTextContent('in')
  })

  it('once: false следует за видимостью', () => {
    useControlledIO()
    render(<Probe once={false} />)
    ControlledIO.instances[0].fire(true)
    expect(screen.getByTestId('probe')).toHaveTextContent('in')
    ControlledIO.instances[0].fire(false)
    expect(screen.getByTestId('probe')).toHaveTextContent('out')
  })

  it('rootMargin передаётся в IntersectionObserver', () => {
    useControlledIO()
    render(<Probe rootMargin="0px 0px -10% 0px" />)
    expect(ControlledIO.instances[0].options?.rootMargin).toBe('0px 0px -10% 0px')
  })
})

describe('E1: Reveal', () => {
  it('по умолчанию variant="up", после пересечения (мок IO) есть data-visible', () => {
    render(<Reveal data-testid="r">текст</Reveal>)
    const el = screen.getByTestId('r')
    expect(el).toHaveAttribute('data-reveal', 'up')
    expect(el).toHaveAttribute('data-visible')
    expect(el).toHaveTextContent('текст')
  })

  it('data-visible появляется только после пересечения и не пропадает', () => {
    useControlledIO()
    render(<Reveal data-testid="r">текст</Reveal>)
    const el = screen.getByTestId('r')
    expect(el).not.toHaveAttribute('data-visible')
    ControlledIO.instances[0].fire(false)
    expect(el).not.toHaveAttribute('data-visible')
    ControlledIO.instances[0].fire(true)
    expect(el).toHaveAttribute('data-visible')
    ControlledIO.instances[0].fire(false)
    expect(el).toHaveAttribute('data-visible')
  })

  it('без IntersectionObserver в window data-visible сразу', () => {
    // @ts-expect-error имитируем браузер без IntersectionObserver
    delete globalThis.IntersectionObserver
    expect('IntersectionObserver' in window).toBe(false)
    render(<Reveal data-testid="r">текст</Reveal>)
    expect(screen.getByTestId('r')).toHaveAttribute('data-visible')
  })

  it.each(['up', 'clip', 'fade'] as const)('variant="%s" попадает в data-reveal', (variant) => {
    render(
      <Reveal variant={variant} data-testid="r">
        x
      </Reveal>,
    )
    expect(screen.getByTestId('r')).toHaveAttribute('data-reveal', variant)
  })

  it('as задаёт тег, className применяется', () => {
    render(
      <Reveal as="section" className="my-reveal" data-testid="r">
        x
      </Reveal>,
    )
    const el = screen.getByTestId('r')
    expect(el.tagName).toBe('SECTION')
    expect(el).toHaveClass('my-reveal')
  })

  it('задержка index × --stagger лежит в inline transition-delay на самом элементе', () => {
    render(
      <>
        <Reveal index={3} data-testid="r3">
          x
        </Reveal>
        <Reveal index={1} data-testid="r1">
          x
        </Reveal>
      </>,
    )
    const style3 = screen.getByTestId('r3').getAttribute('style') ?? ''
    const style1 = screen.getByTestId('r1').getAttribute('style') ?? ''
    expect(style3).toMatch(/transition-delay:[^;]*--stagger[^;]*3|transition-delay:[^;]*3[^;]*--stagger/)
    expect(style1).toMatch(/transition-delay:[^;]*--stagger/)
    expect(style1).not.toBe(style3)
  })
})

describe('E1: SplitWords', () => {
  it('h1: доступное имя равно исходному тексту', () => {
    render(<SplitWords as="h1" text="Вернём машине заводской блеск" />)
    expect(screen.getByRole('heading', { level: 1, name: nameIs('Вернём машине заводской блеск') })).toBeInTheDocument()
  })

  it('по умолчанию h2, id и className применяются', () => {
    render(<SplitWords text="Что говорят клиенты" id="reviews-title" className="my-title" />)
    const h = screen.getByRole('heading', { level: 2, name: nameIs('Что говорят клиенты') })
    expect(h).toHaveAttribute('id', 'reviews-title')
    expect(h).toHaveClass('my-title')
  })

  it('доступное имя учитывает typo: пробелы только неразрывные или обычные, слова те же', () => {
    render(<SplitWords as="h2" text="Мойка в боксе" />)
    expect(screen.getByRole('heading', { name: nameIs('Мойка в боксе') })).toBeInTheDocument()
  })

  it('каждое слово обёрнуто в свой элемент', () => {
    render(<SplitWords as="h1" text="Вернём машине заводской блеск" />)
    const h = screen.getByRole('heading', { level: 1 })
    for (const word of ['Вернём', 'машине', 'заводской', 'блеск']) {
      expect(within(h).getAllByText(word)).toHaveLength(1)
    }
  })
})

describe('E1: Photo', () => {
  const sizes = '(min-width: 1024px) 58vw, 100vw'

  function renderPhoto(props: { priority?: boolean } = {}) {
    const { container } = render(
      <Photo name="hero-main" width={1600} height={1067} alt="Спорткар цвета шалфея" sizes={sizes} {...props} />,
    )
    return {
      picture: container.querySelector('picture')!,
      avif: container.querySelector('source[type="image/avif"]')!,
      webp: container.querySelector('source[type="image/webp"]')!,
      img: container.querySelector('img')!,
    }
  }

  const srcset = (el: Element) =>
    (el.getAttribute('srcset') ?? '').split(',').map((s) => s.trim().replace(/\s+/g, ' '))

  it('picture с двумя source: AVIF, затем WebP', () => {
    const { picture, avif, webp } = renderPhoto()
    expect(picture).not.toBeNull()
    const sources = [...picture.querySelectorAll('source')]
    expect(sources).toHaveLength(2)
    expect(sources[0]).toBe(avif)
    expect(sources[1]).toBe(webp)
  })

  it('srcset: три ширины 640w, 1024w, 1600w в каждом формате', () => {
    const { avif, webp } = renderPhoto()
    expect(srcset(avif)).toEqual([
      '/images/hero-main-640.avif 640w',
      '/images/hero-main-1024.avif 1024w',
      '/images/hero-main-1600.avif 1600w',
    ])
    expect(srcset(webp)).toEqual([
      '/images/hero-main-640.webp 640w',
      '/images/hero-main-1024.webp 1024w',
      '/images/hero-main-1600.webp 1600w',
    ])
  })

  it('sizes передаётся в source', () => {
    const { avif, webp } = renderPhoto()
    expect(avif).toHaveAttribute('sizes', sizes)
    expect(webp).toHaveAttribute('sizes', sizes)
  })

  it('img: src на 1024 webp, width, height, alt', () => {
    const { img } = renderPhoto()
    expect(img).toHaveAttribute('src', '/images/hero-main-1024.webp')
    expect(img).toHaveAttribute('width', '1600')
    expect(img).toHaveAttribute('height', '1067')
    expect(img).toHaveAttribute('alt', 'Спорткар цвета шалфея')
  })

  it('img — последний ребёнок picture (браузер выбирает source по порядку)', () => {
    const { picture, img } = renderPhoto()
    expect(picture.lastElementChild).toBe(img)
  })

  it('priority: fetchpriority="high" и нет loading="lazy"', () => {
    const { img } = renderPhoto({ priority: true })
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).not.toHaveAttribute('loading', 'lazy')
  })

  it('без priority: loading="lazy" decoding="async" и нет fetchpriority="high"', () => {
    const { img } = renderPhoto()
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).not.toHaveAttribute('fetchpriority', 'high')
  })

  it('имя файла берётся из name', () => {
    const { container } = render(<Photo name="booking-car" width={900} height={1200} alt="Корма" sizes="100vw" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/booking-car-1024.webp')
    expect(container.querySelector('source[type="image/avif"]')?.getAttribute('srcset')).toContain('/images/booking-car-1600.avif 1600w')
  })
})

describe('E1: NotchCard и MonoLabel', () => {
  it('NotchCard выводит содержимое при обоих положениях выреза и принимает className', () => {
    const { container, rerender } = render(
      <NotchCard className="my-card">
        <p>Внимание к деталям</p>
      </NotchCard>,
    )
    expect(screen.getByText('Внимание к деталям')).toBeInTheDocument()
    expect(container.querySelector('.my-card')).not.toBeNull()

    rerender(
      <NotchCard notch="top-left" className="my-card">
        <p>Внимание к деталям</p>
      </NotchCard>,
    )
    expect(screen.getByText('Внимание к деталям')).toBeInTheDocument()
    expect(container.querySelector('.my-card')).not.toBeNull()
  })

  it('MonoLabel выводит метку', () => {
    render(<MonoLabel>[УСЛУГА] [01] / ХИМЧИСТКА САЛОНА</MonoLabel>)
    expect(screen.getByText('[УСЛУГА] [01] / ХИМЧИСТКА САЛОНА')).toBeInTheDocument()
  })
})

describe('E1: SectionHeading', () => {
  it('метка и h2 с заданным id', () => {
    render(<SectionHeading id="services-title" label="[УСЛУГИ] [01] / САЛОН" title="От мойки кузова до полного детейлинга" />)
    expect(screen.getByText('[УСЛУГИ] [01] / САЛОН')).toBeInTheDocument()
    const h = screen.getByRole('heading', { level: 2, name: nameIs('От мойки кузова до полного детейлинга') })
    expect(h).toHaveAttribute('id', 'services-title')
  })
})
