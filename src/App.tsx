import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { capabilityDetails, chapters, content, getSlide } from './data/story'

gsap.registerPlugin(ScrollTrigger)
type Mode = 'scroll' | 'presentation'
const presentationTitles = content.navigationTitles
const overflowTask = getSlide('overflow-task')
const overflowAction = getSlide('overflow-action')
const overflowResult = getSlide('overflow-result')
const teamTask = getSlide('team-task')
const teamAction = getSlide('team-action')
const teamResult = getSlide('team-result')

function App() {
  const [mode, setMode] = useState<Mode>('scroll')
  const [activeChapter, setActiveChapter] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [capability, setCapability] = useState<keyof typeof capabilityDetails>('systems')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navigating = useRef(false)
  const activeChapterRef = useRef(0)

  const scrollToSection = (section: HTMLElement, targetMode: Mode, behavior: ScrollBehavior) => {
    if (targetMode === 'presentation' && window.matchMedia('(min-width: 901px)').matches) {
      const rect = section.getBoundingClientRect()
      const top = window.scrollY + rect.top - 84
      const maxTop = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: Math.min(Math.max(0, top), maxTop), behavior })
      return
    }
    section.scrollIntoView({ block: 'start', behavior })
  }

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode)
    activeChapterRef.current = activeChapter
    window.requestAnimationFrame(() => {
      const section = sectionRefs.current[chapters[activeChapter]?.id]
      if (section) scrollToSection(section, nextMode, 'auto')
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) return
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined)
    else document.exitFullscreen?.().catch(() => undefined)
  }

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const sections = chapters.map((chapter) => sectionRefs.current[chapter.id]).filter(Boolean) as HTMLElement[]
    let frame = 0
    const updateActiveChapter = () => {
      frame = 0
      if (navigating.current) return
      const center = window.innerHeight / 2
      let closestIndex = activeChapterRef.current
      let closestDistance = Number.POSITIVE_INFINITY
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const distance = Math.abs(rect.top + rect.height / 2 - center)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })
      if (closestIndex !== activeChapterRef.current) {
        activeChapterRef.current = closestIndex
        setActiveChapter(closestIndex)
      }
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveChapter)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) sections.forEach((section) => gsap.fromTo(section.querySelectorAll('.reveal'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 80%', once: true } }))
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const snapContainer = (document.scrollingElement || root) as HTMLElement
    const desktop = window.matchMedia('(min-width: 901px)')
    const applySnap = () => {
      if (mode === 'presentation' && desktop.matches) {
        snapContainer.style.scrollSnapType = 'y mandatory'
        snapContainer.style.scrollPaddingBlock = '84px 104px'
      } else {
        snapContainer.style.removeProperty('scroll-snap-type')
        snapContainer.style.removeProperty('scroll-padding-block')
      }
    }
    applySnap()
    desktop.addEventListener('change', applySnap)
    return () => {
      desktop.removeEventListener('change', applySnap)
      snapContainer.style.removeProperty('scroll-snap-type')
      snapContainer.style.removeProperty('scroll-padding-block')
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'presentation' || !window.matchMedia('(min-width: 901px)').matches) return
    const correctSnapPosition = () => {
      const sections = chapters.map((chapter) => sectionRefs.current[chapter.id]).filter(Boolean) as HTMLElement[]
      const target = sections.reduce<HTMLElement | null>((closest, section) => {
        if (!closest) return section
        return Math.abs(section.getBoundingClientRect().top - 84) < Math.abs(closest.getBoundingClientRect().top - 84) ? section : closest
      }, null)
      if (!target) return
      const offset = target.getBoundingClientRect().top - 84
      if (Math.abs(offset) > 2) window.scrollBy({ top: offset, behavior: 'auto' })
    }
    window.addEventListener('scrollend', correctSnapPosition)
    return () => window.removeEventListener('scrollend', correctSnapPosition)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    const updateScale = () => {
      if (mode !== 'presentation' || !window.matchMedia('(min-width: 901px)').matches) {
        root.style.removeProperty('--presentation-scale')
        return
      }
      const availableWidth = window.innerWidth - 36
      const availableHeight = window.innerHeight - 84 - 104
      const scale = Math.min(availableWidth / 1600, availableHeight / 900, 1)
      root.style.setProperty('--presentation-scale', String(Math.max(scale, 0.1)))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => {
      window.removeEventListener('resize', updateScale)
      root.style.removeProperty('--presentation-scale')
    }
  }, [mode])

  const goToChapter = (index: number) => {
    const chapter = chapters[index]
    const section = chapter && sectionRefs.current[chapter.id]
    if (!section) return
    activeChapterRef.current = index
    setActiveChapter(index)
    navigating.current = true
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    scrollToSection(section, mode, behavior)
    window.setTimeout(() => { navigating.current = false }, 850)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (mode !== 'presentation') return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); goToChapter(Math.min(activeChapter + 1, chapters.length - 1)) }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); goToChapter(Math.max(activeChapter - 1, 0)) }
      if (event.key === 'Home') { event.preventDefault(); goToChapter(0) }
      if (event.key === 'End') { event.preventDefault(); goToChapter(chapters.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeChapter, mode])

  const setRef = (id: string) => (node: HTMLElement | null) => { sectionRefs.current[id] = node }

  return <div className={`app mode-${mode}`}>
    <a className="skip-link" href="#story">Skip to story</a>
    <header className={`topbar ${activeChapter > 0 ? 'is-compact' : ''}`}><a className="brand" href="#intro" onClick={(event) => { event.preventDefault(); goToChapter(0) }}><span className="brand-mark">RPB</span><span>Engineering portfolio</span></a><div className="topbar-actions"><div className="mode-toggle" role="group" aria-label="View mode"><button type="button" className={mode === 'scroll' ? 'active' : ''} onClick={() => changeMode('scroll')}>Scroll</button><button type="button" className={mode === 'presentation' ? 'active' : ''} onClick={() => changeMode('presentation')}>Presentation </button></div><button className="fullscreen-toggle" type="button" onClick={toggleFullscreen} disabled={!document.fullscreenEnabled} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={document.fullscreenEnabled ? (isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen') : 'Fullscreen is not supported in this browser'}>{isFullscreen ? '×' : '⛶'}</button></div></header>
    <nav className={`chapter-rail ${mode === 'presentation' ? 'is-presentation' : ''}`} aria-label="Chapter navigation">
      <div key={activeChapter} className="chapter-current-title" aria-live="polite">{presentationTitles[activeChapter]}</div>
      <div className="chapter-dots">{chapters.map((chapter, index) => <button key={chapter.id} className={index === activeChapter ? 'rail-item active' : 'rail-item'} onClick={() => goToChapter(index)} aria-label={`Go to ${presentationTitles[index]}`} aria-current={index === activeChapter ? 'step' : undefined}><span>{chapter.number}</span><i /></button>)}</div>
    </nav>
    <main id="story">
      <section id="intro" ref={setRef('intro')} className={`story-section hero-section ${activeChapter === 0 ? 'is-active' : ''}`} aria-labelledby="intro-title"><div className="slide-content"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow reveal"><span>01</span> {content.intro.eyebrow}</p><h1 id="intro-title" className="hero-title reveal">{content.intro.titleLines[0]}<br /><em>{content.intro.titleLines[1]}</em></h1><p className="hero-lede reveal">{content.intro.description}</p><div className="hero-actions reveal"><button className="button button-primary" type="button" onClick={() => goToChapter(1)}>Enter the cases <span>↘</span></button><button className="text-button" type="button" onClick={() => changeMode('presentation')}>Start 5 min presentation <span>→</span></button></div></div><div className="intro-panel reveal"><span className="eyebrow">{content.intro.casesLabel}</span>{content.intro.cases.map((item, index) => <button key={item.number} className={`case-entry ${index === 0 ? 'case-entry-overflow' : 'case-entry-team'}`} type="button" onClick={() => goToChapter(chapters.findIndex((chapter) => chapter.id === item.target))}><strong>{item.number}</strong><span>{item.title}</span><small>{item.description}</small><i aria-hidden="true">↗</i></button>)}<p>{content.intro.casesHint}</p></div></div></div></section>
      <CaseSection active={activeChapter === 1} id={overflowTask.id} refCallback={setRef(overflowTask.id)} image={overflowTask.image} chapter={`${overflowTask.number} / ${overflowTask.chapter ?? overflowTask.label}`} title={overflowTask.title} text={overflowTask.description!} rightPlacement="bottom" right={<KeywordCards items={overflowTask.cards ?? []} />} />
      <CaseSection active={activeChapter === 2} id={overflowAction.id} refCallback={setRef(overflowAction.id)} dark image={overflowAction.image} chapter={`${overflowAction.number} / ${overflowAction.chapter ?? overflowAction.label}`} title={overflowAction.title} text={overflowAction.description!} rightPlacement="under-image" right={<KeywordCards items={overflowAction.cards ?? []} numbered />}><ResultButtons items={overflowAction.resultButtons ?? []} /></CaseSection>
      <CaseSection active={activeChapter === 3} id={overflowResult.id} refCallback={setRef(overflowResult.id)} blue image={overflowResult.image} chapter={`${overflowResult.number} / ${overflowResult.chapter ?? overflowResult.label}`} title={overflowResult.title} text={overflowResult.description!} rightPlacement="bottom" right={<KeywordCards items={overflowResult.cards ?? []} numbered />} />
      <CaseSection active={activeChapter === 4} id={teamTask.id} refCallback={setRef(teamTask.id)} image={teamTask.image} chapter={`${teamTask.number} / ${teamTask.chapter ?? teamTask.label}`} title={teamTask.title} text={teamTask.description!} rightPlacement="bottom" right={<KeywordCards items={teamTask.cards ?? []} />} />
      <CaseSection active={activeChapter === 5} id={teamAction.id} refCallback={setRef(teamAction.id)} dark image={teamAction.image} chapter={`${teamAction.number} / ${teamAction.chapter ?? teamAction.label}`} title={teamAction.title} text={teamAction.description!} rightPlacement="under-image" right={<KeywordCards items={teamAction.cards ?? []} numbered />} />
      <CaseSection active={activeChapter === 6} id={teamResult.id} refCallback={setRef(teamResult.id)} cream hideImage chapter={`${teamResult.number} / ${teamResult.chapter ?? teamResult.label}`} title={teamResult.title} text={teamResult.description!} rightPlacement="bottom" right={<KeywordCards items={teamResult.cards ?? []} numbered />}><div className="closing-transfer"><span className="eyebrow">{teamResult.closing?.eyebrow}</span><h3>{teamResult.closing?.title}</h3><p>{teamResult.closing?.text}</p></div></CaseSection>
    </main>
  </div>
}

function CaseSection({ active, id, refCallback, image, hideImage, chapter, title, text, right, rightPlacement = 'bottom', dark, blue, cream, children }: { active: boolean; id: string; refCallback: (node: HTMLElement | null) => void; image?: string; hideImage?: boolean; chapter: string; title: string; text: string; right: ReactNode; rightPlacement?: 'bottom' | 'under-image'; dark?: boolean; blue?: boolean; cream?: boolean; children?: ReactNode }) {
  return <section id={id} ref={refCallback} className={`story-section case-section ${active ? 'is-active' : ''} ${hideImage ? 'no-case-image' : ''} ${rightPlacement === 'bottom' ? 'has-bottom-procedure' : ''} ${dark ? 'section-dark' : ''} ${blue ? 'section-blue' : ''} ${cream ? 'section-cream' : 'section-paper'}`} aria-labelledby={`${id}-title`}><div className="slide-content"><div className="case-grid"><div className="case-copy"><p className="eyebrow reveal"><span>{chapter.split(' / ')[0]}</span>{chapter.split(' / ').slice(1).join(' / ')}</p><h2 id={`${id}-title`} className="case-title reveal">{title}</h2><p className="case-text reveal">{text}</p>{children && <div className="case-extra reveal">{children}</div>}<div className="case-bottom-transition">{chapter}</div></div>{!hideImage && <div className="case-side reveal"><img className="case-image" src={image} alt="Rounded editorial illustration for this engineering story" width="1672" height="941" loading="lazy" />{rightPlacement === 'under-image' && <div className="case-procedure reveal">{right}</div>}</div>}</div>{rightPlacement === 'bottom' && <div className="case-bottom-keywords reveal">{right}</div>}</div></section>
}

function KeywordCards({ items, numbered }: { items: Array<{ label: string; text: string }>; numbered?: boolean }) {
  return <ol className="keyword-stack">{items.map((item, index) => <li className="keyword-card" key={item.label}><span>{numbered ? `0${index + 1}` : '→'}</span><div><strong>{item.label}</strong><p>{item.text}</p></div></li>)}</ol>
}

function ResultButtons({ items }: { items: Array<{ label: string; text: string }> }) {
  const [active, setActive] = useState(0)
  return <div className="result-buttons" role="group" aria-label="Overflow control loop">{items.map((item, index) => <button key={item.label} type="button" className={active === index ? 'active' : ''} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}<p key={items[active].label} className="result-readout" aria-live="polite">{items[active].text}</p></div>
}

export default App
