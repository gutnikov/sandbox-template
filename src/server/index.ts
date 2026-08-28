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

// Платформа кладёт сюда доступ к вашему хранилищу. Ключ серверный: он
// не должен попадать в клиентский бандл.
const storage = {
  url: process.env.SUPABASE_URL ?? null,
  key: process.env.SUPABASE_SECRET_KEY ?? null,
  bucket: process.env.SUPABASE_BUCKET ?? 'sandbox',
}

// Проверка, что хранилище действительно доступно из работающего
// приложения, а не только настроено. Отвечает и без настроек: отсутствие
// хранилища — это ответ, а не повод падать.
app.get('/health/storage', async (c) => {
  if (!storage.url || !storage.key) {
    return c.json({ configured: false, bucket: storage.bucket, reachable: false }, 503)
  }

  try {
    const response = await fetch(`${storage.url}/storage/v1/bucket/${encodeURIComponent(storage.bucket)}`, {
      headers: { authorization: `Bearer ${storage.key}`, apikey: storage.key },
    })
    const body = { configured: true, bucket: storage.bucket, reachable: response.ok, status: response.status }
    return c.json(body, response.ok ? 200 : 503)
  } catch {
    return c.json({ configured: true, bucket: storage.bucket, reachable: false }, 503)
  }
})

if (IS_PRODUCTION) {
  app.use('/*', serveStatic({ root: CLIENT_DIR }))
  const indexHtml = readFileSync(join(CLIENT_DIR, 'index.html'), 'utf8')
  app.get('*', (c) => c.html(indexHtml))
}

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Сэндбокс слушает на :${info.port}`)
})
