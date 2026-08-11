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
  'Agnes', 'Alina', 'Angela', 'Eileen', 'Nicholas', 'Ying Xiang', 'Zach', 'Eugene'
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
  { id: 'FL006', label: 'Extra Feedback Log', url: 'https://docs.google.com/document/d/1hP_Z31zdLIfnuSj0g2TYgeitZQ-KtYVpQN9bs3iJNEk/edit?usp=sharing' },
  { id: 'FL007', label: "Leader's Vault Feedback Log", url: 'https://docs.google.com/document/d/1CTG3hor31i5TZkZ8wwmqktIXO8sPNKmHTI_OQKRM3Lg/edit?tab=t.8p30lzvtbo8o' },
  { id: 'FL008', label: "Room Booking 2.0 Feedback Log", url: 'https://docs.google.com/document/d/1m7CbKvfBPKlQuoF8vZiN7vzqzwtOje0YBYnQUviqBpA/edit?usp=sharing' },
  { id: 'FL009', label: "REI 2.0 Feedback Log", url: 'https://docs.google.com/document/d/1R-UI1FamA0Y2dnaKkPfceVjSyfWAzUwaKaa057Sy90A/edit?usp=sharing' },
  { id: 'FL010', label: "GI Project Part 1 Feedback Log", url: 'https://docs.google.com/document/d/19zXrMCUdEAJ024FQNj_8jMamfpsGjtsXUG8ABZwKD9Q/edit?tab=t.u6pn7293rju4' },
  { id: 'FL011', label: "Advisor Onboarding Part 2 Feedback Log", url: 'https://docs.google.com/document/d/121elOPWhYTjrNbq4ybjgU8-RK1hqfkXlucJ36GAsHpk/edit?usp=sharing' },
  { id: 'FL012', label: "BSC Module Feedback Log", url: 'https://docs.google.com/document/d/1yB_g3TEg-0bMOwto1DQ1OgIfnLFK15oAAk_hMg1oGrk/edit?usp=sharing' },
  { id: 'FL013', label: "i-NITIATE Feedback Log", url: 'https://docs.google.com/document/d/1rb5kW3-5osg7nhGm4a5HxhiYdBPobCcWDTO13ixm7Ws/edit?usp=sharing' },
  { id: 'FL014', label: "Inception Module Feedback Log", url: 'https://docs.google.com/document/d/1oh-TsMeseKfZsqyfbToaDuz76oepBC2DyfW7y6bltLw/edit?usp=sharing' },
  { id: 'FL015', label: "i-Web Feedback Log", url: 'https://docs.google.com/document/d/1uXxr8DmJ6V3V-Xc07fX8ExBtyhHdczLd-2JJ8ankzq4/edit?usp=sharing' },
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

// ─────────────────────────────────────────────────────────────────────────────
// Project Health
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a date is a working day.
 * Weekends (Saturday/Sunday) are excluded.
 */
// function isWorkingDay(dateStr) {
//   if (!dateStr) return false

//   const d = new Date(`${dateStr}T00:00:00`)
//   const day = d.getDay()

//   return day !== 0 && day !== 6
// }

// /**
//  * Count working days between two dates, inclusive.
//  *
//  * If start > end, returns 0.
//  */
// export function countWorkingDays(startDate, endDate) {
//   if (!startDate || !endDate) return 0

//   const start = new Date(`${startDate}T00:00:00`)
//   const end = new Date(`${endDate}T00:00:00`)

//   if (start > end) return 0

//   let count = 0
//   const current = new Date(start)

//   while (current <= end) {
//     const iso = current.toISOString().split('T')[0]

//     if (isWorkingDay(iso)) {
//       count++
//     }

//     current.setDate(current.getDate() + 1)
//   }

//   return count
// }

