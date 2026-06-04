import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('ratings')
      .select('score, recenzia, created_at')
      .eq('film_id', id)
      .not('recenzia', 'is', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ recenzie: data ?? [] })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba pri načítaní recenzií' }, { status: 500 })
  }
}
