import { describe, expect, it } from 'vitest'
import { formatRub } from '@/lib/format'

describe('E1: formatRub', () => {
  it('ноль', () => {
    expect(formatRub(0)).toBe('0\u00a0₽')
  })

  it('тысячи отделены неразрывным пробелом, перед ₽ тоже неразрывный', () => {
    expect(formatRub(1500)).toBe('1\u00a0500\u00a0₽')
    expect(formatRub(14700)).toBe('14\u00a0700\u00a0₽')
    expect(formatRub(12600)).toBe('12\u00a0600\u00a0₽')
    expect(formatRub(51800)).toBe('51\u00a0800\u00a0₽')
  })

  it('без копеек', () => {
    expect(formatRub(1499.6)).toBe('1\u00a0500\u00a0₽')
    expect(formatRub(1500)).not.toContain(',')
  })
})
