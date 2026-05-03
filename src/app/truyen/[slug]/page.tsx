import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComic, getChapters, fixImageUrl } from '@/lib/supabaseServer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const comic = await getComic(params.slug)
  return { title: comic?.title ?? 'Không tìm thấy', description: comic?.description?.slice(0, 155) }
}

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const [comic, chapters] = await Promise.all([getComic(params.slug), getChapters(params.slug)])
  if (!comic) notFound()

  const cover = fixImageUrl(comic.cover_url)
  const readyChapters = chapters.filter((c: any) => c.fetched && Array.isArray(c.images) && c.images.length > 0)
  const allNums = readyChapters.map((c: any) => Number(c.chapter_number))
  const firstChap = allNums.length ? Math.min(...allNums) : null
  const latestChap = allNums.length ? Math.max(...allNums) : null
  const isComplete = comic.status?.includes('Hoàn')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.93)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontFamily: 'Spectral, serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>🐝 Mangabee</Link>
          <span style={{ color: 'var(--text3)', fontSize: 16 }}>›</span>
          <span style={{ color: 'var(--text2)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{comic.title}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 80px' }}>
        <section className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'clamp(155px,20%,210px) 1fr', gap: 32 }}>
          <div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,.7)', aspectRatio: '3/4', background: 'var(--bg3)' }}>
              {cover ? <img src={cover} alt={comic.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--text3)' }}>📖</div>}
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {firstChap !== null && <Link href={`/truyen/${params.slug}/chuong-${firstChap}`} style={{ display: 'block', textAlign: 'center', background: 'var(--accent)', color: '#000', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>▶ Đọc từ đầu</Link>}
              {latestChap !== null && latestChap !== firstChap && <Link href={`/truyen/${params.slug}/chuong-${latestChap}`} style={{ display: 'block', textAlign: 'center', background: 'var(--bg3)', color: 'var(--text)', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)' }}>⚡ Chương mới nhất</Link>}
              {allNums.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '10px', border: '1px dashed var(--border)', borderRadius: 8 }}>Chưa có chương nào</div>}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Spectral, serif', fontSize: 'clamp(20px,3.5vw,32px)', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.5px' }}>{comic.title}</h1>
            {comic.alternate_title && <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>{comic.alternate_title}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {comic.author && <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: 'var(--text3)', marginRight: 6 }}>Tác giả:</span><span style={{ color: 'var(--text)', fontWeight: 500 }}>{comic.author}</span></div>}
              {comic.status && <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: 'var(--text3)', marginRight: 6 }}>Trạng thái:</span><span style={{ color: isComplete ? 'var(--green)' : 'var(--accent)', fontWeight: 500 }}>{comic.status}</span></div>}
              {readyChapters.length > 0 && <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}><span style={{ color: 'var(--text3)', marginRight: 6 }}>Chương có sẵn:</span><span style={{ color: 'var(--text)', fontWeight: 500 }}>{readyChapters.length}</span></div>}
            </div>
            {comic.description && (
              <div style={{ marginTop: 22 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: '1px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>Nội dung</h2>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.75, borderLeft: '3px solid var(--accent)', paddingLeft: 16, fontFamily: 'Spectral, serif', fontStyle: 'italic' }}>{comic.description}</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Spectral, serif', fontSize: 22, fontWeight: 600 }}>Danh sách chương <span style={{ marginLeft: 10, fontSize: 14, color: 'var(--text3)', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>({chapters.length})</span></h2>
          </div>
          {chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--text3)' }}><p style={{ fontSize: 32, marginBottom: 12 }}>🕐</p><p>Chương đang được tải về...</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {chapters.map((chap: any) => {
                const hasImages = Array.isArray(chap.images) && chap.images.length > 0
                const num = Number(chap.chapter_number)
                return hasImages ? (
                  <Link key={chap.id} href={`/truyen/${params.slug}/chuong-${num}`} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .15s ease', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Chương {num}</span><span style={{ fontSize: 10, color: 'var(--accent)' }}>✓</span>
                  </Link>
                ) : (
                  <div key={chap.id} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.45 }}>
                    <span style={{ fontSize: 13 }}>Chương {num}</span><span style={{ fontSize: 10, color: 'var(--text3)' }}>Đang tải</span>
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
