import { NextResponse } from 'next/server'
import pool from '../../../lib/db'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT r.id, r.score, r.recenzia, r.created_at,
             f.title as film_title, f.id as film_id,
             u.username
      FROM ratings r
      JOIN films f ON r.film_id = f.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `)
    return NextResponse.json({ ratings: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba pri načítaní' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { film_id, film_title, score, recenzia } = body

    if (!film_id || !score) {
      return NextResponse.json({ error: 'Chýba film_id alebo score' }, { status: 400 })
    }
    if (score < 1 || score > 10) {
      return NextResponse.json({ error: 'Score musí byť 1-10' }, { status: 400 })
    }

    // Skontroluj či film existuje, ak nie vytvor ho
    await pool.query(`
      INSERT INTO films (id, title) 
      VALUES ($1, $2) 
      ON CONFLICT (id) DO NOTHING
    `, [film_id, film_title])

    // Vlož hodnotenie (user_id 1 = default)
    const result = await pool.query(`
      INSERT INTO ratings (film_id, user_id, score, recenzia)
      VALUES ($1, 1, $2, $3)
      RETURNING *
    `, [film_id, score, recenzia?.trim() || null])

    return NextResponse.json({ success: true, rating: result.rows[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba pri ukladaní' }, { status: 500 })
  }
}
