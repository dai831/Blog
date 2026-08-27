import { getAllLocalArticles, getLocalArticle, putLocalArticle, removeLocalArticle } from './localDb'

export const categories = [
  { value: 1, label: '前端' },
  { value: 2, label: 'Vue' },
  { value: 3, label: 'Node' },
  { value: 4, label: '工程化' },
  { value: 5, label: '工具' },
  { value: 6, label: '其他' }
]

export function categoryLabel(type) {
  return categories.find(item => Number(item.value) === Number(type))?.label || '其他'
}

const builtinModules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
})

function stableHash(input) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function filenameFromPath(path) {
  return decodeURIComponent(path.split('/').pop() || '').replace(/\.(md|markdown)$/i, '')
}

function titleFromMarkdown(content, fallback) {
  const match = String(content || '').match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallback
}

function excerptFromMarkdown(content) {
  return String(content || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*`_~\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 130)
}

function inferCategory(name) {
  const text = name.toLowerCase()
  if (text.includes('vue') || text.includes('element')) return 2
  if (text.includes('node') || text.includes('npm')) return 3
  if (text.includes('electron') || text.includes('vite') || text.includes('nginx') || text.includes('git')) return 4
  if (text.includes('qgis') || text.includes('快捷键') || text.includes('天地图')) return 5
  return 1
}

const builtinArticles = Object.entries(builtinModules)
  .map(([path, richtext]) => {
    const filename = filenameFromPath(path)
    return {
      id: `builtin-${stableHash(path)}`,
      title: titleFromMarkdown(richtext, filename),
      subtext: excerptFromMarkdown(richtext),
      richtext: String(richtext || ''),
      type: inferCategory(filename),
      status: 'published',
      source: 'builtin',
      sourceName: filename,
      createdAt: null,
      updatedAt: null,
      publishedAt: null
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))

const builtinMap = new Map(builtinArticles.map(item => [String(item.id), item]))

function normalizeLocal(item) {
  if (!item) return null
  return {
    id: item.id,
    title: item.title || '未命名文章',
    subtext: item.subtext || '',
    richtext: item.richtext || '',
    type: Number(item.type || 1),
    status: item.status === 'published' ? 'published' : 'draft',
    source: 'local',
    originalId: item.originalId || null,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    publishedAt: item.publishedAt || null
  }
}

export async function listArticles({ admin = false } = {}) {
  const localRows = (await getAllLocalArticles()).map(normalizeLocal).filter(Boolean)
  const visibleLocal = localRows
    .filter(item => admin || item.status === 'published')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  // 代码目录里的 Markdown 永远排在浏览器本地文档之前。
  return [...builtinArticles, ...visibleLocal]
}

export async function getArticle(id, { admin = false } = {}) {
  const builtin = builtinMap.get(String(id))
  if (builtin) return { ...builtin }

  const local = normalizeLocal(await getLocalArticle(String(id)))
  if (!local || (!admin && local.status !== 'published')) throw new Error('文档不存在')
  return local
}

function makeLocalId() {
  if (globalThis.crypto?.randomUUID) return `local-${crypto.randomUUID()}`
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function saveArticle(article, { publish = null } = {}) {
  const now = new Date().toISOString()
  const isBuiltin = article.source === 'builtin' || String(article.id || '').startsWith('builtin-')
  const existing = !isBuiltin && article.id ? normalizeLocal(await getLocalArticle(String(article.id))) : null
  const status = publish === true ? 'published' : publish === false ? 'draft' : (existing?.status || article.status || 'draft')

  const saved = {
    id: existing?.id || makeLocalId(),
    title: article.title?.trim() || '未命名文章',
    subtext: article.subtext?.trim() || '',
    richtext: article.richtext || '',
    type: Number(article.type || 1),
    status,
    source: 'local',
    originalId: isBuiltin ? article.id : (existing?.originalId || article.originalId || null),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    publishedAt: status === 'published' ? (existing?.publishedAt || now) : null
  }

  await putLocalArticle(saved)
  return saved
}

export async function deleteArticle(id) {
  if (String(id).startsWith('builtin-')) throw new Error('代码内置文档不能在浏览器里删除，请从 src/content 删除源文件')
  await removeLocalArticle(String(id))
}

export function publishArticle(article) {
  return saveArticle(article, { publish: true })
}

export function unpublishArticle(article) {
  return saveArticle(article, { publish: false })
}

export function isBuiltinArticle(article) {
  return article?.source === 'builtin' || String(article?.id || '').startsWith('builtin-')
}
