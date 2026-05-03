export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return {
    from: (table: string) => ({
      select: (columns: string, options?: any) => ({
        eq: (col: string, val: any) => ({
          single: async () => {
            const query = `${url}/rest/v1/${table}?select=${columns}&${col}=eq.${encodeURIComponent(val)}`;
            const res = await fetch(query, {
              headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            });
            if (!res.ok) return { data: null };
            const data = await res.json();
            return { data: Array.isArray(data) ? data[0] : data };
          },
          order: (col: string, opts?: { ascending?: boolean }) => ({
            range: async (from: number, to: number) => {
              const asc = opts?.ascending ?? true;
              const orderParam = asc ? `${col}.asc` : `${col}.desc`;
              const rangeHeader = `${from}-${to}`;
              const res = await fetch(
                `${url}/rest/v1/${table}?select=${columns}&order=${orderParam}`,
                {
                  headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    'Range': rangeHeader
                  },
                  cache: 'no-store'
                }
              );
              if (!res.ok) return { data: [], count: 0 };
              const data = await res.json();
              const contentRange = res.headers.get('content-range');
              const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
              return { data, count };
            }
          }),
          // Count
          selectWithCount: async () => {
            const res = await fetch(`${url}/rest/v1/${table}?select=${columns}`, {
              headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
              },
              cache: 'no-store'
            });
            const data = await res.json();
            const count = parseInt(res.headers.get('content-range')?.split('/')[1] || '0');
            return { data, count };
          }
        })
      })
    })
  };
}