// /**
//  * Calculate the expected progress of a task based on working days elapsed.
//  *
//  * Expected Progress =
//  * Working days elapsed / Total working days × 100
//  *
//  * The result is capped between 0 and 100.
//  */
// export function calculateExpectedProgress(task, referenceDate = today) {
//   const startDate = task?.startDate || task?.start_date
//   const endDate   = task?.endDate || task?.end_date

//   if (!startDate || !endDate) return 0

//   const totalWorkingDays = countWorkingDays(startDate, endDate)

//   if (totalWorkingDays <= 0) return 0

//   // Before task starts
//   if (referenceDate < startDate) {
//     return 0
//   }

//   // After task ends, expected progress is 100%
//   if (referenceDate >= endDate) {
//     return 100
//   }

//   const elapsedWorkingDays = countWorkingDays(startDate, referenceDate)

//   return Math.min(
//     100,
//     Math.round((elapsedWorkingDays / totalWorkingDays) * 100)
//   )
// }

// /**
//  * Calculate Schedule Performance Ratio.
//  *
//  * Actual Progress / Expected Progress
//  *
//  * Returns a decimal ratio.
//  * Example:
//  * 76 actual / 80 expected = 0.95
//  */
// export function calculateSchedulePerformanceRatio(task, referenceDate = today) {
//   const actualProgress = Number(task?.progress) || 0
//   const expectedProgress = calculateExpectedProgress(task, referenceDate)

//   // A task that has not started has no meaningful performance ratio yet.
//   if (expectedProgress <= 0) return null

//   return actualProgress / expectedProgress
// }

// /**
//  * Determine project health independently from the normal task status.
//  *
//  * Priority:
//  * 1. Completed
//  * 2. Overdue
//  * 3. Upcoming / not started
//  * 4. Critical
//  * 5. At Risk
//  * 6. On Track
//  */
// export function computeProjectHealth(task, referenceDate = today) {
//   const actualProgress = Math.max(
//     0,
//     Math.min(100, Number(task?.progress) || 0)
//   )

//   const startDate = task?.startDate || task?.start_date
//   const endDate   = task?.endDate || task?.end_date

//   // Completed always takes priority.
//   if (actualProgress >= 100) {
//     return {
//       key: 'completed',
//       label: 'Completed',
//       icon: '✅',
//       color: '#22c55e',
//       bg: 'rgba(34,197,94,0.15)',
//       expectedProgress: 100,
//       actualProgress,
//       performanceRatio: 1,
//     }
//   }

//   // Due date has passed and task is not complete.
//   if (endDate && referenceDate > endDate && actualProgress < 100) {
//     const expectedProgress = calculateExpectedProgress(task, referenceDate)

//     return {
//       key: 'overdue',
//       label: 'Overdue',
//       icon: '⚠️',
//       color: '#ef4444',
//       bg: 'rgba(239,68,68,0.15)',
//       expectedProgress,
//       actualProgress,
//       performanceRatio: expectedProgress > 0
//         ? actualProgress / expectedProgress
//         : null,
//     }
//   }

//   // Task has not started yet.
//   if (startDate && referenceDate < startDate) {
//     return {
//       key: 'upcoming',
//       label: 'Upcoming',
//       icon: '📅',
//       color: '#64748b',
//       bg: 'rgba(100,116,139,0.15)',
//       expectedProgress: 0,
//       actualProgress,
//       performanceRatio: null,
//     }
//   }

//   const expectedProgress = calculateExpectedProgress(task, referenceDate)
//   const performanceRatio = calculateSchedulePerformanceRatio(task, referenceDate)

//   // Avoid treating a 0% expected-progress task as Critical.
//   if (performanceRatio === null) {
//     return {
//       key: 'on-track',
//       label: 'On Track',
//       icon: '🟢',
//       color: '#22c55e',
//       bg: 'rgba(34,197,94,0.15)',
//       expectedProgress,
//       actualProgress,
//       performanceRatio: null,
//     }
//   }

