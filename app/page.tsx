import { supabase } from '../lib/supabase'
import Search from './Search'

async function getFilmy() {
  const pages = await Promise.all(
    [1,2,3,4,5,6,7,8,9,10].map(page =>
      fetch(
        'https://api.themoviedb.org/3/discover/movie?with_origin_country=SK&sort_by=popularity.desc&api_key=' + process.env.TMDB_API_KEY + '&page=' + page,
        { cache: 'no-store' }
      ).then(res => res.json())
    )
  )
  const filmy = pages.flatMap(p => p.results ?? [])
  const filmyWithCredits = await Promise.all(
    filmy.map(async (film: any) => {
      const credits = await fetch(
        'https://api.themoviedb.org/3/movie/' + film.id + '/credits?api_key=' + process.env.TMDB_API_KEY,
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

  const priemery: { [key: number]: { avg: number, count: number } } = {}
  hodnotenia.forEach((h) => {
    if (!priemery[h.film_id]) priemery[h.film_id] = { avg: 0, count: 0 }
    priemery[h.film_id].avg += h.score
    priemery[h.film_id].count += 1
  })
  Object.keys(priemery).forEach((id) => {
    priemery[Number(id)].avg = priemery[Number(id)].avg / priemery[Number(id)].count
  })

  const featured = filmy[0]

  return (
    <div style={{background: '#0a0a0a', minHeight: '100vh', color: '#fff'}}>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)'
      }}>
        <div style={{fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#e8c97e'}}>
          DSF
        </div>
        <div style={{display: 'flex', gap: '32px', fontSize: '14px', letterSpacing: '2px'}}>
          <a href="/" style={{color: '#fff', textDecoration: 'none', opacity: 0.8}}>FILMY</a>
          <a href="/rebricek" style={{color: '#e8c97e', textDecoration: 'none', fontWeight: 'bold'}}>REBRICEK</a>
        </div>
      </nav>

      {featured && (
        <div style={{position: 'relative', height: '85vh', overflow: 'hidden'}}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(https://image.tmdb.org/t/p/original' + (featured.backdrop_path || featured.poster_path) + ')',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.4)'
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.95) 40%, transparent 100%)'
          }}/>
          <div style={{position: 'absolute', bottom: '80px', left: '48px', maxWidth: '500px'}}>
            <p style={{color: '#e8c97e', letterSpacing: '3px', fontSize: '12px', marginBottom: '16px'}}>
              ODPORUCANY FILM
            </p>
            <h1 style={{fontSize: '52px', fontWeight: 'bold', lineHeight: 1.1, marginBottom: '16px'}}>
              {featured.title}
            </h1>
            <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px'}}>
              {featured.overview?.slice(0, 200)}...
            </p>
            <span style={{color: '#e8c97e', fontSize: '14px'}}>
              {featured.release_date?.slice(0, 4)}
            </span>
          </div>
        </div>
      )}

      <div style={{padding: '48px'}}>
        <h2 style={{
          fontSize: '13px', letterSpacing: '4px', color: '#e8c97e',
          marginBottom: '32px', fontFamily: 'sans-serif'
        }}>
          SLOVENSKA KINEMATOGRAFIA
        </h2>
        <Search filmy={filmy} priemery={priemery} />
      </div>
    </div>
  )
}