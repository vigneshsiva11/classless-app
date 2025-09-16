"use client"

import { useEffect, useState } from 'react'
import { getStoredLanguage, setStoredLanguage, type SupportedLanguage } from '@/lib/utils'

export function useLanguage(): SupportedLanguage {
  const [lang, setLang] = useState<SupportedLanguage>(
    typeof window !== 'undefined' ? getStoredLanguage() : 'en'
  )

  useEffect(() => {
    const handler = (e: Event) => {
      // @ts-ignore
      const next = e?.detail?.lang as SupportedLanguage | undefined
      setLang(next || getStoredLanguage())
    }
    window.addEventListener('classless:language-changed', handler)
    return () => window.removeEventListener('classless:language-changed', handler)
  }, [])

  return lang
}

export { setStoredLanguage }

