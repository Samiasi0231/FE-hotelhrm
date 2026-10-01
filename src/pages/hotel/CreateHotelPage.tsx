import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hotelApi } from '@/api/services'
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common'
import { Loader2 } from 'lucide-react'

function HotelForm({ initial = {}, onSubmit, loading }: { initial?: any; onSubmit: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', state: '', country: 'Nigeria',
    phone: '', email: '', website: '', starRating: 3, ...initial,
  })
  const f = (k: string) => ({ value: form[k] || '', onChange: (e: any) => setForm({ ...form, [k]: e.target.value }) })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Hotel Name *</Label><Input required placeholder="Grand Lagos Hotel" {...f('name')} /></div>
            <div className="space-y-1.5">
              <Label>Star Rating</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.starRating} onChange={e => setForm({ ...form, starRating: Number(e.target.value) })}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Description</Label><Input placeholder="Brief description of your hotel" {...f('description')} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Contact & Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Address *</Label><Input required placeholder="123 Victoria Island" {...f('address')} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>City *</Label><Input required placeholder="Lagos" {...f('city')} /></div>
            <div className="space-y-1.5"><Label>State *</Label><Input required placeholder="Lagos State" {...f('state')} /></div>
            <div className="space-y-1.5"><Label>Country *</Label><Input required placeholder="Nigeria" {...f('country')} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Phone *</Label><Input required placeholder="+234 1 234 5678" {...f('phone')} /></div>
            <div className="space-y-1.5"><Label>Email *</Label><Input required type="email" placeholder="info@hotel.com" {...f('email')} /></div>
          </div>
          <div className="space-y-1.5"><Label>Website</Label><Input placeholder="https://yourhotel.com" {...f('website')} /></div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Hotel'}
        </Button>
      </div>
    </form>
  )
}

export function CreateHotelPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => hotelApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-hotel'] })
      toast.success('Hotel created!', 'Your hotel is ready.')
      navigate('/hotel')
    },
    onError: (e: any) => toast.error('Error', e.response?.data?.message || 'Failed to create hotel'),
  })

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Create Hotel</h1><p className="text-muted-foreground text-sm">Set up your hotel profile</p></div>
      <HotelForm onSubmit={(d) => mutate(d)} loading={isPending} />
    </div>
  )
}

export function EditHotelPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: hotel } = useQuery({ queryKey: ['my-hotel'], queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data) })
  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => hotelApi.update(hotel!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-hotel'] })
      toast.success('Hotel updated!')
      navigate('/hotel')
    },
    onError: (e: any) => toast.error('Error', e.response?.data?.message || 'Failed to update hotel'),
  })

  if (!hotel) return <div className="animate-pulse h-48 bg-slate-200 rounded-xl" />

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Edit Hotel</h1><p className="text-muted-foreground text-sm">Update your hotel information</p></div>
      <HotelForm initial={hotel} onSubmit={(d) => mutate(d)} loading={isPending} />
    </div>
  )
}

export default CreateHotelPage
