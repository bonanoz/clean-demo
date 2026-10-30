# SPEC: демо-сайт автомойки и детейлинга clean.cars

- **slug:** `carwash-demo`
- **ветка:** `feat/carwash-demo`
- **создано:** 2026-10-30
- **команда тестов:** `npm test` (vitest run); дополнительно `npm run build` (tsc + vite build)

## Задача

> мне нужно сделать демо-сайт для автомойки и детейлинга, это один из референсов, я ещё искать буду, тут мне нравится сама структура и цвета, также мне нужны шрифты на кириллице, используй все свои инструменты

Уточнение после первого плана:

> сделай упор на типографику, анимации по скиллам covalski и оптимизацию

Референс: [reference.webp](reference.webp) (длинный скриншот лендинга clean.cars). Воркеры смотрят его через Read перед вёрсткой.

## Цель и границы

Одностраничный демо-лендинг автомойки и детейлинга на русском. Структура и палитра повторяют референс: почти чёрный фон, карточки с вырезами-«вкладками», шалфейно-зелёный акцент, моно-метки вида `[УСЛУГА] [01] / ХИМЧИСТКА`. К структуре референса добавлены форма записи, калькулятор цены, слайдер «до/после», отзывы и FAQ. Сервера нет: форма проверяет данные в браузере и показывает подтверждение.

Три приоритета, которые проверяются на ревью наравне с тестами:

1. **Типографика** — шкала, ритм, русская типографика (неразрывные пробелы, «ёлочки», тире), загрузка шрифтов без скачка вёрстки.
2. **Анимации по Эмилю Ковальски** — скиллы `animate`, `animation-performance`, `review-animations` (`~/.claude/skills/`). Сначала решаем, нужна ли анимация вообще, потом самый дешёвый инструмент: CSS transition → `@starting-style` → CSS-анимация / scroll-driven → WAAPI. Библиотек анимации (GSAP, Motion) в проекте нет.
3. **Оптимизация** — бюджеты по весу и Lighthouse ниже, адаптивные AVIF/WebP, только нужные подмножества шрифтов.

Пользователь ещё будет искать референсы, поэтому цвета, шрифты, радиусы, кривые и длительности живут только в токенах `src/index.css`. Секции не хардкодят hex, `cubic-bezier` и миллисекунды.

## Решения (из опроса)

| Вопрос | Решение |
|---|---|
| Стек | Vite + React 19 + TypeScript + Tailwind 4 + shadcn (radix) — как в `C:\projects\barbershopref` |
| Фото | Unsplash (бесплатная лицензия), авторы в `docs/CREDITS.md` |
| Доп. блоки | форма записи, калькулятор цены, слайдер до/после, отзывы и FAQ — все четыре |
| Шрифты | заголовки и крупные цифры — Unbounded; метки, цены, время — Geist Mono; основной текст — Geist (см. допущения). Все три вариативные, с кириллицей |
| Название | clean.cars, латиницей, как в референсе |
| Анимации | по скиллам Эмиля Ковальски, без GSAP и Motion (заменяет ранний выбор «насыщенно на GSAP») |
| Упор | типографика, анимации, оптимизация |
| Процесс | /pipeline |

## Допущения (принято без вопроса)

- Основной текст (абзацы, поля формы) — Geist: Unbounded широкий и в мелком кегле читается тяжело.
- Только тёмная тема.
- Контакты, цены, отзывы и цифры («1 500 владельцев») — демо-заглушки. В README это сказано.
- Город — Москва, адрес «ул. Примерная, 1», телефон `+7 (900) 000-00-00`, почта `hello@cleancars.example` (зарезервированный домен, чтобы демо не слало письма на чужой адрес).
- Форма записи на нативных контролах (`input`, `select`, `input type=date`, checkbox) со своей стилизацией: доступнее, легче и тестируется в jsdom.
- Чекбокс согласия на обработку персональных данных обязателен (152-ФЗ), ссылка ведёт на `#`.
- Ширины: от 360 px до 1920 px, без горизонтального скролла на 360 px.
- Отзывы без фото людей: инициалы в кружке.
- Иконки — lucide-react, по одной импортом (tree-shaking).

## Чего не трогаем

- `package.json` и `package-lock.json` после E0: воркеры не добавляют зависимости. Нужна зависимость — пишут в NOTES отчёта.
- `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/test/setup.ts`, `components.json`, `public/fonts/*` после E0.
- Тест-файлы-контракт (`src/**/*.test.ts(x)`), кроме случаев, записанных оркестратором в «Журнал».
- Зоны чужих эпиков.

## Дизайн-система (обязательна для всех эпиков)

### Палитра (снята пипеткой с референса, шалфей затемнён до AA с белым текстом)

| Токен | Hex | Где |
|---|---|---|
| `--ink-0` | `#050505` | фон страницы |
| `--ink-1` | `#0d0f0e` | фон крупных блоков |
| `--ink-2` | `#131412` | карточки |
| `--ink-3` | `#1d1f1c` | приподнятые карточки, hover |
| `--line` | `#2d2e2c` | границы, разделители |
| `--paper` | `#f2f3f1` | основной текст |
| `--fog` | `#b3b8b5` | вторичный текст |
| `--fog-dim` | `#8a8f8c` | подписи, моно-метки |
| `--sage` | `#5f7561` | большая зелёная панель (белый текст 5:1) |
| `--sage-deep` | `#475a4b` | карточки на зелёной панели |
| `--sage-bright` | `#8fa691` | акцентные метки и цифры на чёрном |

Переменные shadcn (`--background`, `--primary` и т. д.) ссылаются на эти токены. Секции пользуются утилитами Tailwind из `@theme` (`bg-ink-2`, `text-fog`, `border-line`, `bg-sage` …).

### Типографика

**Шрифты.** Самохостинг из `public/fonts/` (кладёт E0): по два woff2 на гарнитуру — подмножества `cyrillic` и `latin`, вариативные по `wght`. `@font-face` с `unicode-range` из Fontsource, `font-display: swap`. В `index.html` предзагружены только два файла первого экрана: Unbounded cyrillic и Geist cyrillic. Для каждой гарнитуры — фолбэк-`@font-face` на локальном Arial (Courier New для моно) с `size-adjust`, `ascent-override`, `descent-override`, подобранными по метрикам шрифта (например `npx fontaine` или `@capsizecss/unpack` разово, без добавления в зависимости), чтобы подмена шрифта не двигала вёрстку.

