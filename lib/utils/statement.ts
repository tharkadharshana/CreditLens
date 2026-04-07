export function getCurrentStatementPeriod(date: Date, statementDay: number): string {
  const d = date.getDate()
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed

  // If before statement close day, we're in previous month's statement
  if (d <= statementDay) {
    const stMonth = month === 0 ? 11 : month - 1
    const stYear = month === 0 ? year - 1 : year
    return `${stYear}-${String(stMonth + 1).padStart(2, '0')}`
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function getStatementDateRange(period: string, statementDay: number): { start: Date; end: Date } {
  const [year, month] = period.split('-').map(Number)
  const start = new Date(year, month - 1, statementDay + 1)
  const end = new Date(year, month, statementDay)
  return { start, end }
}

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let dueDate = new Date(currentYear, currentMonth, dueDay)
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay)
  }
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
