// Reuse the wallpaper endpoint already referenced by the legacy gallery.
const ENDPOINT = 'https://shcdn-wp.shanhutech.cn/intf/newestList'

export async function loadWallpapers({ page = 1, limit = 6 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ pageno: String(page), count: '60' }),
      signal: controller.signal
    })
    if (!response.ok) return []
    const data = await response.json()
    const list = Array.isArray(data?.data?.list) ? data.data.list : []
    const scenic = list.filter(item => /风景大片|4K专区/.test(item.category || '') || /海|花|山|天空|树林|湖水|日出|日落|自然风光/.test(item.tag || ''))
    return scenic
      .map(item => ({
        url: String(item.url || '').replace(/^http:/, 'https:'),
        title: String(item.tag || item.category || '视觉灵感').split(',')[0].trim(),
        category: item.category || '图片欣赏',
        credit: item.author || ''
      }))
      .filter(item => item.url.startsWith('https://'))
      .slice(0, limit)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}
