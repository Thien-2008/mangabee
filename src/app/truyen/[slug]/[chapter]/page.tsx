import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComic, getChapter, getAdjacentChapters } from '@/lib/supabaseServer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string; chapter: string } }): Promise<Metadata> {
  const { slug, chapter } = params
  const num = parseChapterNum(chapter)
  const comic = await getComic(slug)
  return { title: comic ? `${comic.title} – Chương ${num}` : 'Đọc truyện' }
}

function parseChapterNum(str: string): number {
  const match = str.replace('chuong-', '').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 1
}

export default async function ChapterPage({ params }: { params: { slug: string; chapter: string } }) {
  const { slug, chapter: chapterStr } = params
  const num = parseChapterNum(chapterStr)
  const [comic, chap, adjacent] = await Promise.all([getComic(slug), getChapter(slug, num), getAdjacentChapters(slug, num)])
  if (!comic) notFound()

  const images: string[] = Array.isArray(chap?.images) ? chap.images : []
  const hasImages = images.length > 0
  const { prev, next, all } = adjacent

  // Helper button style
  const btnStyle = (active: boolean, primary?: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: '1px solid #272523', cursor: active ? 'pointer' : 'not-allowed',
    background: primary ? 'var(--accent)' : active ? '#1c1c1f' : '#111',
    color: primary ? '#000' : active ? '#f0ece4' : '#3a3835',
    transition: 'all .15s ease', whiteSpace: 'nowrap', textDecoration: 'none'
  })

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      {/* Top Toolbar */}
      <div style={{ background: 'rgba(13,13,13,.97)', borderBottom: '1px solid #1e1e20', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href={`/truyen/${slug}`} style={{ ...btnStyle(true), color: 'var(--accent)', borderColor: 'rgba(245,158,11,.3)' }}>← Truyện</Link>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#6b6965', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comic.title} · Ch.{num}</span>
          {all.length > 1 && (
            <select defaultValue={num} onChange={e => { window.location.href = `/truyen/${slug}/chuong-${e.target.value}` }} style={{ background: '#1c1c1f', color: '#f0ece4', border: '1px solid #272523', borderRadius: 8, padding: '7px 10px', fontSize: 13, cursor: 'pointer', maxWidth: 160 }}>
              {[...all].reverse().map(n => <option key={n} value={n}>Chương {n}</option>)}
            </select>
          )}
          {prev !== null ? <Link href={`/truyen/${slug}/chuong-${prev}`} style={btnStyle(true)}>‹ Trước</Link> : <span style={btnStyle(false)}>‹ Trước</span>}
          {next !== null ? <Link href={`/truyen/${slug}/chuong-${next}`} style={btnStyle(true, true)}>Sau ›</Link> : <span style={btnStyle(false)}>Sau ›</span>}
        </div>
      </div>

      {/* Images */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {!hasImages ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, padding: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>⏳</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Spectral, serif', fontSize: 22, fontWeight: 600, color: '#f0ece4', marginBottom: 8 }}>Nội dung đang được tải về...</p>
              <p style={{ color: '#6b6965', fontSize: 14 }}>Chương {num} sẽ sớm được cập nhật. Vui lòng quay lại sau nhé!</p>
            </div>
            <Link href={`/truyen/${slug}`} style={{ marginTop: 8, background: 'var(--accent)', color: '#000', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>← Về trang truyện</Link>
          </div>
        ) : (
          <>
            {images.map((url, i) => (
              <div key={i} style={{ lineHeight: 0 }}>
                <img src={url} alt={`Trang ${i + 1}`} loading={i < 3 ? 'eager' : 'lazy'} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom Toolbar */}
      {hasImages && (
        <div style={{ background: 'rgba(13,13,13,.97)', borderTop: '1px solid #1e1e20', padding: '10px 16px', marginTop: 20 }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/truyen/${slug}`} style={{ ...btnStyle(true), color: 'var(--accent)', borderColor: 'rgba(245,158,11,.3)' }}>← Truyện</Link>
            <span style={{ flex: 1 }}></span>
            {prev !== null ? <Link href={`/truyen/${slug}/chuong-${prev}`} style={btnStyle(true)}>‹ Trước</Link> : <span style={btnStyle(false)}>‹ Trước</span>}
            {next !== null ? <Link href={`/truyen/${slug}/chuong-${next}`} style={btnStyle(true, true)}>Sau ›</Link> : <span style={btnStyle(false)}>Sau ›</span>}
          </div>
        </div>
      )}

      {/* Scroll to top */}
      {hasImages && (
        <div style={{ textAlign: 'center', padding: '24px 0 40px' }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'var(--bg3)', border: '1px solid #272523', color: '#9a9390', padding: '8px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>↑ Lên đầu trang</button>
        </div>
      )}
    </div>
  )
}
