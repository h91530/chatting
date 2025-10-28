'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import CustomAlert from '@/components/CustomAlert'

interface Alert {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface AlertContextType {
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const showAlert = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    const id = Date.now().toString()
    const newAlert: Alert = { id, message, type, duration }
    setAlerts((prev) => [...prev, newAlert])

    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      }, duration)
    }
  }

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {alerts.map((alert) => (
          <div key={alert.id} style={{ marginBottom: '12px' }}>
            <CustomAlert
              message={alert.message}
              type={alert.type}
              duration={alert.duration}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context
}
