// Вставляет разметку из entry-server в dist/index.html (main.tsx потом оживляет её через hydrateRoot)
// и встраивает CSS: внешний файл грузится после предзагрузок шрифтов и машины и задерживает первый кадр.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const { render } = await import(pathToFileURL('dist-ssr/entry-server.js').href)
let html = readFileSync('dist/index.html', 'utf8')
const slot = '<div id="root"></div>'
const css = /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/
if (!html.includes(slot) || !css.test(html)) throw new Error('в dist/index.html нет #root или ссылки на CSS')
html = html.replace(css, (_, href) => `<style>${readFileSync(`dist${href}`, 'utf8')}</style>`)
writeFileSync('dist/index.html', html.replace(slot, `<div id="root">${render()}</div>`))
rmSync('dist-ssr', { recursive: true, force: true })
