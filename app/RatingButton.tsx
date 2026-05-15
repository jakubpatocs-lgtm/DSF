'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RatingButton({ filmId, filmTitle }: { filmId: number, filmTitle: string }) {
  const [score, setScore] = useState(0)
  const [recenzia, setRecenzia] = useState('')
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)

  async function saveRating() {
    if (score === 0) return
    await supabase.from('ratings').insert({ 
      film_id: filmId, 
      film_title: filmTitle, 
      score,
      recenzia: recenzia.trim() || null
    })
    setSaved(true)
    setOpen(false)
  }

  if (saved) return <p style={{color: '#4ade80', fontSize: '12px', marginTop: '8px'}}>✓ Hodnotenie uložené!</p>

  return (
    <div style={{marginTop: '8px'}}>
      {!open ? (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true) }}
          style={{
            background: 'rgba(232,201,126,0.15)',
            border: '1px solid rgba(232,201,126,0.3)',
            color: '#e8c97e',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          + Ohodnoť
        </button>
      ) : (
        <div style={{
          background: 'rgba(0,0,0,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          {/* Hviezdy / čísla */}
          <p style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px'}}>Hodnotenie:</p>
          <div style={{display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap'}}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={(e) => { e.stopPropagation(); setScore(n) }}
                style={{
                  width: '26px', height: '26px',
                  background: score === n ? '#e8c97e' : 'rgba(255,255,255,0.1)',
                  color: score === n ? '#000' : '#fff',
                  border: 'none', borderRadius: '4px',
                  fontSize: '11px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Recenzia */}
          <p style={{fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px'}}>Recenzia (nepovinná):</p>
          <textarea
            value={recenzia}
          onChange={e => setRecenzia(e.target.value)}
onClick={e => e.stopPropagation()}
            placeholder="Napíš recenziu..."
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              padding: '8px',
              resize: 'none',
              outline: 'none',
              marginBottom: '8px',
              boxSizing: 'border-box'
            }}
          />

          <div style={{display: 'flex', gap: '8px'}}>
            <button
              onClick={(e) => { e.stopPropagation(); saveRating() }}
              disabled={score === 0}
              style={{
                flex: 1,
                background: score > 0 ? '#e8c97e' : 'rgba(255,255,255,0.1)',
                color: score > 0 ? '#000' : 'rgba(255,255,255,0.3)',
                border: 'none', borderRadius: '6px',
                padding: '8px', fontSize: '12px',
                cursor: score > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 'bold'
              }}
            >
              Uložiť
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false) }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                border: 'none', borderRadius: '6px',
                padding: '8px 12px', fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Zrušiť
            </button>
          </div>
        </div>
      )}
    </div>
  )
}