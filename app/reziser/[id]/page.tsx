const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { background:#04040a; color:#f0ece4; font-family:'Outfit',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.25); border-radius:2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); filter:blur(4px); }
    to   { opacity:1; transform:translateY(0);    filter:blur(0); }
  }
  @keyframes lightSweep {
    0%   { transform:translateX(-120%) skewX(-20deg); opacity:0; }
    10%  { opacity:1; } 90%  { opacity:1; }
    100% { transform:translateX(220%) skewX(-20deg); opacity:0; }
  }
  @keyframes shimmerPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

  .back-link {
    color:${MUTED}; text-decoration:none; font-size:12px; letter-spacing:2px;
    transition:all 0.25s; display:inline-flex; align-items:center; gap:8px;
    padding:8px 16px; border-radius:100px;
    border:1px solid rgba(255,255,255,0.07);
    background:rgba(255,255,255,0.03); backdrop-filter:blur(20px);
  }
  .back-link:hover { color:#f0ece4; border-color:rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); }

  .wiki-btn {
    display:inline-flex; align-items:center; gap:8px;
    padding:10px 18px; border-radius:100px;
    background:rgba(201,168,76,0.08);
    backdrop-filter:blur(20px);
    border:1px solid rgba(201,168,76,0.22);
    color:${GOLD2}; text-decoration:none; font-size:12px;
    font-family:'Outfit',sans-serif; letter-spacing:1px; font-weight:500;
    transition:all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
    position:relative; overflow:hidden;
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .wiki-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
    transform:translateX(-100%);
  }
  .wiki-btn:hover {
    background:rgba(201,168,76,0.16); border-color:rgba(201,168,76,0.45);
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .wiki-btn:hover::before { animation:lightSweep 0.7s ease forwards; }

  .film-item {
    text-decoration:none; color:#f0ece4;
    transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    display:block;
  }
  .film-item:hover { transform:translateY(-12px); }
  .film-item:hover .fi-img {
    box-shadow:0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2);
  }
  .film-item:hover .fi-sweep::after { animation:lightSweep 0.8s ease forwards; }
  .fi-img {
    width:100%; border-radius:14px; display:block;
    border:1px solid rgba(255,255,255,0.06);
    transition:all 0.4s;
  }
  .fi-wrap { position:relative; overflow:hidden; border-radius:14px; }
  .fi-sweep {
    position:absolute; inset:0; pointer-events:none;
  }
  .fi-sweep::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.09) 50%,transparent 65%);
    transform:translateX(-100%);
  }

  .meta-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:100px;
    background:rgba(255,255,255,0.04);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,0.08);
    font-size:12px; color:${MUTED};
  }
  .meta-pill-gold {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:100px;
    background:rgba(201,168,76,0.08);
    backdrop-filter:blur(12px);
    border:1px solid rgba(201,168,76,0.2);
    font-size:12px; color:${GOLD};
  }
`

async function getReziser(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=movie_credits&language=sk`,
    { cache: 'no-store' }
  )
  return res.json()
}