**Шкала** (токены `--text-*`, плавная между 360 и 1440 px):

| Токен | Размер | Гарнитура, вес | Межстрочный | Трекинг |
|---|---|---|---|---|
| `--text-h1` | `clamp(2.125rem, 1.4rem + 3.4vw, 4.5rem)` | Unbounded 300 | 1.02 | −0.035em |
| `--text-h2` | `clamp(1.75rem, 1.3rem + 2vw, 3.25rem)` | Unbounded 300 | 1.08 | −0.025em |
| `--text-h3` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)` | Unbounded 400 | 1.2 | −0.01em |
| `--text-price` | `clamp(1.5rem, 1.25rem + 1vw, 2.25rem)` | Geist Mono 400 | 1.1 | −0.02em |
| `--text-lead` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | Geist 400 | 1.5 | 0 |
| `--text-body` | `clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)` | Geist 400 | 1.55 | 0 |
| `--text-small` | `0.875rem` | Geist 400 | 1.5 | 0 |
| `--text-label` | `0.75rem` | Geist Mono 400, капс | 1.3 | +0.06em |

**Правила:**

- h1–h3: `text-wrap: balance`, без переносов (`hyphens: manual`), но с `overflow-wrap: break-word` на случай узкого экрана. Абзацы: `text-wrap: pretty`, `hyphens: auto` (у `<html>` `lang="ru"`).
- Длина строки: абзацы не шире 60ch, лид — 46ch.
- Цены, время, счётчики, телефоны: `font-variant-numeric: tabular-nums lining-nums`.
- `font-synthesis: none` (никаких поддельных полужирных), `font-kerning: normal`, `-webkit-font-smoothing: antialiased` (светлый текст на тёмном).
- Кнопки и пункты меню — Geist 500, 15 px.
- Русская типографика: «ёлочки», длинное тире с пробелами, `−` для минуса. Все видимые строки текста (заголовки, абзацы, пункты списков, ответы FAQ, отзывы) проходят через `typo()` из `src/lib/typo.ts`: неразрывный пробел после слов из одной-двух букв («в боксе», «на мойку», «и салон»), перед длинным тире и между числом и следующим словом или знаком («60 дней», «3 слоя»).
- Вертикальный ритм: отступы между секциями `--section-y: clamp(4rem, 3rem + 5vw, 8rem)`, внутри — шаг 8 px.

### Формы и детали

- Карточки: радиус 20–24 px, фон `--ink-2`, без теней.
- Карточка-«папка» с вырезом-вкладкой в углу, как в референсе (блок «Premium Products & Technology», «Attention to detail») — компонент `NotchCard`, работает на любом размере и любом фоне родителя.
- Кнопки: основная — `--paper` фон, `--ink-0` текст, радиус 8 px, высота 44 px; вторичная — тёмная с границей `--line`. Текст — короткий глагол: «Записаться», «Рассчитать».
- Моно-метка `MonoLabel`: `[УСЛУГА] [01] / ХИМЧИСТКА САЛОНА`.
- Шапка: логотип (иконка машины + «clean.cars»), навигация в тёмной «таблетке» по центру с подсветкой активного пункта, справа телефон и кнопка «Записаться». На мобильном — бургер с `aria-expanded`.
- Видимый фокус у всего интерактивного: `outline: 2px solid var(--sage-bright); outline-offset: 2px`.

### Анимации (по Эмилю Ковальски)

Каждый воркер перед анимациями загружает скиллы `animate` (и его `RECIPES.md`) и `animation-performance` через Skill и проходит их порядок: нужна ли анимация → цель → инструмент → свойства → кривая и длительность → прерывание → reduced motion. Таблица «Never Ship» из `animate` — блокер на ревью.

**Токены** (`src/index.css`, только они в секциях):

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
--dur-press: 160ms;   /* нажатие */
--dur-ui: 200ms;      /* меню, ховеры, смена значения */
--dur-reveal: 700ms;  /* маркетинговое появление при прокрутке */
--stagger: 50ms;      /* шаг каскада, 30–80 ms */
```

**Карта движения** — что анимируем и зачем. Чего нет в таблице, не анимируется.

| Элемент | Цель | Инструмент | Свойства | Время, кривая |
|---|---|---|---|---|
| Слова h1 в Hero, один раз при загрузке | восторг (первый показ) | `SplitWords` + `@starting-style` | `transform: translateY(100%)` в маске `overflow: hidden` | `--dur-reveal`, `--ease-out`, шаг 40 ms |
| Заголовки h2 и группы карточек при прокрутке | смягчить появление контента | `Reveal` (IntersectionObserver, один раз) + CSS transition | `opacity`, `translateY(16px)` | `--dur-reveal`, `--ease-out`, шаг `--stagger` |
| Крупные фото при прокрутке | смягчить появление | `Reveal variant="clip"` | `clip-path: inset(0 0 100% 0)` → `inset(0)`, у img `scale(1.06)` → `1` | 900 ms, `--ease-in-out` |
| Параллакс `hero-main`, `about-studio`, `booking-car` | глубина (маркетинг) | CSS scroll-driven `animation-timeline: view()` внутри `@supports` | `transform: translateY` ±6% | привязано к прокрутке, `linear` |
| Стопка карточек услуг на ≥ 1024 px | пространственная связь | `position: sticky` + scroll-driven | у перекрытой карточки `scale(0.96)`, `opacity` | привязано к прокрутке |
| Нажатие кнопок | обратная связь | CSS `:active` | `scale(0.97)` | `--dur-press`, `--ease-out` |
| Ховер карточек и фото | обратная связь | CSS, только `@media (hover: hover) and (pointer: fine)` | `translateY(-2px)` / у img `scale(1.03)` | `--dur-ui`, `ease` |
| Фон шапки после начала прокрутки | состояние | IntersectionObserver на сентинеле + CSS transition | `background-color`, `opacity` границы | `--dur-ui`, `ease` |
| Мобильное меню | пространственная связь | CSS transition, выход тем же путём | `opacity`, `translateY(-8px)` | `--dur-ui`, `--ease-out` |
| Итог калькулятора при смене | состояние | `@starting-style` на новом значении | `opacity`, `translateY(40%)` | `--dur-ui`, `--ease-out` |
| Подсказка шторки до/после, один раз при первом показе | объяснение | WAAPI (`element.animate`) | `clip-path`, `transform` ручки, 50 → 30 → 70 → 50 | 1400 ms, `--ease-in-out` |
| Перетаскивание шторки | прямое управление | pointer events + запись в `ref.style`, без setState на кадр | `clip-path`, `transform` | без кривой, за пальцем |
| Аккордеон FAQ | состояние | Radix + CSS-ключи по `--radix-accordion-content-height` (высота допустима только тут) | `height`, `opacity` | `--dur-ui`, `--ease-out` |
| Подтверждение записи вместо формы | состояние | `@starting-style` | `opacity`, `translateY(8px)` | 250 ms, `--ease-out` |

