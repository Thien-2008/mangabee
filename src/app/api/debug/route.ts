import { createSupabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'toi-la-tan-thu-co-cap-cao-nhat';

  const supabase = createSupabaseServer();

  // Kiểm tra kết nối
  const { data: allComics, error: listError } = await supabase
    .from('comics')
    .select('slug')
    .limit(5);

  // Tìm theo slug
  const { data: comic, error } = await supabase
    .from('comics')
    .select('*')
    .eq('slug', slug)
    .single();

  return NextResponse.json({
    slug_requested: slug,
    all_comics_sample: allComics,
    list_error: listError?.message || null,
    comic_found: comic ? true : false,
    comic_data: comic || null,
    error: error?.message || null,
  });
}
