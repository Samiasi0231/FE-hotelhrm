# HotelMS Frontend

A modern React + TypeScript SaaS dashboard for Hotel Booking & Management.

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit VITE_API_BASE_URL to point to your backend
```

### 3. Start development server
```bash
npm run dev
```

App runs at: http://localhost:5173

### 4. Build for production
```bash
npm run build
```

---

## Folder Structure

```
src/
├── api/
│   ├── client.ts              # Axios instance + interceptors (auth)
│   ├── services.ts            # All API service functions
│   └── onboarding.ts          # Onboarding + public hotel API calls
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── common.tsx         # Input, Label, Card, Badge, etc.
│   │   └── toaster.tsx        # Toast notifications
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx        # Auth state & JWT management
├── hooks/
│   └── useOnboardingGuard.ts  # Redirects HOTEL_DIRECTOR if not onboarded
├── layouts/
│   ├── AuthLayout.tsx         # Login/Register wrapper
│   └── DashboardLayout.tsx    # Sidebar + top nav (runs onboarding guard)
├── lib/
│   └── utils.ts               # formatCurrency, formatDate, cn, etc.
├── pages/
│   ├── auth/                  # Login, Register, ForgotPassword
│   ├── dashboard/             # Analytics dashboard
│   ├── hotel/                 # Hotel profile, create, edit
│   ├── onboarding/            # 5-step hotel setup wizard (NEW)
│   │   └── OnboardingPage.tsx
│   ├── public/                # Public guest-facing pages (NEW)
│   │   └── PublicHotelPage.tsx
│   ├── rooms/                 # Room CRUD + detail
│   ├── bookings/              # Booking list, detail, calendar, new
│   ├── staff/                 # Staff list, add, detail, attendance
│   ├── payments/              # Payment history + revenue
│   ├── super-admin/           # Platform management
│   ├── audit/                 # Audit logs
│   └── settings/              # Profile & password
├── App.tsx                    # Route definitions
├── main.tsx                   # Entry point
└── index.css                  # Tailwind + CSS variables
```

---

## User Roles & Access

| Role            | Dashboard | Hotel | Rooms | Bookings | Staff | Payments | Super Admin |
|----------------|-----------|-------|-------|----------|-------|----------|-------------|
| SUPER_ADMIN    | ✅        | ✅    | ✅    | ✅       | ✅    | ✅       | ✅          |
| HOTEL_DIRECTOR | ✅        | ✅    | ✅    | ✅       | ✅    | ✅       | ❌          |
| ADMIN          | ✅        | ✅    | ✅    | ✅       | ✅    | ✅       | ❌          |
| ADMIN_HR       | ✅        | ✅    | ✅    | ✅       | ✅    | ❌       | ❌          |
| STAFF          | ✅        | ❌    | 👁    | 👁       | ❌    | ❌       | ❌          |

---

## Default Login Credentials (after backend seed)

| Role           | Email                    | Password       |
|----------------|--------------------------|----------------|
| Super Admin    | superadmin@hotelms.com   | SuperAdmin@123 |
| Hotel Director | director@grandhotel.com  | Director@123   |
| Admin          | admin@grandhotel.com     | Admin@123      |
| HR Admin       | hr@grandhotel.com        | HR@123         |

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=HotelMS
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
```

---

## Hotel Onboarding Flow

When a Hotel Director registers, they are automatically logged in and redirected to a 5-step onboarding wizard. They cannot access the main dashboard until onboarding is complete.

```
/register  → auto-login → /onboarding

Step 1  Hotel Info      name, address, city, state, country, phone, email, star rating
Step 2  Amenities       tagline + amenity selection (WiFi, Pool, Gym, etc.)
Step 3  Policies        check-in/out times, cancellation policy, pets, smoking
Step 4  Branding        logo upload (optional, skippable)
Step 5  Done            isOnboarded = true → shows public booking link

/dashboard  (accessible only after step 5)
```

### Onboarding guard
`useOnboardingGuard` runs inside `DashboardLayout`. On every protected page load it calls `GET /hotels/onboarding/status`. If `isOnboarded` is `false`, it redirects the director back to `/onboarding`. Other roles (ADMIN, STAFF, etc.) are unaffected.