**Не анимируем:** ошибки валидации (появляются сразу), кольца фокуса, клавиатурное управление шторкой (стрелки двигают её мгновенно), смену радио/чекбоксов в калькуляторе (только цвет, `--dur-ui`).

**Запрещено:** `transition: all`, `ease-in`, `scale(0)`, анимация `width`/`height`/`top`/`left`/`margin`/`padding` (кроме аккордеона), `box-shadow` в анимации, `blur` больше 20 px, `will-change` «на всякий случай», анимация через `setState` на каждый кадр, CSS-переменная на родителе, которую читает `transform` детей.

**Reduced motion:** при `prefers-reduced-motion: reduce` — меньше и мягче, не ноль. Остаются только переходы `opacity` до 200 ms. Убираются сдвиги, маски `clip-path`, параллакс, масштаб в стопке услуг, подсказка шторки, сдвиг слов h1 (слова сразу на месте).

**Надёжность:** скрытое начальное состояние `Reveal` задаётся в CSS только для `[data-reveal]:not([data-visible])` и только внутри `@media (prefers-reduced-motion: no-preference)`. Если IntersectionObserver недоступен, `Reveal` сразу ставит `data-visible`.

### Оптимизация (бюджеты)

| Что | Бюджет |
|---|---|
| JS первого экрана (gzip, по выводу `vite build`) | ≤ 100 КБ (пустой каркас с React 19 — уже 68,6 КБ, на код сайта остаётся ~30 КБ) |
| CSS (gzip) | ≤ 20 КБ |
| Шрифты | 6 файлов woff2, суммарно ≤ 160 КБ, предзагружены 2 |
| LCP-фото `hero-main-1024.avif` | ≤ 120 КБ |
| Любой файл фото | ≤ 250 КБ |
| Lighthouse mobile (`vite preview`) | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 |
| CLS | ≤ 0.05 |

- Фото — через компонент `Photo`: `<picture>` с AVIF и WebP в трёх ширинах (640, 1024, 1600) и `sizes` по реальной ширине в вёрстке; у `<img>` всегда `width`/`height` из манифеста и `alt` на русском; все, кроме `hero-main`, — `loading="lazy" decoding="async"`; `hero-main` — `fetchpriority="high"`, предзагружен в `index.html` с `imagesrcset`/`imagesizes`. `sizes` для `hero-main` фиксирован: `(min-width: 1024px) 58vw, 100vw`.
- Никаких библиотек анимации; lucide — поимённые импорты.
- В `index.html`: `<title>`, `meta description`, `theme-color #050505`, Open Graph (title, description, image `hero-main-1024.webp`), SVG-фавикон.

### Фото (кладёт E2, остальные эпики только ссылаются)

Файлы `public/images/{name}-{640,1024,1600}.{avif,webp}`, манифест `src/data/images.ts`:

```ts
export const images = {
  'hero-main': { width: 1600, height: 1067 }, // реальные пропорции файла 1600w
  // … все имена из таблицы
} as const
export type ImageName = keyof typeof images
```

| Имя | Что на фото | Где |
|---|---|---|
| `hero-main` | спорткар цвета шалфея/оливы на тёмном фоне, 3/4 | Hero, большая карточка |
| `hero-wheel` | диск и тормоз крупно, тёмный фон | Hero, карточка «Внимание к деталям» |
| `hero-front` | тёмная машина, фары в полутьме | Hero, средняя карточка |
| `hero-interior` | руль и приборы / водитель в салоне | Hero, маленькая карточка |
| `about-studio` | машина в чистом тёмном боксе/студии | About |
| `interior-seats` | светлые кожаные сиденья | Services, салон |
| `interior-console` | центральная консоль, селектор | Services, салон |
| `interior-cleaning` | мастер чистит салон | Services, салон |
| `exterior-foam` | машина в пене | Services, мойка |
| `coating` | полировка / нанесение покрытия | Services, защита |
| `compare-before` / `compare-after` | одна и та же машина, один ракурс: грязная / чистая | BeforeAfter |
| `booking-car` | вертикальное фото, корма спорткара | Booking |

## Данные (E1 создаёт файлы ровно с этими значениями — на них опираются тесты)

`src/data/site.ts`:

```ts
export const site = {
  name: 'clean.cars',
  phone: '+7 (900) 000-00-00',
  phoneHref: 'tel:+79000000000',
  email: 'hello@cleancars.example',
  address: 'Москва, ул. Примерная, 1',
  hours: 'Ежедневно 9:00–21:00',
  socials: [
    { label: 'Telegram', href: '#' },
    { label: 'WhatsApp', href: '#' },
    { label: 'VK', href: '#' },
  ],
}

export const nav = [
  { href: '#services', label: 'Услуги' },
  { href: '#results', label: 'До и после' },
  { href: '#calculator', label: 'Цены' },
  { href: '#reviews', label: 'Отзывы' },
  { href: '#booking', label: 'Запись' },
  { href: '#contacts', label: 'Контакты' },
]
```

`src/data/services.ts`:

