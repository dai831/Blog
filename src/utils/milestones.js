const DAY_MS = 86_400_000

// Compare calendar dates so daylight saving changes do not affect day counts.
function calendarDay(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysSince(start, today = new Date()) {
  return Math.max(0, Math.round((calendarDay(today) - calendarDay(start)) / DAY_MS))
}

export function yearsSince(start, today = new Date()) {
  const beforeAnniversary = today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())
  return Math.max(0, today.getFullYear() - start.getFullYear() - Number(beforeAnniversary))
}

export function daysUntilNext(month, day, today = new Date()) {
  let next = new Date(today.getFullYear(), month, day)
  if (calendarDay(next) < calendarDay(today)) next = new Date(today.getFullYear() + 1, month, day)
  return Math.round((calendarDay(next) - calendarDay(today)) / DAY_MS)
}
