import { useState } from 'react'

export type OperationStatus = 'idle' | 'uploading' | 'processing' | 'downloading' | 'success' | 'error'

export interface OperationState {
  status: OperationStatus
  error: string | null
  progress: number
}

const statusMessages: Record<OperationStatus, string | null> = {
  idle: null,
  uploading: 'Uploading file...',
  processing: 'Processing...',
  downloading: 'Downloading...',
  success: 'Done! Download started.',
  error: null,
}

export function useOperationStatus() {
  const [state, setState] = useState<OperationState>({
    status: 'idle',
    error: null,
    progress: 0,
  })

  const update = (status: OperationStatus, error: string | null = null) => {
    setState({ status, error, progress: status === 'idle' ? 0 : state.progress })
  }

  const reset = () => {
    setState({ status: 'idle', error: null, progress: 0 })
  }

  const run = async (
    operations: {
      upload?: () => Promise<unknown>
      process?: () => Promise<unknown>
      download?: () => Promise<unknown>
    }
  ) => {
    reset()
    try {
      if (operations.upload) {
        update('uploading')
        await operations.upload()
      }
      if (operations.process) {
        update('processing')
        await operations.process()
      }
      if (operations.download) {
        update('downloading')
        await operations.download()
      }
      update('success')
      return true
    } catch (err) {
      update('error', err instanceof Error ? err.message : 'Operation failed.')
      return false
    }
  }

  const getMessage = () => state.error || statusMessages[state.status]

  return {
    state,
    update,
    reset,
    run,
    getMessage,
    isBusy: state.status !== 'idle' && state.status !== 'success' && state.status !== 'error',
  }
}