```ts
export type CarClassId = 'sedan' | 'crossover' | 'suv'
export type ServiceGroupId = 'interior' | 'exterior' | 'protection'

export const carClasses = [
  { id: 'sedan', label: 'Седан или хэтчбек', multiplier: 1 },
  { id: 'crossover', label: 'Кроссовер', multiplier: 1.2 },
  { id: 'suv', label: 'Внедорожник или минивэн', multiplier: 1.4 },
] as const

export const services = [
  { id: 'wash', group: 'exterior', title: 'Бережная мойка кузова', basePrice: 1500 },
  { id: 'engine', group: 'exterior', title: 'Мойка двигателя', basePrice: 2500 },
  { id: 'interior', group: 'interior', title: 'Химчистка салона', basePrice: 9000 },
  { id: 'leather', group: 'interior', title: 'Чистка и защита кожи', basePrice: 4000 },
  { id: 'polish', group: 'protection', title: 'Полировка кузова', basePrice: 12000 },
  { id: 'ceramic', group: 'protection', title: 'Керамическое покрытие', basePrice: 25000 },
] as const

export const serviceGroups = [
  { id: 'interior', index: '01', label: 'Детейлинг салона', title: 'Химчистка и уход за салоном',
    items: ['Пылесос салона, сидений и багажника', 'Глубокая чистка обивки и кожи',
            'Чистка кондиционера, если он есть', 'Пластик, консоль и молдинги',
            'Стёкла и зеркала изнутри', 'Нейтрализация запахов'] },
  { id: 'exterior', index: '02', label: 'Мойка кузова', title: 'Бережная мойка кузова',
    items: ['Бесконтактная предмойка', 'Ручная мойка двумя вёдрами', 'Чистка дисков и чернение шин', 'Сушка микрофиброй'] },
  { id: 'protection', index: '03', label: 'Защита ЛКП', title: 'Полировка и защитные покрытия',
    items: ['Восстановительная полировка', 'Керамика в 1–3 слоя', 'Защита фар и пластика', 'Гарантия на покрытие'] },
] as const
```

Поля `description` у групп E1 может добавить (тексты по правилам из глобального CLAUDE.md: без воды и пустых оценок).

## Эпики

| ID | Эпик | Волна | Зависит от | Зона файлов | Модель | Статус | Ветка |
|---|---|---|---|---|---|---|---|
| E0 | Каркас, тестовый раннер, шрифты | 0 | — | `package.json`, конфиги, `src/main.tsx`, `src/test/setup.ts`, `src/lib/utils.ts`, `src/components/ui/*`, `public/fonts/*` | оркестратор | done | feat/carwash-demo |
| E1 | Дизайн-система, типографика, примитивы движения, шапка, сборка страницы | 1 | E0 | `index.html`, `src/index.css`, `src/App.tsx`, `src/lib/{format,typo,use-in-view}.ts`, `src/data/{site,services}.ts`, `src/components/kit/*`, `public/favicon.svg`, `src/sections/Header.tsx`, заглушки остальных `src/sections/*.tsx` | opus | done | feat/carwash-demo |
| E2 | Фото с Unsplash, AVIF/WebP, манифест | 1 | E0 | `public/images/*`, `src/data/images.ts`, `docs/CREDITS.md` | оркестратор (браузер и отбор глазами) | done | feat/carwash-demo |
| E3 | Hero и «О нас» | 2 | E1, E2 | `src/sections/Hero.tsx`, `src/sections/About.tsx` | sonnet | todo | |
| E4 | Услуги и калькулятор | 2 | E1, E2 | `src/sections/Services.tsx`, `src/sections/Calculator.tsx`, `src/lib/price.ts` | sonnet | todo | |
| E5 | Запись и подвал | 2 | E1, E2 | `src/sections/Booking.tsx`, `src/sections/Footer.tsx`, `src/lib/booking.ts` | sonnet | todo | |
| E6 | До/после, отзывы, FAQ | 2 | E1, E2 | `src/sections/BeforeAfter.tsx`, `src/components/compare-slider.tsx`, `src/sections/Reviews.tsx`, `src/data/reviews.ts`, `src/sections/Faq.tsx`, `src/data/faq.ts` | sonnet | todo | |

Статусы: `todo` → `in_progress` → `review` → `done` (или `blocked` + причина в журнале).

### E0. Каркас, тестовый раннер, шрифты (оркестратор)

- **Что сделать:** Vite + React 19 + TS + Tailwind 4 + shadcn (по образцу barbershopref), vitest + jsdom + Testing Library; shadcn-компоненты `button` и `accordion`; `lucide-react`. Шрифты: 6 woff2 (Unbounded, Geist, Geist Mono × cyrillic, latin; вариативные `wght`) с CDN Fontsource в `public/fonts/`. `src/test/setup.ts`: jest-dom, мок `matchMedia` (по умолчанию `prefers-reduced-motion: reduce` = true), мок `IntersectionObserver` (сразу сообщает `isIntersecting: true`), `ResizeObserver`, `scrollTo`, `Element.prototype.animate` (заглушка, возвращает объект с `finished`, `cancel`). `index.html` с `lang="ru"`.
- **Критерии готовности:** `npm test` запускается; `npm run build` проходит.

### E1. Дизайн-система, типографика, примитивы движения, шапка, сборка страницы

- **Что сделать:** токены цвета, шкалы, ритма и движения в `src/index.css` (`@theme` для утилит Tailwind), `@font-face` и фолбэки по разделу «Типографика»; `index.html`: предзагрузка двух шрифтов и `hero-main`, мета-теги, фавикон. Компоненты `src/components/kit/`: `NotchCard`, `MonoLabel`, `SectionHeading` (метка + h2 через `SplitWords` или `Reveal`), `Photo`, `Reveal`, `SplitWords`. Хук `useInView`. `typo()`, `formatRub()`. Данные `src/data/{site,services}.ts`. `Header`. `App.tsx` собирает: Header, `<main id="main">`: Hero, About, Services, BeforeAfter, Calculator, Reviews, Faq, Booking; после main — Footer. Заглушки секций (`<section id aria-labelledby>` с h2 и `MonoLabel`), чтобы страница собиралась до волны 2.
- **Интерфейсы:**
  - `formatRub(value: number): string` — `Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })`.
  - `typo(text: string): string` — правила из раздела «Типографика».
  - `useInView<T extends Element>(options?: { once?: boolean; rootMargin?: string }): [RefObject<T>, boolean]` — `once` по умолчанию `true`.
  - `Reveal({ as = 'div', variant = 'up' | 'clip' | 'fade', index = 0, className, children, ...rest })` — ставит `data-reveal={variant}`, после пересечения — `data-visible`; задержка `index × --stagger` через inline `transition-delay` на самом элементе.
  - `SplitWords({ as = 'h2', text, className, id })` — оборачивает слова в маски; доступное имя заголовка равно исходному тексту (после `typo`).
  - `Photo({ name, width, height, alt, sizes, priority = false, className })` — `<picture>`: `source` AVIF и WebP с `srcset` `/images/{name}-640|1024|1600.{ext} 640w|1024w|1600w`, `img src=/images/{name}-1024.webp`.
  - `NotchCard({ notch = 'top-right' | 'top-left', children, className })`, `MonoLabel({ children })`.
  - Экспорты секций именованные: `Header, Hero, About, Services, BeforeAfter, Calculator, Reviews, Faq, Booking, Footer` из одноимённых файлов в `src/sections/`. id: `hero, about, services, results, calculator, reviews, faq, booking, contacts` (у Footer).
