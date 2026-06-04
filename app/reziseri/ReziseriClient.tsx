'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

// TMDB IDs siene slavy
const SIEN_SLAVY_NAMES = ['Juraj Jakubisko', 'Martin Šulík', 'Tereza Nvotová']

export default function ReziseriClient({ reziseri }: { reziseri: any[] }) {
  const [search, setSearch] = useState('')

  const sienSlavy = SIEN_SLAVY_NAMES
    .map(name => reziseri.find(r => r.name === name || r.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
    .filter(Boolean)
    .filter((r: any) => r?.profile_path)

  const sienSlavyIds = new Set(sienSlavy.map((r: any) => r.id))

  const filtered = reziseri
    .filter(r => !sienSlavyIds.has(r.id))
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      {/* SIEN SLAVY */}
      {!search && sienSlavy.length > 0 && (
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(201,168,76,0.4), transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: GOLD, fontSize: 16 }}>★</span>
              <p style={{ color: GOLD, fontSize: 9, letterSpacing: 5, fontWeight: 500 }}>SIEŇ SLÁVY</p>
              <span style={{ color: GOLD, fontSize: 16 }}>★</span>
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, rgba(201,168,76,0.4), transparent)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28, maxWidth: 900, margin: '0 auto' }}>
            {sienSlavy.map((r: any, i: number) => (
              <a key={r.id} href={`/reziser/${r.id}`} style={{
                display: 'block', textDecoration: 'none', color: '#f0ece4',
                position: 'relative', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(201,168,76,0.2)',
                transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
                animation: `fadeUp 0.6s ease ${i * 100}ms both`,
                height: 380,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-8px)'
                el.style.borderColor = 'rgba(201,168,76,0.5)'
                el.style.boxShadow = '0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(201,168,76,0.2)'
                el.style.boxShadow = 'none'
              }}
              >
                {/* Fotka na cely background */}
                <img
                  src={`https://image.tmdb.org/t/p/w500${r.profile_path}`}
                  alt={r.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                />
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,10,0.97) 0%, rgba(4,4,10,0.5) 50%, rgba(4,4,10,0.1) 100%)' }} />

                {/* Gold badge hore */}
                <div style={{
                  position: 'absolute', top: 16, right: 16, zIndex: 2,
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`,
                  color: '#000', fontSize: 8, fontWeight: 700, letterSpacing: 2,
                  padding: '5px 10px', borderRadius: 100,
                }}>★ SIEŇ SLÁVY</div>

                {/* Info dole */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', zIndex: 2 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, marginBottom: 6, letterSpacing: -0.5 }}>{r.name}</h3>
                  {r.birthday && (
                    <p style={{ color: 'rgba(240,236,228,0.55)', fontSize: 12, marginBottom: 14 }}>
                      {r.birthday.slice(0, 4)}{r.place_of_birth ? ` · ${r.place_of_birth.split(',').pop()?.trim()}` : ''}
                    </p>
                  )}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: 100, padding: '6px 14px',
                    fontSize: 10, color: GOLD2, letterSpacing: 1.5, fontWeight: 500,
                  }}>
                    ZOBRAZIŤ PROFIL →
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 64, marginBottom: 48 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <p style={{ color: MUTED, fontSize: 9, letterSpacing: 4 }}>VŠETCI REŽISÉRI</p>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 40 }}>
        <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: 20, pointerEvents: 'none' }}>⌕</span>
        <input
          className="dsf-search"
          type="text"
          placeholder="Hľadaj režiséra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%',
            width: 28, height: 28, color: MUTED, cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        )}
      </div>

      <p style={{ color: MUTED, fontSize: 12, marginBottom: 28, letterSpacing: 1 }}>
        {filtered.length} režisérov
      </p>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
        {filtered.map((r: any, i: number) => (
          <div key={r.id} style={{ animation: `fadeUp 0.5s ease ${Math.min(i, 16) * 45}ms both` }}>
            <a href={`/reziser/${r.id}`} className="dir-card">
              <div style={{ position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                {r.profile_path ? (
                  <img className="dir-photo" src={`https://image.tmdb.org/t/p/w300${r.profile_path}`} alt={r.name} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '3/4', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: MUTED }}>🎬</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,10,0.9) 0%, transparent 55%)' }} />
              </div>
              <div style={{ padding: '16px 18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.2 }}>{r.name}</p>
                  <span className="dir-arrow" style={{ flexShrink: 0, marginTop: 2 }}>→</span>
                </div>
                {r.birthday && (
                  <p style={{ color: MUTED, fontSize: 11, marginBottom: 10 }}>
                    {r.birthday.slice(0, 4)}{r.place_of_birth ? ` · ${r.place_of_birth.split(',').pop()?.trim()}` : ''}
                  </p>
                )}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)',
                  borderRadius: 100, padding: '4px 10px',
                  fontSize: 9, color: GOLD, letterSpacing: 2, fontWeight: 500,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: GOLD, display: 'inline-block' }} />
                  ZOBRAZIŤ PROFIL
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ color: MUTED, fontSize: 14 }}>Žiadny režisér nenájdený</p>
          <button onClick={() => setSearch('')} style={{
            marginTop: 16, padding: '10px 22px',
            background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
            color: GOLD, borderRadius: 10, cursor: 'pointer', fontSize: 12,
            fontFamily: 'Outfit', letterSpacing: 1,
          }}>VYMAZAŤ FILTER</button>
        </div>
      )}
    </>
  )
}