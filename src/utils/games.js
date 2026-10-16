export function shuffled(items, random = Math.random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function moveSnake(snake, direction, food, size = 16) {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }
  const ate = Boolean(food && head.x === food.x && head.y === food.y)
  const body = ate ? snake : snake.slice(0, -1)
  const ended = head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || body.some(cell => cell.x === head.x && cell.y === head.y)
  return { snake: ended ? snake : [head, ...snake].slice(0, snake.length + Number(ate)), ate, ended }
}

export function newFood(snake, size = 16, random = Math.random) {
  const occupied = new Set(snake.map(cell => `${cell.x},${cell.y}`))
  const free = Array.from({ length: size * size }, (_, i) => ({ x: i % size, y: Math.floor(i / size) }))
    .filter(cell => !occupied.has(`${cell.x},${cell.y}`))
  return free.length ? free[Math.floor(random() * free.length)] : null
}
