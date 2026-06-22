const BASE = 'https://chargewise-ai-lifp.onrender.com/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  getCities: () => get('/cities'),
  getHeatmap: (city = 'bengaluru') => get(`/heatmap/${city}`),
  getDeserts: (city = 'bengaluru') => get(`/deserts/${city}`),
  getRecommendations: (city = 'bengaluru') => get(`/recommendations/${city}`),
  getCompetitors: (city = 'bengaluru') => get(`/competitors/${city}`),
  calculateROI: (data) => post('/roi', data),
  askCopilot: (city, question) => post('/copilot', { city, question }),
}
