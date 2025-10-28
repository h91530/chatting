'use client'

import { useEffect, useState } from 'react'

interface CustomAlertProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export default function CustomAlert({
  message,
  type,
  duration = 3000,
  onClose,
}: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: {
      bgColor: '#f0fdf4',
      borderColor: '#86efac',
      textColor: '#166534',
      icon: '✓',
    },
    error: {
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      icon: '✕',
    },
    warning: {
      bgColor: '#fffbeb',
      borderColor: '#fde047',
      textColor: '#92400e',
      icon: '!',
    },
    info: {
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
      textColor: '#0c4a6e',
      icon: 'ⓘ',
    },
  }

  const style = typeStyles[type]

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          background: style.bgColor,
          border: `1px solid ${style.borderColor}`,
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          minWidth: '300px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.textColor,
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {style.icon}
        </div>
        <p
          style={{
            color: style.textColor,
            margin: 0,
            fontSize: '14px',
            fontWeight: '500',
            flex: 1,
          }}
        >
          {message}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: style.textColor,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
