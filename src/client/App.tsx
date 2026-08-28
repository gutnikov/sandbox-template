import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'

export function App() {
  const [message, setMessage] = useState<string>()
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hello')
      const body = (await response.json()) as { message: string }
      setMessage(body.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Ваш сэндбокс</h1>
        <p className="text-muted-foreground">
          Это заготовка приложения: React и Vite на фронте, Hono на сервере. Правьте что угодно —
          после push платформа соберёт и выкатит новую версию.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={ask} disabled={loading}>
          {loading ? 'Спрашиваю…' : 'Позвать сервер'}
        </Button>
        {message && <span className="text-muted-foreground text-sm">{message}</span>}
      </div>
    </main>
  )
}
