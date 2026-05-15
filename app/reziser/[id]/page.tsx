async function getReziser(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/person/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=movie_credits`,
    { cache: 'no-store' }
  )
  return res.json()
}

async function getWikipedia(meno: string) {
  try {
    const skRes = await fetch(
      `https://sk.wikipedia.org/api/rest_v1/page/summary/${meno.replace(/ /g, '_')}`,
      { cache: 'no-store' }
    )
    const skData = await skRes.json()
    if (skData.extract) return { bio: skData.extract, foto: skData.thumbnail?.source ?? null }

    const enRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${meno.replace(/ /g, '_')}`,
      { cache: 'no-store' }
    )
    const enData = await enRes.json()
    if (enData.extract) return { bio: enData.extract, foto: enData.thumbnail?.source ?? null }

    return null
  } catch {
    return null
  }
}

export default async function ReziserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reziser = await getReziser(id)
  const wiki = await getWikipedia(reziser.name)

  const filmy = [
    ...(reziser.movie_credits?.crew?.filter((f: any) => f.department === 'Directing') ?? []),
    ...(reziser.movie_credits?.cast ?? [])
  ].filter((f: any, index: number, self: any[]) =>
    index === self.findIndex((t) => t.id === f.id)
  ).sort((a: any, b: any) => (b.release_date ?? '').localeCompare(a.release_date ?? ''))

  const bio = wiki?.bio ?? reziser.biography ?? null
  const foto = reziser.profile_path
    ? `https://image.tmdb.org/t/p/w300${reziser.profile_path}`
    : wiki?.foto ?? null

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

      <div style={{padding: '48px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', gap: '48px', marginBottom: '64px'}}>
          {foto && (
            <img
              src={foto}
              alt={reziser.name}
              style={{width: '200px', height: '280px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0}}
            />
          )}
          <div>
            <p style={{color: '#e8c97e', letterSpacing: '3px', fontSize: '12px', marginBottom: '12px'}}>REŽISÉR</p>
            <h1 style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '16px'}}>{reziser.name}</h1>
            {reziser.birthday && (
              <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px'}}>
                Narodený: {reziser.birthday} {reziser.place_of_birth ? `· ${reziser.place_of_birth}` : ''}
              </p>
            )}
            {bio ? (
              <p style={{color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, fontSize: '15px', maxWidth: '600px'}}>
                {bio.slice(0, 800)}{bio.length > 800 ? '...' : ''}
              </p>
            ) : (
              <p style={{color: 'rgba(255,255,255,0.3)', fontSize: '14px'}}>Biografia nie je dostupná.</p>
            )}
          </div>
        </div>

        <h2 style={{fontSize: '13px', letterSpacing: '4px', color: '#e8c97e', marginBottom: '32px'}}>
          FILMOGRAFIA
        </h2>

        {filmy.length === 0 ? (
          <p style={{color: 'rgba(255,255,255,0.3)'}}>Žiadne filmy nenájdené.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '24px'
          }}>
            {filmy.map((film: any) => (
              <div key={film.credit_id}>
                {film.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
                    alt={film.title}
                    style={{width: '100%', borderRadius: '8px', display: 'block'}}
                  />
                ) : (
                  <div style={{width: '100%', paddingTop: '150%', background: '#1a1a1a', borderRadius: '8px'}}/>
                )}
                <p style={{fontSize: '13px', fontWeight: 'bold', marginTop: '8px'}}>{film.title}</p>
                <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '11px'}}>{film.release_date?.slice(0, 4)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}