- **Критерии готовности:**
  - [ ] `App` рендерит секции с id `hero, about, services, results, calculator, reviews, faq, booking, contacts` в этом порядке
  - [ ] у каждой ссылки навигации `href` указывает на существующий id
  - [ ] в шапке ссылка `href="tel:+79000000000"` и ссылка «Записаться» на `#booking`
  - [ ] кнопка мобильного меню переключает `aria-expanded` false → true → false; по `Escape` меню закрывается и фокус возвращается на кнопку
  - [ ] первая фокусируемая ссылка — «К содержимому» на `#main`
  - [ ] `formatRub(0) === '0\u00a0₽'`, `formatRub(1500) === '1\u00a0500\u00a0₽'`, `formatRub(14700) === '14\u00a0700\u00a0₽'`
  - [ ] `typo('Мойка в боксе') === 'Мойка в\u00a0боксе'`; `typo('Запись на 60 дней') === 'Запись на\u00a060\u00a0дней'`; `typo('Чисто — и всё') === 'Чисто\u00a0— и\u00a0всё'`; `typo('А я и не знал')` не содержит обычных пробелов после «А», «я», «и», «не»; строка без коротких слов не меняется
  - [ ] `Reveal` после пересечения (мок IO) имеет `data-visible`; без `IntersectionObserver` в `window` — `data-visible` сразу
  - [ ] `SplitWords as="h1" text="Вернём машине заводской блеск"` → `getByRole('heading', { level: 1 })` с доступным именем «Вернём машине заводской блеск»
  - [ ] `Photo` рендерит два `source` (`image/avif`, `image/webp`) с тремя ширинами в `srcset`; `priority` → `fetchpriority="high"` и без `loading="lazy"`; иначе `loading="lazy"`
  - [ ] данные `services`, `carClasses`, `serviceGroups`, `nav`, `site` совпадают с разделом «Данные»
  - [ ] в `src/` нет строк `transition: all`, `transition-all`, `ease-in` без `-out` и импортов `gsap`/`motion`/`framer-motion` (тест грепает исходники)
  - [ ] `npm run build` проходит
- **Тесты:** `src/App.test.tsx`, `src/sections/Header.test.tsx`, `src/lib/format.test.ts`, `src/lib/typo.test.ts`, `src/components/kit/kit.test.tsx`, `src/data/data.test.ts`, `src/motion-rules.test.ts` (`describe('E1: …')`)
- **Ручная проверка:** вырез `NotchCard` как в референсе; шкала на 360 и 1440 px; шрифты с кириллицей реально грузятся (вкладка Network), подмена шрифта не двигает вёрстку; меню на мобильном.

### E2. Фото с Unsplash, AVIF/WebP, манифест (оркестратор)

- **Что сделать:** подобрать 13 фото по таблице, скачать с `images.unsplash.com`, нарезать Pillow в 640/1024/1600 px по ширине, AVIF и WebP; манифест `src/data/images.ts` с реальными размерами 1600-версии; авторы и ссылки в `docs/CREDITS.md`. Пару «до/после» — найти реальную пару одного ракурса или сделать `compare-before` из `compare-after` (Pillow: грязь, пыль, тусклость) и честно написать это в CREDITS.
- **Критерии готовности:**
  - [ ] для каждого имени 6 файлов, каждый ≤ 250 КБ, `hero-main-1024.avif` ≤ 120 КБ
  - [ ] манифест содержит все 13 имён с положительными `width`/`height`
- **Тесты:** `src/data/images.test.ts` (`describe('E2: images')`)
- **Ручная проверка:** фото держат одну гамму (тёмные, приглушённые, без кислотных цветов).

### E3. Hero и «О нас»

- **Что сделать:** по референсу. Hero: h1 «Вернём машине заводской блеск» через `SplitWords as="h1"`, лид, кнопки «Записаться» (`#booking`) и «Рассчитать цену» (`#calculator`); бенто из фото (`hero-main` с `priority` и `sizes="(min-width: 1024px) 58vw, 100vw"`, `hero-wheel` в `NotchCard` с меткой «ВНИМАНИЕ К ДЕТАЛЯМ», `hero-front`, `hero-interior`) и две инфо-карточки `[01] Выездная мойка` и `[02] 1 500 владельцев доверили нам машину`. About: строка «Чтобы машина выглядела как из салона — clean.cars», h2 «Машине мало обычной мойки», карточка-папка «Профессиональная химия и оборудование», карточка «Безопасно для лака» с текстом и ссылкой «Подробнее» на `#services`, фото `about-studio`. Движение — строго по карте: слова h1, каскад бенто, параллакс `hero-main` и `about-studio`, `Reveal` карточек.
- **Критерии готовности:**
  - [ ] в `#hero` ровно один `h1` с доступным именем «Вернём машине заводской блеск»
  - [ ] в `#hero` ссылки «Записаться» → `#booking` и «Рассчитать цену» → `#calculator`
  - [ ] все `img` в `#hero` и `#about` — с непустым `alt`, `width` и `height`, `src` начинается с `/images/`
  - [ ] у `hero-main` `fetchpriority="high"` и нет `loading="lazy"`; у остальных фото `loading="lazy"`
  - [ ] в `#about` `h2` «Машине мало обычной мойки»
