import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi, hotelApi } from '@/api/services'
import { formatDateTime } from '@/lib/utils'
import { Card, Input } from '@/components/ui/common'
import { Button } from '@/components/ui/button'
import { Search, Activity } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-slate-100 text-slate-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  PAYMENT: 'bg-amber-100 text-amber-700',
  BOOKING: 'bg-purple-100 text-purple-700',
}

const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'BOOKING']
const ENTITIES = ['', 'user', 'hotel', 'room', 'booking', 'payment', 'staff', 'attendance']

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const { data: hotel } = useQuery({
    queryKey: ['my-hotel'],
    queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data),
  })

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', hotel?.id, actionFilter, entityFilter, from, to, page],
    queryFn: () => auditApi.getAll({
      hotelId: hotel?.id,
      action: actionFilter || undefined,
      entity: entityFilter || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: 25,
    }).then(r => r.data?.data || r.data),
    enabled: true,
  })

  const logs = logsData?.data || []
  const meta = logsData?.meta || {}

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">Track all system actions and changes</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1) }}
        >
          {ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={entityFilter}
          onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
        >
          {ENTITIES.map(e => <option key={e} value={e}>{e || 'All Entities'}</option>)}
        </select>
        <Input
          type="date"
          className="h-10 w-40"
          value={from}
          onChange={e => setFrom(e.target.value)}
          placeholder="From date"
        />
        <Input
          type="date"
          className="h-10 w-40"
          value={to}
          onChange={e => setTo(e.target.value)}
          placeholder="To date"
        />
        {(actionFilter || entityFilter || from || to) && (
          <Button variant="outline" size="sm" onClick={() => { setActionFilter(''); setEntityFilter(''); setFrom(''); setTo(''); setPage(1) }}>
            Clear filters
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entity ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">No audit logs found</p>
                  </td>
                </tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-xs">{log.user.firstName} {log.user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{log.user.email}</p>
                      </div>
                    ) : <span className="text-muted-foreground text-xs">System</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium capitalize">{log.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.entityId ? log.entityId.slice(0, 8) + '...' : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
