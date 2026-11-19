import rawContent from './content.json'

export type CardContent = { label: string; text: string }
export type SlideContent = { id: string; number: string; label: string; chapter?: string; navigationTitle?: string; title: string; short: string; description?: string; image?: string; rightPlacement?: 'bottom' | 'under-image'; numbered?: boolean; cards?: CardContent[]; resultButtons?: CardContent[]; closing?: { eyebrow: string; title: string; text: string } }
export type Content = { navigationTitles: string[]; intro: { eyebrow: string; titleLines: string[]; description: string; casesLabel: string; casesHint: string; cases: Array<{ number: string; title: string; description: string; target: string }> }; slides: SlideContent[]; capabilities: Record<string, { title: string; body: string }> }

export const content = rawContent as Content
export const chapters = content.slides.map(({ id, number, label, title, short }) => ({ id, number, label, title, short }))
export const getSlide = (id: string) => content.slides.find((slide) => slide.id === id) as SlideContent
export const keywords = getSlide('overflow-action').cards ?? []
export const teamKeywords = getSlide('team-action').cards ?? []
export const capabilityDetails = content.capabilities as { systems: { title: string; body: string }; evidence: { title: string; body: string }; people: { title: string; body: string } }
