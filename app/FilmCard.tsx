'use client'

import RatingButton from './RatingButton'

export default function FilmCard({ film, priemer }: { film: any, priemer?: { avg: number, count: number } }) {
  return (
    <div
  style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.3s ease' }}
  onClick={() => window.location.href = `/film/${film.id}`}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
        {film.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${film.poster_path}`}
            alt={film.title}
            style={{ width: '100%', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', paddingTop: '150%', background: '#1a1a1a', borderRadius: '8px' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 50%)',
          borderRadius: '8px'
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{film.title}</p>
          {film.director && (
            <a href={`/reziser/${film.director.id}`} style={{ color: '#e8c97e', fontSize: '11px', textDecoration: 'none' }}>
              {film.director.name}
            </a>
          )}
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>
            {film.release_date?.slice(0, 4)}
          </p>
          {priemer && (
            <p style={{ color: '#e8c97e', fontSize: '11px' }}>
              ⭐ {priemer.avg.toFixed(1)} ({priemer.count}x)
            </p>
          )}
        </div>
      </div>
      <div style={{ marginTop: '8px' }}>
        <RatingButton filmId={film.id} filmTitle={film.title} />
      </div>
    </div>
  )
}