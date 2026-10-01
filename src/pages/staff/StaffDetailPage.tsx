import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { hotelApi, staffApi, attendanceApi } from '@/api/services'
import { getInitials, formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, Briefcase, DollarSign } from 'lucide-react'

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: hotel } = useQuery({ queryKey: ['my-hotel'], queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data) })
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff-detail', id],
    queryFn: () => staffApi.getById(hotel!.id, id!).then(r => r.data?.data || r.data),
    enabled: !!hotel?.id && !!id,
  })
  const { data: attendance } = useQuery({
    queryKey: ['staff-attendance', id],
    queryFn: () => attendanceApi.getStaffRecords(id!, { limit: 10 }).then(r => r.data?.data || r.data),
    enabled: !!id,
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />
  if (!staff) return <p>Staff member not found</p>

  const u = staff.user

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/staff"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link>
        <h1 className="text-2xl font-bold">Staff Profile</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(u?.firstName, u?.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{u?.firstName} {u?.lastName}</h2>
              <p className="text-muted-foreground">{staff.position} · {staff.department}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${staff.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {staff.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{u?.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{u?.phone || '—'}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /><span>ID: {staff.employeeId}</span></div>
            {staff.salary && <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span>{formatCurrency(staff.salary)}/month</span></div>}
          </div>
        </CardContent>
      </Card>

      {attendance && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Attendance</CardTitle></CardHeader>
          <CardContent>
            {(attendance?.data || attendance || []).length === 0
              ? <p className="text-sm text-muted-foreground">No attendance records</p>
              : (attendance?.data || attendance).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.type === 'CLOCK_IN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{a.type === 'CLOCK_IN' ? '→ Clock In' : '← Clock Out'}</span>
                  <span className="text-muted-foreground">{formatDateTime(a.timestamp)}</span>
                </div>
              ))
            }
          </CardContent>
        </Card>
      )}
    </div>
  )
}
