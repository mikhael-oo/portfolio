// app/page.tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import About from '@/components/about/About'
import Projects from '@/components/projects/Projects'
import Experience from '@/components/experience/Experience'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Experience />
    </main>
  )
}
