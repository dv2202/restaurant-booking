import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

type BookingSummaryProps = {
  booking: {
    date: Date
    time: string
    guests: number
    name: string
    email: string
    phone: string
  }
}

export function BookingSummary({ booking }: BookingSummaryProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
        <CardDescription>Your table has been reserved</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Date:</strong> {format(new Date(booking.date), 'MMMM d, yyyy')}</p>
          <p><strong>Time:</strong> {booking.time}</p>
          <p><strong>Guests:</strong> {booking.guests}</p>
          <p><strong>Name:</strong> {booking.name}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()}>Make Another Booking</Button>
      </CardFooter>
    </Card>
  )
}

