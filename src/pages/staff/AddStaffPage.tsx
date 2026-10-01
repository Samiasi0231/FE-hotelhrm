import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hotelApi, staffApi } from '@/api/services'
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common'
import { Loader2 } from 'lucide-react'

const DEPARTMENTS = ['Administration', 'Front Desk', 'Housekeeping', 'Food & Beverage', 'Security', 'Maintenance', 'Human Resources', 'Finance', 'IT', 'Marketing']
const ROLES = ['STAFF', 'ADMIN', 'ADMIN_HR']

export default function AddStaffPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    employeeId: '', department: 'Front Desk', position: '', salary: '', role: 'STAFF', password: '',
  })

  const { data: hotel } = useQuery({ queryKey: ['my-hotel'], queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data) })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => staffApi.onboard(hotel!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff onboarded!'); navigate('/staff') },
    onError: (e: any) => toast.error('Error', e.response?.data?.message || 'Failed to onboard staff'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({ ...form, salary: form.salary ? parseFloat(form.salary) : undefined })
  }

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Add Staff Member</h1><p className="text-muted-foreground text-sm">Onboard a new team member</p></div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>First Name *</Label><Input required placeholder="John" {...f('firstName')} /></div>
              <div className="space-y-1.5"><Label>Last Name *</Label><Input required placeholder="Doe" {...f('lastName')} /></div>
            </div>
            <div className="space-y-1.5"><Label>Email *</Label><Input required type="email" placeholder="john@hotel.com" {...f('email')} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input type="tel" placeholder="+234 800 000 0000" {...f('phone')} /></div>
            <div className="space-y-1.5"><Label>Temporary Password</Label><Input type="password" placeholder="Default: Staff@123" {...f('password')} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Employee ID *</Label><Input required placeholder="EMP001" {...f('employeeId')} /></div>
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Position *</Label><Input required placeholder="Receptionist" {...f('position')} /></div>
            </div>
            <div className="space-y-1.5"><Label>Salary (₦)</Label><Input type="number" min="0" placeholder="150000" {...f('salary')} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/staff')}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Staff Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
