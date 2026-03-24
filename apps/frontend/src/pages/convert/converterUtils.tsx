import { apiUrl } from '../../lib/api'
import { useOperationStatus, type OperationStatus } from '../../lib/useOperationStatus'

export const parseFilename = (response: Response, fallback: string) => {
  const header = response.headers.get('content-disposition')
  if (!header) {
    return fallback
  }
  const match = header.match(/filename="?([^";]+)"?/)
  return match?.[1] ?? fallback
}

export const downloadResponse = async (response: Response, fallback: string) => {
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = parseFilename(response, fallback)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Status indicator component for converters
export function ConverterStatus({ status, error }: { status: OperationStatus; error: string | null }) {
  if (status === 'idle') return null

  const statusConfig = {
    uploading: { icon: '⬆️', text: 'Uploading...' },
    processing: { icon: '⚙️', text: 'Converting...' },
    downloading: { icon: '⬇️', text: 'Downloading...' },
    success: { icon: '✅', text: 'Done! Download started.' },
    error: { icon: '❌', text: error || 'Failed.' },
  }

  const config = statusConfig[status]
  const isError = status === 'error'

  return (
    <div className={`operation-status ${isError ? 'error' : ''}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.text}</span>
    </div>
  )
}

// Hook for file conversion operations
export function useFileConverter() {
  const operation = useOperationStatus()

  const convert = async (endpoint: string, file: File | null, fallback: string) => {
    if (!file) {
      operation.update('error', 'Select a file first.')
      return
    }

    await operation.run({
      upload: async () => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch(apiUrl(endpoint), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.detail ?? 'Failed.')
        }
      },
      process: async () => {
        // Server handles processing during upload
      },
      download: async () => {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch(apiUrl(endpoint), {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('Failed.')
        await downloadResponse(response, fallback)
      },
    })
  }

  return {
    convert,
    state: operation.state,
    isBusy: operation.isBusy,
    reset: operation.reset,
  }
}
