'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Nav from './Nav'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap');

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    background: #04040a;
    color: #f0ece4;
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
    cursor: default;
  }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.88) translateY(20px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes heroReveal {
    0%   { opacity:0; transform:translateY(44px) scale(0.96); filter:blur(8px); }
    100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
  }
  @keyframes shimmerPulse {
    0%,100% { opacity:0.4; transform:scaleX(0.8); }
    50%     { opacity:1;   transform:scaleX(1); }
  }
  @keyframes orbFloat {
    0%,100% { transform:translate(0,0) scale(1) rotate(0deg); }
    25%     { transform:translate(60px,-40px) scale(1.1) rotate(90deg); }
    50%     { transform:translate(-30px,60px) scale(0.9) rotate(180deg); }
    75%     { transform:translate(40px,20px) scale(1.05) rotate(270deg); }
  }
  @keyframes lightSweep {
    0%   { transform:translateX(-120%) skewX(-20deg); opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:1; }
    100% { transform:translateX(220%) skewX(-20deg); opacity:0; }
  }
  @keyframes progressFill {
    from { width:0%; }
    to   { width:100%; }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
    50%     { box-shadow: 0 0 40px 8px rgba(201,168,76,0.12); }
  }
  @keyframes toastIn {
    from { opacity:0; transform:translateX(-50%) translateY(16px) scale(0.92); }
    to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
  }
  @keyframes spin {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes reviewIn {
    from { opacity:0; transform:translateX(40px) scale(0.92); filter:blur(4px); }
    to   { opacity:1; transform:translateX(0) scale(1); filter:blur(0); }
  }

  .glass-1 {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(40px) saturate(200%) brightness(110%);
    -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(110%);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .glass-2 {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(60px) saturate(220%) brightness(115%);
    -webkit-backdrop-filter: blur(60px) saturate(220%) brightness(115%);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .glass-gold {
    background: rgba(201,168,76,0.08);
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(201,168,76,0.22);
  }

  .hero-wrapper {
    position: relative; height: 100vh; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    transition: opacity 1.8s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .hero-bg img {
    width: 100%; height: 100%; object-fit: cover;
    filter: brightness(0.35) saturate(1.5);
    transition: transform 9s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .hero-bg.active img { transform: scale(1.08); }
  .hero-bg.inactive { opacity: 0; }
  .hero-bg.inactive img { transform: scale(1); }

  .fc {
    position: relative; cursor: pointer;
    transform: translateY(0) scale(1);
    transition: transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .fc:hover { transform: translateY(-14px) scale(1.02); z-index: 10; }
  .fc .fc-img {
    width: 100%; aspect-ratio: 2/3; object-fit: cover;
    border-radius: 14px;
    transition: all 0.5s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .fc:hover .fc-img {
    box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2);
  }
  .fc .fc-sweep {
    position: absolute; inset: 0; border-radius: 14px; overflow: hidden;
    pointer-events: none; z-index: 2;
  }
  .fc .fc-sweep::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%);
    transform: translateX(-100%);
  }
  .fc:hover .fc-sweep::after {
    animation: lightSweep 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
  }
  .fc .fc-overlay {
    position: absolute; inset: 0; border-radius: 14px;
    background: linear-gradient(to top, rgba(4,4,10,0.98) 0%, rgba(4,4,10,0.4) 50%, transparent 100%);
    opacity: 0.65;
    transition: opacity 0.5s;
  }
  .fc:hover .fc-overlay { opacity: 1; }
  .fc .fc-info {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 16px;
    transform: translateY(5px); opacity: 0.85;
    transition: all 0.45s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .fc:hover .fc-info { transform: translateY(0); opacity: 1; }
  .fc .fc-rate {
    width: 100%; margin-top: 10px; padding: 9px;
    background: rgba(201,168,76,0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 10px; color: ${GOLD2};
    font-size: 11px; font-weight: 500; letter-spacing: 1px;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    opacity: 0; transform: translateY(8px);
    transition: all 0.35s cubic-bezier(0.34,1.2,0.64,1);
    position: relative; overflow: hidden;
  }
  .fc:hover .fc-rate { opacity: 1; transform: translateY(0); }
  .fc:hover .fc-rate:hover {
    background: rgba(201,168,76,0.2);
    border-color: rgba(201,168,76,0.5);
    transform: translateY(-1px);
  }

  .sb {
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer; font-family: 'Outfit', sans-serif;
  }
  .sb:hover { transform: scale(1.25) translateY(-2px); }
  .sb.sel { animation: glowPulse 2s ease infinite; }

  .arrow-glass {
    width: 50px; height: 50px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; cursor: pointer; border: none;
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.8);
    transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
    position: relative; overflow: hidden;
  }
  .arrow-glass:hover {
    background: rgba(201,168,76,0.15);
    border-color: rgba(201,168,76,0.45);
    color: ${GOLD2};
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.4);
  }
  .arrow-glass:active { transform: scale(0.94); }

  .dsf-search {
    width: 100%; padding: 18px 24px 18px 56px;
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; color: #f0ece4; font-size: 15px;
    outline: none; font-family: 'Outfit', sans-serif; font-weight: 300;
    transition: all 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .dsf-search:focus {
    border-color: rgba(201,168,76,0.4);
    background: rgba(255,255,255,0.05);
    box-shadow: 0 0 0 4px rgba(201,168,76,0.06), 0 16px 48px rgba(0,0,0,0.3);
  }
  .dsf-search::placeholder { color: rgba(255,255,255,0.2); }

  .hero-dot {
    height: 3px; border-radius: 2px; border: none; cursor: pointer; padding: 0;
    transition: all 0.5s cubic-bezier(0.34,1.2,0.64,1);
    position: relative; overflow: hidden;
    background: rgba(255,255,255,0.2);
  }
  .hero-dot.active { background: rgba(201,168,76,0.3); }
  .hero-dot .dot-fill {
    position: absolute; top: 0; left: 0; height: 100%;
    background: linear-gradient(to right, ${GOLD}, ${GOLD2});
    border-radius: 2px;
    animation: progressFill 6s linear both;
  }

  .stat-glass {
    text-align: center; padding: 32px 24px;
    background: rgba(255,255,255,0.02);
    position: relative; overflow: hidden;
    transition: all 0.4s ease;
  }
  .stat-glass:hover { background: rgba(255,255,255,0.04); }

  .modal-bg { animation: fadeIn 0.25s ease; }
  .modal-box { animation: scaleIn 0.35s cubic-bezier(0.34,1.1,0.64,1); }
  .dsf-toast { animation: toastIn 0.4s cubic-bezier(0.34,1.2,0.64,1); }
  .hero-text { animation: heroReveal 0.9s cubic-bezier(0.25,0.46,0.45,0.94) both; }

  .rating-badge {
    position: absolute; top: 10px; right: 10px; z-index: 3;
    background: rgba(201,168,76,0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.35);
    border-radius: 8px; padding: 5px 9px;
    font-size: 11px; font-weight: 600; color: #000;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    overflow: hidden;
  }

  .review-popup {
    position: fixed; right: 32px; bottom: 80px; z-index: 400;
    background: rgba(8,6,18,0.85);
    backdrop-filter: blur(40px) saturate(220%);
    -webkit-backdrop-filter: blur(40px) saturate(220%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    box-shadow: 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12);
    animation: reviewIn 0.5s cubic-bezier(0.34,1.1,0.64,1) both;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34,1.1,0.64,1);
    overflow: hidden;
  }
  .review-popup.expanded { width: 300px; padding: 18px 20px; }
  .review-popup.minimized {
    width: auto; padding: 10px 16px; border-radius: 100px;
    background: rgba(8,6,18,0.92); border-color: rgba(201,168,76,0.25);
  }
  .review-popup:hover {
    border-color: rgba(201,168,76,0.3);
    box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.08), inset 0 1px 0 rgba(255,255,255,0.12);
  }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .hero-wrapper { height: 100svh; }

    .fc:hover { transform: none; }
    .fc .fc-info { opacity: 1 !important; transform: translateY(0) !important; }
    .fc .fc-rate { opacity: 1 !important; transform: translateY(0) !important; }
    .fc:hover .fc-img { box-shadow: none; }

    .arrow-glass { width: 40px; height: 40px; font-size: 14px; }

    .review-popup.expanded {
      width: calc(100vw - 32px) !important;
      right: 16px !important;
      bottom: 70px !important;
    }
    .review-popup.minimized {
      right: 16px !important;
      bottom: 70px !important;
    }

    .modal-box {
      padding: 28px 20px !important;
      border-radius: 20px !important;
      margin: 0 8px;
    }

    .dsf-search { font-size: 16px; padding: 14px 20px 14px 48px; }

    .stat-glass { padding: 20px 12px; }
  }
`

/* ─────────────── RATING MODAL ─────────────── */
function RatingModal({ film, onClose, onSave }: {
  film: any
  onClose: () => void
  onSave: (id: number, score: number, text: string) => Promise<void>
}) {
  const [score, setScore] = useState(0)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!score) return
    setSaving(true)
    await onSave(film.id, score, text)
    setSaving(false)
    setDone(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div
      className="modal-bg"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        className="modal-box glass-2"
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: 28, padding: '44px 46px',
          maxWidth: 480, width: '100%',
          boxShadow: '0 64px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}>✓</div>
            <p style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, color: GOLD2, marginBottom: 8 }}>Uložené</p>
            <p style={{ color: MUTED, fontSize: 13 }}>{film.title} · {score}/10</p>
          </div>
        ) : (
          <>
            <p style={{ color: GOLD, fontSize: 9, letterSpacing: 4, marginBottom: 10, textTransform: 'uppercase', fontWeight: 500 }}>Tvoje hodnotenie</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 600, marginBottom: 30, lineHeight: 1.2 }}>{film.title}</h2>

            <p style={{ color: MUTED, fontSize: 9, letterSpacing: 3, marginBottom: 14 }}>SKÓRE</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} className={`sb${score===n?' sel':''}`} onClick={() => setScore(n)} style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: `1px solid ${score===n ? GOLD : 'rgba(255,255,255,0.1)'}`,
                  background: score===n ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.03)',
                  color: score===n ? GOLD2 : MUTED,
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: score===n ? `0 0 20px rgba(201,168,76,0.25)` : 'none',
                }}>{n}</button>
              ))}
            </div>

            {score > 0 && (
              <div style={{ marginBottom: 24, animation: 'fadeUp 0.3s ease both' }}>
                <p style={{ color: MUTED, fontSize: 9, letterSpacing: 3, marginBottom: 10 }}>RECENZIA (NEPOVINNÁ)</p>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="Napíš svoju recenziu..." rows={3}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, color: '#f0ece4', fontSize: 13, resize: 'none',
                    outline: 'none', fontFamily: 'Outfit, sans-serif', lineHeight: 1.7,
                    boxSizing: 'border-box', backdropFilter: 'blur(10px)',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submit} disabled={!score||saving} style={{
                flex: 1, padding: 15,
                background: score ? `linear-gradient(135deg, ${GOLD}, ${GOLD2})` : 'rgba(255,255,255,0.05)',
                color: score ? '#000' : 'rgba(255,255,255,0.2)',
                border: 'none', borderRadius: 14,
                fontWeight: 600, fontSize: 13, cursor: score ? 'pointer' : 'not-allowed',
                fontFamily: 'Outfit, sans-serif', letterSpacing: 0.5,
                boxShadow: score ? '0 8px 24px rgba(201,168,76,0.3)' : 'none',
                transition: 'all 0.3s',
              }}>
                {saving ? '...' : 'Uložiť'}
              </button>
              <button onClick={onClose} style={{
                padding: '15px 20px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                color: MUTED, borderRadius: 14, cursor: 'pointer',
                fontSize: 13, fontFamily: 'Outfit, sans-serif',
                backdropFilter: 'blur(10px)',
              }}>Zrušiť</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────── FILM CARD ─────────────── */
function FilmCard({ film, priemer, userRating, onRate, delay }: {
  film: any
  priemer?: { avg: number; count: number }
  userRating?: number
  onRate: (f: any) => void
  delay: number
}) {
  return (
    <div
      className="fc"
      style={{ animation: `fadeUp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) both`, animationDelay: `${delay}ms` }}
      onClick={() => window.location.href = `/film/${film.id}`}
    >
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
        {film.poster_path || film.backdrop_path ? (
          <img className="fc-img" src={`https://image.tmdb.org/t/p/w300${film.poster_path || film.backdrop_path}`} alt={film.title} loading="lazy" decoding="async" />
        ) : (
          <div style={{ width:'100%', aspectRatio:'2/3', background:'rgba(255,255,255,0.03)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
            <span style={{ fontSize:32, opacity:0.2 }}>🎬</span>
            <p style={{ color:'rgba(255,255,255,0.15)', fontSize:11, textAlign:'center', padding:'0 12px', lineHeight:1.4 }}>{film.title}</p>
          </div>
        )}

        <div className="fc-sweep" />
        <div className="fc-overlay" />

        {priemer && <div className="rating-badge">★ {priemer.avg.toFixed(1)}</div>}

        {priemer && (
          <div style={{
            position: 'absolute', top: 10, left: 10, zIndex: 3,
            background: 'rgba(4,4,10,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: 6, padding: '3px 8px',
            fontSize: 9, color: GOLD, letterSpacing: 1, fontWeight: 500,
          }}>DSF {priemer.count}×</div>
        )}

        <div className="fc-info" style={{ zIndex: 3 }}>
          <div style={{
            display: 'inline-block', marginBottom: 6,
            background: 'rgba(201,168,76,0.1)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 4, padding: '2px 7px',
            fontSize: 8, color: GOLD, letterSpacing: 2, textTransform: 'uppercase',
          }}>SK</div>
          <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>{film.title}</p>
          {film.director && <p style={{ color: GOLD, fontSize: 10, fontWeight: 400 }}>{film.director.name}</p>}
          <p style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{film.release_date?.slice(0,4)}</p>
          {userRating && <p style={{ color: '#6ee7b7', fontSize: 9, marginTop: 5, letterSpacing: 1 }}>✓ TVOJE: {userRating}/10</p>}
        </div>
      </div>

      <button className="fc-rate" onClick={e => { e.stopPropagation(); onRate(film) }}>
        {userRating ? '✎ ZMENIŤ HODNOTENIE' : '+ OHODNOŤ'}
      </button>
    </div>
  )
}

