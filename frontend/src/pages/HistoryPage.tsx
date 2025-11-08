import React, { useEffect, useState } from 'react'

type Job = { id: string, originalName: string, target: string, status: string, createdAt: string }

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs)
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Histórico</h1>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>{j.originalName} → {j.target} — {j.status} — {new Date(j.createdAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  )
}
