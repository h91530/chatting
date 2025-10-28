// API 요청 시 credentials를 포함하여 쿠키 자동 전송
// 미들웨어가 쿠키를 x-user-id 헤더로 자동 변환
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'include', // 쿠키를 자동으로 포함 → 미들웨어가 x-user-id 헤더로 변환
  })
}
