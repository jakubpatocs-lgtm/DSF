import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Chýba id' }, { status: 400 })
    
    const [film, credits] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos&language=sk`,
        { cache: 'no-store' }
      ).then(res => res.json()),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.TMDB_API_KEY}`,
        { cache: 'no-store' }
      ).then(res => res.json()),
    ])
    const director = credits.crew?.find((c: any) => c.job === 'Director')
    const cast = credits.cast?.slice(0, 12) ?? []
    return NextResponse.json({ ...film, director, cast })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
