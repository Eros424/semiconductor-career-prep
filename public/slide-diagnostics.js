(() => {
  const SLIDE_SELECTOR = '.story-section'
  const CONTENT_SELECTOR = '.slide-content'
  const IMPORTANT_SELECTOR = '.case-title,.case-text,.case-image,.keyword-card,.result-buttons,.closing-transfer'
  const EXPECTED_RATIO = 16 / 9
  const RATIO_TOLERANCE = 0.08
  const POSITION_TOLERANCE = 2

  const rect = (element) => {
    const value = element.getBoundingClientRect()
    return { left: value.left, top: value.top, right: value.right, bottom: value.bottom, width: value.width, height: value.height }
  }

  const overflow = (inner, outer) => ({
    left: Math.max(0, outer.left - inner.left),
    right: Math.max(0, inner.right - outer.right),
    top: Math.max(0, outer.top - inner.top),
    bottom: Math.max(0, inner.bottom - outer.bottom),
  })

  const hasOverflow = (value) => Object.values(value).some((amount) => amount > POSITION_TOLERANCE)

  const transformScale = (element) => {
    const scales = []
    let current = element
    while (current) {
      const transform = getComputedStyle(current).transform
      if (transform && transform !== 'none') scales.push({ selector: current.className || current.tagName, transform })
      current = current.parentElement
    }
    return scales
  }

  const stylesheetFindings = () => [...document.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules].filter((rule) => rule.selectorText && /story-section|slide-content|case-image|keyword-card/.test(rule.selectorText) && /transform|overflow|height|min-height|max-height|position/.test(rule.cssText)).map((rule) => rule.cssText)
    } catch {
      return []
    }
  })

  const inspectSlide = (slide) => {
    const frame = rect(slide)
    const content = slide.querySelector(CONTENT_SELECTOR)
    const styles = getComputedStyle(slide)
    const ratio = frame.width && frame.height ? frame.width / frame.height : null
    const frameIssues = []
    if (ratio && Math.abs(ratio - EXPECTED_RATIO) > RATIO_TOLERANCE) frameIssues.push(`比例 ${ratio.toFixed(3)}，與 16:9 差異超過容許值`)
    if (styles.position === 'fixed') frameIssues.push('Slide 使用 position: fixed')
    if (styles.overflow === 'hidden' || styles.overflowY === 'hidden' || styles.overflowX === 'hidden') frameIssues.push('Slide 使用 overflow hidden，需人工確認是否遮住內容')

    const elements = [...slide.querySelectorAll(IMPORTANT_SELECTOR)].map((element) => {
      const elementRect = rect(element)
      const frameOverflow = overflow(elementRect, frame)
      const viewportOverflow = overflow(elementRect, { left: 0, top: 0, right: innerWidth, bottom: innerHeight })
      return {
        selector: element.className || element.tagName.toLowerCase(),
        text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 120),
        rect: elementRect,
        frameOverflow,
        viewportOverflow,
        transforms: transformScale(element),
        contentOverflow: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
        issues: hasOverflow(frameOverflow) ? ['超出 Slide Frame'] : [],
      }
    })

    const viewportOffset = { top: frame.top, bottom: innerHeight - frame.bottom, left: frame.left, right: innerWidth - frame.right }
    const slideScale = transformScale(slide)
    const scaleCount = slideScale.filter(({ transform }) => /matrix\([^)]*,[^)]*,[^)]*,/.test(transform)).length
    if (scaleCount > 1) frameIssues.push(`偵測到 ${scaleCount} 層 transform，可能存在雙重縮放`)

    return {
      id: slide.id,
      frame,
      ratio,
      viewportOffset,
      content: content ? rect(content) : null,
      computed: { height: styles.height, minHeight: styles.minHeight, maxHeight: styles.maxHeight, overflow: styles.overflow, position: styles.position, transform: styles.transform },
      elements,
      issues: frameIssues,
    }
  }

  const inspect = () => {
    const slides = [...document.querySelectorAll(SLIDE_SELECTOR)].map(inspectSlide)
    const issues = slides.flatMap((slide) => slide.issues.map((issue) => ({ slide: slide.id, issue })))
      .concat(slides.flatMap((slide) => slide.elements.flatMap((element) => element.issues.map((issue) => ({ slide: slide.id, element: element.selector, issue })))))
    return {
      generatedAt: new Date().toISOString(),
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight, scrollTop: scrollY, scrollHeight: document.documentElement.scrollHeight },
      selectors: { slide: SLIDE_SELECTOR, content: CONTENT_SELECTOR, important: IMPORTANT_SELECTOR },
      expected: { ratio: EXPECTED_RATIO, ratioTolerance: RATIO_TOLERANCE, positionTolerance: POSITION_TOLERANCE },
      scrollContainer: { element: 'document.documentElement', scrollTop: scrollY, snapType: getComputedStyle(document.documentElement).scrollSnapType, scrollPaddingBlock: getComputedStyle(document.documentElement).scrollPaddingBlock },
      stylesheetFindings: stylesheetFindings(),
      slides,
      issues,
    }
  }

  const download = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `slide-diagnostics-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  window.runSlideDiagnostics = async ({ autoScroll = false, downloadJson = false, settleMs = 350 } = {}) => {
    const slides = [...document.querySelectorAll(SLIDE_SELECTOR)]
    if (autoScroll) {
      for (const slide of slides) {
        slide.scrollIntoView({ block: 'start', behavior: 'auto' })
        await new Promise((resolve) => setTimeout(resolve, settleMs))
        console.group(`Slide ${slide.id}`)
        console.table(inspectSlide(slide).elements.map(({ selector, rect: value, frameOverflow }) => ({ selector, left: value.left.toFixed(1), top: value.top.toFixed(1), width: value.width.toFixed(1), height: value.height.toFixed(1), frameOverflow: JSON.stringify(frameOverflow) })))
        console.groupEnd()
      }
    }
    const report = inspect()
    console.log(`Slide diagnostics: ${report.slides.length} slides, ${report.issues.length} issues`)
    console.table(report.issues)
    if (downloadJson) download(report)
    return report
  }

  console.info('Slide diagnostics loaded. Run window.runSlideDiagnostics({ autoScroll: true, downloadJson: true })')
})()
