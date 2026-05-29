import { supabase } from '../lib/supabase'
import DSFClient from './DSFClient'

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
  return filmyWithCredits.sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
}

async function getHodnotenia() {
  const { data } = await supabase.from('ratings').select('film_id, score')
  return data ?? []
}

async function getRecenzie() {
  const { data } = await supabase
    .from('ratings')
    .select('film_id, film_title, score, recenzia')
    .not('recenzia', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

async function getHeroFilmy() {
  const heroIds = [1107054, 1341775, 1063197, 1406788, 1541444]
  const heroFilms = await Promise.all(
    heroIds.map(async (id) => {
      const [film, credits] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=sk`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.TMDB_API_KEY}`, { cache: 'no-store' }).then(r => r.json()),
      ])
      const director = credits.crew?.find((c: any) => c.job === 'Director')
      return { ...film, director }
    })
  )
  return heroFilms
}

export default async function Home() {
  const [filmy, hodnotenia, recenzie, heroFilmy] = await Promise.all([
    getFilmy(), getHodnotenia(), getRecenzie(), getHeroFilmy()
  ])

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
  return <DSFClient filmy={filmy} priemery={priemery} recenzie={recenzie} heroFilmy={heroFilmy} />
}