async function getWikipedia(meno: string) {
  try {
    const skRes = await fetch(
      `https://sk.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(meno.replace(/ /g,'_'))}`,
      { cache: 'no-store' }
    )
    const sk = await skRes.json()
    if (sk.extract && sk.extract.length > 100) return { bio:sk.extract, foto:sk.thumbnail?.source??null, url:sk.content_urls?.desktop?.page??null, lang:'sk' }
    const enRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(meno.replace(/ /g,'_'))}`,
      { cache: 'no-store' }
    )
    const en = await enRes.json()
    if (en.extract) return { bio:en.extract, foto:en.thumbnail?.source??null, url:en.content_urls?.desktop?.page??null, lang:'en' }
    return null
  } catch { return null }
}

export default async function ReziserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [reziser, wiki] = await Promise.all([getReziser(id), getReziser(id).then(r => getWikipedia(r.name))])

  const filmy = (reziser.movie_credits?.crew?.filter((f:any) => f.department === 'Directing') ?? [])
    .filter((f:any, i:number, self:any[]) => i === self.findIndex((t:any) => t.id === f.id))
    .sort((a:any,b:any) => (b.release_date??'').localeCompare(a.release_date??''))

  const bio = wiki?.bio ?? reziser.biography ?? null
  const foto = reziser.profile_path ? `https://image.tmdb.org/t/p/w300${reziser.profile_path}` : wiki?.foto ?? null
  const age = reziser.birthday ? Math.floor((Date.now()-new Date(reziser.birthday).getTime())/(365.25*24*60*60*1000)) : null

  return (
    <div style={{ background:'#04040a', minHeight:'100vh', color:'#f0ece4' }}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={{
        position:'sticky', top:0, zIndex:200,
        padding:'0 48px', height:64,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:'rgba(4,4,10,0.75)',
        backdropFilter:'blur(40px) saturate(200%)',
        WebkitBackdropFilter:'blur(40px) saturate(200%)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        boxShadow:'0 1px 0 rgba(201,168,76,0.06)',
      }}>
        <a href="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:GOLD2, letterSpacing:8, textDecoration:'none', textShadow:`0 0 30px rgba(201,168,76,0.4)` }}>DSF</a>
        <a href="/" className="back-link">← SPÄŤ</a>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 48px 80px' }}>

        {/* HEADER */}
        <div style={{ display:'flex', gap:52, marginBottom:64, animation:'fadeUp 0.7s ease both' }}>

          {/* Photo */}
          <div style={{ flexShrink:0 }}>
            {foto ? (
              <div style={{ position:'relative' }}>
                <img src={foto} alt={reziser.name} style={{
                  width:210, height:295, objectFit:'cover',
                  borderRadius:20,
                  boxShadow:'0 48px 96px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)',
                  display:'block',
                }} />
                {/* Highlight */}
                <div style={{
                  position:'absolute', top:0, left:0, right:0,
                  height:'40%', borderRadius:'20px 20px 0 0',
                  background:'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)',
                  pointerEvents:'none',
                }} />
                {/* Gold line */}
                <div style={{
                  position:'absolute', bottom:-12, left:20, right:20,
                  height:3, borderRadius:2,
                  background:`linear-gradient(to right, ${GOLD}, transparent)`,
                  opacity:0.7,
                }} />
              </div>
            ) : (
              <div style={{
                width:210, height:295, borderRadius:20,
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:56, color:MUTED,
              }}>🎬</div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex:1, paddingTop:8 }}>
            <p style={{ color:GOLD, fontSize:9, letterSpacing:5, marginBottom:14, fontWeight:500 }}>REŽISÉR</p>
            <h1 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:'clamp(32px,4.5vw,58px)',
              fontWeight:600, lineHeight:1.0, marginBottom:24, letterSpacing:-1,
            }}>{reziser.name}</h1>

            {/* Pills */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:28 }}>
              {reziser.birthday && <span className="meta-pill">🎂 {reziser.birthday}{age ? ` · ${age} rokov` : ''}</span>}
              {reziser.place_of_birth && <span className="meta-pill">📍 {reziser.place_of_birth}</span>}
              {filmy.length > 0 && <span className="meta-pill-gold">🎬 {filmy.length} filmov</span>}
            </div>

            {/* Bio */}
            {bio ? (
              <>
                <p style={{
                  color:'rgba(240,236,228,0.68)', lineHeight:1.9,
                  fontSize:14, maxWidth:580, fontWeight:300, marginBottom:24,
                }}>
                  {bio.slice(0,700)}{bio.length>700?'...':''}
                </p>
                {wiki?.url && (
                  <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="wiki-btn">
                    <span>📖</span>
                    <span>ČÍTAJ NA WIKIPÉDII {wiki.lang === 'sk' ? '(SK)' : '(EN)'}</span>
                    <span style={{ opacity:0.5 }}>↗</span>
                  </a>
                )}
              </>
            ) : (
              <p style={{ color:MUTED, fontSize:14 }}>Biografia nie je dostupná.</p>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{ height:1, marginBottom:52, background:`linear-gradient(to right, rgba(201,168,76,0.3), transparent)` }} />

        {/* FILMOGRAFIA */}
        <div style={{ animation:'fadeUp 0.6s ease 0.15s both' }}>
          <p style={{ color:GOLD, fontSize:9, letterSpacing:5, marginBottom:10, fontWeight:500 }}>FILMOGRAFIA</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, marginBottom:40 }}>Réžia</h2>

          {filmy.length === 0 ? (
            <p style={{ color:MUTED }}>Žiadne filmy nenájdené.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))', gap:24 }}>
              {filmy.map((film:any, i:number) => (
                <a key={film.credit_id} href={`/film/${film.id}`} className="film-item"
                  style={{ animation:`fadeUp 0.5s ease ${Math.min(i,14)*45}ms both` }}
                >
                  <div className="fi-wrap">
                    {film.poster_path ? (
                      <img className="fi-img" src={`https://image.tmdb.org/t/p/w300${film.poster_path}`} alt={film.title} />
                    ) : (
                      <div style={{ width:'100%', paddingTop:'150%', background:'rgba(255,255,255,0.04)', borderRadius:14, border:'1px solid rgba(255,255,255,0.06)' }} />
                    )}
                    <div className="fi-sweep" />
                  </div>
                  <p style={{ fontSize:13, fontWeight:500, marginTop:10, lineHeight:1.3 }}>{film.title}</p>
                  <p style={{ color:MUTED, fontSize:11, marginTop:3 }}>{film.release_date?.slice(0,4)}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}