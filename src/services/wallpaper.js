const NEWEST_ENDPOINT = 'https://shcdn-wp.shanhutech.cn/intf/newestList'
const CATEGORY_ENDPOINT = 'https://wp.shanhutech.cn/intf/GetListByCategory'

// IDs and labels are supplied by the original wallpaper service.
export const wallpaperCategories = [
  { id: '9', label: '风景大片' }, { id: '26', label: '动漫卡通' },
  { id: '14', label: '萌宠动物' }, { id: '15', label: '小清新' },
  { id: '5', label: '游戏壁纸' }, { id: '36', label: '4K专区' },
  { id: '10', label: '炫酷时尚' }, { id: '12', label: '汽车天下' },
  { id: '13', label: '节日美图' }, { id: '35', label: '文字控' },
  { id: '11', label: '明星风尚' }, { id: '6', label: '美女模特' }
]

function normalizePhoto(item) {
  const url = String(item.url || '').replace(/^http:/, 'https:')
  return {
    id: String(item.id || url), url,
    title: String(item.tag || item.category || '视觉灵感').split(/[,，]/)[0].trim(),
    tags: String(item.tag || ''),
    category: String(item.category || '图片欣赏'),
    categoryId: String(item.class_id || ''),
    credit: String(item.author || '')
  }
}

export async function fetchWallpaperPage({ categoryId = 'latest', page = 1, pageSize = 12, signal } = {}) {
  const numericPage = Number(page)
  const requestedPage = Number.isSafeInteger(numericPage) && numericPage > 0 ? numericPage : 1
  const count = Math.min(180, Math.max(1, Math.floor(Number(pageSize) || 12)))
  if (categoryId !== 'latest' && !/^\d+$/.test(String(categoryId))) throw new Error('请选择有效的图片分类。')
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) controller.abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 9000)
  try {
    const params = new URLSearchParams({ pageno: String(requestedPage), count: String(count) })
    let url = NEWEST_ENDPOINT
    const options = { signal: controller.signal }
    if (categoryId === 'latest') {
      options.method = 'POST'
      options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      options.body = params
    } else {
      params.set('cids', String(categoryId))
      url = `${CATEGORY_ENDPOINT}?${params}`
    }
    const response = await fetch(url, options)
    if (!response.ok) throw new Error('图片暂时无法加载，请稍后重试。')
    const payload = await response.json()
    if (Number(payload?.errno) !== 0 || !Array.isArray(payload?.data?.list)) throw new Error('图片服务暂时不可用，请稍后重试。')
    const data = payload.data
    const items = data.list.map(normalizePhoto).filter(item => item.url.startsWith('https://'))
    const total = Math.max(0, Number(data.total_count) || 0)
    const totalPages = Math.max(0, Number(data.total_page) || Math.ceil(total / count))
    return { items, total, totalPages, page: requestedPage, pageSize: count }
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) throw new Error('图片加载超时，请重试。')
    if (['TypeError', 'SyntaxError'].includes(error?.name)) throw new Error('图片服务暂时无法连接，请稍后重试。')
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

let categoriesPromise
export function loadWallpaperCategories() {
  if (!categoriesPromise) {
    categoriesPromise = fetchWallpaperPage({ pageSize: 180 }).then(({ items }) => {
      const categories = new Map(wallpaperCategories.map(item => [item.id, item]))
      for (const photo of items) {
        if (photo.categoryId) categories.set(photo.categoryId, { id: photo.categoryId, label: photo.category })
      }
      return [...categories.values()]
    }).catch(() => { categoriesPromise = null; return wallpaperCategories })
  }
  return categoriesPromise
}

// The home collage keeps a small scenic selection; the gallery uses full pages.
export async function loadWallpapers({ page = 1, limit = 6 } = {}) {
  try {
    const { items } = await fetchWallpaperPage({ page, pageSize: 60 })
    return items.filter(item => /风景大片|4K专区/.test(item.category) || /海|花|山|天空|树林|湖水|日出|日落|自然风光/.test(item.tags)).slice(0, limit)
  } catch { return [] }
}
