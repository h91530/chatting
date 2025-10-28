'use client'

import { AlertProvider } from './context/AlertContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      {children}
    </AlertProvider>
  )
}
