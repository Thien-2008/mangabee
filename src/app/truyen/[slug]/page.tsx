import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComic, getChapters, fixImageUrl } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug)
  const [comic, chapters] = await Promise.all([getComic(decodedSlug), getChapters(decodedSlug)])
  if (!comic) notFound()

  const cover = fixImageUrl(comic.cover_url)
  const readyChapters = chapters.filter((c: any) => c.fetched && Array.isArray(c.images) && c.images.length > 0)
  const allNums = readyChapters.map((c: any) => Number(c.chapter_number))
  const firstChap = allNums.length ? Math.min(...allNums) : null
  const latestChap = allNums.length ? Math.max(...allNums) : null
  const isComplete = comic.status?.includes('Hoàn')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.93)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #272523' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontFamily: 'Spectral, serif', fontSize: 20, fontWeight: 700, color: '#f59e0b', textDecoration: 'none' }}>🐝 Mangabee</Link>
          <span style={{ color: '#52504e', fontSize: 16 }}>›</span>
          <span style={{ color: '#9a9390', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{comic.title}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 80px' }}>
        <section className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'clamp(155px,20%,210px) 1fr', gap: 32 }}>
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #272523', boxShadow: '0 8px 40px rgba(0,0,0,.7)', aspectRatio: '3/4', background: '#1c1c1f' }}>
              {cover ? <img src={cover} alt={comic.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#52504e' }}>📖</div>}
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {firstChap !== null && <Link href={`/truyen/${encodeURIComponent(decodedSlug)}/chuong-${firstChap}`} style={{ display: 'block', textAlign: 'center', background: '#f59e0b', color: '#000', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>▶ Đọc từ đầu</Link>}
              {latestChap !== null && latestChap !== firstChap && <Link href={`/truyen/${encodeURIComponent(decodedSlug)}/chuong-${latestChap}`} style={{ display: 'block', textAlign: 'center', background: '#1c1c1f', color: '#f0ece4', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid #272523', textDecoration: 'none' }}>⚡ Chương mới nhất</Link>}
              {allNums.length === 0 && <div style={{ textAlign: 'center', color: '#52504e', fontSize: 12, padding: '10px', border: '1px dashed #272523', borderRadius: 8 }}>Chưa có chương nào</div>}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Spectral, serif', fontSize: 'clamp(20px,3.5vw,32px)', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.5px' }}>{comic.title}</h1>
            {comic.alternate_title && <p style={{ color: '#52504e', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>{comic.alternate_title}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {comic.author && <div style={{ background: '#1c1c1f', border: '1px solid #272523', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: '#52504e', marginRight: 6 }}>Tác giả:</span><span style={{ color: '#f0ece4', fontWeight: 500 }}>{comic.author}</span></div>}
              {comic.status && <div style={{ background: '#1c1c1f', border: '1px solid #272523', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: '#52504e', marginRight: 6 }}>Trạng thái:</span><span style={{ color: isComplete ? '#22c55e' : '#f59e0b', fontWeight: 500 }}>{comic.status}</span></div>}
              {readyChapters.length > 0 && <div style={{ background: '#1c1c1f', border: '1px solid #272523', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: '#52504e', marginRight: 6 }}>Chương có sẵn:</span><span style={{ color: '#f0ece4', fontWeight: 500 }}>{readyChapters.length}</span></div>}
            </div>
            {comic.description && (
              <div style={{ marginTop: 22 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1px', color: '#52504e', textTransform: 'uppercase', marginBottom: 10 }}>Nội dung</h2>
                <p style={{ color: '#9a9390', fontSize: 14, lineHeight: 1.75, borderLeft: '3px solid #f59e0b', paddingLeft: 16, fontFamily: 'Spectral, serif', fontStyle: 'italic' }}>{comic.description}</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Spectral, serif', fontSize: 22, fontWeight: 600 }}>Danh sách chương <span style={{ marginLeft: 10, fontSize: 14, color: '#52504e', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>({chapters.length})</span></h2>
          </div>
          {chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed #272523', borderRadius: 12, color: '#52504e' }}><p style={{ fontSize: 32, marginBottom: 12 }}>🕐</p><p>Chương đang được tải về...</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {chapters.map((chap: any) => {
                const hasImages = Array.isArray(chap.images) && chap.images.length > 0
                const num = Number(chap.chapter_number)
                return hasImages ? (
                  <Link key={chap.id} href={`/truyen/${encodeURIComponent(decodedSlug)}/chuong-${num}`} style={{ padding: '10px 14px', borderRadius: 8, background: '#161618', border: '1px solid #272523', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s ease', cursor: 'pointer', textDecoration: 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4' }}>Chương {num}</span><span style={{ fontSize: 10, color: '#f59e0b' }}>✓</span>
                  </Link>
                ) : (
                  <div key={chap.id} style={{ padding: '10px 14px', borderRadius: 8, background: '#1c1c1f', border: '1px solid #272523', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.45 }}>
                    <span style={{ fontSize: 13, color: '#f0ece4' }}>Chương {num}</span><span style={{ fontSize: 10, color: '#52504e' }}>Đang tải</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
