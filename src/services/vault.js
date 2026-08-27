const VAULT_KEY = 'markdown_blog_vault_v1'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64(bytes) {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function fromBase64(value) {
  const binary = atob(value)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 220000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export function hasVault() {
  return Boolean(localStorage.getItem(VAULT_KEY))
}

export async function saveVault(entries, password) {
  if (!password) throw new Error('请输入保险箱密码')
  if (!crypto?.subtle) throw new Error('当前浏览器不支持本地加密，请升级浏览器')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const plain = encoder.encode(JSON.stringify(entries || []))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain)

  localStorage.setItem(VAULT_KEY, JSON.stringify({
    version: 1,
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(encrypted))
  }))
}

export async function unlockVault(password) {
  const raw = localStorage.getItem(VAULT_KEY)
  if (!raw) return []
  if (!password) throw new Error('请输入保险箱密码')

  try {
    const payload = JSON.parse(raw)
    const salt = fromBase64(payload.salt)
    const iv = fromBase64(payload.iv)
    const data = fromBase64(payload.data)
    const key = await deriveKey(password, salt)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    const parsed = JSON.parse(decoder.decode(decrypted))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    throw new Error('保险箱密码不正确，或本地数据已损坏')
  }
}

export function clearVault() {
  localStorage.removeItem(VAULT_KEY)
}
