import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

// Охранный тест: правила движения из SPEC.md («Запрещено», «Никаких библиотек анимации»).
const srcDir = import.meta.dirname
const rootDir = join(srcDir, '..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return path === join(srcDir, 'test') ? [] : walk(path)
    return /\.(ts|tsx|css)$/.test(name) && !/\.test\.[tj]sx?$/.test(name) ? [path] : []
  })
}

// Комментарии могут описывать запрет словами, это не нарушение.
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const files = walk(srcDir).map((path) => ({
  path: relative(rootDir, path).split(sep).join('/'),
  code: stripComments(readFileSync(path, 'utf8')),
}))

const rules: Array<[string, RegExp]> = [
  ['transition: all', /transition(-property)?\s*:\s*all\b/i],
  ['transition-all', /\btransition-all\b/],
  ['ease-in (без -out)', /\bease-in(?!-out)\b/],
  ['scale(0)', /scale\(\s*0\s*[,)]/],
  ['scale-0', /(?<![\w-])scale-0(?![\w.%-])/],
  ['импорт библиотеки анимации', /(?:from|import|require\()\s*\(?\s*['"](?:gsap|motion|framer-motion)(?:\/[^'"]*)?['"]/],
]

describe('E1: правила движения в исходниках', () => {
  it('сканер видит исходники', () => {
    const paths = files.map((f) => f.path)
    expect(paths).toContain('src/main.tsx')
    expect(paths).toContain('src/index.css')
  })

  it.each(rules)('нет «%s»', (_name, pattern) => {
    const offenders = files.filter((f) => pattern.test(f.code)).map((f) => f.path)
    expect(offenders).toEqual([])
  })

  it('в зависимостях нет gsap, motion, framer-motion', () => {
    const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    expect(deps.filter((d) => ['gsap', 'motion', 'framer-motion'].includes(d))).toEqual([])
  })
})
