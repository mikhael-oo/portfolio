// components/experience/Experience.tsx
import FadeUp from '@/components/ui/FadeUp'
import SectionTitle from '@/components/ui/SectionTitle'
import Parallax from '@/components/ui/Parallax'

const EXPERIENCE = [
  {
    company: 'Splunk',
    role: 'Software Engineer',
    dates: 'Jan 2025 – Present',
    location: 'Vancouver, BC',
    desc: 'Engineered data monitoring dashboards with optimized SPL queries, reducing latency by 20%. Designed scalable Jsonnet templates cutting cloud deployment setup by 25%. Built testing pipelines with Jest, Cypress, and Storybook + Loki, reducing regression issues by 15%.',
    chips: ['React', 'TypeScript', 'SPL', 'Jsonnet', 'Cypress', 'Loki', 'CI/CD'],
  },
  {
    company: 'Fresh Prep',
    role: 'Fullstack Developer',
    dates: 'Sep 2023 – Jan 2025',
    location: 'Vancouver, BC',
    desc: 'Spearheaded features using Vue.js and Ruby on Rails, driving a 10% surge in user engagement. Integrated Contentful CMS to streamline content management. Implemented UI testing with Mocha, Chai, and Puppeteer.',
    chips: ['Vue.js', 'Ruby on Rails', 'Docker', 'GCP', 'PostgreSQL', 'Mocha'],
  },
  {
    company: 'DivTech',
    role: 'Frontend Engineer · Contract',
    dates: 'Feb 2024 – Jun 2024',
    location: 'Vancouver, BC',
    desc: 'Built frontend infrastructure with Next.js App Router and server components for dynamic routing and SSR. Implemented custom auth middleware securing protected routes across the application.',
    chips: ['Next.js', 'TypeScript', 'TailwindCSS', 'ShadcnUI', 'PostgreSQL', 'AWS'],
  },
  {
    company: 'BC Liquor',
    role: 'Java Developer · Co-op',
    dates: 'May 2022 – Dec 2022',
    location: 'Vancouver, BC',
    desc: 'Developed a web app prototype replacing an expired WebEx subscription using Spring Boot. Monitored and debugged Java ETLs and maintained Oracle databases ensuring stable business operations.',
    chips: ['Spring Boot', 'Java', 'JavaScript', 'Oracle DB', 'ETLs'],
  },
]

export default function Experience() {
  return (
    <section className="section-alt" id="experience">
      <FadeUp><p className="eyebrow">Experience</p></FadeUp>
      <FadeUp delay={0.05}>
        <Parallax distance={30}>
          <SectionTitle>Where I&apos;ve <span className="gradient-text">worked.</span></SectionTitle>
        </Parallax>
      </FadeUp>
      <div className="exp-list">
        {EXPERIENCE.map((e, i) => (
          <FadeUp key={e.company} delay={i * 0.07}>
            <div className="exp-row">
              <div>
                <div className="exp-top">
                  <span className="exp-company">{e.company}</span>
                  <span className="exp-role">{e.role}</span>
                </div>
                <p className="exp-desc">{e.desc}</p>
                <div className="chips">
                  {e.chips.map(c => <span key={c} className="chip">{c}</span>)}
                </div>
              </div>
              <div className="exp-right">
                <span className="exp-dates">{e.dates}</span>
                <span className="exp-loc">{e.location}</span>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