/* ─────────────── MAIN ─────────────── */
export default function DSFClient({ filmy = [], priemery = {}, recenzie = [], heroFilmy }: {
  filmy: any[]
  priemery: { [key: number]: { avg: number; count: number } }
  recenzie?: { film_id: number; film_title: string; score: number; recenzia: string }[]
  heroFilmy?: any[]
}) {
  const [search, setSearch] = useState('')
  const [heroIdx, setHeroIdx] = useState(0)
  const [heroKey, setHeroKey] = useState(0)
  const [modal, setModal] = useState<any>(null)
  const [userRatings, setUserRatings] = useState<{ [k: number]: number }>({})
  const [toast, setToast] = useState<string | null>(null)
  const [localPriemery, setLocalPriemery] = useState(priemery)
  const intervalRef = useRef<any>(null)
  const [popupIdx, setPopupIdx] = useState(0)
  const [popupVisible, setPopupVisible] = useState(true)
  const [popupMinimized, setPopupMinimized] = useState(false)
  const intervalRef2 = useRef<any>(null)
  const [zobrazených, setZobrazených] = useState(20)

  const heroFilms = heroFilmy && heroFilmy.length > 0
    ? heroFilmy
    : filmy.filter(f => f.backdrop_path || f.poster_path).slice(0, 5)

  const featured = heroFilms[heroIdx]

  const goTo = useCallback((idx: number) => {
    setHeroIdx(idx)
    setHeroKey(k => k + 1)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % heroFilms.length)
      setHeroKey(k => k + 1)
    }, 6000)
  }, [heroFilms.length])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % heroFilms.length)
      setHeroKey(k => k + 1)
    }, 6000)
    return () => clearInterval(intervalRef.current)
  }, [heroFilms.length])

  useEffect(() => {
    if (recenzie.length === 0) return
    intervalRef2.current = setInterval(() => {
      if (popupMinimized) return
      setPopupVisible(false)
      setTimeout(() => {
        setPopupIdx(i => (i + 1) % recenzie.length)
        setPopupVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(intervalRef2.current)
  }, [recenzie.length, popupMinimized])

  const filtered = filmy.filter(f => f.title?.toLowerCase().includes(search.toLowerCase()))
  const viditelne = filtered.slice(0, zobrazených)

  async function handleSave(filmId: number, score: number, recenzia: string) {
    const title = filmy.find(f => f.id === filmId)?.title
    await fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ film_id: filmId, film_title: title, score, recenzia })
    })
    setUserRatings(r => ({ ...r, [filmId]: score }))
    setLocalPriemery(prev => {
      const old = prev[filmId]
      if (!old) return { ...prev, [filmId]: { avg: score, count: 1 } }
      const c = old.count + 1
      return { ...prev, [filmId]: { avg: (old.avg * old.count + score) / c, count: c } }
    })
    setToast(`"${title}" hodnotené!`)
    setTimeout(() => setToast(null), 3200)
  }

  const totalRatings = Object.values(localPriemery).reduce((a, b) => a + b.count, 0)
  const myRatings = Object.keys(userRatings).length
  const myAvg = myRatings
    ? (Object.values(userRatings).reduce((a,b)=>a+b,0)/myRatings).toFixed(1)
    : '—'

  const currentRecenzia = recenzie[popupIdx]

  return (
    <>
      <style>{css}</style>
      <Nav count={filmy.length} />

      <div style={{ background: '#04040a', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <div className="hero-wrapper">

          <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:1 }}>
            <div style={{
              position:'absolute', width:700, height:700, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
              top:'10%', left:'55%', animation:'orbFloat 20s ease-in-out infinite',
            }} />
            <div style={{
              position:'absolute', width:500, height:500, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(80,60,180,0.05) 0%, transparent 70%)',
              top:'30%', left:'10%', animation:'orbFloat 26s ease-in-out infinite reverse',
            }} />
          </div>

          {heroFilms.map((f, i) => (
            <div key={f.id} className={`hero-bg ${i === heroIdx ? 'active' : 'inactive'}`} style={{ zIndex: 0 }}>
              <img src={`https://image.tmdb.org/t/p/original${f.backdrop_path || f.poster_path}`} alt="" />
            </div>
          ))}

          <div style={{ position:'absolute', inset:0, zIndex:2, background:'linear-gradient(110deg, rgba(4,4,10,0.98) 0%, rgba(4,4,10,0.65) 50%, rgba(4,4,10,0.2) 100%)' }} />
          <div style={{ position:'absolute', inset:0, zIndex:2, background:'linear-gradient(to top, rgba(4,4,10,1) 0%, transparent 45%)' }} />

          {featured && (
            <div key={heroKey} style={{
              position:'absolute',
              bottom:'clamp(80px, 12vh, 110px)',
              left:'clamp(20px, 5vw, 64px)',
              maxWidth:'min(580px, calc(100vw - 40px))',
              zIndex:10,
            }}>
              <div className="hero-text" style={{ animationDelay:'0ms' }}>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  background:'rgba(201,168,76,0.08)',
                  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                  border:'1px solid rgba(201,168,76,0.22)',
                  borderRadius:100, padding:'7px 16px', marginBottom:22,
                  boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1)',
                }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:GOLD2, animation:'shimmerPulse 2.5s ease infinite', display:'inline-block' }} />
                  <span style={{ color:GOLD, fontSize:9, letterSpacing:3, fontWeight:500 }}>ODPORÚČANÝ FILM</span>
                </div>
              </div>

              <h1 className="hero-text" style={{
                fontFamily:"'Cormorant Garamond', serif",
                fontSize:'clamp(28px,5.5vw,68px)',
                fontWeight:600, lineHeight:1.0, letterSpacing:-1,
                marginBottom:20, animationDelay:'70ms',
                textShadow:'0 2px 40px rgba(0,0,0,0.5)',
              }}>{featured.title}</h1>

              <p className="hero-text" style={{
                color:'rgba(240,236,228,0.58)', fontSize:'clamp(12px,1.5vw,14px)', lineHeight:1.85,
                marginBottom:28, maxWidth:440, fontWeight:300, animationDelay:'130ms',
                display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
              }}>
                {featured.overview?.slice(0,180)}{(featured.overview?.length??0)>180?'...':''}
              </p>

              <div className="hero-text" style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, animationDelay:'170ms' }}>
                {localPriemery[featured.id] && (
                  <>
                    <span style={{ color:GOLD2, fontSize:13, fontWeight:500 }}>★ {localPriemery[featured.id].avg.toFixed(1)}</span>
                    <span style={{ width:3, height:3, borderRadius:'50%', background:MUTED, display:'inline-block' }} />
                  </>
                )}
                <span style={{ color:MUTED, fontSize:12 }}>{featured.release_date?.slice(0,4)}</span>
                {featured.director && (
                  <>
                    <span style={{ width:3, height:3, borderRadius:'50%', background:MUTED, display:'inline-block' }} />
                    <span style={{ color:MUTED, fontSize:12 }}>réž. {featured.director.name}</span>
                  </>
                )}
              </div>

              <div className="hero-text" style={{ display:'flex', gap:12, animationDelay:'210ms' }}>
                <button onClick={() => setModal(featured)} style={{
                  padding:'clamp(10px,2vw,14px) clamp(20px,3vw,32px)',
                  background:`linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                  color:'#000', border:'none', borderRadius:14,
                  fontWeight:600, fontSize:12, cursor:'pointer',
                  fontFamily:'Outfit, sans-serif', letterSpacing:1,
                  boxShadow:'0 12px 36px rgba(201,168,76,0.35)',
                  transition:'all 0.3s',
                }}>OHODNOŤ</button>
                <button onClick={() => window.location.href = `/film/${featured.id}`} style={{
                  padding:'clamp(10px,2vw,14px) clamp(16px,2vw,24px)',
                  background:'rgba(255,255,255,0.06)',
                  backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  color:'rgba(240,236,228,0.8)', borderRadius:14, cursor:'pointer',
                  fontSize:12, fontFamily:'Outfit, sans-serif', letterSpacing:1,
                  transition:'all 0.3s', fontWeight:500,
                }}>DETAIL →</button>
              </div>
            </div>
          )}

          <div style={{
            position:'absolute',
            bottom:'clamp(80px, 12vh, 110px)',
            right:'clamp(16px, 4vw, 64px)',
            zIndex:10, display:'flex', gap:10,
          }}>
            <button className="arrow-glass" onClick={() => goTo((heroIdx-1+heroFilms.length)%heroFilms.length)}>←</button>
            <button className="arrow-glass" onClick={() => goTo((heroIdx+1)%heroFilms.length)}>→</button>
          </div>

          <div style={{
            position:'absolute', bottom:48, left:'50%', transform:'translateX(-50%)',
            display:'flex', gap:8, zIndex:10, alignItems:'center',
          }}>
            {heroFilms.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i===heroIdx?' active':''}`}
                onClick={() => goTo(i)}
                style={{ width: i===heroIdx ? 36 : 8 }}
              >
                {i===heroIdx && <div key={heroKey} className="dot-fill" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{
          maxWidth:1360, margin:'0 auto',
          padding:'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 48px)',
        }}>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:40, flexWrap:'wrap', gap:16 }}>
            <div>
              <p style={{ color:GOLD, fontSize:9, letterSpacing:5, marginBottom:12, fontWeight:500 }}>DATABÁZA</p>
              <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'clamp(24px,4vw,38px)', fontWeight:600, letterSpacing:-0.5, lineHeight:1 }}>
                Slovenská kinematografia
              </h2>
            </div>
            <p style={{ color:MUTED, fontSize:12, letterSpacing:1 }}>{filtered.length} filmov</p>
          </div>

          <div style={{ position:'relative', marginBottom:24 }}>
            <span style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)', fontSize:20, pointerEvents:'none' }}>⌕</span>
            <input
              className="dsf-search"
              type="text"
              placeholder="Hľadaj slovenský film..."
              value={search}
              onChange={e => { setSearch(e.target.value); setZobrazených(20) }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position:'absolute', right:18, top:'50%', transform:'translateY(-50%)',
                background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%',
                width:28, height:28, color:MUTED, cursor:'pointer', fontSize:18,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>×</button>
            )}
          </div>

          {filtered.length > 0 ? (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:20 }}>
                {viditelne.map((film, i) => (
                  <FilmCard
                    key={film.id} film={film}
                    priemer={localPriemery[film.id]}
                    userRating={userRatings[film.id]}
                    onRate={setModal}
                    delay={Math.min(i, 16) * 45}
                  />
                ))}
              </div>
              {zobrazených < filtered.length && (
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <button
                    onClick={() => setZobrazených(z => z + 20)}
                    style={{
                      padding:'14px 40px',
                      background:'rgba(201,168,76,0.08)',
                      backdropFilter:'blur(20px)',
                      border:'1px solid rgba(201,168,76,0.25)',
                      color:GOLD2, borderRadius:14,
                      cursor:'pointer', fontSize:12,
                      fontFamily:'Outfit', letterSpacing:2,
                      transition:'all 0.3s',
                    }}
                  >
                    NAČÍTAŤ ĎALŠIE ({filtered.length - zobrazených} zostáva)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:42, marginBottom:14, opacity:0.15 }}>◻</div>
              <p style={{ color:MUTED, fontSize:14 }}>Žiadne filmy nenájdené</p>
              <button onClick={() => setSearch('')} style={{
                marginTop:16, padding:'10px 22px',
                background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.25)',
                color:GOLD, borderRadius:10, cursor:'pointer', fontSize:12,
                fontFamily:'Outfit', letterSpacing:1,
              }}>VYMAZAŤ FILTER</button>
            </div>
          )}

          <div style={{
            marginTop:80,
            display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
            gap:1, borderRadius:22, overflow:'hidden',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.06)',
            backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
          }}>
            {[
              { label:'Filmov v databáze', val:filmy.length },
              { label:'Celkom hodnotení', val:totalRatings },
              { label:'Tvoje hodnotenia', val:myRatings || '—' },
              { label:'Tvoj priemer', val:myAvg },
            ].map((s,i) => (
              <div key={i} className="stat-glass">
                <div style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontSize:'clamp(28px,4vw,38px)', fontWeight:600, color:GOLD2, marginBottom:8, lineHeight:1,
                }}>{s.val}</div>
                <div style={{ color:MUTED, fontSize:9, letterSpacing:2, textTransform:'uppercase', fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <footer style={{
          padding:'36px clamp(16px, 4vw, 48px)',
          borderTop:'1px solid rgba(255,255,255,0.05)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:12,
          background:'rgba(255,255,255,0.01)',
          backdropFilter:'blur(10px)',
        }}>
          <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, color:GOLD2, letterSpacing:8 }}>DSF</div>
          <p style={{ color:'rgba(255,255,255,0.18)', fontSize:11, letterSpacing:1 }}>DATABÁZA SLOVENSKÝCH FILMOV</p>
        </footer>
      </div>

      {/* ── RECENZIE POPUP ── */}
      {recenzie.length > 0 && popupVisible && currentRecenzia && (
        <div
          key={popupMinimized ? 'min' : popupIdx}
          className={`review-popup ${popupMinimized ? 'minimized' : 'expanded'}`}
          onClick={() => setPopupMinimized(v => !v)}
        >
          {popupMinimized ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:14 }}>💬</span>
              <span style={{ fontSize:11, color:GOLD, letterSpacing:1, fontWeight:500 }}>{currentRecenzia.score}/10</span>
              <span style={{ fontSize:10, color:MUTED, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentRecenzia.film_title}</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginLeft:4 }}>▲</span>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>👤</div>
                <p style={{ flex:1, fontSize:11, color:'rgba(240,236,228,0.5)', letterSpacing:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentRecenzia.film_title}</p>
                <div style={{ background:'linear-gradient(135deg, #C9A84C, #F0D080)', color:'#000', fontWeight:700, fontSize:12, padding:'3px 9px', borderRadius:8, flexShrink:0 }}>{currentRecenzia.score}/10</div>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', flexShrink:0 }}>▼</span>
              </div>
              <p style={{ color:'rgba(240,236,228,0.75)', fontSize:12, lineHeight:1.7, fontWeight:300, fontStyle:'italic', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>"{currentRecenzia.recenzia}"</p>
              <div style={{ marginTop:12, height:2, borderRadius:1, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                <div key={popupIdx} style={{ height:'100%', borderRadius:1, background:'linear-gradient(to right, #C9A84C, #F0D080)', animation:'progressFill 5s linear both' }} />
              </div>
            </>
          )}
        </div>
      )}

      {modal && <RatingModal film={modal} onClose={() => setModal(null)} onSave={handleSave} />}

      {toast && (
        <div className="dsf-toast" style={{
          position:'fixed', bottom:32, left:'50%',
          transform:'translateX(-50%)',
          background:'rgba(8,8,16,0.92)',
          backdropFilter:'blur(40px) saturate(200%)', WebkitBackdropFilter:'blur(40px) saturate(200%)',
          border:'1px solid rgba(201,168,76,0.3)',
          borderRadius:14, padding:'14px 28px',
          color:GOLD2, fontSize:13, zIndex:2000, whiteSpace:'nowrap', letterSpacing:0.5,
          boxShadow:'0 24px 56px rgba(0,0,0,0.6)',
        }}>✓ {toast}</div>
      )}
    </>
  )
}