//   if (performanceRatio >= 0.90) {
//     return {
//       key: 'on-track',
//       label: 'On Track',
//       icon: '🟢',
//       color: '#22c55e',
//       bg: 'rgba(34,197,94,0.15)',
//       expectedProgress,
//       actualProgress,
//       performanceRatio,
//     }
//   }

//   if (performanceRatio >= 0.75) {
//     return {
//       key: 'at-risk',
//       label: 'At Risk',
//       icon: '🟠',
//       color: '#f59e0b',
//       bg: 'rgba(245,158,11,0.15)',
//       expectedProgress,
//       actualProgress,
//       performanceRatio,
//     }
//   }

//   return {
//     key: 'critical',
//     label: 'Critical',
//     icon: '🔴',
//     color: '#ef4444',
//     bg: 'rgba(239,68,68,0.15)',
//     expectedProgress,
//     actualProgress,
//     performanceRatio,
//   }
// }

// ─────────────────────────────────────────────────────────────────────────────
// Project Health
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a date is a working day.
 *
 * Monday-Friday = working day
 * Saturday/Sunday = excluded
 *
 * Public holidays and annual leave are intentionally NOT excluded.
 */
// function isWorkingDay(dateStr) {
//   if (!dateStr) return false

//   const d = new Date(`${dateStr}T00:00:00`)
//   const day = d.getDay()

//   return day !== 0 && day !== 6
// }

function isWorkingDay(date) {
  if (!(date instanceof Date) || isNaN(date)) return false

  const day = date.getDay()

  return day !== 0 && day !== 6
}


/**
 * Count working days between two dates, inclusive.
 *
 * Example:
 * 10 Aug (Mon) -> 14 Aug (Fri) = 5 working days
 *
 * Weekends are excluded.
 * Public holidays and annual leave are counted as normal working days.
 */
// export function countWorkingDays(startDate, endDate) {
//   if (!startDate || !endDate) return 0

//   const start = new Date(`${startDate}T00:00:00`)
//   const end = new Date(`${endDate}T00:00:00`)

//   if (start > end) return 0

//   let count = 0
//   const current = new Date(start)

//   while (current <= end) {
//     const iso = current.toISOString().split('T')[0]

//     if (isWorkingDay(iso)) {
//       count++
//     }

//     current.setDate(current.getDate() + 1)
//   }

//   return count
// }

export function countWorkingDays(startDate, endDate) {
  if (!startDate || !endDate) return 0

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (start > end) return 0

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    if (isWorkingDay(current)) {
      count++
    }

    current.setDate(current.getDate() + 1)
  }

  return count
}


/**
 * Calculate expected project progress based on working days.
 *
 * Expected Progress =
 *
 *     Working Days Elapsed
 *     -------------------- × 100
 *     Total Working Days
 *
 * Rules:
 * - Before start date       = 0%
 * - On start date           = first working day of the project
 * - On end date             = 100%
 * - After end date          = 100%
 * - Weekends are excluded
 * - Public holidays counted
 * - Annual leave counted
 */
export function calculateExpectedProgress(
  task,
  referenceDate = today
) {
  const startDate =
    task?.startDate || task?.start_date

  const endDate =
    task?.endDate || task?.end_date

  if (!startDate || !endDate) {
    return 0
  }

  const totalWorkingDays =
    countWorkingDays(startDate, endDate)

  if (totalWorkingDays <= 0) {
    return 0
  }

  // Project has not started.
  if (referenceDate < startDate) {
    return 0
  }

  // Project has reached/passed its end date.
  if (referenceDate >= endDate) {
    return 100
  }

  /*
   * Count working days from the project start
   * through the current/reference date.
   *
   * This includes the current working day.
   */
  const elapsedWorkingDays =
    countWorkingDays(startDate, referenceDate)

  return Math.min(
    100,
    Math.round(
      (elapsedWorkingDays / totalWorkingDays) * 100
    )
  )
}


