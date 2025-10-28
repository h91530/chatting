export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <html>
      <body style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ marginTop: '50px' }}>
          <h2 style={{ color: '#333' }}>페이지를 찾을 수 없습니다</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>요청하신 페이지가 존재하지 않습니다.</p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            홈으로 이동
          </a>
        </div>
      </body>
    </html>
  )
}
