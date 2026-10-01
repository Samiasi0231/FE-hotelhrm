import axios from 'axios'
import apiClient from './client'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL|| 'http://localhost:3000/api/v1'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:      (data: { email: string; password: string }) => apiClient.post('/auth/login', data),
  register:   (data: any)                                 => apiClient.post('/auth/register', data),
  logout:     ()                                          => apiClient.post('/auth/logout'),
  getProfile: ()                                          => apiClient.get('/auth/profile'),
  refresh:    (userId: string, refreshToken: string)      => apiClient.post('/auth/refresh', { userId, refreshToken }),

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    apiClient.put('/auth/profile', data),

  loginSuperAdmin: (data: { email: string; password: string }) =>
    apiClient.post('/auth/super-admin/login', data),

  
  // Upload user avatar → returns { id, avatar: 'https://res.cloudinary.com/...' }
  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return apiClient.post('/auth/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Hotels ───────────────────────────────────────────────────────────────────
export const hotelApi = {
  create:     (data: any)              => apiClient.post('/hotels', data),
  getAll:     (params?: any)           => apiClient.get('/hotels', { params }),
  getMyHotel: ()                       => apiClient.get('/hotels/my-hotel'),
  getById:    (id: string)             => apiClient.get(`/hotels/${id}`),
  update:     (id: string, data: any)  => apiClient.put(`/hotels/${id}`, data),
  getStats:   (id: string)             => apiClient.get(`/hotels/${id}/stats`),

  // Upload hotel logo → backend sends to Cloudinary, returns { id, logo: url }
  uploadLogo: (id: string, file: File) => {
    const form = new FormData()
    form.append('logo', file)
    return apiClient.post(`/hotels/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // ── Policies ────────────────────────────────────────────────────────────────
  getPolicies: () =>
    apiClient.get('/hotels/my/policies'),

  updatePolicies: (data: {
    checkInTime?:        string
    checkOutTime?:       string
    cancellationPolicy?: string
    petsAllowed?:        boolean
    smokingAllowed?:     boolean
    extraRules?:         string
  }) => apiClient.patch('/hotels/my/policies', data),
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingApi = {
  getStatus:   ()                                        => apiClient.get('/hotels/onboarding/status'),
  createHotel: (data: any)                               => apiClient.post('/hotels', data),
  saveStep:    (step: number, data: Record<string, any>) =>
    apiClient.patch('/hotels/onboarding/step', { step, data }),

  // Same endpoint as hotelApi.uploadLogo — Cloudinary on the backend
  uploadLogo: (hotelId: string, file: File) => {
    const form = new FormData()
    form.append('logo', file)
    return apiClient.post(`/hotels/${hotelId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Public (no auth) ─────────────────────────────────────────────────────────
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const publicApi = {
  getHotel: (slug: string) =>
    publicClient.get(`/hotels/public/${slug}`),
  getAvailableRooms: (slug: string, checkIn: string, checkOut: string) =>
    publicClient.get(`/public/hotels/${slug}/rooms/available`, { params: { checkIn, checkOut } }),
  createBooking: (slug: string, data: any) =>
    publicClient.post(`/public/hotels/${slug}/book`, data),
  verifyPayment: (reference: string) =>
    publicClient.get(`/payments/paystack/verify/${reference}`),
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export const roomApi = {
  create:            (hotelId: string, data: any)                      => apiClient.post(`/hotels/${hotelId}/rooms`, data),
  getAll:            (hotelId: string, params?: any)                   => apiClient.get(`/hotels/${hotelId}/rooms`, { params }),
  getById:           (hotelId: string, id: string)                     => apiClient.get(`/hotels/${hotelId}/rooms/${id}`),
  update:            (hotelId: string, id: string, data: any)          => apiClient.put(`/hotels/${hotelId}/rooms/${id}`, data),
  delete:            (hotelId: string, id: string)                     => apiClient.delete(`/hotels/${hotelId}/rooms/${id}`),
  checkAvailability: (hotelId: string, data: any)                      => apiClient.post(`/hotels/${hotelId}/rooms/availability`, data),
  uploadImages:      (hotelId: string, id: string, files: FileList | File[]) => {
    const form = new FormData()
    Array.from(files).forEach(f => form.append('images', f))
    return apiClient.post(`/hotels/${hotelId}/rooms/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (hotelId: string, id: string, imageUrl: string) =>
    apiClient.delete(`/hotels/${hotelId}/rooms/${id}/images`, { params: { url: imageUrl } }),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingApi = {
  create:  (data: any)                     => apiClient.post('/bookings', data),
  getAll:  (hotelId: string, params?: any) => apiClient.get(`/bookings/hotel/${hotelId}`, { params }),
  getById: (id: string)                    => apiClient.get(`/bookings/${id}`),

  updateStatus: (
    id:            string,
    status:        string,
    reason?:       string,
    cancelType?:   string,
    refundAmount?: number,
  ) =>
    apiClient.patch(`/bookings/${id}/status`, {
      status,
      ...(reason       !== undefined && { reason }),
      ...(cancelType   !== undefined && { cancelType }),
      ...(refundAmount !== undefined && { refundAmount }),
    }),

  getCalendar: (hotelId: string, year: number, month: number) =>
    apiClient.get(`/bookings/calendar/${hotelId}`, { params: { year, month } }),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentApi = {
  initiatePaystack:    (data: any)         => apiClient.post('/payments/paystack/initiate', data),
  verifyPaystack:      (reference: string) => apiClient.get(`/payments/paystack/verify/${reference}`),
  initiateFlutterwave: (data: any)         => apiClient.post('/payments/flutterwave/initiate', data),

  recordManual: (data: {
    bookingId:     string
    paymentMethod: 'CASH' | 'POS' | 'BANK_TRANSFER'
    note?:         string
    amount?:       number
  }) => apiClient.post('/payments/manual', data),

  approveManual: (paymentId: string, approvalNote?: string) =>
    apiClient.patch(`/payments/${paymentId}/approve`, { approvalNote }),

  rejectManual: (paymentId: string, reason: string) =>
    apiClient.patch(`/payments/${paymentId}/reject`, { reason }),

  getPendingApprovals: (hotelId: string) =>
    apiClient.get(`/payments/hotel/${hotelId}/pending`),

  getByHotel: (hotelId: string, params?: any) =>
    apiClient.get(`/payments/hotel/${hotelId}`, { params }),
  getRevenue: (hotelId: string) =>
    apiClient.get(`/payments/hotel/${hotelId}/revenue`),
}

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staffApi = {
  onboard:        (hotelId: string, data: any)             => apiClient.post(`/hotels/${hotelId}/staff`, data),
  getAll:         (hotelId: string, params?: any)           => apiClient.get(`/hotels/${hotelId}/staff`, { params }),
  getById:        (hotelId: string, id: string)             => apiClient.get(`/hotels/${hotelId}/staff/${id}`),
  update:         (hotelId: string, id: string, data: any)  => apiClient.put(`/hotels/${hotelId}/staff/${id}`, data),
  deactivate:     (hotelId: string, id: string)             => apiClient.patch(`/hotels/${hotelId}/staff/${id}/deactivate`),
  getDepartments: (hotelId: string)                         => apiClient.get(`/hotels/${hotelId}/staff/departments`),
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceApi = {
  clockIn: (staffId: string, latitude: number, longitude: number) =>
    apiClient.post('/attendance/clock-in', { staffId, latitude, longitude }),
  clockOut: (staffId: string, latitude: number, longitude: number, note?: string) =>
    apiClient.post('/attendance/clock-out', { staffId, latitude, longitude, note }),

  getTodayStatus:  () => apiClient.get('/attendance/today-status'),
  getDailyRecords: (hotelId: string, date?: string) => apiClient.get(`/attendance/daily/${hotelId}`, { params: { date } }),
  getWeeklyReport: (hotelId: string, weekStart?: string) => apiClient.get(`/attendance/weekly/${hotelId}`, { params: { weekStart } }),
  getStaffRecords: (staffId: string, params?: any) => apiClient.get(`/attendance/staff/${staffId}`, { params }),

  // ── Geofence settings — Director/Admin only, enforced server-side ─────────
  getSettings: (hotelId: string) => apiClient.get(`/attendance/settings/${hotelId}`),
  setLocation: (hotelId: string, data: {
  latitude?: number;
  longitude?: number;
  attendanceRadiusM?: number;
  attendanceGeofenceEnabled?: boolean;
  attendanceGeofenceType?: 'CIRCLE' | 'POLYGON';
  attendanceGeofencePoints?: { lat: number; lng: number }[];
}) => apiClient.patch(`/attendance/settings/${hotelId}`, data),
  toggleGeofence: (hotelId: string, enabled: boolean) =>
    apiClient.patch(`/attendance/settings/${hotelId}/toggle`, { enabled }),
}
// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getHotelDashboard:      (hotelId: string)                 => apiClient.get(`/dashboard/hotel/${hotelId}`),
  getSuperAdminDashboard: ()                                => apiClient.get('/dashboard/super-admin'),
  getRevenueChart:        (hotelId: string, period: string) =>
    apiClient.get(`/dashboard/hotel/${hotelId}/revenue-chart`, { params: { period } }),
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditApi = {
  getAll: (params?: any) => apiClient.get('/audit-logs', { params }),
}

// ─── Super Admin ──────────────────────────────────────────────────────────────
export const superAdminApi = {
  getStats:           ()                                         => apiClient.get('/super-admin/stats'),
  getHotels:          (params?: any)                             => apiClient.get('/super-admin/hotels', { params }),
  suspendHotel:       (id: string, reason?: string)              => apiClient.patch(`/super-admin/hotels/${id}/suspend`, { reason }),
  activateHotel:      (id: string)                               => apiClient.patch(`/super-admin/hotels/${id}/activate`),
  updateSubscription: (id: string, plan: string, months: number) =>
  apiClient.patch(`/super-admin/hotels/${id}/subscription`, { plan, months }),
  getUsers:           (params?: any)                             => apiClient.get('/super-admin/users', { params }),
  toggleUserStatus:   (id: string)                               => apiClient.patch(`/super-admin/users/${id}/toggle-status`),
}

// ─── Platform Branding ────────────────────────────────────────────────────────
export const platformApi = {
  // Public — no auth, called by every sidebar on load
  getLogo: () =>
    publicClient.get('/super-admin/branding/logo'),

  // Super Admin only — uploads to Cloudinary via backend
  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('logo', file)
    return apiClient.post('/super-admin/branding/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// REPLACE the existing inviteApi block in src/api/services.ts with this.


export const inviteApi = {
  create: (data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
    role: string
    position?: string
    department?: string
    employeeId?: string
    salary?: number
    hotelId?: string
  }) => apiClient.post('/auth/invite', data),

  validate: (token: string) =>
    publicClient.get(`/auth/invite/${token}`),

  accept: (data: { token: string; password: string }) =>
    publicClient.post('/auth/invite/accept', data),

  // Director/Admin toggles a staff member's login access directly —
  // works whether or not they ever accepted their invite.
  revokeAccess: (staffId: string) =>
    apiClient.patch(`/staff/${staffId}/revoke-access`),

  grantAccess: (staffId: string) =>
    apiClient.patch(`/staff/${staffId}/grant-access`),
}


// ─── Roster ───────────────────────────────────────────────────────────────────
export const rosterApi = {
  getShiftTypes: (hotelId: string) => apiClient.get(`/roster/hotel/${hotelId}/shift-types`),
  createShiftType: (hotelId: string, data: any) => apiClient.post(`/roster/hotel/${hotelId}/shift-types`, data),
  deactivateShiftType: (id: string) => apiClient.delete(`/roster/shift-types/${id}`),

  getWeek: (hotelId: string, weekStart: string) =>
    apiClient.get(`/roster/hotel/${hotelId}/week`, { params: { weekStart } }),

  // ── Staff's own view ──
  getMyWeek: (hotelId: string, weekStart: string) =>
    apiClient.get(`/roster/hotel/${hotelId}/my-week`, { params: { weekStart } }),

  upsertEntry: (rosterId: string, data: any) => apiClient.patch(`/roster/${rosterId}/entries`, data),
  bulkUpsertEntries: (rosterId: string, entries: any[]) => apiClient.patch(`/roster/${rosterId}/entries/bulk`, { entries }),
  bulkSetCellValues: (rosterId: string, values: { staffId: string; columnId: string; value?: string }[]) =>
  apiClient.patch(`/roster/${rosterId}/cell-values/bulk`, { values }),
  publish: (rosterId: string) => apiClient.patch(`/roster/${rosterId}/publish`),
  lock: (rosterId: string) => apiClient.patch(`/roster/${rosterId}/lock`),
  unlock: (rosterId: string) => apiClient.patch(`/roster/${rosterId}/unlock`),

    getColumns: (hotelId: string) => apiClient.get(`/roster/hotel/${hotelId}/columns`),
  createColumn: (hotelId: string, data: { label: string; type?: string }) =>
    apiClient.post(`/roster/hotel/${hotelId}/columns`, data),
  deactivateColumn: (id: string) => apiClient.delete(`/roster/columns/${id}`),
  reorderColumns: (hotelId: string, columnIds: string[]) =>
    apiClient.patch(`/roster/hotel/${hotelId}/columns/reorder`, { columnIds }),
  setCellValue: (rosterId: string, data: { staffId: string; columnId: string; value?: string }) =>
    apiClient.patch(`/roster/${rosterId}/cell-values`, data),

  reorderStaff: (staffIds: string[]) => apiClient.patch(`/roster/staff/reorder`, { staffIds }),
  toggleStaffVisibility: (staffId: string, hidden: boolean) =>
    apiClient.patch(`/roster/staff/${staffId}/visibility`, { hidden }),


}