- **Тесты:** `src/sections/Hero.test.tsx`, `src/sections/About.test.tsx`
- **Ручная проверка:** бенто на 1440 px похоже на референс; на 360 px — одна колонка, h1 не вылезает; LCP — `hero-main`.

### E4. Услуги и калькулятор

- **Что сделать:** Services: бейдж «1 500+ довольных клиентов», h2 «От мойки кузова до полного детейлинга», три группы из `serviceGroups`. Салон — большая карточка с фото (`interior-console`, `interior-cleaning`, `interior-seats`), моно-ценой и зелёной панелью (`bg-sage`) с шестью пунктами в карточках `sage-deep`, как в референсе. Кузов и защита — две карточки рядом, у каждой цена и кнопка «Записаться» на `#booking`. На ≥ 1024 px карточки групп — стопка на `position: sticky` со scroll-driven масштабом перекрытой карточки. Calculator: радиогруппа класса машины (по умолчанию `sedan`), чекбоксы услуг (по умолчанию `wash`), итог в `<output>` с подписью «Итого», смена значения через `@starting-style`, ссылка «Записаться» на `#booking`.
- **Интерфейсы (`src/lib/price.ts`):**
  - `calculatePrice(carClass: CarClassId, serviceIds: readonly string[]): number` — сумма `basePrice` × `multiplier`, `Math.round(x / 100) * 100`; неизвестные id игнорируются; пустой список → 0.
  - `priceRange(group: ServiceGroupId): { min: number; max: number }` — `min` = минимальный `basePrice` группы, `max` = максимальный `basePrice` × 1.4, округлённый до 100.
- **Критерии готовности:**
  - [ ] `calculatePrice('sedan', ['wash']) === 1500`; `('crossover', ['wash', 'interior']) === 12600`; `('suv', ['ceramic', 'polish']) === 51800`; `('sedan', []) === 0`; `('sedan', ['nope']) === 0`
  - [ ] `priceRange('interior')` → `{ min: 4000, max: 12600 }`, `('exterior')` → `{ min: 1500, max: 3500 }`, `('protection')` → `{ min: 12000, max: 35000 }`
  - [ ] в `#services` три группы с заголовками из `serviceGroups`, у каждой видны минимум и максимум цены в формате `formatRub`
  - [ ] в `#services` видны все шесть пунктов группы `interior`
  - [ ] в `#calculator` по умолчанию выбран «Седан или хэтчбек», отмечена «Бережная мойка кузова», в `output` — `1 500 ₽`
  - [ ] «Кроссовер» + «Химчистка салона» → в `output` `12 600 ₽`
  - [ ] сняты все галочки → `0 ₽` и подсказка «Выберите хотя бы одну услугу»
  - [ ] у `output` `aria-live="polite"`; радио и чекбоксы находятся по подписи (`getByLabelText`)
- **Тесты:** `src/lib/price.test.ts`, `src/sections/Services.test.tsx`, `src/sections/Calculator.test.tsx`
- **Ручная проверка:** стопка услуг не дёргается, выключена на мобильном и при reduce; цена не прыгает по ширине (tabular-nums).

### E5. Запись и подвал

- **Что сделать:** Booking: h2 «Запишитесь на мойку сегодня», форма (имя, телефон, услуга `select` из `services`, класс машины `select` из `carClasses`, дата `input type=date`, время `select` из `timeSlots`, комментарий, согласие), вертикальное фото `booking-car` с параллаксом. `color-scheme: dark` у полей. После успешной отправки форма заменяется подтверждением `role="status"`: «Заявка принята», услуга, дата и время, кнопка «Записаться ещё раз» возвращает пустую форму. Сетевых запросов нет. Footer (`id="contacts"`): почта, телефон, адрес, часы, соцсети (иконки-ссылки с `aria-label`), таблица быстрых ссылок в три колонки, как в референсе, © clean.cars и год.
- **Интерфейсы (`src/lib/booking.ts`):**
  - `timeSlots: readonly string[]` — `'09:00'` … `'20:00'` с шагом час (12 слотов).
  - `type BookingValues = { name: string; phone: string; serviceId: string; carClass: string; date: string; time: string; comment: string; consent: boolean }`
  - `type BookingErrors = Partial<Record<keyof BookingValues, string>>`
  - `normalizePhone(input: string): string | null` — `'+7 (900) 123-45-67'`, `'89001234567'`, `'9001234567'`, `'+7 900 123 45 67'` → `'+79001234567'`; другое число цифр или буквы → `null`.
  - `validateBooking(values: BookingValues, now: Date): BookingErrors` — `{}`, если всё верно. `name` после trim 2–60 символов; `phone` проходит `normalizePhone`; `serviceId` есть в `services`; `carClass` есть в `carClasses`; `date` — `YYYY-MM-DD`, не раньше локальной даты `now` и не позже `now` + 60 дней; `time` есть в `timeSlots`, а если `date` сегодня, час слота больше текущего; `consent === true`; `comment` до 500 символов.
  - Тексты ошибок: name — «Укажите имя»; phone — «Введите номер в формате +7 900 000-00-00»; serviceId — «Выберите услугу»; carClass — «Выберите класс машины»; date — «Выберите дату не раньше сегодняшней» / «Запись открыта на 60 дней вперёд»; time — «Выберите время»; consent — «Нужно согласие на обработку данных»; comment — «Не больше 500 символов».
- **Критерии готовности:**
  - [ ] `normalizePhone` на четырёх примерах → `'+79001234567'`; на `'12345'`, `'+7 900 123 45 6'`, `'abc'` → `null`
  - [ ] `validateBooking` на корректных данных → `{}`; пустая форма → ошибки у `name, phone, serviceId, carClass, date, time, consent`
  - [ ] дата вчера → ошибка `date`; `now` + 61 день → ошибка; `now` + 60 дней → без ошибки
  - [ ] сегодня в 15:30: слот `'15:00'` → ошибка `time`; `'16:00'` → без ошибки
  - [ ] UI: пустая отправка показывает тексты ошибок, у полей `aria-invalid="true"` и `aria-describedby` на текст ошибки, фокус на первом поле с ошибкой
  - [ ] UI: корректное заполнение → `role="status"` с «Заявка принята» и названием услуги; `fetch` не вызывался
  - [ ] «Записаться ещё раз» возвращает пустую форму
  - [ ] в `#contacts` ссылки `mailto:hello@cleancars.example` и `tel:+79000000000`; у ссылок соцсетей `aria-label`
