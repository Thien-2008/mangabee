const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Ưu tiên Service Role Key để bypass RLS, tránh 403
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function restGet(path: string, extra: Record<string, string> = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  console.log('[Supabase] GET', url)
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...extra,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error(`[Supabase] ${res.status} — ${path} — ${errorText}`)
    return { data: null, count: 0, error: `${res.status}: ${errorText}` }
  }
  const data = await res.json()
  const cr = res.headers.get('content-range') ?? ''
  const total = parseInt(cr.split('/')[1] ?? '0', 10)
  return { data, count: isNaN(total) ? 0 : total, error: null }
}

export function fixImageUrl(url?: string | null): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://goctruyentranhvui23.com${url}`
  return `https://goctruyentranhvui23.com/${url}`
}

export async function getComics(from: number, to: number) {
  const { data, count } = await restGet(`comics?select=slug,title,cover_url,status&order=created_at.desc`, { Range: `${from}-${to}`, Prefer: 'count=exact' })
  return { comics: (data as any[]) ?? [], count: count || 0 }
}

export async function getComic(slug: string) {
  const { data, error } = await restGet(`comics?select=*&slug=eq.${encodeURIComponent(slug)}`)
  if (error) {
    console.error('[getComic] Error:', error)
    return null
  }
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function getChapters(comicSlug: string) {
  const { data } = await restGet(`chapters?select=id,chapter_number,images,status,fetched&comic_slug=eq.${encodeURIComponent(comicSlug)}&order=chapter_number.desc`)
  return (data as any[]) ?? []
}

export async function getChapter(comicSlug: string, chapterNumber: number) {
  const { data } = await restGet(`chapters?select=*&comic_slug=eq.${encodeURIComponent(comicSlug)}&chapter_number=eq.${chapterNumber}`)
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

export async function getAdjacentChapters(comicSlug: string, chapterNumber: number) {
  const { data } = await restGet(`chapters?select=chapter_number&comic_slug=eq.${encodeURIComponent(comicSlug)}&fetched=eq.true&order=chapter_number.asc`)
  const nums = ((data as any[]) ?? []).map((c: any) => Number(c.chapter_number))
  const idx = nums.indexOf(chapterNumber)
  return { prev: idx > 0 ? nums[idx - 1] : null, next: idx < nums.length - 1 ? nums[idx + 1] : null, all: nums }
}
