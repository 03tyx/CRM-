//GanttChart.jsx
// import { useMemo, useState } from 'react'
// import { IT_MEMBERS, computeStatus, STATUS_COLOR, today } from './helpers'

// export default function GanttChart({ tasks }) {
//   const COL_W = 45
//   const ROW_H = 50 
//   const LABEL_W = 160
  
//   const [expanded, setExpanded] = useState({})
//   const [hoveredRow, setHoveredRow] = useState(null)

//   const toggleMember = (m) => {
//     setExpanded(prev => ({ ...prev, [m]: !prev[m] }))
//   }

//   const cols = useMemo(() => {
//     const arr = []
//     const d = new Date(today)
//     d.setDate(d.getDate() - 7)  // Start 1 week back
//     for (let i = 0; i < 40; i++) {
//       const dayOfWeek = d.getDay()
//       if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//         arr.push(d.toISOString().split('T')[0])
//       }
//       d.setDate(d.getDate() + 1)
//       if (arr.length >= 22) break  // 1 week back + ~2 weeks forward
//     }
//     return arr
//   }, [today])

//   const byMember = useMemo(() => {
//     const map = {}
//     IT_MEMBERS.forEach(m => { map[m] = [] })
//     tasks.forEach(t => { if (map[t.itName]) map[t.itName].push(t) })
//     return map
//   }, [tasks])

//   function dayIdx(dateStr) { return cols.indexOf(dateStr) }

//   const getTooltipStyle = (mIdx) => ({
//     position: 'absolute',
//     top: mIdx < 4 ? '120%' : 'auto',
//     bottom: mIdx < 4 ? 'auto' : '120%',
//     left: 0,
//     background: '#000000', 
//     border: '1px solid #475569',
//     borderRadius: 8,
//     padding: '10px 12px',
//     fontSize: 11,
//     color: '#ffffff',
//     boxShadow: '0 10px 25px rgba(0,0,0,0.9)',
//     whiteSpace: 'nowrap',
//     opacity: 0,
//     pointerEvents: 'none',
//     transition: 'opacity 0.1s',
//     zIndex: 10000, 
//   })

//   const todayIdx = dayIdx(today)

//   return (
//     <div style={{ overflowX: 'auto' }}>
//       <div style={{ display: 'flex', minWidth: LABEL_W + cols.length * COL_W }}>
        
//         {/* Member Labels */}
//         <div style={{ minWidth: LABEL_W, flexShrink: 0, background: '#1e293b', position: 'sticky', left: 0, zIndex: 30 }}>
//           <div style={{ height: 60, borderBottom: '1px solid #334155', display: 'flex',
//             alignItems: 'flex-end', padding: '0 12px 8px', fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>
//             MEMBER
//           </div>
//           {IT_MEMBERS.map(m => {
//             const memberTasks = byMember[m] || []
//             const isExpanded = expanded[m]
//             const currentHeight = isExpanded ? (memberTasks.length * 22) + 12 : ROW_H

//             return (
//               <div key={m} style={{ 
//                 height: Math.max(ROW_H, currentHeight), 
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 padding: '0 12px', borderBottom: '1px solid #0f172a', fontSize: 12, color: '#c0cad8', fontWeight: 600,
//                 transition: 'height 0.2s'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center' }}>
//                   <div style={{ width: 8, height: 8, borderRadius: 99, marginRight: 8, flexShrink: 0,
//                     background: memberTasks.some(t => computeStatus(t) === 'Delayed') ? '#ef4444' : '#3b82f6' }} />
//                   {m}
//                 </div>
//                 {memberTasks.length > 2 && (
//                   <div 
//                     onClick={() => toggleMember(m)}
//                     style={{ cursor: 'pointer', fontSize: 10, color: '#64748b', padding: '4px' }}
//                   >
//                     {isExpanded ? '▲' : '▼'}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Timeline Grid */}
//         <div style={{ position: 'relative', flex: 1 }}>
//           <div style={{ display: 'flex', height: 60, borderBottom: '1px solid #334155' }}>
//             {cols.map((d) => {
//               const date = new Date(d)
//               const isToday = d === today
//               return (
//                 <div key={d} style={{
//                   minWidth: COL_W, width: COL_W, flexShrink: 0,
//                   background: isToday ? 'rgba(59,130,246,0.1)' : 'transparent',
//                   borderLeft: '1px solid #1e293b',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//                   color: isToday ? '#89a9ff' : '#64748b'
//                 }}>
//                   <span style={{ fontSize: 9, fontWeight: 700 }}>{date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}</span>
//                   <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 400 }}>{date.getDate()}</span>
//                 </div>
//               )
//             })}
//           </div>