/**
 * Calculate schedule performance ratio.
 *
 * Actual Progress / Expected Progress
 *
 * Example:
 * Actual = 76%
 * Expected = 80%
 *
 * Ratio = 0.95
 */
export function calculateSchedulePerformanceRatio(
  task,
  referenceDate = today
) {
  const actualProgress = Math.max(
    0,
    Math.min(100, Number(task?.progress) || 0)
  )

  const expectedProgress =
    calculateExpectedProgress(task, referenceDate)

  // Project has not started yet.
  if (expectedProgress <= 0) {
    return null
  }

  return actualProgress / expectedProgress
}


/**
 * Determine project health.
 *
 * Health is based on actual progress compared with
 * expected progress across the project's working days.
 *
 * Priority:
 *
 * 1. Completed
 * 2. Overdue
 * 3. Upcoming
 * 4. Critical
 * 5. At Risk
 * 6. On Track
 */
export function computeProjectHealth(
  task,
  referenceDate = today
) {
  const actualProgress = Math.max(
    0,
    Math.min(100, Number(task?.progress) || 0)
  )

  const startDate =
    task?.startDate || task?.start_date

  const endDate =
    task?.endDate || task?.end_date


  // ─────────────────────────────────────────────────────────────────────────
  // 1. Completed
  // ─────────────────────────────────────────────────────────────────────────

  if (actualProgress >= 100) {
    return {
      key: 'completed',
      label: 'Completed',
      icon: '✅',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
      expectedProgress: 100,
      actualProgress,
      performanceRatio: 1,
    }
  }


  // ─────────────────────────────────────────────────────────────────────────
  // 2. Overdue
  // ─────────────────────────────────────────────────────────────────────────

  if (
    endDate &&
    referenceDate > endDate &&
    actualProgress < 100
  ) {
    const expectedProgress =
      calculateExpectedProgress(task, referenceDate)

    return {
      key: 'overdue',
      label: 'Overdue',
      icon: '⚠️',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.15)',
      expectedProgress,
      actualProgress,
      performanceRatio:
        expectedProgress > 0
          ? actualProgress / expectedProgress
          : null,
    }
  }


  // ─────────────────────────────────────────────────────────────────────────
  // 3. Upcoming
  // ─────────────────────────────────────────────────────────────────────────

  if (
    startDate &&
    referenceDate < startDate
  ) {
    return {
      key: 'upcoming',
      label: 'Upcoming',
      icon: '📅',
      color: '#64748b',
      bg: 'rgba(100,116,139,0.15)',
      expectedProgress: 0,
      actualProgress,
      performanceRatio: null,
    }
  }


  // ─────────────────────────────────────────────────────────────────────────
  // 4-6. On Track / At Risk / Critical
  // ─────────────────────────────────────────────────────────────────────────

  const expectedProgress =
    calculateExpectedProgress(
      task,
      referenceDate
    )

  const performanceRatio =
    calculateSchedulePerformanceRatio(
      task,
      referenceDate
    )


  if (performanceRatio === null) {
    return {
      key: 'on-track',
      label: 'On Track',
      icon: '🟢',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
      expectedProgress,
      actualProgress,
      performanceRatio: null,
    }
  }


  // ≥ 90% of expected progress
  if (performanceRatio >= 0.90) {
    return {
      key: 'on-track',
      label: 'On Track',
      icon: '🟢',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
      expectedProgress,
      actualProgress,
      performanceRatio,
    }
  }


  // 75%-89% of expected progress
  if (performanceRatio >= 0.75) {
    return {
      key: 'at-risk',
      label: 'At Risk',
      icon: '🟠',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.15)',
      expectedProgress,
      actualProgress,
      performanceRatio,
    }
  }


  // < 75% of expected progress
  return {
    key: 'critical',
    label: 'Critical',
    icon: '🔴',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    expectedProgress,
    actualProgress,
    performanceRatio,
  }
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
