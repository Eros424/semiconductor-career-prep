import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { capabilityDetails, chapters, keywords, teamKeywords } from './data/story'

gsap.registerPlugin(ScrollTrigger)
type Mode = 'explore' | 'presentation'

function App() {
  const [mode, setMode] = useState<Mode>('explore')
  const [activeChapter, setActiveChapter] = useState(0)
  const [capability, setCapability] = useState<keyof typeof capabilityDetails>('systems')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navigating = useRef(false)

  useEffect(() => {
    const sections = chapters.map((chapter) => sectionRefs.current[chapter.id]).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver((entries) => {
      if (navigating.current) return
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveChapter(chapters.findIndex((chapter) => chapter.id === visible.target.id))
    }, { threshold: [0.3, 0.6] })
    sections.forEach((section) => observer.observe(section))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) sections.forEach((section) => gsap.fromTo(section.querySelectorAll('.reveal'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .6, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 80%', once: true } }))
    return () => { observer.disconnect(); ScrollTrigger.getAll().forEach((trigger) => trigger.kill()) }
  }, [])

  const goToChapter = (index: number) => {
    const chapter = chapters[index]
    const section = chapter && sectionRefs.current[chapter.id]
    if (!section) return
    setActiveChapter(index)
    navigating.current = true
    const top = section.getBoundingClientRect().top + window.scrollY - 48
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    window.setTimeout(() => { navigating.current = false }, 850)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (mode !== 'presentation') return
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
    <header className={`topbar ${activeChapter > 0 ? 'is-compact' : ''}`}><a className="brand" href="#intro" onClick={(event) => { event.preventDefault(); goToChapter(0) }}><span className="brand-mark">RPB</span><span>Engineering portfolio</span></a><div className="mode-toggle" role="group" aria-label="View mode"><button type="button" className={mode === 'explore' ? 'active' : ''} onClick={() => setMode('explore')}>Explore</button><button type="button" className={mode === 'presentation' ? 'active' : ''} onClick={() => setMode('presentation')}>Presentation <span className="key-hint">⌘ 5 min</span></button></div></header>
    <nav className="chapter-rail" aria-label="Keyword index">{chapters.map((chapter, index) => <button key={chapter.id} className={index === activeChapter ? 'rail-item active' : 'rail-item'} onClick={() => goToChapter(index)} aria-label={`Go to ${chapter.label}`}><span>{chapter.number}</span><i /></button>)}</nav>
    {mode === 'presentation' && <PresentationBar activeChapter={activeChapter} onPrevious={() => goToChapter(Math.max(0, activeChapter - 1))} onNext={() => goToChapter(Math.min(chapters.length - 1, activeChapter + 1))} />}
    <main id="story">
      <section id="intro" ref={setRef('intro')} className={`story-section hero-section ${activeChapter === 0 ? 'is-active' : ''}`} aria-labelledby="intro-title"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow reveal"><span>01</span> Start here</p><h1 id="intro-title" className="hero-title reveal">From research<br /><em>to engineering.</em></h1><p className="hero-lede reveal">Two short STAR cases. One method: change one factor, observe the response, and make the next step clear.</p><div className="hero-actions reveal"><button className="button button-primary" type="button" onClick={() => goToChapter(1)}>Enter the cases <span>↘</span></button><button className="text-button" type="button" onClick={() => setMode('presentation')}>Start 5 min presentation <span>→</span></button></div></div><div className="intro-panel reveal"><span className="eyebrow">Two cases</span><div><strong>01</strong><span>Overflow</span><small>stabilize the experiment</small></div><div><strong>02</strong><span>Team success</span><small>help a project move</small></div><p>Click the chapter rail or start Presentation Mode when you are ready to speak.</p></div></div></section>
      <CaseSection active={activeChapter === 1} id="overflow-task" refCallback={setRef('overflow-task')} image="/images/overflow-compare.png" chapter="02 / Overflow · Situation + Task" title="The system had to become stable." text="I changed the packing structure while keeping the flow conditions fixed. The task was to understand why the same setup behaved differently." rightPlacement="under-image" right={<KeywordCards items={[{ label: 'Change', text: 'Different packing structures' }, { label: 'Keep fixed', text: 'Flow and other conditions' }, { label: 'Observe', text: 'When overflow appears' }]} />} />
      <CaseSection active={activeChapter === 2} id="overflow-action" refCallback={setRef('overflow-action')} dark image="/images/diagnostic-loop.png" chapter="03 / Overflow · Action" title="Observe. Identify. Verify." text="I used a simple control loop instead of changing many things at once." rightPlacement="under-image" right={<KeywordCards items={keywords.map((item) => ({ label: item.label, text: item.text }))} numbered />}><ResultButtons /></CaseSection>
      <CaseSection active={activeChapter === 3} id="overflow-result" refCallback={setRef('overflow-result')} blue image="/images/rpb-system.png" chapter="04 / Overflow · Result" title="The overflow disappeared." text="After I adjusted the liquid flow in the same overflow-prone experiment, the overflow stopped. I then treated flow as a control variable and continued the comparison." rightPlacement="under-image" right={<KeywordCards items={[{ label: 'Before', text: 'Overflow under the original setting' }, { label: 'Change', text: 'Adjust liquid flow' }, { label: 'After', text: 'A more stable operating range' }]} numbered />} />
      <CaseSection active={activeChapter === 4} id="team-task" refCallback={setRef('team-task')} image="/images/team-assembly.png" chapter="05 / Team · Situation + Task" title="One RPB. Two research tasks." text="I shared the overflow finding with the project student. We needed to organize the setup and use the same equipment without losing the research sequence." rightPlacement="under-image" right={<KeywordCards items={[{ label: 'Share', text: 'Pass on the overflow finding' }, { label: 'Common resource', text: 'One shared RPB' }, { label: 'Target', text: 'Keep the student’s project moving' }]} />} />
      <CaseSection active={activeChapter === 5} id="team-action" refCallback={setRef('team-action')} dark image="/images/team-coordination.png" chapter="06 / Team · Action" title="Organize. Teach. Coordinate." text="I helped assemble the experimental setup, explained the operating sequence, and coordinated the shared equipment around the two tasks." rightPlacement="under-image" right={<KeywordCards items={teamKeywords.map((item) => ({ label: item.label, text: item.text }))} numbered />} />
      <CaseSection active={activeChapter === 6} id="team-result" refCallback={setRef('team-result')} cream image="/images/team-coordination.png" chapter="07 / Team · Result" title="Progress became a team result." text="The student completed the thesis project and received a competition award. My contribution was the structure, equipment guidance, and coordination around the work." rightPlacement="under-image" right={<KeywordCards items={[{ label: 'My contribution', text: 'Structure, assembly, guidance, coordination' }, { label: 'Student outcome', text: 'Completed thesis project' }, { label: 'Student achievement', text: 'Competition award' }]} />}><div className="closing-transfer"><span className="eyebrow">Engineering application</span><h3>Make the equipment state clear. Make the next action clear.</h3><p>That is how I would contribute as an Equipment Engineer while following safety rules, SOPs, records, and escalation paths.</p></div></CaseSection>
    </main>
  </div>
}

function PresentationBar({ activeChapter, onPrevious, onNext }: { activeChapter: number; onPrevious: () => void; onNext: () => void }) {
  return <div className="presentation-bar"><button type="button" onClick={onPrevious} aria-label="Previous chapter">←</button><span><strong>{String(activeChapter + 1).padStart(2, '0')}</strong> / 07 · {chapters[activeChapter].label}</span><div className="presentation-progress"><i style={{ width: `${((activeChapter + 1) / chapters.length) * 100}%` }} /></div><button type="button" onClick={onNext} aria-label="Next chapter">→</button></div>
}

function CaseSection({ active, id, refCallback, image, chapter, title, text, right, rightPlacement = 'bottom', dark, blue, cream, children }: { active: boolean; id: string; refCallback: (node: HTMLElement | null) => void; image: string; chapter: string; title: string; text: string; right: ReactNode; rightPlacement?: 'bottom' | 'under-image'; dark?: boolean; blue?: boolean; cream?: boolean; children?: ReactNode }) {
  return <section id={id} ref={refCallback} className={`story-section case-section ${active ? 'is-active' : ''} ${dark ? 'section-dark' : ''} ${blue ? 'section-blue' : ''} ${cream ? 'section-cream' : 'section-paper'}`} aria-labelledby={`${id}-title`}><div className="case-grid"><div className="case-copy"><p className="eyebrow reveal"><span>{chapter.split(' / ')[0]}</span>{chapter.split(' / ').slice(1).join(' / ')}</p><h2 id={`${id}-title`} className="case-title reveal">{title}</h2><p className="case-text reveal">{text}</p>{children && <div className="case-extra reveal">{children}</div>}<div className="case-bottom-transition">{chapter}</div></div><div className="case-side reveal"><img className="case-image" src={image} alt="Rounded editorial illustration for this engineering story" width="1672" height="941" loading="lazy" />{rightPlacement === 'under-image' && <div className="case-procedure reveal">{right}</div>}</div></div>{rightPlacement === 'bottom' && <div className="case-bottom-keywords reveal">{right}</div>}</section>
}

function KeywordCards({ items, numbered }: { items: Array<{ label: string; text: string }>; numbered?: boolean }) {
  return <ol className="keyword-stack">{items.map((item, index) => <li className="keyword-card" key={item.label}><span>{numbered ? `0${index + 1}` : '→'}</span><div><strong>{item.label}</strong><p>{item.text}</p></div></li>)}</ol>
}

function ResultButtons() {
  const [active, setActive] = useState(0)
  const items = [{ label: 'Operation variable', text: 'Packing structure changed. Flow conditions stayed fixed.' }, { label: 'What I saw', text: 'When resistance became too high, liquid came out from the top.' }, { label: 'What I changed', text: 'I adjusted liquid flow in the same overflow-prone experiment.' }, { label: 'What changed', text: 'The overflow stopped, so I used flow as a control variable.' }]
  return <div className="result-buttons" role="group" aria-label="Overflow control loop">{items.map((item, index) => <button key={item.label} type="button" className={active === index ? 'active' : ''} onClick={() => setActive(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}<p key={items[active].label} className="result-readout" aria-live="polite">{items[active].text}</p></div>
}

export default App
