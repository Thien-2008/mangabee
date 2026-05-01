import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: comics } = await supabase
    .from('comics')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white p-4">
      <h1 className="text-3xl font-bold text-[#F5A623] text-center mb-6">
        🐝 Mangabee
      </h1>
      
      {(!comics || comics.length === 0) ? (
        <div className="text-center text-gray-400 mt-10">
          <p className="text-xl mb-4">👋 Chào mừng đến với Mangabee!</p>
          <p className="text-sm">
            Hãy chạy <code className="bg-gray-800 px-2 py-1 rounded">python sync_data.py</code> trên Termux để cập nhật truyện.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#F5A623]">📖 Mới cập nhật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comics.map((comic: any) => (
              <Link
                key={comic.id}
                href={`/truyen/${comic.slug}`}
                className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <div className="aspect-[3/4] bg-gray-800 flex items-center justify-center">
                  {comic.cover_url ? (
                    <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📚</span>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="text-sm font-medium truncate">{comic.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
