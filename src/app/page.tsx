import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function fixImageUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `https://goctruyentranhvui23.com${url}`
  return `https://goctruyentranhvui23.com/${url}`
}

export default async function Home() {
  const supabase = createSupabaseServer()

  const { data: comics, error } = await supabase
    .from('comics')
    .select('slug, title, cover_url, description')
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    return (
      <main style={{ background: '#0a0a0b', color: 'white', padding: 20 }}>
        <p style={{ color: 'red' }}>Lỗi tải dữ liệu: {error.message}</p>
      </main>
    )
  }

  if (!comics || comics.length === 0) {
    return (
      <main style={{ background: '#0a0a0b', color: 'white', padding: 20 }}>
        <p>Chưa có truyện nào.</p>
      </main>
    )
  }

  return (
    <main style={{
      background: '#0a0a0b',
      color: 'white',
      minHeight: '100vh',
      padding: '20px 16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#F5A623', textAlign: 'center', marginBottom: 24, fontSize: 28 }}>
        🐝 Mangabee
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 16
      }}>
        {comics.map((comic) => (
          <Link
            key={comic.slug}
            href={`/truyen/${comic.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: 12,
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{
                aspectRatio: '3/4',
                background: '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {comic.cover_url ? (
                  <img
                    src={fixImageUrl(comic.cover_url)!}
                    alt={comic.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <span style={{ fontSize: 40 }}>📚</span>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 500,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#EDEBE7'
                }}>
                  {comic.title || comic.slug.replace(/-/g, ' ')}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
