import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const PER_PAGE = 30

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Math.max(1, parseInt(searchParams.page || '1'))

  const supabase = createSupabaseServer()
  const from = (currentPage - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  // Lấy dữ liệu truyện
  const { data: comics, error: dataError } = await supabase
    .from('comics')
    .select('slug, title, cover_url')
    .order('created_at', { ascending: false })
    .range(from, to)

  // Đếm tổng số truyện bằng fetch trực tiếp (chính xác hơn)
  let totalComics = 0
  try {
    const countUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/comics?select=id&head=true&count=exact`
    const countRes = await fetch(countUrl, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    })
    // Lấy count từ header Content-Range
    const contentRange = countRes.headers.get('content-range')
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/)
      if (match) totalComics = parseInt(match[1], 10)
    }
  } catch (e) {
    console.error('Lỗi đếm truyện:', e)
  }

  const totalPages = Math.ceil(totalComics / PER_PAGE)

  // Debug
  const debugInfo = {
    currentPage,
    totalComics,
    totalPages,
    comicsLength: comics?.length || 0,
    dataError: dataError?.message || null
  }

  const fixImageUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `https://goctruyentranhvui23.com${url}`
    return `https://goctruyentranhvui23.com/${url}`
  }

  return (
    <main style={{ background: '#0a0a0b', color: 'white', minHeight: '100vh', padding: '20px 16px', fontFamily: 'Arial' }}>
      <div style={{ background: '#1a1a1a', border: '2px solid #F5A623', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#F5A623' }}>
        <strong>🐞 DEBUG INFO</strong>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      <h1 style={{ color: '#F5A623', textAlign: 'center', marginBottom: 24, fontSize: 28 }}>🐝 Mangabee</h1>

      {!comics || comics.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9A9AA6' }}>Chưa có truyện nào.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
          {comics.map((comic: any) => (
            <Link key={comic.slug} href={`/truyen/${comic.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#1a1a1a', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ aspectRatio: '3/4', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {comic.cover_url ? (
                    <img src={fixImageUrl(comic.cover_url)!} alt={comic.title || comic.slug} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <span style={{ fontSize: 40 }}>📚</span>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#EDEBE7' }}>
                    {comic.title || comic.slug.replace(/-/g, ' ')}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
          {currentPage > 1 ? (
            <Link href={`/?page=${currentPage - 1}`} style={btnStyle}>← Trước</Link>
          ) : (
            <span style={{ ...btnStyle, background: '#1a1a1a', color: '#555', cursor: 'not-allowed', opacity: 0.5 }}>← Trước</span>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage
            return (
              <Link key={page} href={`/?page=${page}`} style={{ ...btnStyle, background: isActive ? '#F5A623' : '#2a2a2a', color: isActive ? '#000' : '#EDEBE7', fontWeight: isActive ? 'bold' : 'normal', border: isActive ? '1px solid #F5A623' : '1px solid #3a3a3a', minWidth: 40, textAlign: 'center' }}>{page}</Link>
            )
          })}
          {currentPage < totalPages ? (
            <Link href={`/?page=${currentPage + 1}`} style={btnStyle}>Sau →</Link>
          ) : (
            <span style={{ ...btnStyle, background: '#1a1a1a', color: '#555', cursor: 'not-allowed', opacity: 0.5 }}>Sau →</span>
          )}
        </div>
      )}
    </main>
  )
}

const btnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '8px 14px',
  borderRadius: 6,
  background: '#2a2a2a',
  color: '#EDEBE7',
  fontSize: 14,
  fontWeight: 'bold',
  border: '1px solid #3a3a3a'
}
