<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import BlogHeader from '../components/BlogHeader.vue'
import BlogFooter from '../components/BlogFooter.vue'
import { moveSnake, newFood, shuffled } from '../utils/games'

const games = [
  { id: 'memory', title: '记忆翻翻乐', description: '翻开色彩，找到相同的小伙伴。', glyph: '✿', tag: '记忆力', color: 'pink' },
  { id: 'snake', title: '彩色贪吃蛇', description: '吃颗星星，再长大一点点。', glyph: '〰', tag: '经典重玩', color: 'green' },
  { id: 'reaction', title: '反应力测试', description: '等绿色亮起，看看你有多快。', glyph: 'ϟ', tag: '手速挑战', color: 'yellow' }
]
const selected = ref('memory')
const currentGame = computed(() => games.find(game => game.id === selected.value))
function onTabKey(event) {
  const index = games.findIndex(game => game.id === selected.value)
  const next = event.key === 'ArrowRight' ? (index + 1) % games.length : event.key === 'ArrowLeft' ? (index + games.length - 1) % games.length : event.key === 'Home' ? 0 : event.key === 'End' ? games.length - 1 : null
  if (next === null) return
  event.preventDefault()
  selected.value = games[next].id
  nextTick(() => document.getElementById(`tab-${selected.value}`)?.focus())
}
function readBest(key) { try { return Number(localStorage.getItem(`daixm-game-${key}`)) || 0 } catch { return 0 } }
function saveBest(key, value) { try { localStorage.setItem(`daixm-game-${key}`, String(value)) } catch { /* Games work without storage. */ } }

// Memory pairs
const symbols = ['✿', '☀', '♥', '✦', '☁', '☺']
const cards = ref([])
const flipped = ref([])
const matched = ref([])
const moves = ref(0)
const memoryBest = ref(readBest('memory'))
let memoryTimer
const memoryWon = computed(() => matched.value.length === 12)
function resetMemory() {
  clearTimeout(memoryTimer)
  cards.value = shuffled([...symbols, ...symbols]).map((symbol, id) => ({ symbol, id }))
  flipped.value = []; matched.value = []; moves.value = 0
}
function flipCard(card) {
  if (flipped.value.length === 2 || flipped.value.includes(card.id) || matched.value.includes(card.id)) return
  flipped.value = [...flipped.value, card.id]
  if (flipped.value.length !== 2) return
  moves.value += 1
  const [first, second] = flipped.value.map(id => cards.value.find(item => item.id === id))
  if (first.symbol === second.symbol) {
    matched.value = [...matched.value, ...flipped.value]
    flipped.value = []
    if (memoryWon.value && (!memoryBest.value || moves.value < memoryBest.value)) {
      memoryBest.value = moves.value; saveBest('memory', moves.value)
    }
  } else memoryTimer = setTimeout(() => { flipped.value = [] }, 850)
}
resetMemory()

// Snake: touch controls and keyboard use the same movement rules.
const boardSize = 16
const snake = ref([{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }])
const food = ref(newFood(snake.value, boardSize))
const snakeState = ref('idle')
const score = ref(0)
const snakeBest = ref(readBest('snake'))
const board = ref(null)
const direction = ref({ x: 1, y: 0 })
let nextDirection = { x: 1, y: 0 }
let turnQueued = false
let snakeTimer
const snakeCells = computed(() => new Set(snake.value.map(cell => cell.y * boardSize + cell.x)))
const snakeHead = computed(() => snake.value[0].y * boardSize + snake.value[0].x)
const foodCell = computed(() => food.value ? food.value.y * boardSize + food.value.x : -1)
function stopSnake() { clearInterval(snakeTimer); snakeTimer = null }
function startSnake() {
  stopSnake()
  if (snakeState.value !== 'paused') {
    snake.value = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }]
    score.value = 0; direction.value = { x: 1, y: 0 }; nextDirection = { x: 1, y: 0 }; turnQueued = false
    food.value = newFood(snake.value, boardSize)
  }
  snakeState.value = 'running'
  nextTick(() => board.value?.focus({ preventScroll: true }))
  snakeTimer = setInterval(() => {
    direction.value = nextDirection; turnQueued = false
    const result = moveSnake(snake.value, direction.value, food.value, boardSize)
    if (result.ended) { snakeState.value = 'over'; stopSnake(); return }
    snake.value = result.snake
    if (result.ate) {
      score.value += 1
      if (score.value > snakeBest.value) { snakeBest.value = score.value; saveBest('snake', score.value) }
      food.value = newFood(snake.value, boardSize)
      if (!food.value) { snakeState.value = 'win'; stopSnake() }
    }
  }, 165)
}
function pauseSnake() { if (snakeState.value === 'running') { snakeState.value = 'paused'; stopSnake() } }
const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
function turn(name) {
  if (snakeState.value !== 'running' || turnQueued) return
  const next = directions[name]
  if (next.x === -direction.value.x && next.y === -direction.value.y) return
  nextDirection = next; turnQueued = true
}
function onKeydown(event) {
  if (selected.value !== 'snake' || event.ctrlKey || event.metaKey || document.querySelector('[role="dialog"]') || /INPUT|TEXTAREA/.test(event.target?.tagName || '')) return
  const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }
  const name = keys[event.key] || keys[event.key.toLowerCase()]
  if (name && snakeState.value === 'running') { event.preventDefault(); turn(name) }
}

