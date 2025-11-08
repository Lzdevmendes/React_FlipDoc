import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

// storage temporário local (exemplo)
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
})
const upload = multer({ storage })

const router = express.Router()

// in-memory job store (exemplo). Em produção use Postgres e persistência.
const JOBS: Record<string, any> = {}

router.post('/convert', upload.single('file'), async (req, res) => {
  const file = req.file
  const target = req.body.target || 'pdf'
  if (!file) return res.status(400).json({ error: 'No file' })

  const jobId = uuidv4()
  JOBS[jobId] = { id: jobId, originalName: file.originalname, path: file.path, target, status: 'pending', createdAt: new Date().toISOString() }

  // em produção: push para Redis queue; aqui, apenas sinalizamos
  // Example: await redis.lpush('convert:queue', JSON.stringify({ jobId }))

  return res.json({ jobId })
})

router.get('/jobs/:id/status', (req, res) => {
  const job = JOBS[req.params.id]
  if (!job) return res.status(404).json({ error: 'Job not found' })
  return res.json({ status: job.status, downloadUrl: job.downloadUrl || null })
})

router.get('/jobs', (req, res) => {
  return res.json(Object.values(JOBS))
})

router.get('/jobs/:id/download', (req, res) => {
  const job = JOBS[req.params.id]
  if (!job) return res.status(404).send('Not found')
  if (job.status !== 'done') return res.status(400).send('Not ready')
  return res.download(job.downloadPath, job.downloadName)
})

export default router
