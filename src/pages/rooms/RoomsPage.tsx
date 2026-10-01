import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { hotelApi, roomApi } from '@/api/services'
import { useAuth } from "@/contexts/AuthContext";
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Card, CardContent, Badge } from '@/components/ui/common'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import { Plus, BedDouble, Edit, Trash2, Users, DollarSign, Search } from 'lucide-react'
import { Input } from '@/components/ui/common'

export default function RoomsPage() {
   const { hotelId, user } = useAuth();   
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: hotel } = useQuery({
    queryKey: ['my-hotel'],
    queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data),
  })

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms', hotel?.id, statusFilter],
    queryFn: () => roomApi.getAll(hotel!.id, { status: statusFilter || undefined, limit: 100 })
      .then(r => r.data?.data || r.data),
    enabled: !!hotel?.id,
  })

  const isDirectorOrAdmin = ["HOTEL_DIRECTOR", "ADMIN", "SUPER_ADMIN"].includes(
    user?.role ?? "",
  );

  const { mutate: deleteRoom } = useMutation({
    mutationFn: (id: string) => roomApi.delete(hotel!.id, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room deleted') },
    onError: () => toast.error('Cannot delete room with active bookings'),
  })

  const rooms = roomsData?.data || roomsData || []
  const filtered = rooms.filter((r: any) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.roomType.toLowerCase().includes(search.toLowerCase())
  )

  const statusOptions = ['', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms</h1>
          <p className="text-muted-foreground text-sm">{rooms.length} total rooms</p>
        </div>
        <Link to="/rooms/add"><Button><Plus className="w-4 h-4 mr-2" />Add Room</Button></Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          {statusOptions.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No rooms found</p>
          <p className="text-muted-foreground text-sm mb-4">Add your first room to get started</p>
          <Link to="/rooms/add"><Button>Add Room</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room: any) => (
            <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">Room {room.roomNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{room.roomType}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/rooms/${room.id}/edit`}>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-muted-foreground hover:text-slate-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => { if (confirm('Delete this room?')) deleteRoom(room.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Per Night</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatCurrency(room.pricePerNight)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity</span>
                    </div>
                    <span className="font-medium">{room.capacity} guests</span>
                  </div>
                  {room.floor && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Floor</span>
                      <span className="font-medium">{room.floor}</span>
                    </div>
                  )}
                </div>
                {room.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                    {room.amenities.slice(0, 4).map((a: string) => (
                      <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{room.amenities.length - 4} more</span>
                    )}
                  </div>
                )}
                <Link to={`/rooms/${room.id}`} className="block mt-3">
                  <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">View Details →</button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