- **Тесты:** `src/lib/booking.test.ts`, `src/sections/Booking.test.tsx`, `src/sections/Footer.test.tsx`
- **Ручная проверка:** форма на 360 px; нативный выбор даты в тёмной теме.

### E6. До/после, отзывы, FAQ

- **Что сделать:** BeforeAfter (`id="results"`): h2 «До и после химчистки», `CompareSlider` с `compare-before`/`compare-after`, подписи «До» и «После». Шторка — по рецепту Ковальски: верхнее фото обрезается `clip-path: inset(0 X% 0 0)`, без лишних DOM-слоёв; перетаскивание с `setPointerCapture`, `touch-action: pan-y`, запись в `ref.style` без setState на кадр; подсказка WAAPI один раз при первом показе. Reviews: h2 «Что говорят клиенты», не меньше 4 отзывов из `src/data/reviews.ts`. FAQ: h2 «Частые вопросы», не меньше 6 вопросов из `src/data/faq.ts` на shadcn `Accordion` (single, collapsible).
- **Интерфейсы:**
  - `CompareSlider({ before, after, beforeAlt, afterAlt, initial = 50 })` из `src/components/compare-slider.tsx`; `before`/`after` — `ImageName`.
  - Ползунок: `role="slider"`, `aria-label="Сравнение до и после"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow`; `ArrowRight`/`ArrowUp` +5, `ArrowLeft`/`ArrowDown` −5, `Home` → 0, `End` → 100, в пределах 0–100.
  - `reviews: { name: string; car: string; text: string; rating: number }[]`, `faq: { q: string; a: string }[]`.
- **Критерии готовности:**
  - [ ] `aria-valuenow` по умолчанию 50; `ArrowRight` → 55; `End` → 100, ещё `ArrowRight` → 100; `Home` → 0, `ArrowLeft` → 0
  - [ ] обе картинки слайдера с непустым `alt`
  - [ ] в `#reviews` не меньше 4 отзывов, у каждого видны имя и текст, у оценки текстовая альтернатива «Оценка 5 из 5»
  - [ ] в `#faq` не меньше 6 вопросов-кнопок; клик по вопросу → `aria-expanded="true"` и виден ответ; клик по другому — первый закрывается
- **Тесты:** `src/components/compare-slider.test.tsx`, `src/sections/BeforeAfter.test.tsx`, `src/sections/Reviews.test.tsx`, `src/sections/Faq.test.tsx`
- **Ручная проверка:** шторка тянется пальцем, вертикальный скролл страницы при этом работает.

## Правила для всех воркеров

- Перед вёрсткой посмотреть `docs/specs/carwash-demo/reference.webp`.
- Перед анимациями — скиллы `animate` и `animation-performance`; движение только из «Карты движения», только на токенах.
- Видимые тексты — через `typo()`, по правилам «Как писать» из глобального CLAUDE.md (без воды и пустых оценок, кнопки — короткий глагол).
- Цвета, размеры текста, кривые и длительности — только токены.
- Фото — только через `Photo` и манифест `images`.

## Оставлено на сведение (делает оркестратор)

- Стыки между секциями (отступы, ритм), если вылезут при просмотре целиком.
- README: запуск, что в демо заглушки, откуда фото и шрифты.
- Проверка текстов скиллом `site-copy-check` и правка находок.
- Ревью движения по `review-animations/STANDARDS.md` на собранной странице.
- Замер бюджетов: вывод `vite build`, Lighthouse mobile на `vite preview`.

## Критерии готовности всей задачи

- [ ] `npm test` зелёный полностью, `npm run build` проходит
- [ ] бюджеты из раздела «Оптимизация» выполнены (цифры в отчёте)
- [ ] страница открыта в браузере: консоль без ошибок, 1440 px и 375 px, горизонтального скролла нет
- [ ] при эмуляции `prefers-reduced-motion: reduce` весь контент виден, остались только переходы прозрачности
- [ ] тексты прошли `site-copy-check`

## Журнал

- 2026-10-30 spec создан
- 2026-10-30 по просьбе пользователя: упор на типографику, анимации по скиллам Эмиля Ковальски и оптимизацию; GSAP и fontsource-пакеты убраны, шрифты самохостятся, фото в AVIF/WebP с srcset
- 2026-10-30 E0 готов: каркас, раннер, шрифты (6 woff2, 159 КБ). npm install требует legacy-peer-deps (в .npmrc) из-за peer-конфликта Babel. Бюджет JS поднят до 100 КБ: пустой каркас весит 68,6 КБ gzip
- 2026-10-30 E2 готов: 13 фото, 78 файлов, 4,5 МБ всего; hero-main-1024.avif — 39 КБ. compare-before нарисован из compare-after (реальной пары на Unsplash нет), hero-wheel — рука с щёткой у диска вместо кропа того же 911
- 2026-10-30 тест-райтер добавил devDependency @testing-library/dom (peer Testing Library, не ставится сам из-за legacy-peer-deps) — принято в зону E0

## Интерфейсы, уточнённые тестами (обязательны)

