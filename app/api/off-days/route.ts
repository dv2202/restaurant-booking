import { NextResponse } from 'next/server'

// This is a mock database. In a real application, you'd use a proper database.
const offDays = [
  '2023-06-05',
  '2023-06-12',
  '2023-06-19',
  '2023-06-26'
]

export async function GET() {
  return NextResponse.json(offDays)
}

