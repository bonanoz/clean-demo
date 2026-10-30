import { useEffect, useRef, useState } from 'react'
import { CarFront, Menu, Phone, X } from 'lucide-react'
import { nav, site } from '@/data/site'
import { typo } from '@/lib/typo'

const navLink =
  'type-ui rounded-lg px-3.5 py-2.5 text-fog transition-[color,background-color] duration-(--dur-ui) ease-[ease] hover:text-paper aria-[current]:bg-ink-3 aria-[current]:text-paper'

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const burger = useRef<HTMLButtonElement>(null)

  // Фон шапки: сентинел в начале страницы ушёл из вида — значит, прокрутили. При открытом меню фон тоже нужен.
  useEffect(() => {
    const el = sentinel.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Активный пункт: секция, которая пересекает полосу чуть выше середины экрана.
  // Состояние меняется только на границах секций, а не на каждом кадре прокрутки.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = `#${entry.target.id}`
          if (entry.isIntersecting) setActive(id)
          else setActive((current) => (current === id ? null : current))
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    for (const item of nav) {
      const section = document.querySelector(item.href)
      if (section) io.observe(section)
    }
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      burger.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-2 w-px" />
      <header
        data-solid={scrolled || open ? '' : undefined}
        className="sticky top-0 z-50 before:absolute before:inset-0 before:-z-10 before:border-b before:border-line before:bg-ink-0 before:opacity-0 before:transition-opacity before:duration-(--dur-ui) before:ease-[ease] data-solid:before:opacity-100"
      >
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:absolute focus:px-5 focus:top-2 focus:left-(--gutter) focus:z-10"
        >
          К содержимому
        </a>

        <div className="shell flex h-(--header-h) items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <a href="#hero" className="type-ui flex items-center gap-2.5 justify-self-start font-display text-paper">
            <CarFront aria-hidden="true" className="size-6 text-sage-bright" strokeWidth={1.75} />
            <span>
              clean<span className="text-fog">.cars</span>
            </span>
          </a>

          <nav aria-label="Разделы" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-xl border border-line bg-ink-1 p-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active === item.href ? 'location' : undefined}
                    className={`${navLink} block`}
                  >
                    {typo(item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <a
              href={site.phoneHref}
              className="type-ui hidden items-center gap-2 px-3 whitespace-nowrap text-fog tabular-nums transition-colors hover:text-paper xl:flex"
            >
              <Phone aria-hidden="true" className="size-4" strokeWidth={1.75} />
              {site.phone}
            </a>
            <a href="#booking" className="btn btn-primary hidden sm:inline-flex">
              Записаться
            </a>
            <button
              ref={burger}
              type="button"
              aria-label="Меню"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
              className="press grid size-11 place-items-center rounded-lg border border-line bg-ink-1 text-paper lg:hidden"
            >
              {open ? (
                <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
              ) : (
                <Menu aria-hidden="true" className="size-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Меню всегда в DOM: закрытие идёт тем же путём, что и открытие. Закрытое — inert. */}
        <div
          id="mobile-menu"
          data-state={open ? 'open' : 'closed'}
          inert={!open}
          className="absolute inset-x-0 top-full border-b border-line bg-ink-0 transition-[opacity,translate] duration-(--dur-ui) ease-out motion-reduce:transition-[opacity] data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 motion-safe:data-[state=closed]:-translate-y-2 lg:hidden"
        >
          <nav aria-label="Меню" className="shell py-4">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href} className="border-b border-line last:border-b-0">
                  <a
                    href={item.href}
                    aria-current={active === item.href ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                    className="type-ui flex min-h-12 items-center text-fog transition-colors hover:text-paper aria-[current]:text-paper"
                  >
                    {typo(item.label)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={site.phoneHref}
                className="type-ui flex min-h-11 items-center gap-2 whitespace-nowrap text-paper tabular-nums"
                onClick={() => setOpen(false)}
              >
                <Phone aria-hidden="true" className="size-4 text-sage-bright" strokeWidth={1.75} />
                {site.phone}
              </a>
              <a href="#booking" className="btn btn-primary" onClick={() => setOpen(false)}>
                Записаться
              </a>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
