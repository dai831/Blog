<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminNav from '../components/AdminNav.vue'
import { clearVault, hasVault, saveVault, unlockVault } from '../services/vault'

const configured = ref(hasVault())
const unlocked = ref(false)
const unlocking = ref(false)
const masterInput = ref('')
const masterConfirm = ref('')
const vaultPassword = ref('')
const entries = ref([])
const keyword = ref('')
const dialogVisible = ref(false)
const editingId = ref(null)
const revealIds = ref(new Set())

const form = reactive({ name: '', url: '', username: '', password: '', note: '' })

const filteredEntries = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return entries.value
  return entries.value.filter(item => [item.name, item.url, item.username, item.note].join(' ').toLowerCase().includes(q))
})

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeUrl(value) {
  const url = String(value || '').trim()
  if (!url) return ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) return url
  return `https://${url}`
}

async function setupVault() {
  if (masterInput.value.length < 6) return ElMessage.warning('保险箱密码至少 6 位')
  if (masterInput.value !== masterConfirm.value) return ElMessage.warning('两次输入的密码不一致')
  unlocking.value = true
  try {
    await saveVault([], masterInput.value)
    vaultPassword.value = masterInput.value
    configured.value = true
    unlocked.value = true
    entries.value = []
    masterInput.value = ''
    masterConfirm.value = ''
    ElMessage.success('本地保险箱已创建')
  } catch (e) { ElMessage.error(e.message) }
  finally { unlocking.value = false }
}

async function unlock() {
  if (!masterInput.value) return ElMessage.warning('请输入保险箱密码')
  unlocking.value = true
  try {
    entries.value = await unlockVault(masterInput.value)
    vaultPassword.value = masterInput.value
    unlocked.value = true
    masterInput.value = ''
  } catch (e) { ElMessage.error(e.message) }
  finally { unlocking.value = false }
}

function lock() {
  unlocked.value = false
  entries.value = []
  vaultPassword.value = ''
  revealIds.value = new Set()
}

async function persistEntries(nextEntries) {
  await saveVault(nextEntries, vaultPassword.value)
  entries.value = nextEntries
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', url: '', username: '', password: '', note: '' })
  dialogVisible.value = true
}

function openEdit(item) {
  editingId.value = item.id
  Object.assign(form, item)
  dialogVisible.value = true
}

async function saveEntry() {
  if (!form.name.trim()) return ElMessage.warning('请填写名称')
  if (!form.username.trim() && !form.password.trim() && !form.url.trim()) return ElMessage.warning('至少填写网址、账号或密码中的一项')

  const now = new Date().toISOString()
  const item = {
    id: editingId.value || makeId(),
    name: form.name.trim(),
    url: normalizeUrl(form.url),
    username: form.username.trim(),
    password: form.password,
    note: form.note.trim(),
    updatedAt: now
  }

  try {
    const next = [...entries.value]
    const index = next.findIndex(row => row.id === item.id)
    if (index >= 0) next.splice(index, 1, item)
    else next.unshift(item)
    await persistEntries(next)
    dialogVisible.value = false
    ElMessage.success('已加密保存到当前浏览器')
  } catch (e) { ElMessage.error(e.message) }
}

async function removeEntry(item) {
  try {
    await ElMessageBox.confirm(`确认删除“${item.name}”吗？`, '删除记录', { type: 'warning' })
    await persistEntries(entries.value.filter(row => row.id !== item.id))
    revealIds.value.delete(item.id)
    ElMessage.success('已删除')
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '删除失败')
  }
}

function toggleReveal(id) {
  const next = new Set(revealIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  revealIds.value = next
}

async function copyText(text, label) {
  if (!text) return ElMessage.warning(`${label}为空`)
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
    else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    ElMessage.success(`${label}已复制`)
  } catch { ElMessage.error('复制失败，请长按手动复制') }
}

function copyAll(item) {
  const text = [
    item.name,
    item.url ? `网址：${item.url}` : '',
    item.username ? `账号：${item.username}` : '',
    item.password ? `密码：${item.password}` : '',
    item.note ? `备注：${item.note}` : ''
  ].filter(Boolean).join('\n')
  return copyText(text, '完整信息')
}

function openLink(url) {
  if (!url) return ElMessage.warning('没有填写网址')
  window.open(normalizeUrl(url), '_blank', 'noopener,noreferrer')
}

