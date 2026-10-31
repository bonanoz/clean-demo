import { Star } from 'lucide-react'
import { Reveal } from '@/components/kit/Reveal'
import { SectionHeading } from '@/components/kit/SectionHeading'
import { reviews } from '@/data/reviews'
import { typo } from '@/lib/typo'

const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`Оценка ${rating} из 5`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          strokeWidth={1.75}
          className={i < rating ? 'size-4 fill-sage-bright text-sage-bright' : 'size-4 text-fog-dim'}
        />
      ))}
    </span>
  )
}

export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="shell py-(--section-y)">
      <SectionHeading id="reviews-title" label="[ОТЗЫВЫ]" title="Что говорят клиенты" />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal key={review.name} as="li" index={i % 3} className="flex">
            <figure className="hover-lift flex w-full flex-col gap-5 rounded-card bg-ink-2 p-6">
              <Stars rating={review.rating} />
              <blockquote>
                <p className="type-body text-paper">{typo(review.text)}</p>
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="type-label grid size-11 shrink-0 place-items-center rounded-full bg-sage-deep text-on-sage"
                >
                  {initials(review.name)}
                </span>
                <span className="flex flex-col">
                  <span className="type-ui text-paper">{typo(review.name)}</span>
                  <span className="type-small text-fog-dim">{typo(review.car)}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
