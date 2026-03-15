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
     } catch (_err) {
       const fallbackSuccess = await copyToClipboardFallback(text)
       if (!fallbackSuccess && onError) {
         if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
           onError(
             'Clipboard unavailable. Access this app via HTTPS or localhost to enable clipboard functionality.'
           )
         } else {
           onError('Clipboard unavailable. Try manually copying the text.')
         }
       }
       return fallbackSuccess
     }
   }

   const fallbackSuccess = await copyToClipboardFallback(text)
   if (!fallbackSuccess && onError) {
     if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
       onError(
         'Clipboard unavailable. Access this app via HTTPS or localhost to enable clipboard functionality.'
       )
     } else {
       onError('Clipboard unavailable. Try manually copying the text.')
     }
   }
   return fallbackSuccess
 }

 export async function readFromClipboard(
   onError?: (error: string) => void
 ): Promise<string | null> {
   if (!navigator.clipboard) {
     let error = 'Clipboard API not available in this browser.'

     if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
       error =
         'Clipboard API requires secure context (HTTPS or localhost). Access this app via HTTPS or localhost to enable clipboard functionality.'
     }

     if (onError) onError(error)
     return null
   }

   try {
     const text = await navigator.clipboard.readText()
     return text
   } catch (err) {
     let error = 'Failed to read from clipboard.'

     if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
       error =
         'Clipboard permission denied. Please grant clipboard permissions in your browser settings.'
     } else if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
       error =
         'Clipboard access may be restricted over HTTP. Access this app via HTTPS or localhost.'
     }

     if (onError) onError(error)
     return null
   }
 }
