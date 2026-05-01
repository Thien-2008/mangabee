import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const { table, method = 'POST', payload, query, prefer } = await req.json()
    
    let url = `${SUPABASE_URL}/rest/v1/${table}`
    if (query) url += `?${query}`
    
    const headers: Record<string, string> = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
    
    if (prefer) {
      headers['Prefer'] = prefer
    }
    
    const options: RequestInit = { method, headers }
    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload)
    }
    
    const res = await fetch(url, options)
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
