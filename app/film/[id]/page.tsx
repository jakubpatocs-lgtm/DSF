import pool from '../../../lib/db'
import Nav from '../../Nav'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

async function getFilm(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,videos&language=sk`,
    { cache: 'no-store' }
  )
  return res.json()
}

async function getRecenzie(id: string) {
  try {
    const result = await pool.query(`
      SELECT r.score, r.recenzia, r.created_at
      FROM ratings r
      WHERE r.film_id = $1 AND r.recenzia IS NOT NULL AND r.recenzia != ''
      ORDER BY r.created_at DESC
    `, [id])
    return result.rows ?? []
  } catch {
    return []
  }
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { background:#04040a; color:#f0ece4; font-family:'Outfit',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.25); border-radius:2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); filter:blur(4px); }
    to   { opacity:1; transform:translateY(0); filter:blur(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .director-link {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 12px 20px;
    background: rgba(201,168,76,0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 14px;
    color: #F0D080; text-decoration: none;
    font-size: 13px; font-weight: 500;
    transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
    margin-bottom: 24px;
  }
  .director-link:hover {
    background: rgba(201,168,76,0.16);
    border-color: rgba(201,168,76,0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(201,168,76,0.15);
  }

  .cast-card { transition: transform 0.3s ease; cursor: pointer; text-decoration: none; color: #f0ece4; }
  .cast-card:hover { transform: translateY(-6px); }

  .review-card {
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 22px 24px;
    margin-bottom: 12px;
    display: flex; gap: 20;
    transition: all 0.3s;
  }
  .review-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(201,168,76,0.15);
  }
`

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [film, recenzie] = await Promise.all([getFilm(id), getRecenzie(id)])

  const director = film.credits?.crew?.find((c: any) => c.job === 'Director')
  const cast = film.credits?.cast?.slice(0, 10) ?? []
  const trailer = film.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')

  return (
    <div style={{ background: '#04040a', minHeight: '100vh', color: '#f0ece4' }}>
      <style>{css}</style>

      <Nav />

      {/* HERO */}
      {film.backdrop_path && (
        <div style={{ position: 'relative', height: '55vh', overflow: 'hidden' }}>
          <img
            src={`https://image.tmdb.org/t/p/original${film.backdrop_path}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(1.4)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.5) 60%, rgba(4,4,10,0.2) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,10,1) 0%, transparent 50%)' }} />
        </div>
      )}

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: 'clamp(16px,4vw,48px)',
        paddingBottom: 80,
        marginTop: film.backdrop_path ? -160 : 0,
        position: 'relative',
      }}>

        {/* FILM HEADER */}
        <div style={{ display: 'flex', gap: 'clamp(20px,4vw,44px)', marginBottom: 52, animation: 'fadeUp 0.6s ease both', flexWrap: 'wrap' }}>
          {film.poster_path && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
                alt={film.title}
                style={{
                  width: 'clamp(130px,15vw,190px)', borderRadius: 16,
                  boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>
          )}

          <div style={{ paddingTop: 'clamp(20px,5vw,52px)', flex: 1, minWidth: 0 }}>
            <p style={{ color: GOLD, fontSize: 9, letterSpacing: 4, marginBottom: 12, fontWeight: 500 }}>
              {film.release_date?.slice(0, 4)} · {film.genres?.map((g: any) => g.name).join(', ')}
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(24px,4vw,52px)',
              fontWeight: 600, lineHeight: 1.08, marginBottom: 24, letterSpacing: -0.5,
            }}>
              {film.title}
            </h1>

            {director && (
              <a href={`/reziser/${director.id}`} className="director-link">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                  background: 'rgba(201,168,76,0.1)', flexShrink: 0,
                  border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {director.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${director.profile_path}`} alt={director.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 16 }}>🎬</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 9, color: 'rgba(240,208,128,0.6)', letterSpacing: 2, marginBottom: 2 }}>RÉŽIA</p>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{director.name}</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 16, opacity: 0.6 }}>→</span>
              </a>
            )}

            <p style={{ color: 'rgba(240,236,228,0.65)', lineHeight: 1.85, fontSize: 14, maxWidth: 560, fontWeight: 300 }}>
              {film.overview || 'Popis nie je dostupný.'}
            </p>
          </div>
        </div>

        {/* TRAILER */}
        {trailer && (
          <div style={{ marginBottom: 56 }}>
            <p style={{ color: GOLD, fontSize: 9, letterSpacing: 4, marginBottom: 20, fontWeight: 500 }}>TRAILER</p>
            <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                style={{ width: '100%', height: 'clamp(220px,40vw,440px)', border: 'none', display: 'block' }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* CAST */}
        {cast.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <p style={{ color: GOLD, fontSize: 9, letterSpacing: 4, marginBottom: 10, fontWeight: 500 }}>OBSADENIE</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 28 }}>Herci</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 20 }}>
              {cast.map((herec: any, i: number) => (
                <div key={herec.id} className="cast-card" style={{ textAlign: 'center', animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 40}ms` }}>
                  {herec.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${herec.profile_path}`} alt={herec.name}
                      style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto', border: '2px solid rgba(255,255,255,0.08)' }}
                    />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>{herec.name}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 3, lineHeight: 1.3 }}>{herec.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIVIDER */}
        <div style={{ height: 1, marginBottom: 48, background: 'linear-gradient(to right, rgba(201,168,76,0.3), transparent)' }} />

        {/* RECENZIE */}
        <div>
          <p style={{ color: GOLD, fontSize: 9, letterSpacing: 4, marginBottom: 10, fontWeight: 500 }}>KOMUNITA</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 28 }}>Recenzie</h2>
          {recenzie.length === 0 ? (
            <p style={{ color: MUTED }}>Zatiaľ žiadne recenzie. Buď prvý!</p>
          ) : (
            recenzie.map((r: any, i: number) => (
              <div key={i} className="review-card" style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 60}ms` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'rgba(240,236,228,0.78)', lineHeight: 1.8, fontSize: 14, fontWeight: 300 }}>{r.recenzia}</p>
                  <p style={{ color: MUTED, fontSize: 11, marginTop: 10, letterSpacing: 0.5 }}>
                    {new Date(r.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                  color: '#000', fontWeight: 700, fontSize: 20,
                  width: 52, height: 52, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontFamily: "'Cormorant Garamond', serif",
                  boxShadow: '0 8px 24px rgba(201,168,76,0.25)',
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