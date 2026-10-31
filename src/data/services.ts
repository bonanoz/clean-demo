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
  {
    id: 'interior',
    index: '01',
    label: 'Детейлинг салона',
    title: 'Химчистка и уход за салоном',
    description:
      'Чистим салон по зонам: обивку, кожу, пластик и стёкла. После химчистки сушим салон, чтобы не осталось сырости и запаха.',
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
    description: 'Сначала снимаем грязь пеной без касания, потом моем вручную двумя вёдрами, чтобы песок не царапал лак.',
    items: ['Бесконтактная предмойка', 'Ручная мойка двумя вёдрами', 'Чистка дисков и чернение шин', 'Сушка микрофиброй'],
  },
  {
    id: 'protection',
    index: '03',
    label: 'Защита ЛКП',
    title: 'Полировка и защитные покрытия',
    description: 'Полировкой убираем мелкие царапины и голограммы, затем закрепляем блеск керамикой.',
    items: ['Восстановительная полировка', 'Керамика в 1–3 слоя', 'Защита фар и пластика', 'Гарантия на покрытие'],
  },
] as const
