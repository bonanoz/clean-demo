import { describe, expect, it } from 'vitest'
import { nav, site } from '@/data/site'
import { carClasses, serviceGroups, services } from '@/data/services'

describe('E1: data/site', () => {
  it('контакты и реквизиты', () => {
    expect(site.name).toBe('clean.cars')
    expect(site.phone).toBe('+7 (900) 000-00-00')
    expect(site.phoneHref).toBe('tel:+79000000000')
    expect(site.email).toBe('hello@cleancars.example')
    expect(site.address).toBe('Москва, ул. Примерная, 1')
    expect(site.hours).toBe('Ежедневно 9:00–21:00')
  })

  it('соцсети', () => {
    expect(site.socials.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: 'Telegram', href: '#' },
      { label: 'WhatsApp', href: '#' },
      { label: 'VK', href: '#' },
    ])
  })

  it('навигация', () => {
    expect(nav.map(({ href, label }) => ({ href, label }))).toEqual([
      { href: '#services', label: 'Услуги' },
      { href: '#results', label: 'До и после' },
      { href: '#calculator', label: 'Цены' },
      { href: '#reviews', label: 'Отзывы' },
      { href: '#booking', label: 'Запись' },
      { href: '#contacts', label: 'Контакты' },
    ])
  })
})

describe('E1: data/services', () => {
  it('классы машин', () => {
    expect(carClasses.map(({ id, label, multiplier }) => ({ id, label, multiplier }))).toEqual([
      { id: 'sedan', label: 'Седан или хэтчбек', multiplier: 1 },
      { id: 'crossover', label: 'Кроссовер', multiplier: 1.2 },
      { id: 'suv', label: 'Внедорожник или минивэн', multiplier: 1.4 },
    ])
  })

  it('услуги', () => {
    expect(services.map(({ id, group, title, basePrice }) => ({ id, group, title, basePrice }))).toEqual([
      { id: 'wash', group: 'exterior', title: 'Бережная мойка кузова', basePrice: 1500 },
      { id: 'engine', group: 'exterior', title: 'Мойка двигателя', basePrice: 2500 },
      { id: 'interior', group: 'interior', title: 'Химчистка салона', basePrice: 9000 },
      { id: 'leather', group: 'interior', title: 'Чистка и защита кожи', basePrice: 4000 },
      { id: 'polish', group: 'protection', title: 'Полировка кузова', basePrice: 12000 },
      { id: 'ceramic', group: 'protection', title: 'Керамическое покрытие', basePrice: 25000 },
    ])
  })

  it('группы услуг', () => {
    expect(
      serviceGroups.map(({ id, index, label, title, items }) => ({ id, index, label, title, items: [...items] })),
    ).toEqual([
      {
        id: 'interior',
        index: '01',
        label: 'Детейлинг салона',
        title: 'Химчистка и уход за салоном',
        items: [
          'Пылесос салона, сидений и багажника',
          'Глубокая чистка обивки и кожи',
          'Чистка кондиционера, если он есть',
          'Пластик, консоль и молдинги',
          'Стёкла и зеркала изнутри',
          'Нейтрализация запахов',
        ],
      },
      {
        id: 'exterior',
        index: '02',
        label: 'Мойка кузова',
        title: 'Бережная мойка кузова',
        items: ['Бесконтактная предмойка', 'Ручная мойка двумя вёдрами', 'Чистка дисков и чернение шин', 'Сушка микрофиброй'],
      },
      {
        id: 'protection',
        index: '03',
        label: 'Защита ЛКП',
        title: 'Полировка и защитные покрытия',
        items: ['Восстановительная полировка', 'Керамика в 1–3 слоя', 'Защита фар и пластика', 'Гарантия на покрытие'],
      },
    ])
  })
})
