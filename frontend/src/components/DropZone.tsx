import React, { useRef } from 'react'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

export default function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const { ref, file, setFile, over } = useDragAndDrop()
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div ref={ref} style={{ border: over ? '2px dashed #1976d2' : '2px dashed #ccc', padding: 16, borderRadius: 8 }}>
      <p>Arraste o arquivo ou <button onClick={() => inputRef.current?.click()}>Selecione</button></p>
      <input ref={inputRef} type="file" accept=".doc,.docx,.pdf" style={{ display: 'none' }} onChange={e => {
        const f = e.target.files?.[0]; if (f) { setFile(f); onFile(f) }
      }} />
      {file && (
        <div><strong>{file.name}</strong> — {(file.size/1024).toFixed(1)} KB</div>
      )}
    </div>
  )
}