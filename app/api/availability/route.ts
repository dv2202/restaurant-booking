import { NextResponse } from 'next/server'
import { format, addMinutes } from 'date-fns'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'

const START_TIME = 12 * 60 // 12:00 PM in minutes
const END_TIME = 24 * 60 // 12:00 AM in minutes
const SLOT_DURATION = 30 // in minutes

export async function GET(req: Request) {
  await dbConnect()

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ message: 'Date is required' }, { status: 400 })
  }

  try {
    const bookings = await Booking.find({ date })
    const bookedTimes = bookings.map(booking => booking.time)

    const availableSlots = []
    for (let time = START_TIME; time < END_TIME; time += SLOT_DURATION) {
      const slot = format(addMinutes(new Date(0), time), 'HH:mm')
      if (!bookedTimes.includes(slot)) {
        availableSlots.push(slot)
      }
    }

    return NextResponse.json(availableSlots)
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching availability' }, { status: 500 })
  }
}

