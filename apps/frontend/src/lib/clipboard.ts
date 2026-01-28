export async function copyToClipboardFallback(text: string): Promise<boolean> {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    textArea.setSelectionRange(0, textArea.value.length)
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch {
    return false
  }
}

export async function copyToClipboard(
  text: string,
  onError?: (error: string) => void
): Promise<boolean> {
  if (!text) return false

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const fallbackSuccess = await copyToClipboardFallback(text)
      if (!fallbackSuccess && onError) {
        onError('Clipboard unavailable. Use HTTPS or localhost.')
      }
      return fallbackSuccess
    }
  }

  const fallbackSuccess = await copyToClipboardFallback(text)
  if (!fallbackSuccess && onError) {
    onError('Clipboard unavailable. Use HTTPS or localhost.')
  }
  return fallbackSuccess
}

export async function readFromClipboard(
  onError?: (error: string) => void
): Promise<string | null> {
  if (!navigator.clipboard || !(window.isSecureContext ?? false)) {
    const error = 'Clipboard unavailable. Use HTTPS or localhost.'
    if (onError) onError(error)
    return null
  }

  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch {
    const error = 'Clipboard permission denied or unavailable.'
    if (onError) onError(error)
    return null
  }
}
