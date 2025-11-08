export async function downloadUrlFor(jobId: string) {
  const res = await fetch(`/api/jobs/${jobId}/status`)
  const body = await res.json()
  return body.downloadUrl
}