async function resetVault() {
  try {
    await ElMessageBox.confirm('这会永久删除当前浏览器里保存的全部账号密码，且无法恢复。', '清空本地保险箱', {
      type: 'warning', confirmButtonText: '确认清空', cancelButtonText: '取消'
    })
    clearVault()
    configured.value = false
    unlocked.value = false
    entries.value = []
    vaultPassword.value = ''
    masterInput.value = ''
    masterConfirm.value = ''
    ElMessage.success('本地保险箱已清空')
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error(e.message || '操作失败')
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminNav />
    <main class="admin-main vault-main">
      <header class="admin-top">
        <div>
          <h1>常用链接 / 账号库</h1>
          <p>账号密码加密保存在当前浏览器，不上传服务器，也不会写进项目源码。</p>
        </div>
        <div v-if="unlocked" class="vault-top-actions">
          <button class="secondary-btn big-action" @click="lock">锁定</button>
          <button class="primary-btn big-action" @click="openCreate">＋ 新增记录</button>
        </div>
      </header>

      <section v-if="!configured" class="vault-lock-card">
        <span class="vault-icon">🔐</span>
        <h2>创建本地保险箱</h2>
        <p>设置一个只由你记住的密码。账号数据会先加密，再写入当前浏览器。</p>
        <label>保险箱密码</label>
        <input v-model="masterInput" type="password" autocomplete="new-password" placeholder="至少 6 位" @keyup.enter="setupVault" />
        <label>再次输入</label>
        <input v-model="masterConfirm" type="password" autocomplete="new-password" placeholder="再次输入保险箱密码" @keyup.enter="setupVault" />
        <button class="primary-btn vault-submit" :disabled="unlocking" @click="setupVault">创建并进入</button>
        <small>忘记保险箱密码后无法解密原数据，只能清空重建，所以请自行记住。</small>
      </section>

      <section v-else-if="!unlocked" class="vault-lock-card">
        <span class="vault-icon">🔒</span>
        <h2>解锁本地保险箱</h2>
        <p>输入保险箱密码后即可查看并复制你的常用账号。</p>
        <label>保险箱密码</label>
        <input v-model="masterInput" type="password" autocomplete="current-password" placeholder="输入保险箱密码" @keyup.enter="unlock" />
        <button class="primary-btn vault-submit" :disabled="unlocking" @click="unlock">解锁</button>
        <button class="text-danger-btn" @click="resetVault">忘记密码 / 清空保险箱</button>
      </section>

      <template v-else>
        <div class="vault-toolbar">
          <input v-model="keyword" class="search-box vault-search" placeholder="搜索名称、网址、账号、备注..." />
          <span>共 {{ entries.length }} 条，仅当前浏览器可见</span>
        </div>

        <div v-if="!filteredEntries.length" class="vault-empty">
          <h3>{{ entries.length ? '没有匹配的记录' : '还没有保存账号' }}</h3>
          <p>{{ entries.length ? '换一个关键词试试。' : '点击“新增记录”保存第一个常用网站。' }}</p>
          <button v-if="!entries.length" class="primary-btn big-action" @click="openCreate">＋ 新增记录</button>
        </div>

        <section v-else class="vault-grid">
          <article v-for="item in filteredEntries" :key="item.id" class="vault-card">
            <div class="vault-card-head">
              <div><h3>{{ item.name }}</h3><a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.url }}</a></div>
              <button class="mini-edit" @click="openEdit(item)">编辑</button>
            </div>

            <div class="credential-row">
              <span>账号</span>
              <code>{{ item.username || '未填写' }}</code>
              <button @click="copyText(item.username, '账号')">复制账号</button>
            </div>
            <div class="credential-row">
              <span>密码</span>
              <code>{{ item.password ? (revealIds.has(item.id) ? item.password : '••••••••••') : '未填写' }}</code>
              <button @click="toggleReveal(item.id)">{{ revealIds.has(item.id) ? '隐藏' : '显示' }}</button>
              <button @click="copyText(item.password, '密码')">复制密码</button>
            </div>
            <p v-if="item.note" class="vault-note">{{ item.note }}</p>

            <div class="vault-actions">
              <button class="secondary-btn" :disabled="!item.url" @click="openLink(item.url)">打开网站</button>
              <button class="primary-btn" @click="copyAll(item)">复制完整信息</button>
              <button class="danger-btn" @click="removeEntry(item)">删除</button>
            </div>
          </article>
        </section>
      </template>

      <p class="vault-security-note">安全提示：本功能适合个人设备使用。共享电脑上不要保存重要账号；浏览器被清除数据后，本地记录也会消失。</p>
    </main>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑账号记录' : '新增账号记录'" width="560px" class="vault-dialog" append-to-body>
      <div class="vault-form">
        <label>名称 *</label><input v-model="form.name" placeholder="例如：GitHub、公司邮箱" />
        <label>网址</label><input v-model="form.url" inputmode="url" placeholder="https://example.com" />
        <label>登录账号</label><input v-model="form.username" autocomplete="off" placeholder="用户名 / 邮箱 / 手机号" />
        <label>登录密码</label><input v-model="form.password" autocomplete="off" placeholder="登录密码" />
        <label>备注</label><textarea v-model="form.note" rows="3" placeholder="可填写用途、环境、注意事项等"></textarea>
      </div>
      <template #footer>
        <div class="dialog-actions">
          <button class="secondary-btn touch-btn" @click="dialogVisible = false">取消</button>
          <button class="primary-btn touch-btn" @click="saveEntry">加密保存</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
