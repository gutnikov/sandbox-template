import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

// Платформа задаёт порт переменной окружения. Не хардкодьте номер:
// сэндбокс запускается рядом с другими и получает свой.
const PORT = Number(process.env.PORT ?? 3000)
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const CLIENT_DIR = './dist/client'

const app = new Hono()

// Платформа считает сэндбокс готовым принимать трафик только когда этот
// endpoint отвечает успехом. Если приложению нужно прогреться — отвечайте
// ошибкой, пока не готовы.
app.get('/healthz', (c) => c.json({ status: 'ok' }))

app.get('/api/hello', (c) => c.json({ message: 'Привет из сэндбокса', at: new Date().toISOString() }))

if (IS_PRODUCTION) {
  app.use('/*', serveStatic({ root: CLIENT_DIR }))
  const indexHtml = readFileSync(join(CLIENT_DIR, 'index.html'), 'utf8')
  app.get('*', (c) => c.html(indexHtml))
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Сэндбокс слушает на :${info.port}`)
})
