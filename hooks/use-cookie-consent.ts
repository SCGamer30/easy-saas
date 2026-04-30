'use client'

import { useSyncExternalStore } from 'react'

type ConsentState = 'accepted' | 'declined' | null

const STORAGE_KEY = 'cookie-consent'

function readConsent(): ConsentState {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'accepted' || stored === 'declined' ? stored : null
}

function readServerConsent(): ConsentState {
  return null
}

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener('cookie-consent-change', onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener('cookie-consent-change', onStoreChange)
  }
}

function subscribeMounted() {
  return () => {}
}

function notifyConsentChange() {
  window.dispatchEvent(new Event('cookie-consent-change'))
}

export function useCookieConsent() {
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  )
  const consent = useSyncExternalStore(subscribeConsent, readConsent, readServerConsent)

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    notifyConsentChange()
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    notifyConsentChange()
  }

  const showBanner = mounted && consent === null

  return { consent, showBanner, accept, decline }
}