- `npm run build` проверяет типы без тест-файлов (`tsconfig.json` → `exclude`): вызовы из тестов в чужие ещё не написанные модули не ломают сборку эпика.
- Помощники тестов — `src/test/helpers.ts` (`norm`, `nameIs`, `looseShortWords`, `expectTypoApplied` …). Цены и тексты сравниваются с точностью до неразрывных пробелов.
- `SectionHeading({ label: string; title: string; id: string; className? })` — `MonoLabel` + h2 через `SplitWords` с этим `id`.
- `Photo`: `sizes` на обоих `source`; AVIF-`source` раньше WebP, `img` последний; у не-priority `decoding="async"` и `loading="lazy"`.
- `Reveal` с `index > 0`: inline `transition-delay` содержит `--stagger` и число, например `calc(var(--stagger) * 2)`.
- Header: `<header>` (роль banner); бургер — единственная кнопка с `aria-expanded`, у неё есть доступное имя; Escape закрывает меню и когда фокус на ссылке меню. «К содержимому» (`href="#main"`) — первый фокусируемый элемент страницы (в Header или App).
- `index.html` проверяется тестом: `lang="ru"`, meta description, theme-color, OG, favicon, `preload` двух шрифтов (Unbounded cyrillic, Geist cyrillic) и `hero-main` (`imagesrcset`).
- `src/index.css` проверяется текстом: токены `--ink-0…` и `--color-ink-0…` в `@theme`, `--text-h1…`, `--section-y`, `--ease-*`, `--dur-*`, `--stagger`, `@font-face` с фолбэками, `font-synthesis: none`, правило `[data-reveal]` только внутри `@media (prefers-reduced-motion: no-preference)`.
- Calculator: `<output aria-live="polite">`; подпись — текст, начинающийся с «Итого»; радио и чекбоксы находятся `getByLabelText` по подстроке названия. `output` может пересоздаваться при смене значения.
- Services: каждая группа — карточка, где вместе заголовок, `formatRub(min)` и `formatRub(max)`; зелёная панель — элемент с классом `bg-sage` со всеми 6 пунктами; у карточек кузова и защиты ссылка «Записаться» → `#booking`.
- Booking: подписи полей содержат (без учёта регистра) `имя`, `телефон`, `услуг`, `класс машины`, `дата`, `время`, `комментарий`; согласие — единственный checkbox секции; отправка — `button type="submit"`; у формы `noValidate`; селекты стартуют с `value=""`, значения option — id услуги / класса / слот; ошибка — в элементе, на который указывает `aria-describedby`; фокус — на первое поле с ошибкой в порядке DOM; в подтверждении дата видна как `31.10`, `31 октября` или `2026-10-31`, время — как `10:00`; подтверждение `role="status"` с кнопкой «Записаться ещё раз».
- Footer: `<footer id="contacts">`; год считается при рендере; не меньше 6 якорных ссылок на разделы.
- CompareSlider: один слой с inline `clip-path: inset(0 X% 0 0)`, где X — значение или 100 − значение; у корня inline `touch-action: pan-y` или класс `touch-pan-y`; pointer-события на элементе `role="slider"` всплывают к обработчику, вызывается `setPointerCapture`, значение считается из `getBoundingClientRect`; подсказка — `Element.prototype.animate` с `duration: 1400`, только без reduce.
- Reviews: «Оценка N из 5» — `aria-label` или текст листового элемента в карточке отзыва.
- `typo` проверяется на пунктах услуг, отзывах, вопросах и ответах FAQ: после слова из 1–2 русских букв нет обычного пробела.
- 2026-10-30 встроенная изоляция worktree падает (`$GIT_DIR too big`, длинный путь Windows): включён `core.longpaths`, worktree создаются вручную в `.claude/worktrees/<epic>` с ветками `wt/carwash/<epic>`
- 2026-10-30 тесты-контракт закоммичены (240 тестов, 18 файлов красные по отсутствию модулей); tsc в сборке исключает тесты. E1 запущен (opus)

## Классы и токены из E1 (волна 2 пользуется только ими)

- **Размер текста — классы `type-h1`, `type-h2`, `type-h3`, `type-price`, `type-lead`, `type-body`, `type-small`, `type-label`, `type-ui`** (Geist 500, 15 px — кнопки, меню). Не `text-h2` и не `text-[…]`: `cn()` (tailwind-merge) принимает `text-h2` за цвет и выбрасывает его рядом с `text-fog`. Токены `--text-*` лежат в `:root`.
- Цвета — утилиты из `@theme`: `bg-ink-0…3`, `text-paper`, `text-fog`, `text-fog-dim`, `border-line`, `bg-sage`, `bg-sage-deep`, `text-sage-bright`, `text-on-sage` (белый — единственный цвет текста на `bg-sage`), `text-danger` (`--danger: #f0786b`, ошибки форм). Никаких `bg-[#…]`.
- Раскладка: `shell` — контейнер страницы с полями (`--gutter`, `--shell-max`); `rounded-card` — радиус карточек (22 px); `--header-h` — высота шапки (для `sticky top`, `scroll-margin`); `--section-y` — вертикальный отступ секций.
- Кнопки: `btn` + `btn-primary` / `btn-secondary`; нажатие — `press`.
- Ховеры: `hover-lift` (карточка), `hover-zoom` (фото внутри `overflow-hidden`) — уже загейчены `(hover: hover) and (pointer: fine)` и reduced motion.
- Параллакс: класс `parallax` на `img` внутри контейнера с `overflow-hidden`; двигает отдельные свойства `translate`/`scale`.
- Движение: `--ease-out`, `--ease-in-out`, `--ease-drawer`, `--dur-press`, `--dur-ui`, `--dur-reveal`, `--dur-clip` (900 ms), `--stagger`, `--stagger-words` (40 ms). `@starting-style` в TSX — вариант Tailwind `starting:` вместе с `motion-reduce:`.
- `Reveal` — только обёртка: ховер и параллакс вешаются на элемент ВНУТРИ, иначе переходы спорят. `parallax` и `Reveal variant="clip"` на одном `img` не совмещать: keyframes параллакса перебивают `scale` клипа — клип на обёртке, параллакс на `img`.
- `NotchCard`: под вырезом остаётся `--notch-h` (28 px) — верхний отступ содержимого не меньше.
- `MonoLabel` сам пропускает текст через `typo`. `Photo` берёт `width`/`height` из манифеста, если не переданы.
- Ширину текста ограничивать в `em`, не в `ch`: `ch` зависит от гарнитуры и прыгает при подмене шрифта (CLS).
- Знака ₽ нет в Geist и Geist Mono — рисуется фолбэком (Arial / Courier New). Проверить глазами в ценах.
- 2026-10-30 E1 done: 1 круг ревью (clip-path, ширины ch→em, белый на шалфее + 9 мелочей), смержен. JS 85,06 КБ → 82,11 КБ после cn/vite (таблицы cn только под классы src; src/lib/cn-tables.ts генерируется, при merge берётся наша версия через .gitattributes merge=ours, потом пересобирается)
