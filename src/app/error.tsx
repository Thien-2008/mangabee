'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ background: '#0a0a0b', color: 'white', padding: 20 }}>
      <h2 style={{ color: '#F5A623' }}>Đã xảy ra lỗi</h2>
      <p style={{ color: '#ff4444' }}>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{ background: '#F5A623', color: 'black', padding: '10px 20px', border: 'none', borderRadius: 8 }}
      >
        Thử lại
      </button>
    </div>
  )
}
