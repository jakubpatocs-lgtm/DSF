import { NextResponse } from 'next/server'
import pool from '../../../lib/db'

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT f.id as film_id, f.title, f.poster_path,
             AVG(r.score) as average,
             COUNT(r.id) as count
      FROM films f
      JOIN ratings r ON r.film_id = f.id
      GROUP BY f.id, f.title, f.poster_path
      ORDER BY average DESC
    `)
    return NextResponse.json({ rebricek: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Chyba' }, { status: 500 })
  }
}
