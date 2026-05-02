import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: comics, error } = await supabase
    .from('comics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0b] text-white p-4">
        <div className="max-w-7xl mx-auto text-center mt-20">
          <p className="text-red-500">Lỗi: {error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F5A623] text-center mb-6">
          🐝 Mangabee
        </h1>
        
        {!comics || comics.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-xl">Chưa có truyện nào.</p>
            <p className="text-sm mt-2">
              Chạy <code className="bg-gray-800 px-2 py-1 rounded">python push_to_supabase.py</code> trên Termux để cập nhật.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {comics.map((comic: any) => (
              <Link
                key={comic.id}
                href={`/truyen/${comic.slug}`}
                className="group bg-[#1a1a1a] rounded-xl overflow-hidden hover:ring-2 hover:ring-[#F5A623]/50 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="aspect-[3/4] bg-gray-800 flex items-center justify-center relative">
                  {comic.cover_url ? (
                    <img
                      src={comic.cover_url}
                      alt={comic.title || comic.slug}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-5xl text-gray-600">📚</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[#F5A623] transition-colors">
                    {comic.title || comic.slug.replace(/-/g, ' ')}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
