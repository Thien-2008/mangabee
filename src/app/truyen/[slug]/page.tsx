export const dynamic = 'force-dynamic'

export default function TestPage({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 40, background: '#111', color: '#0f0', minHeight: '100vh' }}>
      <h1>✅ Route OK</h1>
      <p>Slug: <strong>{params.slug}</strong></p>
    </div>
  )
}
