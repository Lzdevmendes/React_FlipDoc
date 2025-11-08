import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { redis } from '../redis/client'
import pLimit from 'p-limit'

const CONCURRENCY = 3            // quantos jobs ao mesmo tempo
const MAX_RETRIES = 3            // quantas tentativas por job
const QUEUE_KEY = 'convert:queue'
const PROCESSING_KEY = 'convert:processing'

const limit = pLimit(CONCURRENCY)

interface Job {
  id: string
  originalName: string
  path: string
  target: string
  retries: number
  status: 'pending' | 'processing' | 'done' | 'failed'
  downloadPath?: string
  downloadName?: string
  downloadUrl?: string
  error?: string
}

async function runConversion(job: Job): Promise<void> {
  const outdir = path.join(__dirname, '..', '..', 'storage')
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true })

  const ext = job.target === 'pdf' ? 'pdf' : 'docx'
  const outputName = `${Date.now()}-${path.basename(job.originalName)}.${ext}`
  const outputPath = path.join(outdir, outputName)
  const cmd = `libreoffice --headless --convert-to ${ext} --outdir ${outdir} ${job.path}`

  await redis.hset(`job:${job.id}`, 'status', 'processing')
  console.log(`🟡 [${job.id}] Iniciando conversão -> ${ext}`)

  try {
    await new Promise<void>((resolve, reject) => {
      exec(cmd, (err) => (err ? reject(err) : resolve()))
    })

    job.status = 'done'
    job.downloadPath = outputPath
    job.downloadName = outputName
    job.downloadUrl = `/files/${outputName}`

    await redis.hset(`job:${job.id}`, {
      status: 'done',
      downloadPath: outputPath,
      downloadName: outputName,
      downloadUrl: job.downloadUrl,
    })

    console.log(`✅ [${job.id}] Conversão concluída: ${outputName}`)
  } catch (err: any) {
    job.retries += 1
    console.error(`❌ [${job.id}] Erro: ${err.message} (tentativa ${job.retries}/${MAX_RETRIES})`)

    if (job.retries < MAX_RETRIES) {
      await redis.lpush(QUEUE_KEY, JSON.stringify(job)) // Reinsere na fila
      await redis.hset(`job:${job.id}`, {
        status: 'pending',
        retries: job.retries,
        error: err.message,
      })
    } else {
      await redis.hset(`job:${job.id}`, {
        status: 'failed',
        error: err.message,
      })
      console.log(`🚫 [${job.id}] Falhou definitivamente após ${MAX_RETRIES} tentativas`)
    }
  }
}

async function listenQueue() {
  console.log('🚀 Worker de conversão iniciado...')
  while (true) {
    try {
      const result = await redis.brpop(QUEUE_KEY, 0)
      if (!result) continue

      const [, jobStr] = result
      const job: Job = JSON.parse(jobStr)
      await redis.hset(`job:${job.id}`, 'status', 'processing')

      limit(() => runConversion(job)).catch(console.error)
    } catch (err) {
      console.error('Erro no worker:', err)
      await new Promise(r => setTimeout(r, 2000)) // espera 2s antes de tentar de novo
    }
  }
}

listenQueue()
