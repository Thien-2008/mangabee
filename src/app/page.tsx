import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  const { data, error } = await supabase.from('comics').select('*').limit(1)
  
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white p-4">
      <h1 className="text-3xl font-bold text-[#F5A623] text-center mb-4">
        🐝 Mangabee
      </h1>
      <p className="text-center text-gray-400">
        {error ? 'Lỗi kết nối: ' + error.message : 'Kết nối Supabase thành công!'}
      </p>
    </main>
  )
}
