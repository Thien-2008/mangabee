import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';

export default async function ChapterReader({ params }: { params: { slug: string; chapter: string } }) {
  const supabase = createSupabaseServer();

  const { data: comic } = await supabase.from('comics').select('title').eq('slug', params.slug).single();
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('comic_slug', params.slug)
    .eq('chapter_number', parseFloat(params.chapter))
    .single();

  if (!comic || !chapter) {
    return <div style={{ color: '#F5A623', textAlign: 'center', marginTop: 40 }}>Không tìm thấy dữ liệu chương.</div>;
  }

  const images: string[] = chapter.images || [];

  const { data: allChapters } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('comic_slug', params.slug)
    .order('chapter_number', { ascending: true });

  const currentIndex = allChapters?.findIndex((ch: any) => ch.chapter_number === parseFloat(params.chapter)) ?? -1;
  const prevChapter = currentIndex > 0 ? allChapters![currentIndex - 1] : null;
  const nextChapter = currentIndex < (allChapters?.length || 0) - 1 ? allChapters![currentIndex + 1] : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Thanh điều hướng trên */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#1a1a1a', padding: '10px 16px', borderRadius: 8 }}>
        <Link href={`/truyen/${params.slug}`} style={{ color: '#F5A623', textDecoration: 'none', fontSize: 14 }}>← Về chi tiết</Link>
        <h2 style={{ color: '#F5A623', margin: 0, fontSize: 16 }}>{comic.title} - Chương {params.chapter}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {prevChapter && <Link href={`/truyen/${params.slug}/${prevChapter.chapter_number}`} style={{ padding: '6px 12px', background: '#2a2a2a', color: '#EDEBE7', textDecoration: 'none', borderRadius: 4, fontSize: 13 }}>← Trước</Link>}
          {nextChapter && <Link href={`/truyen/${params.slug}/${nextChapter.chapter_number}`} style={{ padding: '6px 12px', background: '#F5A623', color: '#000', textDecoration: 'none', borderRadius: 4, fontSize: 13, fontWeight: 'bold' }}>Sau →</Link>}
        </div>
      </div>

      {/* Ảnh */}
      {images.length > 0 ? (
        <div style={{ textAlign: 'center' }}>
          {images.map((img: string, idx: number) => (
            <img key={idx} src={img} alt={`Trang ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} loading="lazy" />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Chương này chưa có ảnh hoặc đang được tải về.</div>
      )}

      {/* Thanh điều hướng dưới */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, background: '#1a1a1a', padding: '10px 16px', borderRadius: 8 }}>
        <Link href={`/truyen/${params.slug}`} style={{ color: '#F5A623', textDecoration: 'none', fontSize: 14 }}>← Về chi tiết</Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {prevChapter && <Link href={`/truyen/${params.slug}/${prevChapter.chapter_number}`} style={{ padding: '8px 16px', background: '#2a2a2a', color: '#EDEBE7', textDecoration: 'none', borderRadius: 6, fontSize: 14 }}>← Trước</Link>}
          {nextChapter && <Link href={`/truyen/${params.slug}/${nextChapter.chapter_number}`} style={{ padding: '8px 16px', background: '#F5A623', color: '#000', textDecoration: 'none', borderRadius: 6, fontSize: 14, fontWeight: 'bold' }}>Sau →</Link>}
        </div>
      </div>
    </div>
  );
}
