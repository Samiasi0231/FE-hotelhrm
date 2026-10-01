import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/common'
import { CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, call the API
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h2>
      <p className="text-slate-500 text-sm mb-6">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email address</Label>
          <Input type="email" placeholder="you@hotel.com" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}
