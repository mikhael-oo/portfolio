// components/about/About.tsx
import FadeUp from '@/components/ui/FadeUp'

const STACK = [
  { name: 'React · TypeScript',         tag: 'Core',         core: true  },
  { name: 'Vue.js · Ruby on Rails',     tag: 'Core',         core: true  },
  { name: 'Next.js · Node.js',          tag: 'Core',         core: true  },
  { name: 'PostgreSQL · MongoDB',       tag: 'Data',         core: false },
  { name: 'Docker · GCP · AWS',         tag: 'Infra',        core: false },
  { name: 'Cypress · Jest · Storybook', tag: 'Testing',      core: false },
  { name: 'Three.js · Framer Motion',   tag: 'Creative',     core: false },
  { name: 'SPL · Jsonnet',              tag: 'Observability',core: false },
]

export default function About() {
  return (
    <section className="section-alt" id="about">
      <FadeUp><p className="eyebrow">About</p></FadeUp>
      <FadeUp delay={0.05}>
        <h2 className="section-title">Who I <span className="gradient-text">am.</span></h2>
      </FadeUp>
      <div className="about-layout">
        <FadeUp delay={0.1}>
          <div>
            <p className="about-body">
              Based in Vancouver, BC. Full-stack engineer with a knack for selecting
              the right tool for each problem — from data-heavy enterprise dashboards
              to polished consumer products.
            </p>
            <p className="about-body">
              Beyond code, I find inspiration in poetry, martial arts, and somatic
              movement. I believe the best software is made by people who notice things.
            </p>
            <p className="about-body">
              Currently at Splunk building monitoring infrastructure. Previously at
              FreshPrep, DivTech, and BC Liquor Distribution Branch.
            </p>
            <div className="stats">
              <div><span className="stat-val">4+</span><span className="stat-lbl">Years exp.</span></div>
              <div><span className="stat-val">4</span><span className="stat-lbl">Companies</span></div>
              <div><span className="stat-val">B.Sc.</span><span className="stat-lbl">SFU · 2024</span></div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.15}>
          <div className="stack-panel">
            <div className="stack-panel-head">
              <span>Stack</span><em>Technologies</em>
            </div>
            {STACK.map(item => (
              <div key={item.name} className="stack-item">
                <span className="stack-name">{item.name}</span>
                <span className={`stack-tag${item.core ? ' core' : ''}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
