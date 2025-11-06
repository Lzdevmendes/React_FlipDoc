  import React from 'react'
  import DropZone from '../components/DropZone'
  import LegacyUploader from '../components/LegacyUploader'
  import { useConversion } from '../hooks/useConversion'
  import { usePolling } from '../hooks/usePolling'

  export default function UploadPage() {
  const { jobId, status, error, startConversion, checkStatus } = useConversion()

  usePolling(async () => { if (jobId && status !== 'done' && status !== 'failed') await checkStatus() }, 2000, !!jobId && status !== 'done' && status !== 'failed')

  return (
    <div style={{ padding: 16 }}>
      <h1>DocSwitcher</h1>
      <DropZone onFile={(file) => startConversion(file, file.name.endsWith('.pdf') ? 'docx' : 'pdf')} />

      <div style={{ marginTop: 16 }}>
        <p>Ou use o uploader legado (jQuery):</p>
        <LegacyUploader onFile={(file) => startConversion(file, file.name.endsWith('.pdf') ? 'docx' : 'pdf')} />
      </div>

      <div style={{ marginTop: 24 }}>
        <p>Job: {jobId}</p>
        <p>Status: {status}</p>
        {status === 'done' && jobId && <a href={`/api/jobs/${jobId}/download`}>Baixar arquivo convertido</a>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  )
}
