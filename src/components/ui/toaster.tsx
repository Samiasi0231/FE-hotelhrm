import * as React from "react"

type ToastType = 'default' | 'success' | 'error' | 'warning'

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...opts, id }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Stand-alone toaster that uses a global event bus
  React.useEffect(() => {
    const handler = (e: CustomEvent<Omit<Toast, 'id'>>) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { ...e.detail, id }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
    }
    window.addEventListener('hotelms-toast' as any, handler as any)
    return () => window.removeEventListener('hotelms-toast' as any, handler as any)
  }, [])

  const colors: Record<ToastType, string> = {
    default: 'bg-white border-slate-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }
  const titleColors: Record<ToastType, string> = {
    default: 'text-slate-900',
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
  }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-xl border shadow-lg p-4 animate-fade-in ${colors[t.type]}`}>
          <p className={`font-semibold text-sm ${titleColors[t.type]}`}>{t.title}</p>
          {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}

// Global toast helper (call without hooks)
export const toast = {
  success: (title: string, description?: string) =>
    window.dispatchEvent(new CustomEvent('hotelms-toast', { detail: { title, description, type: 'success' } })),
  error: (title: string, description?: string) =>
    window.dispatchEvent(new CustomEvent('hotelms-toast', { detail: { title, description, type: 'error' } })),
  warning: (title: string, description?: string) =>
    window.dispatchEvent(new CustomEvent('hotelms-toast', { detail: { title, description, type: 'warning' } })),
  info: (title: string, description?: string) =>
    window.dispatchEvent(new CustomEvent('hotelms-toast', { detail: { title, description, type: 'default' } })),
}
