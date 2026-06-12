// app/page.tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import Dissolve from '@/components/dissolve/Dissolve'
import About from '@/components/about/About'
import Projects from '@/components/projects/Projects'
import Experience from '@/components/experience/Experience'
import Contact from '@/components/contact/Contact'
import FieldClient from '@/components/field/FieldClient'

export default function Home() {
  return (
    <main>
      <FieldClient />
      <Nav />
      <Hero />
      <Dissolve />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </main>
  )
}
