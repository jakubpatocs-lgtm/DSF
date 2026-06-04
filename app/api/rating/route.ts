import { NextResponse } from 'next/server'
import pool from '../../../lib/db'

export async function GET() {
  try {
    const result = await pool.query('SELECT film_id, score FROM ratings')
    return NextResponse.json({ ratings: result.rows ?? [] })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
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

    await pool.query(
      `INSERT INTO films (id, title) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [film_id, film_title]
    )

    const result = await pool.query(
      `INSERT INTO ratings (film_id, user_id, score, recenzia)
       VALUES ($1, 1, $2, $3) RETURNING *`,
      [film_id, score, recenzia?.trim() || null]
    )

    return NextResponse.json({ success: true, rating: result.rows[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba pri ukladaní' }, { status: 500 })
  }
}
