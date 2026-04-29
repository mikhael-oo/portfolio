// app/page.tsx
import Nav from '@/components/nav/Nav'

export default function Home() {
  return (
    <main>
      <Nav />
      <div style={{ height: '200vh', padding: '48px' }}>scroll test</div>
    </main>
  )
}
