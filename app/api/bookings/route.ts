import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function POST(req: Request) {
  await dbConnect()

  try {
    const booking = await req.json()
    const newBooking = new Booking(booking)
    await newBooking.save()
    return NextResponse.json({ message: 'Booking created successfully', booking: newBooking }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Error creating booking' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  await dbConnect()

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  try {
    if (date) {
      const bookings = await Booking.find({ date })
      return NextResponse.json(bookings)
    } else {
      const bookings = await Booking.find()
      return NextResponse.json(bookings)
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching bookings' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  await dbConnect()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    try {
      await Booking.findByIdAndDelete(id)
      return NextResponse.json({ message: 'Booking deleted successfully' })
    } catch (error) {
      return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 })
}

