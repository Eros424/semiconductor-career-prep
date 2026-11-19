import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../', import.meta.url)
const dist = new URL('./dist/', root)
let html = await readFile(new URL('index.html', dist), 'utf8')

const cssLink = html.match(/<link rel="stylesheet"[^>]+href="\.\/assets\/([^\"]+)"[^>]*>/)
const jsScript = html.match(/<script type="module"[^>]+src="\.\/assets\/([^\"]+)"[^>]*><\/script>/)
if (!cssLink || !jsScript) throw new Error('Built assets were not found in dist/index.html')

const css = await readFile(new URL(`assets/${cssLink[1]}`, dist), 'utf8')
let js = await readFile(new URL(`assets/${jsScript[1]}`, dist), 'utf8')
const imageDir = new URL('images/', dist)
for (const file of await readdir(imageDir)) {
  if (!file.endsWith('.png')) continue
  const image = await readFile(new URL(file, imageDir))
  js = js.replaceAll(`/images/${file}`, `data:image/png;base64,${image.toString('base64')}`)
}

html = html.replace(cssLink[0], () => `<style>${css}</style>`)
const safeScript = js.replaceAll('</script>', () => '<\\/script>')
html = html.replace(jsScript[0], () => `<script type="module">${safeScript}</script>`)
await writeFile(new URL('rpb-engineering-portfolio.html', root), html)
console.log('Created rpb-engineering-portfolio.html')
