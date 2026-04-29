'use client'

import { useState, useEffect } from 'react'

type ConsentState = 'accepted' | 'declined' | null

const STORAGE_KEY = 'cookie-consent'

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null
    setConsent(stored)
    setLoaded(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setConsent('accepted')
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setConsent('declined')
  }

  // Show the banner only when we've loaded from storage and no decision exists yet
  const showBanner = loaded && consent === null

  return { consent, showBanner, accept, decline }
}
