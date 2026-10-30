import { describe, expect, it } from 'vitest'
import { calculatePrice, priceRange } from '@/lib/price'
import { carClasses, services } from '@/data/services'

describe('E4: calculatePrice', () => {
  it('одна услуга для седана', () => {
    expect(calculatePrice('sedan', ['wash'])).toBe(1500)
  })

  it('кроссовер: сумма услуг умножается на 1,2', () => {
    expect(calculatePrice('crossover', ['wash', 'interior'])).toBe(12600)
  })

  it('внедорожник: сумма услуг умножается на 1,4', () => {
    expect(calculatePrice('suv', ['ceramic', 'polish'])).toBe(51800)
  })

  it('пустой список даёт 0', () => {
    expect(calculatePrice('sedan', [])).toBe(0)
    expect(calculatePrice('suv', [])).toBe(0)
  })

  it('неизвестные id игнорируются', () => {
    expect(calculatePrice('sedan', ['nope'])).toBe(0)
    expect(calculatePrice('sedan', ['wash', 'nope'])).toBe(1500)
  })

  it('порядок услуг не влияет на цену', () => {
    expect(calculatePrice('crossover', ['interior', 'wash'])).toBe(calculatePrice('crossover', ['wash', 'interior']))
  })

  it('для любого класса и набора услуг результат — сумма × множитель, округлённая до 100', () => {
    for (const cls of carClasses) {
      for (let mask = 0; mask < 1 << services.length; mask++) {
        const picked = services.filter((_, i) => mask & (1 << i))
        const sum = picked.reduce((acc, s) => acc + s.basePrice, 0)
        const expected = Math.round((sum * cls.multiplier) / 100) * 100
        expect(calculatePrice(cls.id, picked.map((s) => s.id))).toBe(expected)
      }
    }
  })
})

describe('E4: priceRange', () => {
  it('салон', () => {
    expect(priceRange('interior')).toEqual({ min: 4000, max: 12600 })
  })

  it('кузов', () => {
    expect(priceRange('exterior')).toEqual({ min: 1500, max: 3500 })
  })

  it('защита', () => {
    expect(priceRange('protection')).toEqual({ min: 12000, max: 35000 })
  })
})