//           {/* Data Rows */}
//           {IT_MEMBERS.map((m, mIdx) => {
//             const memberTasks = byMember[m] || []
//             const isExpanded = expanded[m]
//             const isHovered = hoveredRow === m
//             const currentHeight = isExpanded ? (memberTasks.length * 22) + 12 : ROW_H
            
//             return (
//               <div key={m} 
//                 onMouseEnter={() => setHoveredRow(m)}
//                 onMouseLeave={() => setHoveredRow(null)}
//                 style={{ 
//                   position: 'relative', 
//                   height: Math.max(ROW_H, currentHeight), 
//                   borderBottom: '1px solid #0f172a', 
//                   display: 'flex',
//                   overflow: (isExpanded || isHovered) ? 'visible' : 'hidden', 
//                   transition: 'height 0.2s',
//                   zIndex: isHovered ? 50 : 1 
//                 }}>
//                 {cols.map(d => (
//                   <div key={d} style={{
//                     minWidth: COL_W, width: COL_W, flexShrink: 0,
//                     background: d === today ? 'rgba(59,130,246,0.05)' : 'transparent',
//                     borderLeft: '1px solid #1e293b'
//                   }} />
//                 ))}

//                 {/* Vertical Line for Today */}
//                 {todayIdx >= 0 && (
//                   <div style={{ position: 'absolute', left: (todayIdx * COL_W) + (COL_W / 2) - 1, top: 0, bottom: 0, width: 2, background: '#3b82f6', zIndex: 5, pointerEvents: 'none' }} />
//                 )}

//                 {/* One Week After Vertical Line (Centered) */}
//                {todayIdx + 5 >= 0 && (todayIdx + 5) < cols.length && (
//                  <div style={{ 
//                    position: 'absolute', 
//                    left: ((todayIdx + 5) * COL_W) + (COL_W / 2) - 1, // 5 working days = 1 week
//                    top: 0, 
//                    bottom: 0, 
//                    width: 2, 
//                    background: '#f97316', // Orange color
//                    zIndex: 5, 
//                    pointerEvents: 'none',
//                    borderLeft: '1px dashed rgba(249, 115, 22, 0.5)' // Optional dash effect
//                  }} />
//                )}

//                 {/* Task Bars */}
//                 {memberTasks.map((t, tIdx) => {
//                     let si = dayIdx(t.startDate)
//                     // No endDate → extend to last day of the window
//                     const effectiveEnd = t.endDate || cols[cols.length - 1]
//                     let ei = dayIdx(effectiveEnd)

//                     // Task ends before the window starts — skip
//                     if (ei < 0) return null
//                     // Task starts after the window ends — skip
//                     if (si >= cols.length) return null

//                     // Clamp: if start is before window, pin to first column
//                     const clampedSi = si < 0 ? 0 : si
//                     const clampedEi = Math.min(cols.length - 1, ei)

//                     const left = clampedSi * COL_W
//                     const width = Math.max(COL_W - 4, (clampedEi - clampedSi + 1) * COL_W)
//                     const topOffset = 4 + (tIdx * 22)
//                     const st = computeStatus(t)
//                     const color = STATUS_COLOR[st]

//                     return (
//                       <div key={t.id}
//                         className="task-bar-container"
//                         onMouseEnter={e => { 
//                           e.currentTarget.querySelector('.task-tooltip').style.opacity = 1
//                           e.currentTarget.style.zIndex = 100 
//                         }}
//                         onMouseLeave={e => { 
//                           e.currentTarget.querySelector('.task-tooltip').style.opacity = 0
//                           e.currentTarget.style.zIndex = 10 + tIdx 
//                         }}
//                         style={{
//                           position: 'absolute', left: left + 2, top: topOffset,
//                           height: 18, width: width - 4, borderRadius: 4,
//                           background: `${color}25`, border: `1px solid ${color}80`,
//                           display: 'flex', alignItems: 'center', padding: '0 6px',
//                           cursor: 'pointer', 
//                           zIndex: 10 + tIdx,
//                           transition: 'z-index 0s'
//                         }}>
                        
