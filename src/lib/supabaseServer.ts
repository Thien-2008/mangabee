// Hàm helper gọi Supabase REST API trực tiếp (dùng fetch)
// Trả về object mô phỏng cách gọi của supabase-js để dễ dùng

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function restGet(path: string, headers?: Record<string, string>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) return { data: null, count: 0 };
  const data = await res.json();
  const contentRange = res.headers.get('content-range');
  const count = contentRange ? parseInt(contentRange.split('/')[1], 10) : 0;
  return { data, count };
}

// Hàm tạo object query gần giống supabase-js
export function createSupabaseServer() {
  const baseUrl = `${SUPABASE_URL}`;

  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        // Lấy 1 dòng với điều kiện eq
        eq: (col: string, val: any) => ({
          single: async () => {
            const res = await restGet(
              `${table}?select=${columns}&${col}=eq.${encodeURIComponent(val)}`
            );
            return { data: Array.isArray(res.data) ? res.data[0] : res.data };
          },
          // Cho phép gọi order sau eq? (ít dùng)
        }),
        // Sắp xếp và lấy range
        order: (col: string, opts?: { ascending?: boolean }) => ({
          range: async (from: number, to: number) => {
            const asc = opts?.ascending ?? true;
            const orderParam = asc ? `${col}.asc` : `${col}.desc`;
            const rangeHeader = `${from}-${to}`;
            const res = await restGet(
              `${table}?select=${columns}&order=${orderParam}`,
              {
                'Range': rangeHeader,
                'Prefer': 'count=exact',
              }
            );
            return { data: res.data ?? [], count: res.count };
          },
          // Lấy toàn bộ (không range) – dùng cho trang chapter
          all: async () => {
            const res = await restGet(
              `${table}?select=${columns}&order=${col}.${opts?.ascending ?? true ? 'asc' : 'desc'}`
            );
            return { data: res.data ?? [], count: res.count };
          },
        }),
        // Lấy tất cả dòng (không phân trang) – dùng cho danh sách chapter
        all: async () => {
          const res = await restGet(`${table}?select=${columns}`);
          return { data: res.data ?? [], count: res.count };
        },
      }),
    }),
  };
}
