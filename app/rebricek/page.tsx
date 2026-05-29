import { supabase } from '../../lib/supabase'
import Nav from '../Nav'

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
    from { opacity:0; transform:translateY(24px); filter:blur(3px); }
    to   { opacity:1; transform:translateY(0); filter:blur(0); }
  }
  @keyframes lightSweep {
    0%   { transform:translateX(-120%) skewX(-20deg); opacity:0; }
    10%  { opacity:1; } 90% { opacity:1; }
    100% { transform:translateX(220%) skewX(-20deg); opacity:0; }
  }
  @keyframes shimmerPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes numberReveal {
    from { opacity:0; transform:scale(0.6) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  .rank-row {
    display:flex; align-items:center; gap:24px;
    padding:20px 24px;
    background:rgba(255,255,255,0.025);
    backdrop-filter:blur(30px) saturate(180%);
    -webkit-backdrop-filter:blur(30px) saturate(180%);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:18px; text-decoration:none; color:#f0ece4;
    margin-bottom:12px;
    transition:all 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
    position:relative; overflow:hidden;
  }
  .rank-row::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
  }
  .rank-row::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
    transform:translateX(-100%);
  }
  .rank-row:hover {
    background:rgba(255,255,255,0.045);
    border-color:rgba(201,168,76,0.2);
    transform:translateX(6px);
    box-shadow:0 16px 48px rgba(0,0,0,0.4), -4px 0 0 rgba(201,168,76,0.4);
  }
  .rank-row:hover::after { animation:lightSweep 0.8s ease forwards; }

  .rank-row.gold-row {
    background:rgba(201,168,76,0.06);
    border-color:rgba(201,168,76,0.2);
    box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .rank-row.gold-row:hover {
    background:rgba(201,168,76,0.1);
    border-color:rgba(201,168,76,0.4);
    box-shadow:0 20px 56px rgba(0,0,0,0.5), -4px 0 0 ${GOLD2}, 0 0 40px rgba(201,168,76,0.1);
  }

  .score-display {
    font-family:'Cormorant Garamond', serif;
    font-size:36px; font-weight:700; line-height:1;
    transition:all 0.3s;
  }
  .rank-row:hover .score-display { transform:scale(1.08); }

  .bar-bg {
    height:3px; border-radius:2px;
    background:rgba(255,255,255,0.06); margin-top:6px;
    overflow:hidden; position:relative;
  }
  .bar-fill {
    height:100%; border-radius:2px;
    background:linear-gradient(to right, ${GOLD}, ${GOLD2});
    transition:width 1s cubic-bezier(0.25,0.46,0.45,0.94);
  }
`

async function getRebricek() {
  const { data } = await supabase.from('ratings').select('film_id, film_title, score')
  if (!data) return []

  const grouped: { [k:number]: { title:string; scores:number[] } } = {}
  data.forEach((r:any) => {
    if (!grouped[r.film_id]) grouped[r.film_id] = { title:r.film_title, scores:[] }
    grouped[r.film_id].scores.push(r.score)
  })

  const rebricek = Object.entries(grouped).map(([id, val]) => ({
    film_id: id,
    title: val.title,
    average: val.scores.reduce((a,b)=>a+b,0)/val.scores.length,
    count: val.scores.length,
  })).sort((a,b) => b.average - a.average)

  const withPosters = await Promise.all(rebricek.map(async film => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${film.film_id}?api_key=${process.env.TMDB_API_KEY}`, { cache:'no-store' })
      const d = await res.json()
      return { ...film, poster_path:d.poster_path, backdrop_path:d.backdrop_path }
    } catch { return { ...film, poster_path:null, backdrop_path:null } }
  }))

  return withPosters
}

export default async function Rebricek() {
  const filmy = await getRebricek()
  const medals = ['🥇','🥈','🥉']

  return (
    <div style={{ background:'#04040a', minHeight:'100vh', color:'#f0ece4' }}>
      <style>{css}</style>

      <Nav />

      <div style={{ maxWidth:900, margin:'0 auto', padding:'96px 48px 80px' }}>

        <div style={{ marginBottom:56, animation:'fadeUp 0.7s ease both' }}>
          <p style={{ color:GOLD, fontSize:9, letterSpacing:5, marginBottom:12, fontWeight:500 }}>TOP HODNOTENIA</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(36px,5vw,60px)', fontWeight:600, letterSpacing:-1, lineHeight:1, marginBottom:16 }}>
            Rebríček filmov
          </h1>
          <p style={{ color:MUTED, fontSize:13, fontWeight:300 }}>
            {filmy.length} filmov hodnotených komunitou DSF
          </p>
        </div>

        {filmy.length === 0 ? (
          <div style={{
            textAlign:'center', padding:72,
            background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:20,
          }}>
            <p style={{ color:MUTED, fontSize:15 }}>Zatiaľ žiadne hodnotenia.</p>
          </div>
        ) : filmy.map((film, i) => (
          <a
            key={film.film_id}
            href={`/film/${film.film_id}`}
            className={`rank-row${i < 3 ? ' gold-row' : ''}`}
            style={{ animation:`fadeUp 0.5s ease ${Math.min(i,12)*55}ms both` }}
          >
            <div style={{ width:52, textAlign:'center', flexShrink:0 }}>
              {i < 3 ? (
                <span style={{ fontSize:30, animation:`numberReveal 0.5s ease ${i*80}ms both` }}>{medals[i]}</span>
              ) : (
                <span style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize:28, fontWeight:700,
                  color: i < 10 ? GOLD : MUTED,
                  opacity: i < 10 ? 1 : 0.5,
                }}>#{i+1}</span>
              )}
            </div>

            {film.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${film.poster_path}`}
                alt={film.title}
                style={{
                  width:54, height:80, objectFit:'cover',
                  borderRadius:10, flexShrink:0,
                  border:'1px solid rgba(255,255,255,0.07)',
                  boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
                }}
              />
            ) : (
              <div style={{ width:54, height:80, background:'rgba(255,255,255,0.04)', borderRadius:10, flexShrink:0 }} />
            )}

            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ fontSize:17, fontWeight:500, marginBottom:4, lineHeight:1.3, fontFamily:"'Cormorant Garamond',serif" }}>{film.title}</h2>
              <p style={{ color:MUTED, fontSize:11, marginBottom:8, letterSpacing:1 }}>
                {film.count} {film.count === 1 ? 'hodnotenie' : film.count < 5 ? 'hodnotenia' : 'hodnotení'}
              </p>
              <div className="bar-bg" style={{ maxWidth:220 }}>
                <div className="bar-fill" style={{ width:`${(film.average/10)*100}%` }} />
              </div>
            </div>

            <div style={{ textAlign:'right', flexShrink:0 }}>
              <div className="score-display" style={{ color: i===0 ? GOLD2 : i<3 ? GOLD : '#f0ece4' }}>
                {film.average.toFixed(1)}
              </div>
              <div style={{ color:MUTED, fontSize:10, letterSpacing:1, marginTop:2 }}>/ 10</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}