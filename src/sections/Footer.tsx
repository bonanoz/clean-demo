import { MessageCircle, Send, UsersRound, type LucideIcon } from 'lucide-react'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { Reveal } from '@/components/kit/Reveal'
import { nav, site } from '@/data/site'
import { typo } from '@/lib/typo'

// В lucide нет брендовых иконок: ближайшие по смыслу, имя ссылки читается из aria-label.
const socialIcons: Record<string, LucideIcon> = { Telegram: Send, WhatsApp: MessageCircle, VK: UsersRound }

// Заголовки столбцов; подписи ссылок берём из nav, чтобы они не расходились с шапкой.
const columns = [
  { title: 'Выбрать', hrefs: ['#services', '#calculator'] },
  { title: 'Проверить', hrefs: ['#results', '#reviews'] },
  { title: 'Приехать', hrefs: ['#booking', '#contacts'] },
]

const bigLink = 'type-h3 block break-words text-paper tabular-nums lining-nums transition-colors hover:text-sage-bright'

export function Footer() {
  return (
    <footer id="contacts" aria-label="Контакты" className="border-t border-line">
      <div className="shell py-(--section-y)">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <MonoLabel>[ПОЧТА]</MonoLabel>
              <a href={`mailto:${site.email}`} className={bigLink}>
                {site.email}
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <MonoLabel>[ТЕЛЕФОН]</MonoLabel>
              <a href={site.phoneHref} className={bigLink}>
                {site.phone}
              </a>
            </div>
            <address className="flex flex-col gap-3 not-italic">
              <MonoLabel>[АДРЕС И ЧАСЫ]</MonoLabel>
              <p className="type-body tabular-nums lining-nums text-fog">
                {typo(site.address)}
                <br />
                {typo(site.hours)}
              </p>
            </address>
            <div className="flex flex-col gap-3">
              <MonoLabel>[СОЦСЕТИ]</MonoLabel>
              <ul className="flex gap-3">
                {site.socials.map(({ label, href }) => {
                  const Icon = socialIcons[label]
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        aria-label={label}
                        className="grid size-12 place-items-center rounded-xl bg-ink-3 text-fog transition-colors hover:text-paper"
                      >
                        <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal as="nav" index={1} aria-label="Быстрые ссылки" className="flex flex-col gap-3 lg:self-end">
            <MonoLabel>[БЫСТРЫЕ ССЫЛКИ]</MonoLabel>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line">
              {columns.map(({ title, hrefs }) => (
                <div key={title} className="bg-ink-2">
                  <p className="type-label border-b border-line bg-ink-3 px-3 py-3 text-paper sm:px-4">{typo(title)}</p>
                  <ul>
                    {hrefs.map((href) => (
                      <li key={href} className="border-b border-line last:border-b-0">
                        <a
                          href={href}
                          className="type-small flex min-h-12 items-center px-3 text-fog transition-colors hover:text-paper sm:px-4"
                        >
                          {typo(nav.find((item) => item.href === href)?.label ?? '')}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="type-small mt-16 border-t border-line pt-6 text-fog-dim">
          © {site.name}, {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  )
}
