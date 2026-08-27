<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import { categories, getArticle, saveArticle } from '../services/blog'

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const uploadRef = ref(null)
const mobilePane = ref('edit')
const form = reactive({ id: null, title: '', subtext: '', type: 1, richtext: '', status: 'draft', source: 'local' })

const words = computed(() => (form.richtext || '').replace(/\s/g, '').length)
const editingBuiltin = computed(() => form.source === 'builtin')

function parseTitle(content, fallbackName) {
  const match = String(content || '').match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || fallbackName.replace(/\.(md|markdown)$/i, '')
}

async function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!/\.(md|markdown)$/i.test(file.name)) {
    event.target.value = ''
    return ElMessage.warning('请选择 .md 或 .markdown 文件')
  }
  try {
    const text = await file.text()
    form.id = null
    form.source = 'local'
    form.status = 'draft'
    form.richtext = text
    form.title = parseTitle(text, file.name)
    const plain = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#>*`\[\]()_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    form.subtext = plain.slice(0, 120)
    ElMessage.success(`已读取 ${file.name}，文件只保存在当前浏览器`)
  } catch { ElMessage.error('读取 Markdown 文件失败') }
  finally { event.target.value = '' }
}

async function persist(publish) {
  if (!form.title.trim()) return ElMessage.warning('请填写文章标题')
  if (!form.richtext.trim()) return ElMessage.warning('请填写或上传 Markdown 内容')
  saving.value = true
  try {
    const wasBuiltin = editingBuiltin.value
    const saved = await saveArticle({ ...form }, { publish })
    Object.assign(form, saved)
    if (wasBuiltin) ElMessage.success('代码内置文档已另存为浏览器本地副本')
    else ElMessage.success(publish === true ? '已发布到当前浏览器' : '已保存到当前浏览器')
    router.replace(`/admin/editor/${saved.id}`)
  } catch (e) { ElMessage.error(e.message) }
  finally { saving.value = false }
}

async function loadArticle() {
  if (!route.params.id) return
  try {
    const item = await getArticle(route.params.id, { admin: true })
    Object.assign(form, item)
  } catch (e) { ElMessage.error(e.message) }
}

onMounted(loadArticle)
</script>

<template>
  <div class="editor-page">
    <header class="editor-topbar">
      <div class="editor-left">
        <button class="icon-back touch-btn" @click="router.push('/admin/articles')">←</button>
        <div><strong>{{ form.id ? '编辑文档' : '新建文档' }}</strong><small>浏览器本地保存 · 不上传服务器</small></div>
      </div>
      <div class="editor-actions">
        <input ref="uploadRef" type="file" accept=".md,.markdown,text/markdown" hidden @change="handleFile" />
        <button class="secondary-btn touch-btn" @click="uploadRef.click()">上传 .md</button>
        <button class="secondary-btn touch-btn" :disabled="saving" @click="persist(false)">保存草稿</button>
        <button class="primary-btn touch-btn" :disabled="saving" @click="persist(true)">发布</button>
      </div>
    </header>

    <div v-if="editingBuiltin" class="builtin-edit-tip">
      当前打开的是代码内置 Markdown。浏览器无法修改源码，保存时会自动创建一份“浏览器本地副本”。
    </div>

    <section class="editor-meta">
      <div class="field title-field"><label>标题</label><input v-model="form.title" placeholder="文章标题" /></div>
      <div class="field category-field"><label>分类</label><select v-model="form.type"><option v-for="item in categories" :key="item.value" :value="item.value">{{ item.label }}</option></select></div>
      <div class="field excerpt-field"><label>摘要</label><input v-model="form.subtext" maxlength="200" placeholder="一句话说明这篇文章讲什么" /></div>
    </section>

    <div class="mobile-editor-tabs">
      <button :class="{ active: mobilePane === 'edit' }" @click="mobilePane = 'edit'">编辑 Markdown</button>
      <button :class="{ active: mobilePane === 'preview' }" @click="mobilePane = 'preview'">预览文档</button>
    </div>

    <section class="split-editor">
      <div :class="['edit-pane', { 'mobile-pane-hidden': mobilePane !== 'edit' }]">
        <div class="pane-head"><span>Markdown</span><small>{{ words }} 字</small></div>
        <textarea v-model="form.richtext" spellcheck="false" placeholder="# 从这里开始写 Markdown\n\n也可以点击上方“上传 .md”读取本地文件。"></textarea>
      </div>
      <div :class="['preview-pane', { 'mobile-pane-hidden': mobilePane !== 'preview' }]">
        <div class="pane-head"><span>实时预览</span><small>文档视图</small></div>
        <div class="preview-scroll">
          <MarkdownRenderer v-if="form.richtext" :content="form.richtext" />
          <div v-else class="preview-empty"><b>预览区域</b><p>输入 Markdown 后，这里会实时显示文档效果。</p></div>
        </div>
      </div>
    </section>
  </div>
</template>
