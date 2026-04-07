const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['restaurant','pizza','kfc','mcdonalds','cafe','coffee','dining','food','eat','hotel','delivery','swiggy','uber eats'],
  transport: ['uber','pickup','taxi','bus','train','fuel','petrol','shell','ceypetco','parking','toll'],
  shopping: ['amazon','keells','arpico','supermarket','store','shop','mall','clothe','fashion'],
  health: ['pharmacy','hospital','clinic','medical','doctor','health','drug','apollo','nawaloka'],
  entertainment: ['netflix','spotify','youtube','cinema','movie','game','steam'],
  utilities: ['electricity','water','telephone','slt','dialog','mobitel','airtel','internet'],
  travel: ['airline','srilankan','airport','hotel','booking','airbnb','expedia'],
  fuel: ['petrol','shell','ioc','ceypetco','fuel'],
  finance: ['interest','fee','charge','annual fee','late fee'],
}

export function inferCategory(description: string, merchant: string): string {
  const text = `${description} ${merchant}`.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return category
  }
  return 'other'
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  food:          { label: 'Food & Dining',   color: '#f97316', emoji: '🍔' },
  transport:     { label: 'Transport',        color: '#3b82f6', emoji: '🚗' },
  shopping:      { label: 'Shopping',         color: '#8b5cf6', emoji: '🛍️' },
  health:        { label: 'Health',           color: '#10b981', emoji: '💊' },
  entertainment: { label: 'Entertainment',    color: '#f59e0b', emoji: '🎬' },
  utilities:     { label: 'Utilities',        color: '#6b7280', emoji: '⚡' },
  travel:        { label: 'Travel',           color: '#06b6d4', emoji: '✈️' },
  fuel:          { label: 'Fuel',             color: '#ef4444', emoji: '⛽' },
  finance:       { label: 'Finance/Fees',     color: '#dc2626', emoji: '💰' },
  other:         { label: 'Other',            color: '#9ca3af', emoji: '📦' },
}
