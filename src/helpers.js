export const today = new Date().toISOString().split('T')[0]

export const IT_MEMBERS = [
  'Chu Jian Wei', 'Gan Shu Yi', 'Lim Kah Yee', 'Low Yee Fei',
  'Ngoh Chin Shuan', 'Tan Jun Ling', 'Wong Kak Lok, Carol', 'Woo Xin Quan',
  'Yaw Xin Ying, Alexa', 'Yeap Chun Hong', 'Chin Xue Ting - intern', 'Gan Hui Moon - intern'
]

export const PA_MEMBERS = [
  'Beatrice', 'Toh Yan Xin'
]

export const IFA_MEMBERS = [
  'Nic', 'Zach', 'YX', 'Alina', 'Angela', 'Agnes'
]

export const DISCOVERY_TYPES = [
  { value: '', label: 'Select…' },
  { value: 'self-discovered', label: 'Self-Discovered' },
  { value: 'bug',            label: 'Bug' },
]

export const FEEDBACK_LOGS = [
  { id: 'FL001', label: 'Commission Module Feedback Log', url: 'https://docs.google.com/document/d/1eI3_O9behQjBemO56v3R6rNbmm6oOiRkpjv7ELdccP4/edit?tab=t.0#heading=h.q7679xhplkb5' },
  { id: 'FL002', label: 'Lodgement Module Feedback Log ', url: 'https://docs.google.com/document/d/1OQ6X3l8L9xmJTmGygaurajxQ6jYEWgs5PCYB6BdMvpo/edit?tab=t.0#heading=h.hstrvwgzo0nv' },
  { id: 'FL003', label: 'CRM 2.0 Feedback Log', url: 'https://docs.google.com/document/d/1AGFhXAt5vklldjxm7xQRbF8bla5jfb5Pmb1wb_tLLh8/edit#heading=h.jqroo53mh8ok' },
  { id: 'FL004', label: 'Advisor Onboarding Part 1 Feedback Log', url: 'https://docs.google.com/document/d/1lFHDjRj-aEeJZdreOLSdd7QwwgjZTOxl4By2UBnHZkY/edit?usp=sharing' },
  { id: 'FL005', label: 'League Ladder Feedback Log', url: 'https://docs.google.com/document/d/1OP41AmcKm7ChQMEnMMzj9347kN-HADY6KYp4EJ1nObM/edit?usp=sharing' },
]

//remove 'Delayed' change 'Upcoming' to red colour
export const STATUS_COLOR = {
  'In Progress': '#3b82f6',
  'Completed':   '#22c55e',
  'Upcoming':     '#ef4444',
  'On Hold':     '#f59e0b',
  'UAT':         '#8b5cf6',
}

//remove 'Delayed' change 'Upcoming' to red colour
export const STATUS_BG = {
  'In Progress': 'rgba(59,130,246,0.15)',
  'Completed':   'rgba(34,197,94,0.15)',
  'Upcoming':     'rgba(239,68,68,0.15)',
  'On Hold':     'rgba(245,158,11,0.15)',
  'UAT':         'rgba(139,92,246,0.15)',
}

// export const PRIORITY_COLOR = { High: '#ef4444', Low: '#64748b' }

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
