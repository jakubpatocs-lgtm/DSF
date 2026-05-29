import ReziseriClient from './ReziseriClient'
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

  .dir-card {
    display:block; text-decoration:none; color:#f0ece4;
    background:rgba(255,255,255,0.025);
    backdrop-filter:blur(30px) saturate(180%);
    -webkit-backdrop-filter:blur(30px) saturate(180%);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:20px; overflow:hidden;
    transition:all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    position:relative;
  }
  .dir-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
    z-index:1;
  }
  .dir-card::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
    transform:translateX(-100%); pointer-events:none; z-index:2;
  }
  .dir-card:hover {
    border-color:rgba(201,168,76,0.25);
    transform:translateY(-10px) scale(1.02);
    box-shadow:0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15);
    background:rgba(255,255,255,0.04);
  }
  .dir-card:hover::after { animation:lightSweep 0.8s ease forwards; }
  .dir-card:hover .dir-photo { transform:scale(1.07); }
  .dir-card:hover .dir-arrow { opacity:1 !important; transform:translateX(0) !important; }

  .dir-photo {
    width:100%; aspect-ratio:3/4; object-fit:cover;
    transition:transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
    display:block;
  }
  .dir-arrow {
    opacity:0 !important; transform:translateX(-6px) !important;
    transition:all 0.3s cubic-bezier(0.34,1.2,0.64,1) !important;
  }

  .dsf-search {
    width:100%; padding:18px 24px 18px 56px;
    background:rgba(255,255,255,0.03);
    backdrop-filter:blur(40px) saturate(180%);
    -webkit-backdrop-filter:blur(40px) saturate(180%);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:16px; color:#f0ece4; font-size:15px;
    outline:none; font-family:'Outfit',sans-serif; font-weight:300;
    transition:all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .dsf-search:focus {
    border-color:rgba(201,168,76,0.4);
    background:rgba(255,255,255,0.05);
    box-shadow:0 0 0 4px rgba(201,168,76,0.06), 0 16px 48px rgba(0,0,0,0.3);
  }
  .dsf-search::placeholder { color:rgba(255,255,255,0.2); }
`

async function getReziserov() {
  const pages = await Promise.all(
    [1,2,3,4,5,6,7,8,9,10].map(page =>
      fetch(
        `https://api.themoviedb.org/3/discover/movie?with_origin_country=SK&sort_by=popularity.desc&api_key=${process.env.TMDB_API_KEY}&page=${page}`,
        { cache: 'no-store' }
      ).then(res => res.json())
    )
  )
  const filmy = pages.flatMap(p => p.results ?? [])

  const withDirectors = await Promise.all(
    filmy.map(async (film: any) => {
      const credits = await fetch(
        `https://api.themoviedb.org/3/movie/${film.id}/credits?api_key=${process.env.TMDB_API_KEY}`,
        { cache: 'no-store' }
      ).then(res => res.json())
      return credits.crew?.find((c: any) => c.job === 'Director') ?? null
    })
  )

  const seen = new Set()
  const unikatni = withDirectors
    .filter(Boolean)
    .filter((d: any) => {
      if (seen.has(d.id)) return false
      seen.add(d.id)
      return true
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const withPhotos = await Promise.all(
    unikatni.map(async (d: any) => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/person/${d.id}?api_key=${process.env.TMDB_API_KEY}`,
          { cache: 'no-store' }
        ).then(r => r.json())
        return { ...d, profile_path: res.profile_path ?? d.profile_path, birthday: res.birthday, place_of_birth: res.place_of_birth }
      } catch { return d }
    })
  )

  return withPhotos
}

export default async function ReziseriPage() {
  const reziseri = await getReziserov()

  return (
    <div style={{ background:'#04040a', minHeight:'100vh', color:'#f0ece4' }}>
      <style>{css}</style>

      <Nav />

      <div style={{ maxWidth:1360, margin:'0 auto', padding:'96px 48px 80px' }}>

        <div style={{ marginBottom:48, animation:'fadeUp 0.7s ease both' }}>
          <p style={{ color:GOLD, fontSize:9, letterSpacing:5, marginBottom:12, fontWeight:500 }}>TVORCOVIA</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(36px,5vw,60px)', fontWeight:600, letterSpacing:-1, lineHeight:1, marginBottom:16 }}>
            Slovenskí režiséri
          </h1>
          <p style={{ color:MUTED, fontSize:13, fontWeight:300 }}>
            {reziseri.length} režisérov · klikni pre životopis a filmografiu
          </p>
        </div>

        <ReziseriClient reziseri={reziseri} />
      </div>
    </div>
  )
}