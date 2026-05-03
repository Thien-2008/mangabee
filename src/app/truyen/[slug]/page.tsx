import Link from 'next/link';
import { supabase } from '@/lib/supabaseServer';

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const { data: comic, error } = await supabase
    .from('comics')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error) {
    console.error('[ComicDetail] Supabase error:', error.message);
  }

  if (!comic) {
    return <div style={{ color: '#F5A623', textAlign: 'center', marginTop: 40 }}>Không tìm thấy truyện.</div>;
  }

  const { data: chapters } = await supabase
    .from('chapters')
    .select('chapter_number, images')
    .eq('comic_slug', params.slug)
    .order('chapter_number', { ascending: false });

  const fixImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `https://goctruyentranhvui23.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: '0 0 200px', background: '#1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          {comic.cover_url ? (
            <img src={fixImageUrl(comic.cover_url)!} alt={comic.title} style={{ width: '100%', display: 'block' }} />
          ) : (
            <div style={{ aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📚</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#F5A623', margin: 0 }}>{comic.title}</h1>
          {comic.alternate_title && <p style={{ color: '#aaa' }}>Tên khác: {comic.alternate_title}</p>}
          {comic.author && <p>Tác giả: {comic.author}</p>}
          {comic.status && <p>Trạng thái: <span style={{ color: '#F5A623' }}>{comic.status}</span></p>}
          {comic.description && (
            <div style={{ marginTop: 12, background: '#1a1a1a', padding: 12, borderRadius: 8 }}>
              <h3 style={{ color: '#F5A623', margin: '0 0 8px' }}>Giới thiệu</h3>
              <p style={{ lineHeight: 1.6 }}>{comic.description}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ color: '#F5A623', borderBottom: '1px solid #333', paddingBottom: 8 }}>Danh sách chương</h2>
        {chapters && chapters.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginTop: 12 }}>
            {chapters.map((ch: any) => (
              <Link
                key={ch.chapter_number}
                href={`/truyen/${params.slug}/${ch.chapter_number}`}
                style={{
                  display: 'block',
                  background: ch.images && ch.images.length > 0 ? '#1a3a1a' : '#1a1a1a',
                  padding: '10px 14px',
                  borderRadius: 8,
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#EDEBE7',
                  fontSize: 14,
                  border: '1px solid #333'
                }}
              >
                Chương {ch.chapter_number}
                {ch.images && ch.images.length > 0 && (
                  <span style={{ display: 'block', fontSize: 10, color: '#4CAF50', marginTop: 4 }}>✅ {ch.images.length} ảnh</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: '#aaa' }}>Chưa có chương nào.</p>
        )}
      </div>
    </div>
  );
}
