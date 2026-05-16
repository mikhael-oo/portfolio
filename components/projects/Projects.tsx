// components/projects/Projects.tsx
import FadeUp from '@/components/ui/FadeUp'

const PROJECTS = [
  {
    num: '01',
    title: 'Splunk Monitoring Dashboards',
    desc: 'Engineered data monitoring dashboards with optimized SPL queries and scalable Jsonnet templates. Built comprehensive testing pipelines with Jest, Cypress, and Storybook.',
    chips: ['React', 'TypeScript', 'SPL', 'Jsonnet', 'Cypress'],
    impact: '20% latency reduction',
    href: 'www.splunk.com',
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
  {
    num: '05',
    title: 'Audiophile E-commerce',
    desc: 'E-commerce website for a fictional audio company. Built with ReactJS and Vite on the frontend, and Express with MongoDB on the backend.',
    chips: ['ReactJS', 'Vite', 'Express', 'MongoDB'],
    impact: 'Personal project',
    href: 'https://audiophile-frontend-6m7uvjjxn-mikhael-oo.vercel.app/',
  },
]

export default function Projects() {
  return (
    <section className="section" id="work">
      <FadeUp><p className="eyebrow">Selected Work</p></FadeUp>
      <FadeUp delay={0.05}><h2 className="section-title">Projects that <span className="gradient-text">matter.</span></h2></FadeUp>
      <div className="proj-list">
        {PROJECTS.map((p, i) => (
          <FadeUp key={p.num} delay={i * 0.07}>
            <a
              className="proj-row"
              href={p.href.startsWith('http') ? p.href : p.href === '#' ? p.href : `https://${p.href}`}
              target={p.href !== '#' ? '_blank' : undefined}
              rel={p.href !== '#' ? 'noopener noreferrer' : undefined}
            >
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
                <span className="proj-arrow-btn" aria-hidden="true">↗</span>
              </div>
            </a>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