### Resume support
If a director closes the browser mid-onboarding, the wizard reads `onboardingStep` from the API on mount and jumps to the correct step automatically.

### Public booking page
After onboarding, the hotel gets a shareable link:
```
https://yourapp.com/book/:slug
```
This page (`PublicHotelPage.tsx`) requires no login and displays the hotel's info, amenities, policies, and available rooms. It uses a separate `publicClient` Axios instance with no Authorization header.

### New files added for onboarding

| File | Purpose |
|------|---------|
| `src/pages/onboarding/OnboardingPage.tsx` | 5-step wizard |
| `src/pages/public/PublicHotelPage.tsx` | Guest-facing booking page |
| `src/hooks/useOnboardingGuard.ts` | Redirect guard hook |
| `src/api/onboarding.ts` | Onboarding API calls + public client |

### Route structure (App.tsx)
```
/login, /register, /forgot-password   → AuthLayout (no auth)
/book/:slug                           → PublicHotelPage (no auth)
/onboarding                           → ProtectedRoute → OnboardingPage (auth, no sidebar)
/dashboard, /hotel, /rooms, ...       → ProtectedRoute → DashboardLayout → page
```
//peyment and booking flows
Guest visits /book/your-hotel-slug
  → picks dates → searches available rooms
  → clicks "Book & Pay ₦40,000"
  → fills name, email, phone
  → clicks "Pay with Paystack"
        ↓
Backend creates booking (PENDING) + initializes Paystack
        ↓
Paystack popup opens in browser (no redirect)
Guest enters card → pays
        ↓
Frontend calls GET /payments/paystack/verify/:ref
Backend verifies with Paystack API → booking → CONFIRMED
        ↓
Two emails fire simultaneously:
  📧 Guest  → beautiful confirmation with ref, dates, hotel contact
  📧 Hotel Director → new booking alert with guest phone, email, requests + dashboard link
        ↓
Success screen shows booking ref + "Check your inbox"
Hotel dashboard /bookings shows booking as CONFIRMED ✅


================================================================================
COMPLETE INTEGRATION GUIDE — Booking + Payment + Staff Tracking + Audit Logs
================================================================================

This guide shows how to integrate all the code files provided into your project.

================================================================================
BACKEND CHANGES
================================================================================

1. UPDATE: src/modules/booking/booking.module.ts
   ──────────────────────────────────────────────────────────────────────────

   import { Module } from '@nestjs/common';
   import { BookingController } from './booking.controller';
   import { BookingService } from './booking.service';
   import { AuditLogModule } from '../audit-log/audit-log.module';
   import { EmailModule } from '../email/email.module';

   @Module({
     imports:    [AuditLogModule, EmailModule],  // ← ADD THIS
     controllers: [BookingController],
     providers:   [BookingService],
     exports:     [BookingService],
   })
   export class BookingModule {}


