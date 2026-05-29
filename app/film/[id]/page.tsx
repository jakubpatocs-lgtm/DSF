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

const GOLD = '#E8C97E'
const MUTED = 'rgba(255,255,255,0.42)'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080808; color:#fff; font-family:'DM Sans',sans-serif; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(232,201,126,0.3); border-radius:2px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .director-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: rgba(232,201,126,0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(232,201,126,0.25);
    border-radius: 12px;
    color: #E8C97E;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
    margin-bottom: 24px;
  }
  .director-link:hover {
    background: rgba(232,201,126,0.16);
    border-color: rgba(232,201,126,0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(232,201,126,0.15);
  }
  .director-link .arrow {
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.25s;
  }
  .director-link:hover .arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .cast-card { transition: transform 0.3s ease; cursor: pointer; text-decoration: none; color: #fff; }
  .cast-card:hover { transform: translateY(-6px); }
  .cast-card:hover img { box-shadow: 0 16px 32px rgba(0,0,0,0.6); }

  .back-link { transition: all 0.2s; }
  .back-link:hover { color: #fff !important; }
`

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [film, recenzie] = await Promise.all([getFilm(id), getRecenzie(id)])

  const director = film.credits?.crew?.find((c: any) => c.job === 'Director')
  const cast = film.credits?.cast?.slice(0, 10) ?? []
  const trailer = film.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 48px', height: 62,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ fontFamily: "'Playfair Display'", fontSize: 21, fontWeight: 700, color: GOLD, letterSpacing: 6 }}>DSF</div>
        <a href="/" className="back-link" style={{ color: MUTED, textDecoration: 'none', fontSize: 13 }}>
          ← Späť na filmy
        </a>
      </nav>

      {/* HERO backdrop */}
      {film.backdrop_path && (
        <div style={{ position: 'relative', height: '55vh', overflow: 'hidden' }}>
          <img
            src={`https://image.tmdb.org/t/p/original${film.backdrop_path}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25) saturate(1.2)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #080808 0%, transparent 60%)' }} />
        </div>
      )}

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 48px 64px',
        marginTop: film.backdrop_path ? -140 : 48,
        position: 'relative',
      }}>

        {/* FILM HEADER */}
        <div style={{ display: 'flex', gap: 44, marginBottom: 52, animation: 'fadeUp 0.6s ease both' }}>
          {film.poster_path && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
                alt={film.title}
                style={{
                  width: 190, borderRadius: 14,
                  boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>
          )}

          <div style={{ paddingTop: 52 }}>
            <p style={{ color: GOLD, fontSize: 10, letterSpacing: 4, marginBottom: 12, textTransform: 'uppercase' }}>
              {film.release_date?.slice(0, 4)} · {film.genres?.map((g: any) => g.name).join(', ')}
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display'", fontSize: 'clamp(28px,4vw,50px)',
              fontWeight: 700, lineHeight: 1.08, marginBottom: 24, letterSpacing: -1,
            }}>
              {film.title}
            </h1>

            {/* Director — prominent clickable card */}
            {director && (
              <a href={`/reziser/${director.id}`} className="director-link">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                  background: 'rgba(232,201,126,0.15)', flexShrink: 0,
                  border: '1px solid rgba(232,201,126,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {director.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${director.profile_path}`}
                      alt={director.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 16 }}>🎬</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(232,201,126,0.6)', letterSpacing: 2, marginBottom: 2 }}>RÉŽIA</p>
                  <p style={{ fontWeight: 600 }}>{director.name}</p>
                </div>
                <span className="arrow" style={{ marginLeft: 'auto', fontSize: 16 }}>→</span>
              </a>
            )}

            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, fontSize: 14, maxWidth: 560 }}>
              {film.overview || 'Popis nie je dostupný.'}
            </p>
          </div>
        </div>

        {/* TRAILER */}
        {trailer && (
          <div style={{ marginBottom: 56 }}>
            <p style={{ color: GOLD, fontSize: 10, letterSpacing: 4, marginBottom: 20, textTransform: 'uppercase' }}>Trailer</p>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                style={{ width: '100%', height: 420, border: 'none', display: 'block' }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* CAST */}
        {cast.length > 0 && (
          <div style={{ marginBottom: 56 }}>
            <p style={{ color: GOLD, fontSize: 10, letterSpacing: 4, marginBottom: 10, textTransform: 'uppercase' }}>Obsadenie</p>
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Herci</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 20,
            }}>
              {cast.map((herec: any, i: number) => (
                <div
                  key={herec.id}
                  className="cast-card"
                  style={{
                    textAlign: 'center',
                    animation: `fadeUp 0.5s ease both`,
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  {herec.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${herec.profile_path}`}
                      alt={herec.name}
                      style={{
                        width: 80, height: 80, borderRadius: '50%',
                        objectFit: 'cover', display: 'block', margin: '0 auto',
                        border: '2px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.3s',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '2px solid rgba(255,255,255,0.08)',
                      margin: '0 auto',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>👤</div>
                  )}
                  <p style={{ fontSize: 11, fontWeight: '600', marginTop: 10, lineHeight: 1.3 }}>{herec.name}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 3, lineHeight: 1.3 }}>{herec.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIVIDER */}
        <div style={{
          height: 1, marginBottom: 48,
          background: 'linear-gradient(to right, rgba(232,201,126,0.3), transparent)',
        }} />

        {/* RECENZIE */}
        <div>
          <p style={{ color: GOLD, fontSize: 10, letterSpacing: 4, marginBottom: 10, textTransform: 'uppercase' }}>Komunita</p>
          <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Recenzie</h2>
          {recenzie.length === 0 ? (
            <p style={{ color: MUTED }}>Zatiaľ žiadne recenzie. Buď prvý!</p>
          ) : (
            recenzie.map((r: any, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '22px 24px',
                marginBottom: 14,
                display: 'flex', gap: 20,
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.75, fontSize: 14 }}>{r.recenzia}</p>
                  <p style={{ color: MUTED, fontSize: 11, marginTop: 10 }}>
                    {new Date(r.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div style={{
                  background: GOLD, color: '#000',
                  fontWeight: 700, fontSize: 22,
                  width: 56, height: 56, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontFamily: "'Playfair Display'",
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