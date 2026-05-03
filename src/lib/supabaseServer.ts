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

// Hỗ trợ nhiều eq bằng cách tích lũy điều kiện
class QueryBuilder {
  private table: string;
  private columns: string;
  private filters: string[] = [];
  private orderStr: string | null = null;

  constructor(table: string, columns: string) {
    this.table = table;
    this.columns = columns;
  }

  eq(col: string, val: any): QueryBuilder {
    this.filters.push(`${col}=eq.${encodeURIComponent(val)}`);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): QueryBuilder {
    const asc = opts?.ascending ?? true;
    this.orderStr = `${col}.${asc ? 'asc' : 'desc'}`;
    return this;
  }

  async single(): Promise<{ data: any }> {
    const filterStr = this.filters.length > 0 ? `&${this.filters.join('&')}` : '';
    const res = await restGet(`${this.table}?select=${this.columns}${filterStr}`);
    return { data: Array.isArray(res.data) ? res.data[0] : res.data };
  }

  async range(from: number, to: number): Promise<{ data: any[]; count: number }> {
    const filterStr = this.filters.length > 0 ? `&${this.filters.join('&')}` : '';
    const orderStr = this.orderStr ? `&order=${this.orderStr}` : '';
    const rangeHeader = `${from}-${to}`;
    const res = await restGet(`${this.table}?select=${this.columns}${filterStr}${orderStr}`, {
      'Range': rangeHeader,
      'Prefer': 'count=exact',
    });
    return { data: res.data ?? [], count: res.count };
  }

  async all(): Promise<{ data: any[]; count: number }> {
    const filterStr = this.filters.length > 0 ? `&${this.filters.join('&')}` : '';
    const orderStr = this.orderStr ? `&order=${this.orderStr}` : '';
    const res = await restGet(`${this.table}?select=${this.columns}${filterStr}${orderStr}`);
    return { data: res.data ?? [], count: res.count };
  }
}

export function createSupabaseServer() {
  return {
    from: (table: string) => ({
      select: (columns: string) => new QueryBuilder(table, columns),
    }),
  };
}
