import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComic, getChapters, fixImageUrl } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function ComicDetail({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  const [comic, chapters] = await Promise.all([getComic(slug), getChapters(slug)])
  if (!comic) notFound()

  const cover = fixImageUrl(comic.cover_url)
  const ready = chapters.filter(
    (c: any) => c.fetched && Array.isArray(c.images) && c.images.length > 0
  )
  const nums = ready.map((c: any) => Number(c.chapter_number))
  const firstChap = nums.length ? Math.min(...nums) : null
  const latestChap = nums.length ? Math.max(...nums) : null

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0f', color: '#f0ece4', fontFamily: 'sans-serif' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,13,15,.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #272523', padding: '0 20px',
        height: 56, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/" style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>🐝 Mangabee</Link>
        <span style={{ color: '#52504e' }}>›</span>
        <span style={{ color: '#9a9390', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {comic.title}
        </span>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'clamp(150px,20%,200px) 1fr', gap: 32 }}>

          {/* Cover */}
          <div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '2px solid #272523', aspectRatio: '3/4', background: '#1c1c1f' }}>
              {cover ? (
                <img src={cover} alt={comic.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📖</div>
              )}
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {firstChap !== null && (
                <Link href={`/truyen/${slug}/chuong-${firstChap}`} style={{
                  display: 'block', textAlign: 'center',
                  background: '#f59e0b', color: '#000',
                  padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
                }}>▶ Đọc từ đầu</Link>
              )}
              {latestChap !== null && latestChap !== firstChap && (
                <Link href={`/truyen/${slug}/chuong-${latestChap}`} style={{
                  display: 'block', textAlign: 'center',
                  background: '#1c1c1f', color: '#f0ece4',
                  padding: '10px 0', borderRadius: 8, fontSize: 13,
                  border: '1px solid #272523',
                }}>⚡ Mới nhất</Link>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 700, lineHeight: 1.3 }}>{comic.title}</h1>
            {comic.alternate_title && (
              <p style={{ color: '#52504e', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>{comic.alternate_title}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {comic.author && <Chip label="Tác giả" value={comic.author} />}
              {comic.status && <Chip label="Trạng thái" value={comic.status} />}
              <Chip label="Chương có sẵn" value={String(ready.length)} />
            </div>
            {comic.description && (
              <p style={{
                marginTop: 20, color: '#9a9390', fontSize: 14, lineHeight: 1.75,
                borderLeft: '3px solid #f59e0b', paddingLeft: 14,
              }}>{comic.description}</p>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            Danh sách chương <span style={{ color: '#52504e', fontSize: 14, fontWeight: 400 }}>({chapters.length})</span>
          </h2>
          {chapters.length === 0 ? (
            <p style={{ color: '#52504e', textAlign: 'center', padding: 40 }}>Chưa có chương nào.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
              {chapters.map((c: any) => {
                const has = Array.isArray(c.images) && c.images.length > 0
                const n = Number(c.chapter_number)
                return has ? (
                  <Link key={c.id} href={`/truyen/${slug}/chuong-${n}`}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: '#161618', border: '1px solid #272523',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: 13, cursor: 'pointer',
                    }}>
                      <span>Chương {n}</span>
                      <span style={{ color: '#f59e0b', fontSize: 11 }}>✓</span>
                    </div>
                  </Link>
                ) : (
                  <div key={c.id} style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: '#0f0f11', border: '1px dashed #1e1e20',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 13, opacity: 0.4,
                  }}>
                    <span>Chương {n}</span>
                    <span style={{ fontSize: 10, color: '#52504e' }}>Đang tải</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#1c1c1f', border: '1px solid #272523', borderRadius: 8, padding: '5px 12px', fontSize: 12 }}>
      <span style={{ color: '#52504e', marginRight: 6 }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
