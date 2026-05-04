import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getComic, getChapter, getAdjacentChapters } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

function parseNum(str: string): number {
  const m = str.replace('chuong-', '').match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 1
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapter: string }
}) {
  const slug = params.slug
  const num = parseNum(params.chapter)

  const [comic, chap, adj] = await Promise.all([
    getComic(slug),
    getChapter(slug, num),
    getAdjacentChapters(slug, num),
  ])

  if (!comic) notFound()

  const images: string[] = Array.isArray(chap?.images) ? chap.images : []
  const { prev, next, all } = adj

  const navStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: '1px solid #272523', whiteSpace: 'nowrap',
    background: active ? '#f59e0b' : '#1c1c1f',
    color: active ? '#000' : (active ? '#f0ece4' : '#52504e'),
    pointerEvents: active ? 'auto' : 'none',
  })

  const toolbar = (
    <div style={{
      background: 'rgba(10,10,12,.97)', borderBottom: '1px solid #1e1e20',
      padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Link href={`/truyen/${slug}`} style={{ ...navStyle(true), background: 'transparent', color: '#f59e0b', border: '1px solid rgba(245,158,11,.3)' }}>
          ← Truyện
        </Link>
        <span style={{ flex: 1, fontSize: 12, color: '#52504e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {comic.title} · Ch.{num}
        </span>
        {all.length > 1 && (
          <select defaultValue={num} onChange={e => { window.location.href = `/truyen/${slug}/chuong-${e.target.value}` }}
            style={{ background: '#1c1c1f', color: '#f0ece4', border: '1px solid #272523', borderRadius: 8, padding: '7px 10px', fontSize: 13, cursor: 'pointer' }}>
            {[...all].reverse().map(n => <option key={n} value={n}>Chương {n}</option>)}
          </select>
        )}
        {prev !== null
          ? <Link href={`/truyen/${slug}/chuong-${prev}`} style={{ ...navStyle(true), background: '#1c1c1f', color: '#f0ece4' }}>‹ Trước</Link>
          : <span style={navStyle(false)}>‹ Trước</span>}
        {next !== null
          ? <Link href={`/truyen/${slug}/chuong-${next}`} style={navStyle(true)}>Sau ›</Link>
          : <span style={navStyle(false)}>Sau ›</span>}
      </div>
    </div>
  )

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#f0ece4', fontFamily: 'sans-serif' }}>
      {toolbar}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {images.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 40 }}>
            <div style={{ fontSize: 48 }}>⏳</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Nội dung đang được tải về...</p>
            <p style={{ color: '#52504e', fontSize: 14 }}>Chương {num} sẽ sớm có. Quay lại sau nhé!</p>
            <Link href={`/truyen/${slug}`} style={{ background: '#f59e0b', color: '#000', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, marginTop: 8 }}>
              ← Về trang truyện
            </Link>
          </div>
        ) : (
          images.map((url, i) => (
            <div key={i} style={{ lineHeight: 0 }}>
              <img src={url} alt={`Trang ${i + 1}`} loading={i < 3 ? 'eager' : 'lazy'}
                style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          ))
        )}
      </div>
      {images.length > 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0 48px' }}>
          {next !== null
            ? <Link href={`/truyen/${slug}/chuong-${next}`} style={{ background: '#f59e0b', color: '#000', padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
                Chương tiếp theo →
              </Link>
            : <Link href={`/truyen/${slug}`} style={{ background: '#1c1c1f', color: '#f0ece4', padding: '12px 32px', borderRadius: 8, fontSize: 15, border: '1px solid #272523' }}>
                ← Về trang truyện
              </Link>
          }
        </div>
      )}
    </div>
  )
}
