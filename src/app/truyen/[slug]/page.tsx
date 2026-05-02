import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function fixImageUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  if (url.startsWith('/')) return `https://goctruyentranhvui23.com${url}`
  return `https://goctruyentranhvui23.com/${url}`
}

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServer()

  const { data: comic, error } = await supabase
    .from('comics')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !comic) {
    notFound()
  }

  return (
    <main style={{
      background: '#0a0a0b',
      color: 'white',
      minHeight: '100vh',
      padding: '20px 16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Nút quay lại */}
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: '#F5A623',
        textDecoration: 'none',
        marginBottom: 20,
        fontSize: 14
      }}>
        <span>← Quay lại</span>
      </Link>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Ảnh bìa + Thông tin */}
        <div style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap' as const
        }}>
          {/* Ảnh bìa */}
          <div style={{
            width: 200,
            flexShrink: 0,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#1a1a1a'
          }}>
            {comic.cover_url ? (
              <img
                src={fixImageUrl(comic.cover_url)!}
                alt={comic.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <div style={{
                aspectRatio: '3/4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60
              }}>
                📚
              </div>
            )}
          </div>

          {/* Thông tin */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#F5A623',
              marginBottom: 16
            }}>
              {comic.title}
            </h1>
            <div style={{
              background: '#1a1a1a',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16
            }}>
              <h2 style={{
                fontSize: 16,
                color: '#F5A623',
                marginBottom: 8
              }}>
                📖 Mô tả
              </h2>
              <p style={{
                fontSize: 14,
                color: '#9A9AA6',
                lineHeight: 1.7,
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {comic.description || 'Đang cập nhật...'}
              </p>
            </div>
          </div>
        </div>

        {/* Nút đọc truyện */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Link
            href={`/truyen/${comic.slug}/chapter-1`}
            style={{
              display: 'inline-block',
              background: '#F5A623',
              color: 'black',
              padding: '14px 40px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
            📖 Đọc từ đầu
          </Link>
        </div>
      </div>
    </main>
  )
}