2. REPLACE: src/modules/booking/booking.service.ts
   ──────────────────────────────────────────────────────────────────────────

   Copy entire content from: /mnt/user-data/outputs/booking.service.complete.ts
   
   Key changes:
   ✅ Imports AuditLogService
   ✅ Logs every status change (CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
   ✅ Includes full staff account details (name, role, employeeId, position)
   ✅ Tracks who did what (checkedInById, checkedOutById, cancelledByUserId)
   ✅ Mandatory cancel reason + refund amount support


3. REPLACE: src/modules/booking/booking.controller.ts
   ──────────────────────────────────────────────────────────────────────────

   Copy entire content from provided file.
   
   Key changes:
   ✅ updateStatus accepts: status, reason, cancelType, refundAmount
   ✅ Uses @CurrentUser() to extract JWT identity (no manual auth)
   ✅ Passes actor info to service for audit logging


4. REPLACE: src/modules/booking/dto/create-booking.dto.ts
   ──────────────────────────────────────────────────────────────────────────

   Copy entire content from: /mnt/user-data/outputs/create-booking.dto.ts
   
   Key changes:
   ✅ Adds optional createdByUserId field (for staff booking tracking)


5. UPDATE: src/modules/payment/payment.module.ts
   ──────────────────────────────────────────────────────────────────────────

   import { Module } from '@nestjs/common';
   import { PaymentController } from './payment.controller';
   import { PaymentService } from './payment.service';
   import { AuditLogModule } from '../audit-log/audit-log.module';

   @Module({
     imports:    [AuditLogModule],  // ← ADD THIS
     controllers: [PaymentController],
     providers:   [PaymentService],
     exports:     [PaymentService],
   })
   export class PaymentModule {}


6. REPLACE: src/modules/payment/payment.service.ts
   ──────────────────────────────────────────────────────────────────────────

   Copy entire content from: /mnt/user-data/outputs/payment.service.complete.ts
   
   Key changes:
   ✅ recordManualPayment → any staff records CASH/POS/BANK_TRANSFER
   ✅ approveManualPayment → DIRECTOR/ADMIN approves (booking confirmed)
   ✅ rejectManualPayment → DIRECTOR/ADMIN rejects (booking stays PENDING)
   ✅ All actions logged to audit table
   ✅ Full actor display (name, role, email) on every approval/rejection


7. REPLACE: src/modules/payment/payment.controller.ts
   ──────────────────────────────────────────────────────────────────────────

   Copy entire content from: /mnt/user-data/outputs/payment.controller.complete.ts
   
   Key changes:
   ✅ POST /payments/manual → record manual payment (any staff)
   ✅ PATCH /payments/:id/approve → approve manual (director/admin)
   ✅ PATCH /payments/:id/reject → reject manual (director/admin)
   ✅ GET /payments/hotel/:hotelId/pending → list pending approvals


8. ENSURE: AuditLogModule is imported in all relevant modules
   ──────────────────────────────────────────────────────────────────────────

   Modules using AuditLogService:
   - BookingModule ✅
   - PaymentModule ✅
   - (Optional) StaffModule, HotelModule


9. VERIFY: DatabaseMigration
   ──────────────────────────────────────────────────────────────────────────

   Check your prisma/schema.prisma includes:
   ✅ AuditLog model (provided in doc index 19)
   ✅ Booking fields: checkedInById, checkedOutById, cancelledByUserId, cancelType, refundAmount
   ✅ Payment fields: recordedByUserId, recordedAt, approvedByUserId, approvedAt,
                      approvalNote, rejectionReason, isManual, manualStatus
   ✅ Staff model with proper relationships

   Run migration:
   npx prisma migrate dev --name "add-audit-booking-payment-fields"


================================================================================
FRONTEND CHANGES
================================================================================

1. UPDATE: src/api/services.ts
   ──────────────────────────────────────────────────────────────────────────

   Already provided in your codebase (doc index 18).
   Ensure all booking & payment methods are present:

   bookingApi.create() ✅
   bookingApi.updateStatus(id, status, reason, cancelType, refundAmount) ✅
   
   paymentApi.recordManual() ✅
   paymentApi.approveManual() ✅
   paymentApi.rejectManual() ✅
   paymentApi.getPendingApprovals() ✅


2. UPDATE: src/pages/bookings/NewBookingPage.tsx
   ──────────────────────────────────────────────────────────────────────────

   ADD: Payment method selector after step 3 (before "Create Booking")

   ```tsx
   const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'MANUAL' | null>(null)

   // In step 3, after guest info form:
   <div className="space-y-2">
     <Label>Payment Method *</Label>
     <div className="flex gap-2">
       <button
         onClick={() => setPaymentMethod('ONLINE')}
         className={`px-4 py-2 rounded-lg text-sm font-medium ${
           paymentMethod === 'ONLINE'
             ? 'bg-blue-600 text-white'
             : 'bg-slate-100 text-slate-700'
         }`}
       >
         💳 Online (Paystack)
       </button>
       <button
         onClick={() => setPaymentMethod('MANUAL')}
         className={`px-4 py-2 rounded-lg text-sm font-medium ${
           paymentMethod === 'MANUAL'
             ? 'bg-green-600 text-white'
             : 'bg-slate-100 text-slate-700'
         }`}
       >
         💵 Cash / POS
       </button>
     </div>
   </div>

   // Then:
   if (paymentMethod === 'ONLINE') {
     // Existing flow: bookingApi.create() → then paymentApi.initiatePaystack()
   } else if (paymentMethod === 'MANUAL') {
     // New flow: bookingApi.create() → then paymentApi.recordManual()
   }
   ```


3. UPDATE: src/pages/bookings/BookingDetailPage.tsx
   ──────────────────────────────────────────────────────────────────────────

   Already mostly provided. ADD this to the actions section:

   ```tsx
   // If booking is PENDING and current user is DIRECTOR/ADMIN:
   // Show quick-approve button for manual payments
   {booking.status === 'PENDING' && isPending && (
     <button
       onClick={() => {
         const note = prompt('Approval note (optional):')
         paymentApi.approveManual(
           booking.payments[0].id,
           { approvalNote: note }
         ).then(() => {
           qc.invalidateQueries({ queryKey: ['booking', id] })
           toast.success('Payment approved — booking confirmed')
         })
       }}
       className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
     >
       Approve Payment
     </button>
   )}

   // And show payment details with who recorded/approved it:
   {payment.recordedByUser && (
     <p className="text-xs text-slate-500">
       Recorded by: {payment.recordedByUser.firstName} {payment.recordedByUser.lastName}
     </p>
   )}
   {payment.approvedByUser && (
     <p className="text-xs text-slate-500">
       Approved by: {payment.approvedByUser.firstName} {payment.approvedByUser.lastName}
     </p>
   )}
   ```


4. CREATE: src/pages/payments/PendingApprovalsPage.tsx (Optional)
   ──────────────────────────────────────────────────────────────────────────

   New page for directors/admins to approve/reject manual payments.

   ```tsx
   import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
   import { paymentApi, hotelApi } from '@/api/services'
   import { Button } from '@/components/ui/button'
   import { Card } from '@/components/ui/common'
   import { formatCurrency, formatDate } from '@/lib/utils'
   import { Check, X } from 'lucide-react'

   export default function PendingApprovalsPage() {
     const qc = useQueryClient()
     const { data: hotel } = useQuery({
       queryKey: ['my-hotel'],
       queryFn: () => hotelApi.getMyHotel().then(r => r.data?.data || r.data),
     })

     const { data: pending = [] } = useQuery({
       queryKey: ['pending-approvals', hotel?.id],
       queryFn: () => paymentApi.getPendingApprovals(hotel!.id),
       enabled: !!hotel?.id,
     })

     const { mutate: approve } = useMutation({
       mutationFn: (paymentId: string) =>
         paymentApi.approveManual(paymentId, {}),
       onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['pending-approvals'] })
         qc.invalidateQueries({ queryKey: ['bookings'] })
       },
     })

     const { mutate: reject } = useMutation({
       mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
         paymentApi.rejectManual(paymentId, { reason }),
       onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['pending-approvals'] })
       },
     })

     if (pending.length === 0) {
       return <p className="text-muted-foreground">No pending approvals</p>
     }

     return (
       <div className="space-y-4">
         <h2 className="text-xl font-bold">Payment Approvals</h2>
         {pending.map((p: any) => (
           <Card key={p.id} className="p-4">
             <div className="flex items-start justify-between">
               <div>
                 <p className="font-bold">{p.booking.bookingRef}</p>
                 <p className="text-sm">{p.booking.guestName}</p>
                 <p className="text-sm text-muted-foreground">
                   {formatCurrency(p.amount)} · {formatDate(p.booking.checkIn)}
                 </p>
                 <p className="text-xs text-slate-500 mt-1">
                   Recorded by: {p.recordedByUser?.firstName} {p.recordedByUser?.lastName}
                 </p>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   onClick={() => approve(p.id)}
                   className="bg-green-600 hover:bg-green-700"
                 >
                   <Check className="w-4 h-4 mr-1" /> Approve
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   onClick={() => {
                     const reason = prompt('Rejection reason:')
                     if (reason) reject({ paymentId: p.id, reason })
                   }}
                 >
                   <X className="w-4 h-4 mr-1" /> Reject
                 </Button>
               </div>
             </div>
           </Card>
         ))}
       </div>
     )
   }
   ```


5. UPDATE: src/contexts/AuthContext.tsx
   ──────────────────────────────────────────────────────────────────────────

   Already provided in this guide (section "Complete Updated AuthContext").
   Copy to replace existing file.


================================================================================
AUDIT LOG VISIBILITY
================================================================================

The audit logs page (AuditLogsPage) should now show:
✅ Booking created
✅ Booking confirmed (payment received)
✅ Booking checked in (by which staff)
✅ Booking checked out (by which staff)
✅ Booking cancelled (with reason, type, refund amount, by whom)
✅ Payment recorded (cash/POS/transfer, by whom)
✅ Payment approved (by whom, approval note)
✅ Payment rejected (by whom, reason)

Directors can filter by:
- Action (CREATE, BOOKING, PAYMENT, etc.)
- Entity (Booking, Payment)
- Date range
- Staff member (via userId)


Frontend

src/api/services.ts — rosterApi with all methods (week, my-week, entries, bulk, columns, staff reorder/visibility, publish/lock/unlock)
src/pages/staff/RosterPage.tsx — full grid (above)
src/pages/staff/MyRosterPage.tsx — staff's own read-only view
src/pages/settings/RosterSettingsPage.tsx — shift types, columns, staff order/visibility
Routes in App.tsx: /roster, /roster/mine, /settings/roster


================================================================================
DATABASE MIGRATIONS
================================================================================

Ensure these fields exist in Booking table:
- checkedInById (String, FK to Staff.id)
- checkedOutById (String, FK to Staff.id)
- cancelledByUserId (String, FK to User.id)
- cancelType (String, e.g., 'REFUND', 'NO_REFUND')
- refundAmount (Decimal)

Ensure these fields exist in Payment table:
- recordedByUserId (String, FK to User.id)
- recordedAt (DateTime)
- approvedByUserId (String, FK to User.id)
- approvedAt (DateTime)
- approvalNote (String)
- rejectionReason (String)
- isManual (Boolean)
- manualStatus (ManualPaymentStatus enum)

Ensure AuditLog table exists with:
- id, userId, hotelId, action, entity, entityId, oldValues, newValues, ipAddress, userAgent, createdAt

Run:
npx prisma migrate dev --name "booking-payment-audit-complete"


================================================================================
TESTING CHECKLIST
================================================================================

Backend Tests:
☐ POST /bookings → creates PENDING booking
☐ POST /payments/manual → records manual payment (PENDING_APPROVAL)
☐ PATCH /payments/:id/approve → confirms booking, marks room OCCUPIED
☐ PATCH /payments/:id/reject → keeps booking PENDING
☐ PATCH /bookings/:id/status (CONFIRMED) → room marked OCCUPIED, audit logged
☐ PATCH /bookings/:id/status (CHECKED_IN) → checkedInById set, audit logged
☐ PATCH /bookings/:id/status (CHECKED_OUT) → room marked AVAILABLE, audit logged
☐ PATCH /bookings/:id/status (CANCELLED) → room marked AVAILABLE, refund if needed
☐ GET /audit-logs → shows all actions with actor details

Frontend Tests:
☐ NewBookingPage: can select payment method (Online / Manual)
☐ Manual flow: create → record payment → shows "awaiting approval"
☐ Director can approve payment → booking confirmed → room unavailable
☐ Audit page shows all actions with staff names
☐ Booking detail shows who checked in/out (with timestamp)
☐ Booking detail shows cancel reason, type, refund amount, who cancelled


================================================================================
DEPLOYMENT CHECKLIST
================================================================================

☐ AuditLogService is injected into BookingService and PaymentService
☐ All try-catch blocks on auditLog.create() calls (never block main flow on logging)
☐ @CurrentUser() decorator works (extract from JWT payload)
☐ RolesGuard applies to approval/rejection endpoints (DIRECTOR/ADMIN only)
☐ @Public() decorator on GET /payments/paystack/verify/:reference
☐ Env vars set: PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, FRONTEND_URL
☐ Database migrated and includes all new fields
☐ Frontend services updated to call new endpoints
☐ AuditLogsPage accessible to directors
☐ PendingApprovalsPage accessible to directors/admins (if created)


================================================================================
END OF INTEGRATION GUIDE
================================================================================

All files are provided in /mnt/user-data/outputs:
- booking.service.complete.ts
- payment.service.complete.ts
- payment.controller.complete.ts
- create-booking.dto.ts
- AuthContext.tsx (from earlier)

Copy-paste each file into your project and run migrations.
All audit logging is fire-and-forget (won't block booking/payment flows).