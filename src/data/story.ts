export type Chapter = { id: string; number: string; label: string; title: string; short: string }

export const chapters: Chapter[] = [
  { id: 'intro', number: '01', label: 'Start here', title: 'From research to engineering.', short: 'The method I bring' },
  { id: 'overflow-task', number: '02', label: 'Overflow / Task', title: 'The system had to become stable.', short: 'Change one factor at a time' },
  { id: 'overflow-action', number: '03', label: 'Overflow / Action', title: 'Observe. Identify. Verify.', short: 'A simple control loop' },
  { id: 'overflow-result', number: '04', label: 'Overflow / Result', title: 'The overflow disappeared.', short: 'A range I could use' },
  { id: 'team-task', number: '05', label: 'Team / Task', title: 'One RPB. Two research tasks.', short: 'Share the learning' },
  { id: 'team-action', number: '06', label: 'Team / Action', title: 'Organize. Teach. Coordinate.', short: 'Make the next step clear' },
  { id: 'team-result', number: '07', label: 'Team / Result', title: 'Progress became a team result.', short: 'Support without overclaiming' },
]

export const keywords = [
  { id: 'observe', label: 'Observe', text: 'Keep the flow conditions fixed and watch what changes.' },
  { id: 'identify', label: 'Identify', text: 'Compare the packing structure and locate the changed factor.' },
  { id: 'collect', label: 'Collect data', text: 'Record the packing, flow setting, and operating condition.' },
  { id: 'verify', label: 'Verification', text: 'Change the liquid flow and check whether overflow stops.' },
]

export const teamKeywords = [
  { id: 'share', label: 'Share', text: 'Pass the overflow finding to the project student.' },
  { id: 'assemble', label: 'Assemble', text: 'Help organize the shared equipment and experimental setup.' },
  { id: 'guide', label: 'Guide', text: 'Explain the operating sequence and the next check.' },
  { id: 'coordinate', label: 'Coordinate', text: 'Keep two research tasks moving around one RPB.' },
]

export const capabilityDetails = {
  systems: { title: 'System thinking', body: 'Change one factor, keep the rest steady, and read the equipment response.' },
  evidence: { title: 'Evidence first', body: 'Separate what I saw from what the literature may explain.' },
  people: { title: 'Team coordination', body: 'Share the finding, make the next step clear, and keep the handoff visible.' },
}
