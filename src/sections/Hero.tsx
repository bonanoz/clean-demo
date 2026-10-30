import { Truck, Users } from 'lucide-react'
import { MonoLabel } from '@/components/kit/MonoLabel'
import { NotchCard } from '@/components/kit/NotchCard'
import { Photo } from '@/components/kit/Photo'
import { Reveal } from '@/components/kit/Reveal'
import { SplitWords } from '@/components/kit/SplitWords'
import { site } from '@/data/site'
import { typo } from '@/lib/typo'

const facts = [
  { index: '[01]', text: 'Выездная мойка', Icon: Truck },
  { index: '[02]', text: '1 500 владельцев доверили нам машину', Icon: Users },
]

/**
 * Первый экран. Размеры и сдвиги машины (--car-w, --car-h, зазор между строками h1) и
 * её движение — в index.css, раздел «Hero: машина поверх заголовка».
 */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="shell pt-6 pb-(--section-y) lg:pt-10">
      <div className="hero-stage grid">
        <div className="relative lg:col-start-1 lg:row-start-1">
          <SplitWords
            as="h1"
            id="hero-title"
            text="Заводской блеск"
            className="hero-title type-display flex flex-col items-start [&>.split-word:first-child]:text-sage-bright [&>.split-word:last-child]:self-center [&>.split-word:last-child]:text-ghost"
          />
          {/* Машина не ловит указатель и лежит над строками h1. Дрейф — на обёртке, въезд — на img. */}
          <div className="hero-car pointer-events-none absolute inset-0 z-10 grid place-items-center">
            <div className="hero-car-drift">
              <Photo
                name="hero-car"
                alt="Тёмно-зелёный кабриолет, вид сверху"
                sizes="(min-width: 1024px) 50vw, 84vw"
                priority
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* От 1024 px карточки стоят в зазоре между строками по бокам от машины, ниже — под заголовком. */}
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:pointer-events-none lg:z-10 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:flex lg:items-center lg:justify-between">
          {facts.map(({ index, text, Icon }, i) => (
            <Reveal as="li" key={index} index={i + 2} className="hero-fact">
              <div className="flex h-full items-start justify-between gap-3 rounded-card bg-ink-2 p-4">
                <div>
                  <MonoLabel className="text-sage-bright">{index}</MonoLabel>
                  <p className="type-small mt-2 text-paper">{typo(text)}</p>
                </div>
                <Icon aria-hidden="true" className="size-5 shrink-0 text-sage-bright" strokeWidth={1.75} />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:mt-12 lg:flex-row lg:items-end lg:justify-between">
        <p className="type-lead text-fog">
          <span className="text-paper">{typo('Вернём машине заводской блеск')}</span>
          {typo(`: моем кузов вручную, чистим салон, полируем лак и наносим керамику. Ждём по адресу: ${site.address}. ${site.hours}.`)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#booking" className="btn btn-primary">
            Записаться
          </a>
          <a href="#calculator" className="btn btn-secondary">
            Рассчитать цену
          </a>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-[3fr_2fr_7fr] lg:items-end">
        <Reveal className="sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1">
          <div className="hover-zoom aspect-[16/10] overflow-hidden rounded-card">
            <Photo
              name="hero-main"
              alt="Тёмно-зелёный спорткар с золотистыми дисками на мокром асфальте"
              sizes="(min-width: 1024px) 58vw, 100vw"
              priority
              className="parallax size-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal index={1} className="lg:col-start-1 lg:row-start-1">
          <NotchCard className="hover-lift flex flex-col gap-3 p-3">
            <MonoLabel className="px-2 pt-1.5">ВНИМАНИЕ К ДЕТАЛЯМ</MonoLabel>
            <div className="hover-zoom aspect-[4/3] overflow-hidden rounded-xl lg:aspect-[4/5]">
              <Photo
                name="hero-wheel"
                alt="Рука в чёрной перчатке чистит колёсный диск мягкой щёткой"
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 46vw, 92vw"
                className="size-full object-cover"
              />
            </div>
          </NotchCard>
        </Reveal>

        {/* Ниже 1024 px обёртка растворяется, и обе плитки встают в общую сетку. */}
        <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
          <Reveal index={2}>
            <div className="hover-zoom aspect-[4/3] overflow-hidden rounded-card lg:aspect-[4/5]">
              <Photo
                name="hero-interior"
                alt="Руль спорткара с гербом на ступице"
                sizes="(min-width: 1024px) 15vw, (min-width: 640px) 50vw, 100vw"
                className="size-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal index={3} className="sm:col-span-2 lg:col-span-1">
            <div className="hover-zoom aspect-[4/3] overflow-hidden rounded-card sm:aspect-[16/7] lg:aspect-[4/3]">
              <Photo
                name="hero-front"
                alt="Тёмный спорткар с включёнными фарами в полумраке"
                sizes="(min-width: 1024px) 15vw, 100vw"
                className="size-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
