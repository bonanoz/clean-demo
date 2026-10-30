import { Fragment } from 'react'
import { typo } from '@/lib/typo'

type SplitWordsProps = {
  as?: 'h1' | 'h2' | 'h3'
  text: string
  className?: string
  id?: string
}

/**
 * Заголовок, где каждое слово лежит в своей маске. У h1 слова выезжают снизу при первом
 * показе (@starting-style в index.css), h2 появляются целиком через Reveal.
 * Слова, склеенные typo() неразрывным пробелом, едут одной маской.
 */
export function SplitWords({ as: Tag = 'h2', text, className, id }: SplitWordsProps) {
  const words = typo(text).split(' ')
  return (
    <Tag id={id} className={className} data-split="">
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="split-word">
            <span style={Tag === 'h1' && i > 0 ? { transitionDelay: `calc(var(--stagger-words) * ${i})` } : undefined}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