// Reaction test
const reactionState = ref('idle')
const reactionTime = ref(0)
const reactionBest = ref(readBest('reaction'))
let reactionTimer
let readyAt = 0
function handleReaction() {
  if (reactionState.value === 'waiting') { clearTimeout(reactionTimer); reactionState.value = 'early'; return }
  if (reactionState.value === 'ready') {
    reactionTime.value = Math.round(performance.now() - readyAt)
    reactionState.value = 'result'
    if (!reactionBest.value || reactionTime.value < reactionBest.value) { reactionBest.value = reactionTime.value; saveBest('reaction', reactionTime.value) }
    return
  }
  reactionState.value = 'waiting'
  reactionTimer = setTimeout(() => { readyAt = performance.now(); reactionState.value = 'ready' }, 1500 + Math.random() * 2500)
}
const reactionCopy = computed(() => ({
  idle: ['☺', '准备好了吗？', '点击色块开始，等它变绿后再点一次。'],
  waiting: ['◌', '等一等…', '保持专注，等到绿色出现。'],
  ready: ['ϟ', '就是现在！', '快点一下！'],
  early: ['↺', '抢跑啦', '还没有变绿呢。点一下，再试一次。'],
  result: ['✦', `${reactionTime.value} ms`, '反应时间 · 点一下再挑战一次。']
})[reactionState.value])
function onVisibility() {
  if (document.hidden || document.querySelector('[role="dialog"]')) {
    pauseSnake()
    clearTimeout(reactionTimer)
    if (['ready', 'waiting'].includes(reactionState.value)) reactionState.value = 'idle'
  }
}
watch(selected, () => { pauseSnake(); clearTimeout(reactionTimer); reactionState.value = 'idle' })
window.addEventListener('keydown', onKeydown)
document.addEventListener('visibilitychange', onVisibility)
// Opening global search also pauses the active game.
const dialogObserver = new MutationObserver(onVisibility)
dialogObserver.observe(document.body, { childList: true })
onBeforeUnmount(() => {
  stopSnake(); clearTimeout(memoryTimer); clearTimeout(reactionTimer)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibility)
  dialogObserver.disconnect()
})
const fortunes = ['把复杂的问题，拆成今天能完成的一小步。', '休息一下，也是在给下一次灵感充电。', '去看一眼窗外，世界也在认真渲染。', '写点代码，也给生活留一点空白。', '今天的小进步，值得一个大大的微笑。']
const fortune = ref(0)
function nextFortune() { fortune.value = (fortune.value + 1 + Math.floor(Math.random() * (fortunes.length - 1))) % fortunes.length }
</script>

