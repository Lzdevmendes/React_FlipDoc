import React, { useEffect, useRef } from 'react'
import $ from 'jquery'

export default function LegacyUploader({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const $el = $(inputRef.current!)
    $el.on('change', function (this: HTMLInputElement) {
      const f = this.files?.[0]
      if (f) onFile(f)
    })
    return () => { $el.off('change') }
  }, [onFile])

  return <input ref={inputRef} type="file" accept=".doc,.docx,.pdf" />
}
