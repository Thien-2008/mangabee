import Link from 'next/link'
import { getComics, fixImageUrl } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 30

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { comics, count } = await getComics(from, to)
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,15,.93)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #272523' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🐝</span>
            <span style={{ fontFamily: 'Spectral, serif', fontSize: 24, fontWeight: 700, color: '#f59e0b', letterSpacing: '-0.5px' }}>Mangabee</span>
          </Link>
          <span style={{ background: '#1c1c1f', border: '1px solid #272523', color: '#9a9390', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{count.toLocaleString()} truyện</span>
        </div>
      </header>

      <div style={{ background: 'linear-gradient(160deg, #1a1206 0%, #0d0d0f 55%)', borderBottom: '1px solid #272523', padding: '44px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Spectral, serif', fontSize: 'clamp(26px,5vw,46px)', fontWeight: 300, letterSpacing: '-1px', lineHeight: 1.2 }}>
          Kho Truyện <em style={{ color: '#f59e0b', fontStyle: 'italic', fontWeight: 400 }}>Vô Tận</em>
        </h1>
        <p style={{ color: '#52504e', marginTop: 10, fontSize: 13, letterSpacing: '0.5px' }}>MANGA · MANHWA · MANHUA · CẬP NHẬT LIÊN TỤC</p>
      </div>

      <main style={{ flex: 1, maxWidth: 1300, margin: '0 auto', padding: '32px 16px 60px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 16 }}>
          {comics.map((comic: any, i: number) => (
            <Link key={comic.slug} href={`/truyen/${encodeURIComponent(comic.slug)}`} style={{ textDecoration: 'none' }}>
              <div className="fade-up" style={{ animationDelay: `${Math.min(i * 0.025, 0.4)}s`, borderRadius: 10, overflow: 'hidden', background: '#161618', border: '1px solid #272523', cursor: 'pointer', transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease' }}>
                <div style={{ position: 'relative', paddingTop: '142%', background: '#1c1c1f' }}>
                  {fixImageUrl(comic.cover_url) ? (
                    <img src={fixImageUrl(comic.cover_url)} alt={comic.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52504e', fontSize: 28 }}>📖</div>
                  )}
                  {comic.status && (
                    <span style={{ position: 'absolute', top: 7, left: 7, background: comic.status.includes('Hoàn') ? '#22c55e' : '#f59e0b', color: comic.status.includes('Hoàn') ? '#fff' : '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>{comic.status.includes('Hoàn') ? 'Xong' : 'Đang ra'}</span>
                  )}
                </div>
                <div style={{ padding: '9px 10px 11px' }}>
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: '#f0ece4', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comic.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {totalPages > 1 && (
          <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 52, flexWrap: 'wrap' }}>
            {page > 1 && <Link href={`/?page=${page - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 36, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid #272523', background: '#1c1c1f', color: '#9a9390', textDecoration: 'none' }}>← Trước</Link>}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/?page=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 36, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: p === page ? 700 : 500, border: '1px solid #272523', background: p === page ? '#f59e0b' : '#161618', color: p === page ? '#000' : '#f0ece4', textDecoration: 'none' }}>{p}</Link>
            ))}
            {page < totalPages && <Link href={`/?page=${page + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 36, padding: '0 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid #272523', background: '#1c1c1f', color: '#9a9390', textDecoration: 'none' }}>Sau →</Link>}
          </nav>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #272523', padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Spectral, serif', fontSize: 16, color: '#f59e0b', marginBottom: 4 }}>🐝 Mangabee</p>
        <p style={{ color: '#52504e', fontSize: 12 }}>Website đọc truyện tranh online · Dữ liệu tự động cập nhật</p>
      </footer>
    </div>
  )
}
