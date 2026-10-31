const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })

/** `1500` → `1 500 ₽`, разделители — неразрывные пробелы (так форматирует ru-RU). */
export const formatRub = (value: number): string => rub.format(value)
