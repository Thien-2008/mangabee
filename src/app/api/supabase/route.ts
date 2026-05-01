import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, method = 'POST', payload, query } = body
    
    let url = `${SUPABASE_URL}/rest/v1/${table}`
    if (query) url += `?${query}`
    
    const headers: Record<string, string> = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
    
    const options: RequestInit = {
      method,
      headers
    }
    
    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload)
    }
    
    const res = await fetch(url, options)
    const data = await res.json()
    
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
