const DB_NAME = 'markdown_blog_local'
const DB_VERSION = 1
const ARTICLE_STORE = 'articles'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(ARTICLE_STORE)) {
        const store = db.createObjectStore(ARTICLE_STORE, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('无法打开浏览器本地数据库'))
  })
}

function run(storeName, mode, action) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    const store = tx.objectStore(storeName)
    let result
    try { result = action(store) } catch (error) { reject(error); db.close(); return }
    tx.oncomplete = () => { resolve(result?.result); db.close() }
    tx.onerror = () => { reject(tx.error || new Error('浏览器本地数据库操作失败')); db.close() }
    tx.onabort = () => { reject(tx.error || new Error('浏览器本地数据库操作中止')); db.close() }
  }))
}

export function getAllLocalArticles() {
  return run(ARTICLE_STORE, 'readonly', store => store.getAll())
}

export async function getLocalArticle(id) {
  return run(ARTICLE_STORE, 'readonly', store => store.get(id))
}

export function putLocalArticle(article) {
  return run(ARTICLE_STORE, 'readwrite', store => store.put(article))
}

export function removeLocalArticle(id) {
  return run(ARTICLE_STORE, 'readwrite', store => store.delete(id))
}
