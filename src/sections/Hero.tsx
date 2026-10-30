import { MonoLabel } from '@/components/kit/MonoLabel'
import { Photo } from '@/components/kit/Photo'
import { SplitWords } from '@/components/kit/SplitWords'

// Заглушка E1: секцию собирает E3.
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-title" className="shell pt-8 pb-(--section-y)">
      <MonoLabel>[CLEAN.CARS] / МОЙКА И ДЕТЕЙЛИНГ</MonoLabel>
      <SplitWords as="h1" id="hero-title" text="Вернём машине заводской блеск" className="type-h1 mt-4 max-w-[14ch]" />
      <div className="hover-zoom mt-8 aspect-[16/10] overflow-hidden rounded-card lg:w-[58vw]">
        <Photo
          name="hero-main"
          alt="Спорткар цвета шалфея в тёмной студии"
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          className="parallax size-full object-cover"
        />
      </div>
    </section>
  )
}
