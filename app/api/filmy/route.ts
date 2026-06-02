import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pages = await Promise.all(
      [1,2,3,4,5,6,7,8,9,10].map(page =>
        fetch(
          `https://api.themoviedb.org/3/discover/movie?with_origin_country=SK&sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&page=${page}`,
          { cache: 'no-store' }
        ).then(res => res.json())
      )
    )
    const filmy = pages.flatMap((p: any) => p.results ?? [])
    const sorted = filmy.sort((a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    return NextResponse.json({ filmy: sorted })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba pri načítaní filmov' }, { status: 500 })
  }
}