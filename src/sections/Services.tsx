import { Check } from 'lucide-react'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { Photo } from '@/components/kit/Photo'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { serviceGroups, type ServiceGroupId } from '@/data/services'
import type { ImageName } from '@/data/images'
import { formatRub } from '@/lib/format'
import { priceRange } from '@/lib/price'
import { typo } from '@/lib/typo'

const [interior, exterior, protection] = serviceGroups

/** «от 4 000 ₽ до 12 600 ₽»: слова «от» и «до» приглушены, чтобы цифры читались первыми. */
function Price({ group }: { group: ServiceGroupId }) {
  const { min, max } = priceRange(group)
  return (
    <p className="type-price text-paper">
      <span className="text-fog-dim">{typo('от ')}</span>
      {formatRub(min)} <span className="text-fog-dim">{typo('до ')}</span>
      {formatRub(max)}
    </p>
  )
}

/** Фото в клетке коллажа. Маска-раскрытие на обёртке, ховер-зум — на клетке внутри (они не должны делить элемент). */
function PhotoCell({ name, alt, index, className }: { name: ImageName; alt: string; index: number; className?: string }) {
  return (
    <Reveal variant="clip" index={index} className={className}>
      <div className="hover-zoom relative h-full overflow-hidden rounded-xl bg-ink-3">
        <Photo name={name} alt={alt} sizes="(min-width: 1024px) 26vw, 44vw" className="absolute inset-0 size-full object-cover" />
      </div>
    </Reveal>
  )
}

const groupLabel = (group: (typeof serviceGroups)[number]) => `[УСЛУГА] [${group.index}] / ${group.label}`

/** Кузов и защита: фото, описание, пункты, цена и запись. */
function CompactCard({ group, photo, alt }: { group: typeof exterior | typeof protection; photo: ImageName; alt: string }) {
  const titleId = `service-${group.id}`
  return (
    // Без Reveal: в стопке эти карточки едут поверх салона, и скрытая карточка оставляла бы чёрный провал на панели
    <div className="h-full">
      <article aria-labelledby={titleId} className="hover-lift flex h-full flex-col gap-5 rounded-card bg-ink-2 p-4 sm:p-6">
        <div className="hover-zoom relative h-44 overflow-hidden rounded-xl bg-ink-3">
          <Photo name={photo} alt={alt} sizes="(min-width: 768px) 44vw, 92vw" className="absolute inset-0 size-full object-cover" />
        </div>
        <MonoLabel>{groupLabel(group)}</MonoLabel>
        <div className="flex flex-col gap-3">
          <h3 id={titleId} className="type-h3">
            {typo(group.title)}
          </h3>
          <p className="type-body text-fog">{typo(group.description)}</p>
        </div>
        <ul className="type-small grid gap-x-4 gap-y-2 text-fog sm:grid-cols-2">
          {group.items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sage-bright" strokeWidth={1.75} />
              {typo(item)}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <Price group={group.id} />
          <a href="#booking" className="btn btn-primary">
            Записаться
          </a>
        </div>
      </article>
    </div>
  )
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="shell py-(--section-y)">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="services-title" label="[УСЛУГИ]" title="От мойки кузова до полного детейлинга" className="max-w-3xl" />
        <Reveal
          as="p"
          index={1}
          className="type-small inline-flex w-fit items-center gap-2 rounded-full border border-line bg-ink-2 px-4 py-2 text-fog"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-sage-bright" />
          {typo('1 500+ клиентов')}
        </Reveal>
      </div>

      {/* Стопка: на ≥ 1024 px первая карточка залипает, вторая наезжает на неё (index.css). */}
      <div className="stack mt-10 lg:mt-14">
        <article aria-labelledby="service-interior" className="stack-base flex flex-col gap-4">
          <NotchCard className="flex flex-col gap-6 p-4 pt-12 sm:p-6">
            <MonoLabel>{groupLabel(interior)}</MonoLabel>
            <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
              <div className="grid h-80 grid-cols-2 grid-rows-2 gap-3">
                <PhotoCell name="interior-console" alt="Центральная консоль с селектором режимов и светлой кожей" index={0} className="row-span-2" />
                <PhotoCell name="interior-cleaning" alt="Мастер в перчатках протирает панель салона микрофиброй" index={1} />
                <PhotoCell name="interior-seats" alt="Светлые кожаные сиденья в салоне" index={2} />
              </div>
              <Reveal index={1} className="flex flex-col justify-between gap-6">
                <Price group={interior.id} />
                <div className="flex flex-col gap-3">
                  <h3 id="service-interior" className="type-h3">
                    {typo(interior.title)}
                  </h3>
                  <p className="type-body text-fog">{typo(interior.description)}</p>
                </div>
              </Reveal>
            </div>
          </NotchCard>

          <Reveal className="rounded-card bg-sage p-4 text-on-sage sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <p className="type-lead">{typo('Что входит в химчистку салона')}</p>
              <div className="flex flex-wrap gap-2">
                <a href="#booking" className="btn btn-primary">
                  Записаться
                </a>
                <a href="#contacts" className="btn btn-secondary">
                  Контакты
                </a>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {interior.items.map((item, i) => (
                <Reveal as="li" key={item} index={i}>
                  <NotchCard
                    notch={i % 2 ? 'top-left' : 'top-right'}
                    className="flex h-full min-h-36 flex-col justify-between gap-4 bg-sage-deep p-4 pt-9 text-on-sage"
                  >
                    <MonoLabel className="text-on-sage">[{String(i + 1).padStart(2, '0')}]</MonoLabel>
                    <p className="type-small">{typo(item)}</p>
                    <Check aria-hidden="true" className="size-5 self-end" strokeWidth={1.75} />
                  </NotchCard>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </article>

        <div className="stack-cover bg-ink-0 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CompactCard group={exterior} photo="exterior-foam" alt="Чёрная машина и колесо в пене" />
            <CompactCard group={protection} photo="coating" alt="Мастер полирует кузов тёмной машины" />
          </div>
        </div>
      </div>
    </section>
  )
}
