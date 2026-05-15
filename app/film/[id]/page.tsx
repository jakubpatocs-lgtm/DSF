import { supabase } from '../../../lib/supabase'

async function getFilm(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,videos&language=sk`,
    { cache: 'no-store' }
  )
  return res.json()
}

async function getRecenzie(id: string) {
  const { data } = await supabase
    .from('ratings')
    .select('score, recenzia, created_at')
    .eq('film_id', id)
    .not('recenzia', 'is', null)
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [film, recenzie] = await Promise.all([getFilm(id), getRecenzie(id)])

  const director = film.credits?.crew?.find((c: any) => c.job === 'Director')
  const cast = film.credits?.cast?.slice(0, 8) ?? []
  const trailer = film.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')

  return (
    <div style={{background: '#0a0a0a', minHeight: '100vh', color: '#fff'}}>
      <nav style={{
        padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(0,0,0,0.9)'
      }}>
        <div style={{fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#e8c97e'}}>DSF</div>
        <a href="/" style={{color: '#fff', textDecoration: 'none', opacity: 0.7, fontSize: '14px'}}>← Späť na filmy</a>
      </nav>

      {film.backdrop_path && (
        <div style={{position: 'relative', height: '60vh', overflow: 'hidden'}}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(https://image.tmdb.org/t/p/original${film.backdrop_path})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.3)'
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)'
          }}/>
        </div>
      )}

      <div style={{
        padding: '0 48px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
        marginTop: film.backdrop_path ? '-120px' : '48px',
        position: 'relative'
      }}>
        <div style={{display: 'flex', gap: '48px', marginBottom: '48px'}}>
          {film.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
              alt={film.title}
              style={{width: '200px', borderRadius: '8px', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.8)'}}
            />
          )}
          <div style={{paddingTop: '48px'}}>
            <p style={{color: '#e8c97e', letterSpacing: '3px', fontSize: '12px', marginBottom: '12px'}}>
              {film.release_date?.slice(0, 4)} · {film.genres?.map((g: any) => g.name).join(', ')}
            </p>
            <h1 style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '16px'}}>{film.title}</h1>
            {director && (
              <a href={`/reziser/${director.id}`} style={{color: '#e8c97e', fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '16px'}}>
                Réžia: {director.name}
              </a>
            )}
            <p style={{color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '15px', maxWidth: '600px'}}>
              {film.overview || 'Popis nie je dostupný.'}
            </p>
          </div>
        </div>

        {trailer && (
          <div style={{marginBottom: '48px'}}>
            <h2 style={{fontSize: '13px', letterSpacing: '4px', color: '#e8c97e', marginBottom: '24px'}}>TRAILER</h2>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              style={{width: '100%', height: '400px', borderRadius: '8px', border: 'none'}}
              allowFullScreen
            />
          </div>
        )}

        {cast.length > 0 && (
          <div style={{marginBottom: '48px'}}>
            <h2 style={{fontSize: '13px', letterSpacing: '4px', color: '#e8c97e', marginBottom: '24px'}}>HERCI</h2>
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              {cast.map((herec: any) => (
                <div key={herec.id} style={{textAlign: 'center', width: '100px'}}>
                  {herec.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${herec.profile_path}`}
                      alt={herec.name}
                      style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}}
                    />
                  ) : (
                    <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#1a1a1a', margin: '0 auto'}}/>
                  )}
                  <p style={{fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.8)'}}>{herec.name}</p>
                  <p style={{fontSize: '10px', color: 'rgba(255,255,255,0.4)'}}>{herec.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENZIE */}
        <div style={{marginTop: '48px'}}>
          <h2 style={{fontSize: '13px', letterSpacing: '4px', color: '#e8c97e', marginBottom: '24px'}}>RECENZIE</h2>
          {recenzie.length === 0 ? (
            <p style={{color: 'rgba(255,255,255,0.3)'}}>Zatiaľ žiadne recenzie.</p>
          ) : (
            recenzie.map((r: any, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                gap: '16px',
              }}>
                <div style={{flex: 1}}>
                  <p style={{color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '14px'}}>{r.recenzia}</p>
                  <p style={{color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '8px'}}>
                    {new Date(r.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div style={{
                  background: '#e8c97e',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {r.score}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}