import { useState, useCallback } from 'react'

export type JobStatus = 'pending' | 'processing' | 'done' | 'failed'

export function useConversion() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startConversion = useCallback(async (file: File, target: 'pdf' | 'docx') => {
    setError(null)
    const form = new FormData()
    form.append('file', file)
    form.append('target', target)

    const res= await fetch('/api/convert', {method: 'POST', body: form})
    if (!res.ok) { setError('Erro ao enviar arquivo'); return }
    const body = await res.json()
    setJobId(body.jobId)
    setStatus('pending')
    return body.jobId

  }, [])

  const checkStatus = useCallback(async (id?: string) => {
    const jid = id ?? jobId
    if (!jid) return
    try {
      const res = await fetch(`/api/jobs/${jid}/status`)
      const body = await res.json()
      setStatus(body.status)
      if (body.status === 'failed') setError(body.error)
      return body
    } catch (e) {
      setError('Erro ao checar status')      
    }
  }, [jobId])

  return { jobId, status, error, startConversion, checkStatus }
}