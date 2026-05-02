import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Biến môi trường bị thiếu', 
      url_exists: !!supabaseUrl, 
      key_exists: !!supabaseKey 
    }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase.from('comics').select('*').limit(1)

  return NextResponse.json({
    url_exists: !!supabaseUrl,
    key_exists: !!supabaseKey,
    db_connect: !error,
    error_message: error?.message || null,
    sample_data: data
  })
}
