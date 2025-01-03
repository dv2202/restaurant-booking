'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format, isSameDay, addDays } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast, useToast } from '@/components/ui/use-toast'
import { AlertCircle, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'

type BookingFormData = {
  date: Date
  time: string
  guests: number
  name: string
  email: string
  phone: string
}

// Mock data for holidays and fully booked days
const mockHolidays = [
  addDays(new Date(), 5),
  addDays(new Date(), 15),
  addDays(new Date(), 25),
]

const mockFullyBookedDays = [
  addDays(new Date(), 3),
  addDays(new Date(), 10),
  addDays(new Date(), 17),
]

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>()

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    const response = await fetch(`/api/availability?date=${format(date, 'yyyy-MM-dd')}`)
    const slots = await response.json()
    setAvailableSlots(slots)
  }

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Validate time format before sending the request
      if (!/^\d{1,2}:\d{2}(?: [AP]M)?$/.test(data.time)) {
        throw new Error('Invalid time format. Please use HH:MM AM/PM format.');
      }

      // Ensure the date is valid before formatting
      if (!selectedDate) {
        throw new Error('Invalid date selected.');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: format(selectedDate, 'yyyy-MM-dd'), // Use selectedDate instead of data.date
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Confirmed",
          description: `Your table has been booked for ${format(selectedDate, 'MMMM d, yyyy')} at ${data.time}.`, // Use selectedDate instead of data.date
        })
        reset()
        fetchAvailableSlots(selectedDate) // Use selectedDate instead of data.date
      } else {
        const errorData = await response.json(); // Check the error response
        throw new Error(errorData.message || 'Booking failed');
      }
    } catch (error) {
      console.log(error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "There was an error while booking your table. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isDateDisabled = (date: Date) => {
    return mockHolidays.some(holiday => isSameDay(holiday, date)) ||
      mockFullyBookedDays.some(fullyBooked => isSameDay(fullyBooked, date))
  }

  const isDateFullyBooked = (date: Date) => {
    return mockFullyBookedDays.some(fullyBooked => isSameDay(fullyBooked, date))
  }

  const isDateHoliday = (date: Date) => {
    return mockHolidays.some(holiday => isSameDay(holiday, date))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className='flex flex-col md:flex-row justify-between'>
          <CardHeader>
            <CardTitle>Restaurant Table Booking</CardTitle>
            <CardDescription>Book your table for a delightful dining experience</CardDescription>
          </CardHeader>
          <div className="mt-4 md:mt-0 p-6">
            <Link href="/bookings">
              <Button variant="outline" className="w-full md:w-auto">View Your Bookings</Button>
            </Link>
          </div>
        </div>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className='pt-6'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    modifiers={{
                      booked: isDateFullyBooked,
                      holiday: isDateHoliday,
                    }}
                    modifiersStyles={{
                      booked: { color: 'lightgray' },
                      holiday: { color: 'red' },
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded bg-red-500 mr-1" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded bg-gray-300 mr-1" />
                  <span>Fully Booked</span>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="time">Time</Label>
                <select
                  id="time"
                  {...register('time', { required: 'Time is required' })}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a time</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time && <p className="text-red-500">{errors.time.message}</p>}
              </div>
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  {...register('guests', { required: 'Number of guests is required', min: 1 })}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.guests && <p className="text-red-500">{errors.guests.message}</p>}
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'Phone is required' })}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
              </div>
              <Button type="submit" className="w-full">Book Table</Button>
            </form>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <AlertCircle className="inline-block mr-1 h-4 w-4" />
            Bookings are subject to availability and confirmation.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
