import { createI18n } from 'vue-i18n'
import zh from './locale/zh'
import en from './locale/en'

const i18n = createI18n({
  legacy: false,
  locale: 'zh', // 默认显示语言
  messages: { zh, en }
})

export default i18n
