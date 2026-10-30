import { carClasses, services, type CarClassId, type ServiceGroupId } from '@/data/services'

const round100 = (value: number) => Math.round(value / 100) * 100

/** Сумма базовых цен выбранных услуг × множитель класса, до сотни. Неизвестные id пропускаются. */
export function calculatePrice(carClass: CarClassId, serviceIds: readonly string[]): number {
  const multiplier = carClasses.find((c) => c.id === carClass)?.multiplier ?? 1
  const sum = services.filter((s) => serviceIds.includes(s.id)).reduce((acc, s) => acc + s.basePrice, 0)
  return round100(sum * multiplier)
}

/** «От» — самая дешёвая услуга группы для седана, «до» — самая дорогая для самого большого класса. */
export function priceRange(group: ServiceGroupId): { min: number; max: number } {
  const prices = services.filter((s) => s.group === group).map((s) => s.basePrice)
  const top = Math.max(...carClasses.map((c) => c.multiplier))
  return { min: Math.min(...prices), max: round100(Math.max(...prices) * top) }
}
