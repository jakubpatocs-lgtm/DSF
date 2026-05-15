'use client'

import { useState } from 'react'
import RatingButton from './RatingButton'

export default function Search({ filmy, priemery }: { filmy: any[], priemery: { [key: number]: { avg: number, count: number } } }) {
  const [query, setQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const filtered = filmy.filter(f => f.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div style={{position: 'relative', marginBottom: '40px'}}>
        <input
          type="text"
          placeholder="Hladaj slovensky film..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{width: '100%', padding: '18px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none', boxSizing: 'border-box'}}
        />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '28px'}}>
        {filtered.map((film: any) => (
          <div key={film.id} style={{cursor: 'pointer'}} onClick={() => window.location.href = '/film/' + film.id}>
            <div style={{position: 'relative', borderRadius: '10px', overflow: 'hidden'}}>
              {film.poster_path ? (
                <img src={'https://image.tmdb.org/t/p/w300' + film.poster_path} alt={film.title} style={{width: '100%', display: 'block'}} />
              ) : (
                <div style={{width: '100%', paddingTop: '150%', background: '#1a1a1a'}}/>
              )}
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, transparent 60%)'}}/>
              {priemery[film.id] && (
                <div style={{position: 'absolute', top: '10px', right: '10px', background: '#e8c97e', color: '#000', fontWeight: 'bold', fontSize: '13px', padding: '4px 8px', borderRadius: '6px'}}>
                  {priemery[film.id].avg.toFixed(1)}
                </div>
              )}
              <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px'}}>
                <p style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '4px'}}>{film.title}</p>
                {film.director && (
                  <a href={'/reziser/' + film.director.id} style={{color: '#e8c97e', fontSize: '11px', textDecoration: 'none'}} onClick={e => e.stopPropagation()}>
                    {film.director.name}
                  </a>
                )}
                <p style={{color: '#666', fontSize: '11px', marginTop: '2px'}}>{film.release_date?.slice(0, 4)}</p>
              </div>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <RatingButton filmId={film.id} filmTitle={film.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
