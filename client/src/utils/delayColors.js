export function getDelayColor(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 5) return 'text-emerald-600'
  if (minutes <= 15) return 'text-amber-500'
  if (minutes <= 30) return 'text-orange-500'
  return 'text-red-600'
}

export function getDelayBg(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 5) return 'bg-emerald-50 border-emerald-200'
  if (minutes <= 15) return 'bg-amber-50 border-amber-200'
  if (minutes <= 30) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

export function getDelayLabel(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 5) return 'On Time'
  if (minutes <= 15) return 'Slight Delay'
  if (minutes <= 30) return 'Delayed'
  return 'Severely Delayed'
}

export function getDelayDot(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 5) return 'bg-emerald-500'
  if (minutes <= 15) return 'bg-amber-500'
  if (minutes <= 30) return 'bg-orange-500'
  return 'bg-red-500'
}

// For station board (dark mode)
export function getDelayBoardColor(minutes) {
  if (minutes === null || minutes === undefined || minutes <= 5) return 'text-emerald-400'
  if (minutes <= 15) return 'text-amber-400'
  if (minutes <= 30) return 'text-orange-400'
  return 'text-red-400'
}
