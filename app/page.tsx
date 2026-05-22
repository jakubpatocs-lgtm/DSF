import { createClient } from '@supabase/supabase-js'
import DSFClient from './DSFClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getFilmy() {
  const pages = await Promise.all(
    [1,2,3,4,5,6,7,8,9,10].map(page =>
      fetch(
        `https://api.themoviedb.org/3/discover/movie?with_origin_country=SK&sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&page=${page}`,
        { cache: 'no-store' }
      ).then(res => res.json())
    )
  )
  const filmy = pages.flatMap(p => p.results ?? [])
  const filmyWithCredits = await Promise.all(
    filmy.map(async (film: any) => {
      const credits = await fetch(
        `https://api.themoviedb.org/3/movie/${film.id}/credits?api_key=${process.env.TMDB_API_KEY}`,
        { cache: 'no-store' }
      ).then(res => res.json())
      const director = credits.crew?.find((c: any) => c.job === 'Director')
      return { ...film, director }
    })
  )
  return filmyWithCredits
}

async function getHodnotenia() {
  const { data } = await supabase.from('ratings').select('film_id, score')
  return data ?? []
}

export default async function Home() {
  const [filmy, hodnotenia] = await Promise.all([getFilmy(), getHodnotenia()])

  const priemery: { [key: number]: { avg: number; count: number } } = {}
  hodnotenia.forEach((h: any) => {
    if (!priemery[h.film_id]) priemery[h.film_id] = { avg: 0, count: 0 }
    priemery[h.film_id].avg += h.score
    priemery[h.film_id].count += 1
  })
  Object.keys(priemery).forEach(id => {
    const n = Number(id)
    priemery[n].avg = priemery[n].avg / priemery[n].count
  })

  return <DSFClient filmy={filmy} priemery={priemery} />
}
