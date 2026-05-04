import Link from 'next/link'
import { getComic, getChapters, fixImageUrl } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const comic = await getComic(params.slug)

  if (!comic) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#f59e0b' }}>
        <h1>Không tìm thấy truyện</h1>
        <p>Slug: {params.slug}</p>
        <Link href="/">← Về trang chủ</Link>
      </div>
    )
  }

  const chapters = await getChapters(params.slug)
  const cover = fixImageUrl(comic.cover_url)
  const readyChapters = chapters.filter((c: any) => c.fetched && c.images?.length > 0)
  const latestChap = readyChapters.length > 0 ? readyChapters[0] : null
  const firstChap = readyChapters.length > 0 ? readyChapters[readyChapters.length - 1] : null

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', color: '#f0ece4', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#131315', padding: '12px 20px', borderBottom: '1px solid #272523', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: 18, fontWeight: 700 }}>🐝 Mangabee</Link>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
          <div style={{ width: 200, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            {cover ? (
              <img src={cover} alt={comic.title} style={{ width: '100%', display: 'block' }} />
            ) : (
              <div style={{ height: 280, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📖</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 250 }}>
            <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>{comic.title}</h1>
            {comic.alternate_title && <p style={{ color: '#888', fontStyle: 'italic' }}>{comic.alternate_title}</p>}
            <div style={{ display: 'flex', gap: 12, margin: '12px 0', flexWrap: 'wrap' }}>
              {comic.author && <span style={{ background: '#1a1a1a', padding: '4px 10px', borderRadius: 6, fontSize: 13 }}>✍️ {comic.author}</span>}
              {comic.status && <span style={{ background: '#1a1a1a', padding: '4px 10px', borderRadius: 6, fontSize: 13, color: '#f59e0b' }}>{comic.status}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {firstChap && (
                <Link href={`/truyen/${params.slug}/chuong-${firstChap.chapter_number}`}
                  style={{ background: '#f59e0b', color: '#000', padding: '8px 16px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  ▶ Đọc từ đầu
                </Link>
              )}
              {latestChap && latestChap.chapter_number !== firstChap?.chapter_number && (
                <Link href={`/truyen/${params.slug}/chuong-${latestChap.chapter_number}`}
                  style={{ background: '#1a1a1a', color: '#f59e0b', padding: '8px 16px', borderRadius: 6, textDecoration: 'none', border: '1px solid #333', fontSize: 14 }}>
                  ⚡ Mới nhất
                </Link>
              )}
            </div>
            {comic.description && (
              <div style={{ marginTop: 16, padding: 12, background: '#1a1a1a', borderRadius: 8, borderLeft: '3px solid #f59e0b' }}>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#ccc' }}>{comic.description}</p>
              </div>
            )}
          </div>
        </div>

        <h2 style={{ borderBottom: '1px solid #272523', paddingBottom: 8, marginBottom: 16 }}>📚 Danh sách chương ({chapters.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {chapters.map((ch: any) => {
            const hasImages = ch.images && ch.images.length > 0
            return hasImages ? (
              <Link key={ch.id} href={`/truyen/${params.slug}/chuong-${ch.chapter_number}`}
                style={{ background: '#1a2a1a', color: '#f0ece4', padding: '10px', borderRadius: 6, textAlign: 'center', textDecoration: 'none', fontSize: 13, border: '1px solid #2a3a2a' }}>
                Ch.{ch.chapter_number} <span style={{ fontSize: 10, color: '#4ade80' }}>✓</span>
              </Link>
            ) : (
              <div key={ch.id} style={{ background: '#1a1a1a', color: '#666', padding: '10px', borderRadius: 6, textAlign: 'center', fontSize: 13, border: '1px solid #222' }}>
                Ch.{ch.chapter_number} <span style={{ fontSize: 10 }}>⏳</span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
