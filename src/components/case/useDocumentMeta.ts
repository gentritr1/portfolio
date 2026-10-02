import { useEffect } from 'react'

/** Sets the document title and meta description while the page is mounted, then restores both. */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousTitle = document.title
    const previousDescription = meta?.content
    document.title = title
    if (meta) meta.content = description
    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== undefined) meta.content = previousDescription
    }
  }, [title, description])
}
