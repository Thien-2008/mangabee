import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const { slug } = await Promise.resolve(params) // đảm bảo params được resolve
  const supabase = createSupabaseServer()

  const { data: comic, error } = await supabase
    .from('comics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !comic) {
    console.error(`[ComicDetail] Lỗi slug "${slug}":`, error?.message || 'không tìm thấy')
    notFound()
  }

  return (
    <main style={{ background: '#0a0a0b', color: 'white', minHeight: '100vh', padding: 20, fontFamily: 'Arial' }}>
      <Link href="/" style={{ color: '#F5A623', textDecoration: 'none' }}>← Quay lại</Link>
      <div style={{ marginTop: 20 }}>
        {comic.cover_url && (
          <img src={comic.cover_url.startsWith('http') ? comic.cover_url : `https://goctruyentranhvui23.com${comic.cover_url}`}
               alt={comic.title} style={{ width: '100%', maxWidth: 300, borderRadius: 12 }} />
        )}
        <h1 style={{ color: '#F5A623', fontSize: 24, marginTop: 16 }}>{comic.title || comic.slug}</h1>
        <p style={{ color: '#9A9AA6', lineHeight: 1.7, marginTop: 12 }}>
          {comic.description || 'Đang cập nhật...'}
        </p>
      </div>
    </main>
  )
}
