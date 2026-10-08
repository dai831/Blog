// Reuse the wallpaper endpoint already referenced by the legacy gallery.
const ENDPOINT = 'https://shcdn-wp.shanhutech.cn/intf/newestList'

export async function loadWallpapers() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ pageno: '1', count: '20' }),
      signal: controller.signal
    })
    if (!response.ok) return []
    const data = await response.json()
    const list = Array.isArray(data?.data?.list) ? data.data.list : []
    return list
      .filter(item => /星球|宇宙|太空|城市|都市|建筑|赛博|科技|夜景|风景/.test(`${item.tag || ''} ${item.category || ''}`))
      .map(item => ({ url: String(item.url || '').replace(/^http:/, 'https:'), credit: item.author || '' }))
      .filter(item => item.url.startsWith('https://'))
      .slice(0, 6)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}
