import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PER_PAGE = 30;

export default async function Home({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Math.max(1, parseInt(searchParams.page || '1'));
  const from = (currentPage - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const supabase = createSupabaseServer();
  const { count } = await supabase.from('comics').select('*', { count: 'exact', head: true });
  const totalComics = count || 0;
  const totalPages = Math.ceil(totalComics / PER_PAGE);

  const { data: comics } = await supabase
    .from('comics')
    .select('slug, title, cover_url')
    .order('created_at', { ascending: false })
    .range(from, to);

  const fixImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://goctruyentranhvui23.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <>
      {/* Grid truyện */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {comics?.map((comic: any) => (
          <Link key={comic.slug} href={`/truyen/${comic.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ aspectRatio: '3/4', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  fontSize: 14, fontWeight: 500, margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {comic.title || comic.slug.replace(/-/g, ' ')}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8, flexWrap: 'wrap' }}>
          {currentPage > 1 && (
            <Link
              href={`/?page=${currentPage - 1}`}
              style={{
                padding: '8px 16px', background: '#2a2a2a', color: '#EDEBE7',
                borderRadius: 6, textDecoration: 'none', fontSize: 14
              }}
            >
              ← Trước
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={`/?page=${page}`}
              style={{
                padding: '8px 16px',
                background: page === currentPage ? '#F5A623' : '#2a2a2a',
                color: page === currentPage ? '#000' : '#EDEBE7',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: page === currentPage ? 'bold' : 'normal',
              }}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/?page=${currentPage + 1}`}
              style={{
                padding: '8px 16px', background: '#2a2a2a', color: '#EDEBE7',
                borderRadius: 6, textDecoration: 'none', fontSize: 14
              }}
            >
              Sau →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
