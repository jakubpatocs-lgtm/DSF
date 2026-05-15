import { supabase } from '../../lib/supabase'

async function getRebricek() {
  const { data } = await supabase
    .from('ratings')
    .select('film_id, film_title, score')
  
  if (!data) return []

  const grouped: { [key: number]: { title: string, scores: number[] } } = {}
  
  data.forEach((r) => {
    if (!grouped[r.film_id]) {
      grouped[r.film_id] = { title: r.film_title, scores: [] }
    }
    grouped[r.film_id].scores.push(r.score)
  })

  const rebricek = Object.entries(grouped).map(([id, val]) => ({
    film_id: id,
    title: val.title,
    average: val.scores.reduce((a, b) => a + b, 0) / val.scores.length,
    count: val.scores.length
  })).sort((a, b) => b.average - a.average)

  const withPosters = await Promise.all(
    rebricek.map(async (film) => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${film.film_id}?api_key=${process.env.TMDB_API_KEY}`,
          { cache: 'no-store' }
        )
        const d = await res.json()
        return { ...film, poster_path: d.poster_path }
      } catch {
        return { ...film, poster_path: null }
      }
    })
  )

  return withPosters
}export default async function Rebricek() {
  const filmy = await getRebricek()

  return (
    <div style={{background: '#0a0a0a', minHeight: '100vh', color: '#fff'}}>
      <nav style={{
        padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.9)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#e8c97e'}}>DSF</div>
        <a href="/" style={{color: '#fff', textDecoration: 'none', opacity: 0.7, fontSize: '14px'}}>← Späť na filmy</a>
      </nav>

      <div style={{padding: '48px', maxWidth: '900px', margin: '0 auto'}}>
        <p style={{color: '#e8c97e', letterSpacing: '4px', fontSize: '12px', marginBottom: '16px'}}>TOP HODNOTENIA</p>
        <h1 style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '48px'}}>Rebríček filmov</h1>

        {filmy.length === 0 && (
          <p style={{color: 'rgba(255,255,255,0.3)'}}>Zatiaľ žiadne hodnotenia.</p>
        )}

        {filmy.map((film, index) => (
          <a key={film.film_id} href={`/film/${film.film_id}`} style={{textDecoration: 'none', color: '#fff', display: 'block', marginBottom: '16px'}}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            }}>
              <div style={{width: '48px', textAlign: 'center', flexShrink: 0}}>
                {index === 0 ? <span style={{fontSize: '28px'}}>🥇</span>
                : index === 1 ? <span style={{fontSize: '28px'}}>🥈</span>
                : index === 2 ? <span style={{fontSize: '28px'}}>🥉</span>
                : <span style={{fontSize: '20px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)'}}>#{index + 1}</span>}
              </div>

              {film.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${film.poster_path}`}
                  alt={film.title}
                  style={{width: '60px', height: '90px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0}}
                />
              ) : (
                <div style={{width: '60px', height: '90px', background: '#1a1a1a', borderRadius: '6px', flexShrink: 0}}/>
              )}

              <div style={{flex: 1}}>
                <h2 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '4px'}}>{film.title}</h2>
                <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '13px'}}>{film.count} hodnotení</p>
              </div>

              <div style={{textAlign: 'right', flexShrink: 0}}>
                <div style={{fontSize: '32px', fontWeight: 'bold', color: '#e8c97e', lineHeight: 1}}>
                  {film.average.toFixed(1)}
                </div>
                <div style={{color: 'rgba(255,255,255,0.3)', fontSize: '12px'}}>/ 10</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}