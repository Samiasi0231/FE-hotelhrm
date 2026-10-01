import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hotelApi, bookingApi } from '@/api/services'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date())
  const { data: hotel } = useQuery({ queryKey: ['my-hotel'], queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data) })

  const { data: bookings = [] } = useQuery({
    queryKey: ['calendar', hotel?.id, current.getFullYear(), current.getMonth()],
    queryFn: () => bookingApi.getCalendar(hotel!.id, current.getFullYear(), current.getMonth() + 1).then(r => r.data?.data || r.data),
    enabled: !!hotel?.id,
  })

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1))
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1))

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getBookingsForDay = (day: number) => {
    const date = new Date(year, month, day)
    return (bookings as any[]).filter(b => {
      const ci = new Date(b.checkIn)
      const co = new Date(b.checkOut)
      return date >= ci && date < co
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Booking Calendar</h1>
        <Link to="/bookings/new"><Button>+ New Booking</Button></Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setCurrent(new Date())}>Today</Button>
              <Button size="sm" variant="outline" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const dayBookings = getBookingsForDay(day)
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
              return (
                <div key={day} className={`min-h-16 p-1 rounded-lg border text-xs ${isToday ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}>
                  <div className={`font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</div>
                  {dayBookings.slice(0, 2).map((b: any) => (
                    <Link key={b.id} to={`/bookings/${b.id}`}>
                      <div className={`truncate px-1 py-0.5 rounded text-xs mb-0.5 ${getStatusColor(b.status)}`}>
                        {b.guestName?.split(' ')[0]}
                      </div>
                    </Link>
                  ))}
                  {dayBookings.length > 2 && <div className="text-muted-foreground">+{dayBookings.length - 2}</div>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {(bookings as any[]).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">This Month's Bookings ({(bookings as any[]).length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(bookings as any[]).map((b: any) => (
                <Link key={b.id} to={`/bookings/${b.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border">
                    <div>
                      <p className="font-medium text-sm">{b.guestName}</p>
                      <p className="text-xs text-muted-foreground">Room {b.room?.roomNumber} · {new Date(b.checkIn).toLocaleDateString()} – {new Date(b.checkOut).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(b.status)}`}>{b.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