//                         <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t.progress}%`, background: `${color}30` }} />
//                         <span style={{ fontSize: 9, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 2 }}>
//                           {t.project}
//                         </span>

//                         <div className="task-tooltip" style={getTooltipStyle(mIdx)}>
//                           <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.project}</div>
//                           <div style={{ fontSize: 10 }}>📅 {t.startDate} → {t.endDate}</div>
//                           <div style={{ fontSize: 10 }}>👷 Manday: {t.manday} | Status: {st}</div>
//                           {t.targetUAT && <div style={{ fontSize: 10, color: '#8b5cf6' }}>🎯 UAT: {t.targetUAT}</div>}
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               );
//             })}
//         </div>
//       </div>
      
//       {/* Legend */}
//       <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', padding: '0 4px' }}>
//         {Object.entries(STATUS_COLOR).map(([s, c]) => (
//           <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
//             <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {s}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

//GanttChart.jsx
import { useMemo, useState } from 'react'
import { IT_MEMBERS, computeStatus, STATUS_COLOR, today } from './helpers'

const COL_W    = 38
const ROW_H    = 54
const LABEL_W  = 175
const HEADER_H = 80

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function fmtShort(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function buildCols(startDate, endDate) {
  const arr = []
  const cur = new Date(startDate)
  const end = new Date(endDate)
  while (cur <= end) {
    arr.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return arr
}

export default function GanttChart({ tasks = [], leaves = [] }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  // ── Time range ─────────────────────────────────────────────────────────────
  const { rangeStart, rangeEnd, cols } = useMemo(() => {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 2)
    start.setDate(1)
    const end = new Date(today)
    end.setMonth(end.getMonth() + 3)
    end.setDate(0)
    const s = start.toISOString().split('T')[0]
    const e = end.toISOString().split('T')[0]
    return { rangeStart: s, rangeEnd: e, cols: buildCols(s, e) }
  }, [])

  const colIdxMap = useMemo(() => {
    const m = {}
    cols.forEach((d, i) => { m[d] = i })
    return m
  }, [cols])

  function dayIdx(dateStr) { return colIdxMap[dateStr] ?? -1 }

  function nearestIdx(dateStr) {
    if (!dateStr) return -1
    if (colIdxMap[dateStr] !== undefined) return colIdxMap[dateStr]
    for (let i = 1; i <= 3; i++) {
      const next = addDays(dateStr, i)
      if (colIdxMap[next] !== undefined) return colIdxMap[next]
    }
    for (let i = 1; i <= 3; i++) {
      const prev = addDays(dateStr, -i)
      if (colIdxMap[prev] !== undefined) return colIdxMap[prev]
    }
    return -1
  }

  const todayIdx = dayIdx(today)
  const weekIdx = (() => {
    let count = 0, i = todayIdx + 1
    while (i < cols.length && count < 5) {
      const day = new Date(cols[i]).getDay()
      if (day !== 0 && day !== 6) count++
      if (count < 5) i++
    }
    return i < cols.length ? i : -1
  })()

  const oneMonthAgo = addDays(today, -30)

  const byMember = useMemo(() => {
    const map = {}
    IT_MEMBERS.forEach(m => { map[m] = [] })
    tasks.forEach(t => {
      if (!map[t.itName]) return
      const st = computeStatus({ ...t, start_date: t.startDate, end_date: t.endDate })
      if (st === 'Completed' && t.endDate && t.endDate < oneMonthAgo) return
      const effectiveEnd = t.endDate || rangeEnd
      const startInRange = t.startDate >= rangeStart && t.startDate <= rangeEnd
      const endInRange   = effectiveEnd >= rangeStart && effectiveEnd <= rangeEnd
      const spansRange   = t.startDate <= rangeStart && effectiveEnd >= rangeEnd
      if (!startInRange && !endInRange && !spansRange) return
      map[t.itName].push(t)
    })
    return map
  }, [tasks, rangeStart, rangeEnd, oneMonthAgo])

  const alByMember = useMemo(() => {
    const map = {}
    IT_MEMBERS.forEach(m => { map[m] = [] })
    leaves.forEach(l => {
      if (!map[l.it_name]) return
      if (l.end_date >= today && l.start_date <= rangeEnd) map[l.it_name].push(l)
    })
    return map
  }, [leaves, rangeEnd])

  function rowHeight(m) {
    const taskCount = (byMember[m] || []).length
    const alCount   = (alByMember[m] || []).length
    const taskH = Math.max(ROW_H, taskCount * 22 + 12)
    return alCount > 0 ? taskH + 16 : taskH
  }

  const monthGroups = useMemo(() => {
    const groups = []
    let cur = null
    cols.forEach((d, i) => {
      const label = new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      if (!cur || cur.label !== label) {
        cur = { label, start: i, count: 1 }
        groups.push(cur)
      } else {
        cur.count++
      }
    })
    return groups
  }, [cols])

  // ── Tooltip: fixed position, follows mouse ────────────────────────────────
  // Each bar uses onMouseMove to set left/top on its .task-tooltip child
  // so the tooltip always appears near the cursor regardless of scroll position.
  const baseTTStyle = {
    position:     'fixed',
    background:   '#0f172a',
    border:       '1px solid #475569',
    borderRadius: 8,
    padding:      '10px 14px',
    fontSize:     11,
    color:        '#e2e8f0',
    boxShadow:    '0 10px 30px rgba(0,0,0,0.8)',
    whiteSpace:   'nowrap',
    opacity:      0,
    pointerEvents:'none',
    transition:   'opacity 0.1s',
    zIndex:       10000,
    minWidth:     200,
    // left/top are set dynamically via onMouseMove
  }

  function handleBarMouseMove(e) {
    const tt = e.currentTarget.querySelector('.task-tooltip')
    if (!tt) return
    const OFFSET = 14
    const ttW = tt.offsetWidth || 220
    const ttH = tt.offsetHeight || 120
    const vw  = window.innerWidth
    const vh  = window.innerHeight
    // Prefer right of cursor, flip left if too close to right edge
    let left = e.clientX + OFFSET
    if (left + ttW > vw - 8) left = e.clientX - ttW - OFFSET
    // Prefer below cursor, flip above if too close to bottom
    let top = e.clientY + OFFSET
    if (top + ttH > vh - 8) top = e.clientY - ttH - OFFSET
    tt.style.left = left + 'px'
    tt.style.top  = top  + 'px'
  }

  const totalW = LABEL_W + cols.length * COL_W

  return (
    <div style={{ position: 'relative', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '80vh' }}>
        <div style={{ minWidth: totalW, position: 'relative' }}>

          {/* ── Sticky header ── */}
          <div style={{
            display: 'flex', position: 'sticky', top: 0, zIndex: 40,
            height: HEADER_H, background: '#1e293b',
            borderBottom: '2px solid #334155',
          }}>
            {/* Top-left corner */}
            <div style={{
              minWidth: LABEL_W, width: LABEL_W, flexShrink: 0,
              position: 'sticky', left: 0, zIndex: 50,
              background: '#1e293b', borderRight: '1px solid #334155',
              display: 'flex', alignItems: 'flex-end',
              padding: '0 14px 8px',
              fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em',
            }}>MEMBER</div>

            {/* Day columns */}
            <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
              {/* Month row */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', height: 22 }}>
                {monthGroups.map((g, gi) => (
                  <div key={gi} style={{
                    minWidth: g.count * COL_W, width: g.count * COL_W,
                    fontSize: 9, fontWeight: 800, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderLeft: '1px solid #334155',
                    display: 'flex', alignItems: 'center', paddingLeft: 6,
                    background: '#1e293b',
                  }}>{g.label}</div>
                ))}
              </div>

              {/* Day row */}
              <div style={{ position: 'absolute', top: 22, left: 0, display: 'flex', height: 36 }}>
                {cols.map(d => {
                  const date = new Date(d)
                  const dow  = date.getDay()
                  const isToday   = d === today
                  const isWeekend = dow === 0 || dow === 6
                  return (
                    <div key={d} style={{
                      minWidth: COL_W, width: COL_W, flexShrink: 0,
                      background: isToday ? 'rgba(59,130,246,0.15)' : isWeekend ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderLeft: `1px solid ${isToday ? '#3b82f6' : '#1e293b'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: isToday ? '#93c5fd' : isWeekend ? '#334155' : '#64748b',
                    }}>
                      <span style={{ fontSize: 8, fontWeight: 700 }}>
                        {date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 400 }}>{date.getDate()}</span>
                    </div>
                  )
                })}
              </div>

              {/* TODAY label */}
              {todayIdx >= 0 && (
                <div style={{
                  position: 'absolute', left: todayIdx * COL_W + COL_W / 2 - 16,
                  top: 58, width: 32, fontSize: 8, fontWeight: 800, color: '#3b82f6',
                  textAlign: 'center', pointerEvents: 'none', zIndex: 6,
                }}>TODAY</div>
              )}

              {/* +1 WK label */}
              {weekIdx >= 0 && (
                <div style={{
                  position: 'absolute', left: weekIdx * COL_W + COL_W / 2 - 20,
                  top: 58, width: 40, fontSize: 8, fontWeight: 800, color: '#f97316',
                  textAlign: 'center', pointerEvents: 'none', zIndex: 6,
                }}>+1 WK</div>
              )}
            </div>
          </div>

          {/* ── Data rows ── */}
          <div style={{ display: 'flex' }}>

            {/* Sticky left label column */}
            <div style={{
              minWidth: LABEL_W, width: LABEL_W, flexShrink: 0,
              position: 'sticky', left: 0, zIndex: 20,
              background: '#1e293b', borderRight: '1px solid #334155',
            }}>
              {IT_MEMBERS.map(m => {
                const memberTasks = byMember[m] || []
                const myAL        = alByMember[m] || []
                const h           = rowHeight(m)
                const hasDelayed  = memberTasks.some(t =>
                  computeStatus({ ...t, start_date: t.startDate, end_date: t.endDate }) === 'Delayed'
                )
                return (
                  <div key={m} style={{
                    height: h, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', padding: '0 12px',
                    borderBottom: '1px solid #0f172a', fontSize: 12, color: '#c0cad8', fontWeight: 600,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 99, flexShrink: 0,
                        background: hasDelayed ? '#ef4444' : '#3b82f6' }} />
                      <span style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m}
                      </span>
                    </div>
                    {myAL.map(al => (
                      <div key={al.id} style={{
                        fontSize: 9, color: '#f97316', fontWeight: 600,
                        marginTop: 3, paddingLeft: 13,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        🌴 {fmtShort(al.start_date)}{al.start_date !== al.end_date ? ` – ${fmtShort(al.end_date)}` : ''}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Timeline rows */}
            <div style={{ position: 'relative', flex: 1 }}>
              {IT_MEMBERS.map((m, mIdx) => {
                const memberTasks = byMember[m] || []
                const myAL        = alByMember[m] || []
                const h           = rowHeight(m)
                const isHovered   = hoveredRow === m

                return (
                  <div key={m}
                    onMouseEnter={() => setHoveredRow(m)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      position: 'relative', height: h,
                      borderBottom: '1px solid #0f172a',
                      overflow: isHovered ? 'visible' : 'hidden',
                      zIndex: isHovered ? 30 : 1,
                    }}
                  >
                    {/* Grid background */}
                    <div style={{ display: 'flex', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                      {cols.map(d => {
                        const dow = new Date(d).getDay()
                        const isWeekend = dow === 0 || dow === 6
                        return (
                          <div key={d} style={{
                            minWidth: COL_W, width: COL_W, height: '100%', flexShrink: 0,
                            background: d === today ? 'rgba(59,130,246,0.05)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
                            borderLeft: `1px solid ${isWeekend ? '#172032' : '#1e293b'}`,
                          }} />
                        )
                      })}
                    </div>

                    {/* AL highlight band */}
                    {myAL.map(al => {
                      const si = nearestIdx(al.start_date)
                      let ei = -1
                      for (let i = cols.length - 1; i >= 0; i--) {
                        if (cols[i] <= al.end_date) { ei = i; break }
                      }
                      if (si < 0 || ei < 0 || ei < si) return null
                      return (
                        <div key={al.id} style={{
                          position: 'absolute', left: si * COL_W, top: 0, bottom: 0,
                          width: (ei - si + 1) * COL_W,
                          background: 'rgba(251,146,60,0.10)',
                          borderLeft: '2px solid rgba(251,146,60,0.55)',
                          borderRight: '2px solid rgba(251,146,60,0.55)',
                          zIndex: 2, pointerEvents: 'none',
                        }} />
                      )
                    })}

                    {/* Today line */}
                    {todayIdx >= 0 && (
                      <div style={{
                        position: 'absolute', left: todayIdx * COL_W + COL_W / 2 - 1,
                        top: 0, bottom: 0, width: 2, background: '#3b82f6', zIndex: 5, pointerEvents: 'none',
                      }} />
                    )}

                    {/* +1 week line */}
                    {weekIdx >= 0 && (
                      <div style={{
                        position: 'absolute', left: weekIdx * COL_W + COL_W / 2 - 1,
                        top: 0, bottom: 0, width: 2, background: '#f97316', zIndex: 5, pointerEvents: 'none',
                      }} />
                    )}

                    {/* Task bars */}
                    {memberTasks.map((t, tIdx) => {
                      const effectiveEnd = t.endDate || rangeEnd
                      const si = nearestIdx(t.startDate)
                      const ei = nearestIdx(effectiveEnd)

                      if (si < 0 && ei < 0) return null
                      if (si >= cols.length) return null

                      const clampedSi = si < 0 ? 0 : si
                      const clampedEi = ei < 0 ? cols.length - 1 : Math.min(cols.length - 1, ei)
                      const left      = clampedSi * COL_W
                      const width     = Math.max(COL_W - 4, (clampedEi - clampedSi + 1) * COL_W)
                      const topOffset = 4 + tIdx * 22
                      const st        = computeStatus({ ...t, start_date: t.startDate, end_date: t.endDate })
                      const color     = STATUS_COLOR[st]

                      return (
                        <div
                          key={t.id}
                          className="task-bar-container"
                          onMouseEnter={e => {
                            e.currentTarget.querySelector('.task-tooltip').style.opacity = '1'
                            e.currentTarget.style.zIndex = '200'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.querySelector('.task-tooltip').style.opacity = '0'
                            e.currentTarget.style.zIndex = String(10 + tIdx)
                          }}
                          onMouseMove={handleBarMouseMove}
                          style={{
                            position: 'absolute', left: left + 2, top: topOffset,
                            height: 18, width: width - 4, borderRadius: 4,
                            background: `${color}22`, border: `1px solid ${color}88`,
                            display: 'flex', alignItems: 'center', padding: '0 5px',
                            cursor: 'pointer', zIndex: 10 + tIdx,
                          }}
                        >
                          <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${t.progress || 0}%`, background: `${color}30`, borderRadius: 4,
                          }} />
                          <span style={{
                            fontSize: 9, fontWeight: 700, color,
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', zIndex: 2, maxWidth: '100%',
                          }}>
                            {t.project}
                          </span>

                          {/* Tooltip — position set by onMouseMove, not relative to bar */}
                          <div className="task-tooltip" style={baseTTStyle}>
                            <div style={{ fontWeight: 800, color: '#f1f5f9', marginBottom: 6, fontSize: 12 }}>
                              {t.project}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <div style={{ color: '#94a3b8' }}>⏱ Manday: <span style={{ color: '#e2e8f0' }}>{t.manday || '—'}</span></div>
                              <div style={{ color: '#94a3b8' }}>📅 Start: <span style={{ color: '#e2e8f0' }}>{t.startDate || '—'}</span></div>
                              <div style={{ color: '#94a3b8' }}>🏁 End: <span style={{ color: '#e2e8f0' }}>{t.endDate || '—'}</span></div>
                              <div style={{ color: '#94a3b8' }}>📊 Progress: <span style={{ color: '#e2e8f0' }}>{t.progress || 0}%</span></div>
                              <div style={{ color: '#94a3b8' }}>🏷 Status: <span style={{ color }}>{st}</span></div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', padding: '0 4px' }}>
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {s}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(251,146,60,0.4)', border: '1px solid #f97316' }} />
          Annual Leave
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
          <div style={{ width: 2, height: 10, background: '#3b82f6' }} /> Today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8' }}>
          <div style={{ width: 2, height: 10, background: '#f97316' }} /> Today + 1 Week
        </div>
      </div>
    </div>
  )
}