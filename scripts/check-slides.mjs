import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const url = process.env.SLIDES_URL || 'http://127.0.0.1:4173/'
const channel = process.env.PW_CHANNEL
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
]
const outputDir = process.env.SLIDES_REPORT_DIR || 'artifacts/slide-checks'
const tolerance = 2

let browser
try {
  browser = await chromium.launch(channel ? { channel, headless: false } : { headless: true })
} catch (error) {
  console.error('Playwright browser is unavailable. Run `npx playwright install` on a supported host before running this check.')
  console.error(error.message)
  process.exitCode = 1
  process.exit()
}
await fs.mkdir(outputDir, { recursive: true })
let failures = 0

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Presentation' }).click()
  await page.waitForTimeout(300)

  const slideIds = await page.locator('.story-section').evaluateAll((sections) => sections.map((section) => section.id))
  const slides = []
  const failures = []
  for (const slideId of slideIds) {
    await page.locator(`#${slideId}`).evaluate((section) => section.scrollIntoView({ block: 'center', behavior: 'auto' }))
    await page.waitForTimeout(250)
    const slide = await page.evaluate(({ slideId, tolerance }) => {
      const section = document.getElementById(slideId)
      const frame = section.getBoundingClientRect()
      const frameOverflow = { left: -frame.left, right: frame.right - innerWidth, top: -frame.top, bottom: frame.bottom - innerHeight }
      const childFailures = []
      const children = [...section.querySelectorAll('.case-title,.case-text,.case-image,.keyword-card,.result-buttons,.closing-transfer')].map((element) => {
        const rect = element.getBoundingClientRect()
        const overflow = { left: frame.left - rect.left, right: rect.right - frame.right, top: frame.top - rect.top, bottom: rect.bottom - frame.bottom }
        if (Object.values(overflow).some((value) => value > tolerance)) childFailures.push({ slide: slideId, element: element.className, overflow })
        return { element: element.className, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } }
      })
      return { id: slideId, frame: { left: frame.left, top: frame.top, right: frame.right, bottom: frame.bottom, width: frame.width, height: frame.height }, frameOverflow, children, childFailures, scrollTop: window.scrollY }
    }, { slideId, tolerance })
    slides.push(slide)
    failures.push(...slide.childFailures)
    if (Object.values(slide.frameOverflow).some((value) => value > tolerance)) failures.push({ slide: slideId, element: 'Slide Frame', overflow: slide.frameOverflow })
    await page.screenshot({ path: `${outputDir}/${viewport.width}x${viewport.height}-${slide.id}.png`, fullPage: false })
  }
  console.log(JSON.stringify({ viewport, slides, failures }, null, 2))
  if (failures.length) process.exitCode = 1
  await page.close()
}

await browser.close()
if (failures) process.exitCode = 1
