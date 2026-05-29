'use client'

import { useState } from 'react'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

export default function ReziseriClient({ reziseri }: { reziseri: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = reziseri.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* SEARCH */}
      <div style={{ position:'relative', marginBottom:40 }}>
        <span style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)', fontSize:20, pointerEvents:'none' }}>⌕</span>
        <input
          className="dsf-search"
          type="text"
          placeholder="Hľadaj režiséra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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

      <p style={{ color:MUTED, fontSize:12, marginBottom:28, letterSpacing:1 }}>
        {filtered.length} režisérov
      </p>

      {/* GRID */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
        gap:24,
      }}>
        {filtered.map((r: any, i: number) => (
          <div
            key={r.id}
            style={{ animation:`fadeUp 0.5s ease ${Math.min(i,16)*45}ms both` }}
          >
            <a href={`/reziser/${r.id}`} className="dir-card">
              {/* Photo */}
              <div style={{ position:'relative', overflow:'hidden', background:'rgba(255,255,255,0.03)' }}>
                {r.profile_path ? (
                  <img
                    className="dir-photo"
                    src={`https://image.tmdb.org/t/p/w300${r.profile_path}`}
                    alt={r.name}
                  />
                ) : (
                  <div style={{
                    width:'100%', aspectRatio:'3/4',
                    background:'rgba(255,255,255,0.03)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:56, color:MUTED,
                  }}>🎬</div>
                )}
                <div style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(to top, rgba(4,4,10,0.9) 0%, transparent 55%)',
                }} />
              </div>

              {/* Info */}
              <div style={{ padding:'16px 18px 20px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                  <p style={{ fontSize:15, fontWeight:500, fontFamily:"'Cormorant Garamond',serif", lineHeight:1.2 }}>{r.name}</p>
                  <span className="dir-arrow" style={{ flexShrink:0, marginTop:2 }}>→</span>
                </div>
                {r.birthday && (
                  <p style={{ color:MUTED, fontSize:11, marginBottom:10 }}>
                    {r.birthday.slice(0,4)}
                    {r.place_of_birth ? ` · ${r.place_of_birth.split(',').pop()?.trim()}` : ''}
                  </p>
                )}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  background:'rgba(201,168,76,0.08)',
                  border:'1px solid rgba(201,168,76,0.18)',
                  borderRadius:100, padding:'4px 10px',
                  fontSize:9, color:GOLD, letterSpacing:2, fontWeight:500,
                }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:GOLD, display:'inline-block' }} />
                  ZOBRAZIŤ PROFIL
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 0' }}>
          <p style={{ color:MUTED, fontSize:14 }}>Žiadny režisér nenájdený</p>
          <button onClick={() => setSearch('')} style={{
            marginTop:16, padding:'10px 22px',
            background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.25)',
            color:GOLD, borderRadius:10, cursor:'pointer', fontSize:12,
            fontFamily:'Outfit', letterSpacing:1,
          }}>VYMAZAŤ FILTER</button>
        </div>
      )}
    </>
  )
}