<template>
  <div class="tech-blog tb-playground"><BlogHeader />
    <main>
      <section class="tb-page-intro tb-play-intro"><div class="tb-container"><RouterLink class="tb-breadcrumb" to="/">首页 <span>↗</span></RouterLink><div class="tb-page-intro-grid"><div><span class="tb-eyebrow">THE PLAYGROUND / NO PRESSURE, JUST PLAY</span><h1>给好奇心，<br>放一个小假。</h1><p>代码也可以很好玩。选一个小实验，点一点、试一试，找回单纯的快乐。</p></div><span class="tb-page-intro-glyph" aria-hidden="true">☺</span></div><div class="tb-play-support"><span>☝ 手机触屏</span><span>⌘ 电脑键盘与鼠标</span><span>✦ 随时开始，随时休息</span></div></div></section>
      <section class="tb-game-section tb-container">
        <div class="tb-game-tabs" role="tablist" aria-label="选择小游戏"><button v-for="game in games" :id="`tab-${game.id}`" :key="game.id" role="tab" :tabindex="selected === game.id ? 0 : -1" @keydown="onTabKey" :aria-selected="selected === game.id" :aria-controls="`panel-${game.id}`" :class="[game.color, {active:selected === game.id}]" @click="selected = game.id"><span>{{ game.glyph }}</span><div><small>{{ game.tag }}</small><strong>{{ game.title }}</strong></div><b>↗</b></button></div>
        <div :id="`panel-${selected}`" class="tb-game-panel" role="tabpanel" :aria-labelledby="`tab-${selected}`"><div class="tb-game-panel-head"><div><span class="tb-eyebrow">LET’S PLAY</span><h2>{{ currentGame.title }}</h2><p>{{ currentGame.description }}</p></div><span class="tb-game-live"><i></i> 可直接游玩</span></div>
          <div v-if="selected === 'memory'" class="tb-game-layout"><div class="tb-memory-grid"><button v-for="(card,index) in cards" :key="card.id" class="tb-memory-card" :class="{flipped:flipped.includes(card.id) || matched.includes(card.id),matched:matched.includes(card.id)}" :aria-label="matched.includes(card.id) ? `已配对 ${card.symbol}` : flipped.includes(card.id) ? `卡片 ${card.symbol}` : `未翻开的卡片 ${index+1}`" :disabled="matched.includes(card.id)" @click="flipCard(card)"><span class="tb-memory-card-inner"><span class="tb-memory-front" aria-hidden="true">✳</span><span class="tb-memory-back" aria-hidden="true">{{ card.symbol }}</span></span></button></div><aside class="tb-game-instructions"><span class="tb-game-rule-glyph">✿</span><h3>找到 6 对小可爱</h3><p>每次翻开两张卡片，相同的图案会留下。用更少的步数，记住所有颜色。</p><div class="tb-game-stats"><div><strong>{{ moves }}</strong><small>已翻步数</small></div><div><strong>{{ matched.length / 2 }} / 6</strong><small>找到的配对</small></div><div><strong>{{ memoryBest || '—' }}</strong><small>本机最佳步数</small></div></div><p v-if="memoryWon" class="tb-game-success" role="status">✦ 全部找到了！记忆力很棒。</p><button class="tb-button tb-button-dark" @click="resetMemory">{{ memoryWon ? '再来一局' : '重新洗牌' }} <span>⟳</span></button></aside></div>
          <div v-else-if="selected === 'snake'" class="tb-game-layout"><div><div ref="board" class="tb-snake-board" tabindex="0" role="application" aria-label="贪吃蛇棋盘，使用方向键或下方触屏方向按钮操作"><span v-for="(_,index) in boardSize*boardSize" :key="index" :class="{'snake-body':snakeCells.has(index),'snake-head':snakeHead===index,'snake-food':foodCell===index}">{{ foodCell===index ? '✦' : '' }}</span><div v-if="snakeState !== 'running'" class="tb-snake-overlay"><strong>{{ {idle:'准备出发 ✦',paused:'休息一下 ☁',over:'这次旅程结束啦',win:'满分！装满星星啦'}[snakeState] }}</strong><small>{{ snakeState==='over' ? `收获了 ${score} 颗星星，再来一次吧。` : '吃星星，躲开边界和自己的尾巴。' }}</small><button class="tb-button tb-button-dark" @click="startSnake">{{ snakeState==='paused' ? '继续游戏' : snakeState==='idle' ? '开始游戏' : '再玩一次' }} <span>→</span></button></div></div><div class="tb-dpad" aria-label="触屏方向控制"><button class="up" aria-label="向上" :disabled="snakeState !== 'running'" @click="turn('up')">↑</button><button class="left" aria-label="向左" :disabled="snakeState !== 'running'" @click="turn('left')">←</button><button class="down" aria-label="向下" :disabled="snakeState !== 'running'" @click="turn('down')">↓</button><button class="right" aria-label="向右" :disabled="snakeState !== 'running'" @click="turn('right')">→</button></div></div><aside class="tb-game-instructions"><span class="tb-game-rule-glyph green">〰</span><h3>跟着星星走</h3><p>电脑用方向键或 WASD，手机点按下方方向按钮。蛇不能直接掉头，碰到边界或自己就会结束。</p><div class="tb-game-stats"><div><strong>{{ score }}</strong><small>本局星星</small></div><div><strong>{{ snakeBest }}</strong><small>本机最高纪录</small></div></div><button v-if="snakeState === 'running'" class="tb-button tb-button-outline" @click="pauseSnake">暂停游戏 <span>Ⅱ</span></button><p class="tb-game-tip">切换页面、游戏或打开搜索时会自动暂停。</p></aside></div>
          <div v-else class="tb-game-layout"><button class="tb-reaction-stage" :class="`state-${reactionState}`" @click="handleReaction"><span>{{ reactionCopy[0] }}</span><strong>{{ reactionCopy[1] }}</strong><small>{{ reactionCopy[2] }}</small></button><aside class="tb-game-instructions"><span class="tb-game-rule-glyph yellow">ϟ</span><h3>等绿灯，再出手</h3><p>先点一下色块开始。只有等它变成绿色时，再尽快点一下。电脑也可以聚焦色块后按空格键。</p><div class="tb-game-stats"><div><strong>{{ reactionBest ? `${reactionBest}` : '—' }}</strong><small>本机最佳 / ms</small></div></div><p class="tb-game-tip">这是一个轻松的小挑战，成绩会受到设备和操作方式影响。</p></aside></div>
        </div>
        <div class="tb-fortune"><span>✧</span><div><small>给今天的一句灵感</small><p :key="fortune">{{ fortunes[fortune] }}</p></div><button @click="nextFortune" aria-label="换一句灵感">换一句 ↗</button></div>
        <p class="tb-play-note">小游戏无需登录。最佳成绩仅保存在当前设备的浏览器中。</p>
      </section>
    </main><BlogFooter />
  </div>
</template>
