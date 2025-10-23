import { useEffect, useState } from 'react'

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const newLogs: string[] = []

    // 콘솔 로그 캡처
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      newLogs.push(`[LOG] ${args.join(' ')}`)
      originalLog(...args)
    }

    console.error = (...args) => {
      newLogs.push(`[ERROR] ${args.join(' ')}`)
      originalError(...args)
    }

    // API 테스트
    const testApi = async () => {
      try {
        newLogs.push('Starting API tests...')

        // me 엔드포인트 테스트
        console.log('Testing /api/auth/me...')
        const meResponse = await fetch('/api/auth/me')
        const meData = await meResponse.json()
        console.log('ME Response:', meData)

        setLogs([...newLogs, 'Tests completed!'])
      } catch (error) {
        console.error('Test error:', error)
        setLogs([...newLogs])
      }
    }

    testApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">API Test Logs</h1>
      <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-400">로딩 중...</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={log.includes('ERROR') ? 'text-red-400' : 'text-green-400'}
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
