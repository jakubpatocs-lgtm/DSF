import pool from '../lib/db'
import DSFClient from './DSFClient'

async function getFilmy() {
  const pages = await Promise.all(
    [1,2,3,4,5,6,7,8,9,10].map(page =>
      fetch(
        `https://api.themoviedb.org/3/discover/movie?with_origin_country=SK&sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&page=${page}&language=sk`,
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
    .filter((film, index, self) => index === self.findIndex(f => f.id === film.id))
}

async function getHodnotenia() {
  const result = await pool.query('SELECT film_id, score FROM ratings')
  return result.rows ?? []
}

async function getRecenzie() {
  const result = await pool.query(`
    SELECT r.film_id, f.title as film_title, r.score, r.recenzia
    FROM ratings r
    JOIN films f ON r.film_id = f.id
    WHERE r.recenzia IS NOT NULL AND r.recenzia != ''
    ORDER BY r.created_at DESC
    LIMIT 20
  `)
  return result.rows ?? []
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

  const filmySorted = filmy.sort((a, b) => {
    const countA = priemery[a.id]?.count ?? 0
    const countB = priemery[b.id]?.count ?? 0
    return countB - countA
  })

  return <DSFClient filmy={filmySorted} priemery={priemery} recenzie={recenzie} heroFilmy={heroFilmy} />
}