import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export function fixImageUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://goctruyentranhvui23.com${url}`
  return `https://goctruyentranhvui23.com/${url}`
}

export async function getComics(from: number, to: number) {
  const { data, count } = await supabase
    .from('comics')
    .select('slug, title, cover_url, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  return { comics: data ?? [], count: count ?? 0 }
}

export async function getComic(slug: string) {
  console.log('[getComic] Looking for slug:', slug)
  const { data, error } = await supabase
    .from('comics')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('[getComic] Supabase error:', error.message, error.code)
    return null
  }
  console.log('[getComic] Found:', data?.title)
  return data
}

export async function getChapters(comicSlug: string) {
  const { data } = await supabase
    .from('chapters')
    .select('id, chapter_number, images, status, fetched')
    .eq('comic_slug', comicSlug)
    .order('chapter_number', { ascending: false })
  return data ?? []
}

export async function getChapter(comicSlug: string, chapterNumber: number) {
  const { data } = await supabase
    .from('chapters')
    .select('*')
    .eq('comic_slug', comicSlug)
    .eq('chapter_number', chapterNumber)
    .single()
  return data
}

export async function getAdjacentChapters(comicSlug: string, chapterNumber: number) {
  const { data } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('comic_slug', comicSlug)
    .eq('fetched', true)
    .order('chapter_number', { ascending: true })
  
  const nums = (data ?? []).map((c: any) => Number(c.chapter_number))
  const idx = nums.indexOf(chapterNumber)
  return {
    prev: idx > 0 ? nums[idx - 1] : null,
    next: idx < nums.length - 1 ? nums[idx + 1] : null,
    all: nums
  }
}
