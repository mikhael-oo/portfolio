// components/projects/Projects.tsx
const PROJECTS = [
  {
    num: '01',
    title: 'Splunk Monitoring Dashboards',
    desc: 'Engineered data monitoring dashboards with optimized SPL queries and scalable Jsonnet templates. Built comprehensive testing pipelines with Jest, Cypress, and Storybook.',
    chips: ['React', 'TypeScript', 'SPL', 'Jsonnet', 'Cypress'],
    impact: '20% latency reduction',
    href: '#',
  },
  {
    num: '02',
    title: 'Personal Finance Manager',
    desc: 'Full-stack web application for tracking personal finances — budgeting, expense categorization, and reporting. PostgreSQL-backed REST API with a clean React frontend.',
    chips: ['React', 'Express', 'PostgreSQL', 'Tailwind'],
    impact: 'Personal project',
    href: '#',
  },
  {
    num: '03',
    title: 'DivTech Frontend',
    desc: 'Built frontend infrastructure with Next.js App Router and server components. Custom auth middleware securing protected routes across the application.',
    chips: ['Next.js', 'TypeScript', 'TailwindCSS', 'AWS'],
    impact: 'Contract',
    href: '#',
  },
  {
    num: '04',
    title: 'This Portfolio',
    desc: "Designed and built from scratch — 3D interactive globe, smooth scroll, dark/light mode. The site you're currently on.",
    chips: ['Next.js', 'React Three Fiber', 'Framer Motion', 'TypeScript'],
    impact: 'mikhaelcodes.dev',
    href: '#',
  },
]

export default function Projects() {
  return (
    <section className="section" id="work">
      <p className="eyebrow">Selected Work</p>
      <h2 className="section-title">Projects that <span className="gradient-text">matter.</span></h2>
      <div className="proj-list">
        {PROJECTS.map(p => (
          <a key={p.num} className="proj-row" href={p.href}>
            <span className="proj-num">{p.num}</span>
            <div>
              <div className="proj-title">{p.title}</div>
              <p className="proj-desc">{p.desc}</p>
              <div className="proj-chips">
                {p.chips.map(c => <span key={c} className="proj-chip">{c}</span>)}
              </div>
            </div>
            <div className="proj-right">
              <span className="proj-impact">{p.impact}</span>
              <button className="proj-arrow-btn" aria-label="Open project">↗</button>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
