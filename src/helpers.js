export const today = new Date().toISOString().split('T')[0]

export const IT_MEMBERS = [
  'Chu Jian Wei', 'Gan Shu Yi', 'Lim Kah Yee', 'Low Yee Fei',
  'Ngoh Chin Shuan', 'Tan Jun Ling', 'Wong Kak Lok, Carol', 'Woo Xin Quan',
  'Yaw Xin Ying, Alexa', 'Yeap Chun Hong', 'Xue Ting - intern', 'Hui Moon - intern'
]

export const STATUS_COLOR = {
  'In Progress': '#3b82f6',
  'Completed':   '#22c55e',
  'Delayed':     '#ef4444',
  'On Hold':     '#f59e0b',
  'UAT':         '#8b5cf6',
  'Upcoming':    '#64748b',
}

export const STATUS_BG = {
  'In Progress': 'rgba(59,130,246,0.15)',
  'Completed':   'rgba(34,197,94,0.15)',
  'Delayed':     'rgba(239,68,68,0.15)',
  'On Hold':     'rgba(245,158,11,0.15)',
  'UAT':         'rgba(139,92,246,0.15)',
  'Upcoming':    'rgba(100,116,139,0.15)',
}

export const PRIORITY_COLOR = { High: '#ef4444', Low: '#64748b' }

export function isOnLeave(date, leaves = []) {
  return leaves.some(l => {
    if (!l.start || !l.end) return false
    return date >= l.start && date <= l.end
  })
}

export function addWorkdays(startDate, days, leaves = []) {
  let d = new Date(startDate)
  let added = 0

  while (added < days) {
    d.setDate(d.getDate() + 1)

    const iso = d.toISOString().split('T')[0]
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const onLeave = isOnLeave(iso, leaves)

    if (!isWeekend && !onLeave) {
      added++
    }
  }

  return d.toISOString().split('T')[0]
}

export function computeStatus(task) {
  if (task.progress === 100) return 'Completed'
  if (task.status === 'On Hold') return 'On Hold'
  if (task.status === 'UAT') return 'UAT'
  if (task.end_date && today > task.end_date && task.progress < 100) return 'Delayed'
  if (task.start_date && today >= task.start_date && today <= task.end_date) return 'In Progress'
  if (task.start_date && today < task.start_date) return 'Upcoming'
  return task.status || 'In Progress'
}

// Map camelCase form fields → snake_case DB columns
export function toDb(form) {
  return {
    it_name:      form.itName,
    project:      form.project,
    manday:       Number(form.manday),
    al_date:      form.al || null,
    start_date:   form.startDate || null,
    end_date:     form.endDate || null,
    progress:     Number(form.progress),
    priority:     form.priority,
    status:       form.status,
    updated_date: today,
    target_uat:   form.targetUAT || null,
    target_live:  form.targetLive || null,
  }
}

// Map DB row → camelCase used in UI
export function fromDb(row) {
  return {
    id:          row.id,
    itName:      row.it_name,
    project:     row.project,
    manday:      row.manday,
    al:          row.al_date || '',
    startDate:   row.start_date || '',
    endDate:     row.end_date || '',
    progress:    row.progress,
    priority:    row.priority,
    status:      row.status,
    updatedDate: row.updated_date,
    targetUAT:   row.target_uat || '',
    targetLive:  row.target_live || '',
  }
}
