'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const GOLD = '#E8C97E'
const MUTED = 'rgba(255,255,255,0.42)'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080808; color:#fff; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(232,201,126,0.3); border-radius:2px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .film-card { transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
  .film-card:hover { transform:translateY(-10px) scale(1.025); }
  .film-card:hover .card-overlay { opacity:1 !important; }
  .film-card:hover .rate-btn-card { opacity:1 !important; transform:translateY(0) !important; }
  .nav-link { position:relative; transition:color 0.3s; text-decoration:none; }
  .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:1px; background:#E8C97E; transform:scaleX(0); transition:transform 0.3s; }
  .nav-link:hover::after, .nav-link.active::after { transform:scaleX(1); }
  .search-box:focus { border-color:rgba(232,201,126,0.5) !important; box-shadow:0 0 0 3px rgba(232,201,126,0.07) !important; }
  .genre-btn { transition:all 0.25s; cursor:pointer; font-family:'DM Sans'; }
  .genre-btn:hover { background:rgba(232,201,126,0.15) !important; border-color:rgba(232,201,126,0.4) !important; }
  .genre-btn.on { background:rgba(232,201,126,0.15) !important; border-color:#E8C97E !important; color:#E8C97E !important; }
  .hero-cta { transition:all 0.25s; }
  .hero-cta:hover { background:#fff !important; color:#000 !important; transform:translateY(-1px); }
  .score-btn { transition:all 0.18s; cursor:pointer; }
  .score-btn:hover { transform:scale(1.15); }
  .modal-overlay { animation:fadeIn 0.2s ease; }
  .modal-box { animation:fadeUp 0.3s cubic-bezier(0.25,0.46,0.45,0.94); }
  .toast-el { animation:slideDown 0.3s ease; }
  .hero-slide { position:absolute; inset:0; transition:opacity 1.4s cubic-bezier(0.25,0.46,0.45,0.94); }
`

function RatingModal({ film, onClose, onSave }: {
  film: any
  onClose: () => void
  onSave: (filmId: number, score: number, recenzia: string) => Promise<void>
}) {
  const [score, setScore] = useState(0)
  const [recenzia, setRecenzia] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSave() {
    if (!score) return
    setSaving(true)
    await onSave(film.id, score, recenzia)
    setSaving(false)
    setDone(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(15,15,15,0.99)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '38px 40px',
          maxWidth: 460, width: '100%',
        }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 50, marginBottom: 16, color: GOLD }}>✓</div>
            <p style={{ fontFamily: "'Playfair Display'", fontSize: 20, marginBottom: 8 }}>Hodnotenie uložené!</p>
            <p style={{ color: MUTED, fontSize: 14 }}>{film.title} — {score}/10</p>
          </div>
        ) : (
          <>
            <p style={{ color: MUTED, fontSize: 10, letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>Hodnotenie</p>
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 24, marginBottom: 26, lineHeight: 1.2 }}>{film.title}</h2>
            <p style={{ color: MUTED, fontSize: 11, marginBottom: 12, letterSpacing: 1 }}>VYBER SKÓRE (1–10)</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 26, flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  className={`score-btn${score === n ? ' on' : ''}`}
                  onClick={() => setScore(n)}
                  style={{
                    width: 36, height: 36, borderRadius: 9,
                    border: `1px solid ${score === n ? GOLD : 'rgba(255,255,255,0.1)'}`,
                    background: score === n ? 'rgba(232,201,126,0.18)' : 'rgba(255,255,255,0.04)',
                    color: score === n ? GOLD : MUTED,
                    fontWeight: '600', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans'",
                  }}
                >{n}</button>
              ))}
            </div>

            {score > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: MUTED, fontSize: 11, marginBottom: 10, letterSpacing: 1 }}>RECENZIA (NEPOVINNÁ)</p>
                <textarea
                  value={recenzia}
                  onChange={e => setRecenzia(e.target.value)}
                  placeholder="Napíš svoju recenziu..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: 14,
                    resize: 'none', outline: 'none', fontFamily: "'DM Sans'",
                    lineHeight: 1.6, boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="hero-cta"
                onClick={handleSave}
                disabled={!score || saving}
                style={{
                  flex: 1, padding: 14,
                  background: score ? GOLD : 'rgba(255,255,255,0.06)',
                  color: score ? '#000' : 'rgba(255,255,255,0.25)',
                  border: 'none', borderRadius: 12,
                  fontWeight: '700', fontSize: 14,
                  cursor: score ? 'pointer' : 'not-allowed',
                  fontFamily: "'DM Sans'",
                }}
              >{saving ? 'Ukladám...' : 'Uložiť hodnotenie'}</button>
              <button
                onClick={onClose}
                style={{
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  color: MUTED,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, cursor: 'pointer',
                  fontSize: 14, fontFamily: "'DM Sans'",
                }}
              >Zrušiť</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FilmCard({ film, priemer, userRating, onRate, delay }: {
  film: any
  priemer?: { avg: number; count: number }
  userRating?: number
  onRate: (film: any) => void
  delay: number
}) {
  const [hovered, setHovered] = useState(false)
  // ✅ OPRAVENÉ: zobrazí rating iba z DSF databázy, nie z TMDB
  const displayRating = priemer ? priemer.avg.toFixed(1) : null

  return (
    <div
      className="film-card"
      style={{ animation: `fadeUp 0.55s ease both`, animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = `/film/${film.id}`}
    >
      <div style={{ position: 'relative', borderRadius: 13, overflow: 'hidden', aspectRatio: '2/3', background: '#111', cursor: 'pointer' }}>
        {film.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
        )}

        <div
          className="card-overlay"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
            opacity: hovered ? 1 : 0.72, transition: 'opacity 0.4s',
          }}
        />

        {displayRating && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(232,201,126,0.95)', color: '#000',
            fontWeight: '700', fontSize: 11,
            padding: '4px 8px', borderRadius: 7,
          }}>★ {displayRating}</div>
        )}

        {priemer && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(0,0,0,0.7)', color: GOLD,
            fontSize: 10, padding: '3px 7px', borderRadius: 6,
          }}>DSF {priemer.count}x</div>
        )}

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14,
          transform: hovered ? 'translateY(0)' : 'translateY(4px)',
          opacity: hovered ? 1 : 0.9, transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}>
          {film.genre_ids?.[0] && (
            <div style={{
              display: 'inline-block',
              background: 'rgba(232,201,126,0.12)',
              border: '1px solid rgba(232,201,126,0.25)',
              color: GOLD, fontSize: 8, letterSpacing: 2,
              padding: '2px 7px', borderRadius: 5, marginBottom: 7,
              textTransform: 'uppercase',
            }}>SK Film</div>
          )}
          <p style={{ fontSize: 13, fontWeight: '600', marginBottom: 3, lineHeight: 1.3 }}>{film.title}</p>
          {film.director && (
            <p style={{ color: GOLD, fontSize: 11 }}>{film.director.name}</p>
          )}
          <p style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{film.release_date?.slice(0, 4)}</p>
          {userRating && (
            <p style={{ color: '#4ade80', fontSize: 10, marginTop: 5 }}>✓ Tvoje: {userRating}/10</p>
          )}
          <button
            className="rate-btn-card"
            onClick={e => { e.stopPropagation(); onRate(film) }}
            style={{
              marginTop: 10, width: '100%', padding: '7px',
              background: 'rgba(232,201,126,0.12)',
              border: '1px solid rgba(232,201,126,0.35)',
              color: GOLD, borderRadius: 8, fontSize: 11,
              cursor: 'pointer', fontFamily: "'DM Sans'", fontWeight: '500',
              opacity: 0, transform: 'translateY(6px)', transition: 'all 0.3s',
            }}
          >{userRating ? 'Zmeniť hodnotenie' : '+ Ohodnoť'}</button>
        </div>
      </div>
    </div>
  )
}

export default function DSFClient({ filmy, priemery }: {
  filmy: any[]
  priemery: { [key: number]: { avg: number; count: number } }
}) {
  const [search, setSearch] = useState('')
  const [heroIdx, setHeroIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [ratingModal, setRatingModal] = useState<any>(null)
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({})
  const [toast, setToast] = useState<string | null>(null)
  const [localPriemery, setLocalPriemery] = useState(priemery)

  const heroFilms = filmy.slice(0, 4)
  const featured = heroFilms[heroIdx]

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroFilms.length), 6000)
    return () => clearInterval(t)
  }, [heroFilms.length])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = filmy.filter(f =>
    f.title?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSaveRating(filmId: number, score: number, recenzia: string) {
    await supabase.from('ratings').insert({
      film_id: filmId,
      film_title: filmy.find(f => f.id === filmId)?.title,
      score,
      recenzia: recenzia.trim() || null,
    })
    setUserRatings(r => ({ ...r, [filmId]: score }))
    setLocalPriemery(prev => {
      const old = prev[filmId]
      if (!old) return { ...prev, [filmId]: { avg: score, count: 1 } }
      const newCount = old.count + 1
      const newAvg = (old.avg * old.count + score) / newCount
      return { ...prev, [filmId]: { avg: newAvg, count: newCount } }
    })
    const title = filmy.find(f => f.id === filmId)?.title
    setToast(`Hodnotenie pre "${title}" uložené!`)
    setTimeout(() => setToast(null), 3000)
  }

  const ratingCount = Object.keys(userRatings).length + Object.keys(priemery).length
  const allRatingVals = Object.values(userRatings)
  const avgScore = allRatingVals.length
    ? (allRatingVals.reduce((a, b) => a + b, 0) / allRatingVals.length).toFixed(1)
    : '—'

  return (
    <>
      <style>{css}</style>
      <div style={{ background: '#080808', minHeight: '100vh', color: '#fff' }}>

        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          padding: '0 40px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'rgba(8,8,8,0.93)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.4s',
        }}>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 21, fontWeight: 700, color: GOLD, letterSpacing: 6 }}>DSF</div>
          <div style={{ display: 'flex', gap: 32, fontSize: 11, letterSpacing: 2 }}>
            <a href="/" className="nav-link active" style={{ color: GOLD }}>FILMY</a>
            <a href="/rebricek" className="nav-link" style={{ color: MUTED }}>REBRÍČEK</a>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ position: 'relative', height: '88vh', overflow: 'hidden' }}>
          {heroFilms.map((f, i) => (
            <div
              key={f.id}
              className="hero-slide"
              style={{ opacity: i === heroIdx ? 1 : 0, zIndex: 0 }}
            >
              <img
                src={`https://image.tmdb.org/t/p/original${f.backdrop_path || f.poster_path}`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.28) saturate(1.2)' }}
              />
            </div>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(8,8,8,1) 0%,rgba(8,8,8,0.7) 45%,transparent 78%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(8,8,8,1) 0%,transparent 38%)', zIndex: 1 }} />

          {featured && (
            <div style={{ position: 'absolute', bottom: 90, left: 56, maxWidth: 520, zIndex: 2, animation: 'fadeUp 1s ease both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,201,126,0.1)', border: '1px solid rgba(232,201,126,0.22)', borderRadius: 8, padding: '6px 14px', marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: 'shimmer 2s ease infinite', display: 'inline-block' }} />
                <span style={{ color: GOLD, fontSize: 10, letterSpacing: 3, fontWeight: 500 }}>ODPORÚČANÝ FILM</span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display'", fontSize: 'clamp(32px,4.5vw,58px)', fontWeight: 700, lineHeight: 1.08, marginBottom: 18, letterSpacing: -1 }}>
                {featured.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 14, lineHeight: 1.75, marginBottom: 24, maxWidth: 400 }}>
                {featured.overview?.slice(0, 200)}{featured.overview?.length > 200 ? '...' : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                {/* ✅ OPRAVENÉ: v hero zobrazuje iba DSF rating, nie TMDB */}
                {localPriemery[featured.id] ? (
                  <span style={{ color: GOLD, fontSize: 13, fontWeight: 600 }}>★ {localPriemery[featured.id].avg.toFixed(1)}</span>
                ) : null}
                <span style={{ color: MUTED, fontSize: 13 }}>{featured.release_date?.slice(0, 4)}</span>
                {localPriemery[featured.id] && (
                  <span style={{ background: 'rgba(232,201,126,0.1)', border: '1px solid rgba(232,201,126,0.2)', color: GOLD, fontSize: 10, padding: '3px 10px', borderRadius: 6 }}>
                    DSF ★ {localPriemery[featured.id].avg.toFixed(1)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="hero-cta"
                  onClick={() => setRatingModal(featured)}
                  style={{ padding: '13px 28px', background: GOLD, color: '#000', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans'" }}
                >Ohodnoť film</button>
                <button
                  onClick={() => window.location.href = `/film/${featured.id}`}
                  style={{ padding: '13px 22px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans'" }}
                >Viac info →</button>
              </div>
            </div>
          )}

          {/* Hero dots */}
          <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
            {heroFilms.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} style={{
                width: i === heroIdx ? 28 : 6, height: 6,
                borderRadius: 3, border: 'none', cursor: 'pointer',
                background: i === heroIdx ? GOLD : 'rgba(255,255,255,0.22)',
                transition: 'all 0.4s',
              }} />
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{ padding: '60px 40px', maxWidth: 1380, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <p style={{ color: GOLD, fontSize: 10, letterSpacing: 4, marginBottom: 10, textTransform: 'uppercase' }}>Databáza</p>
              <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Slovenská kinematografia</h2>
            </div>
            <p style={{ color: MUTED, fontSize: 13 }}>{filtered.length} filmov</p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 18 }}>
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 19, pointerEvents: 'none' }}>⌕</span>
            <input
              className="search-box"
              type="text"
              placeholder="Hľadaj slovenský film..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '15px 18px 15px 50px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 13, color: '#fff', fontSize: 15,
                outline: 'none', fontFamily: "'DM Sans'", transition: 'all 0.3s',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
                width: 24, height: 24, color: MUTED, cursor: 'pointer', fontSize: 16,
              }}>×</button>
            )}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 22 }}>
              {filtered.map((film, i) => (
                <FilmCard
                  key={film.id}
                  film={film}
                  priemer={localPriemery[film.id]}
                  userRating={userRatings[film.id]}
                  onRate={setRatingModal}
                  delay={Math.min(i, 12) * 55}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.25 }}>🎬</div>
              <p style={{ color: MUTED, fontSize: 15 }}>Žiadne filmy nenájdené</p>
              <button onClick={() => setSearch('')} style={{
                marginTop: 18, padding: '10px 22px',
                background: 'rgba(232,201,126,0.1)', border: '1px solid rgba(232,201,126,0.3)',
                color: GOLD, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans'",
              }}>Vymazať filter</button>
            </div>
          )}

          {/* Stats */}
          <div style={{
            marginTop: 72, display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 1, background: 'rgba(255,255,255,0.06)',
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { label: 'Filmov v databáze', value: filmy.length },
              { label: 'Hodnotení', value: ratingCount },
              { label: 'Tvoje priemerné skóre', value: avgScore },
              { label: 'Slovenských filmov', value: filtered.length },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '28px 20px', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontFamily: "'Playfair Display'", fontSize: 30, fontWeight: 700, color: GOLD, marginBottom: 6 }}>{s.value}</p>
                <p style={{ color: MUTED, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 18, color: GOLD, letterSpacing: 5 }}>DSF</div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Databáza Slovenských Filmov · 2024</p>
        </footer>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          film={ratingModal}
          onClose={() => setRatingModal(null)}
          onSave={handleSaveRating}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-el" style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,15,15,0.98)',
          border: '1px solid rgba(232,201,126,0.3)',
          borderRadius: 12, padding: '13px 24px',
          color: GOLD, fontSize: 14, zIndex: 2000,
          whiteSpace: 'nowrap', backdropFilter: 'blur(20px)',
        }}>✓ {toast}</div>
      )}
    </>
  )
}