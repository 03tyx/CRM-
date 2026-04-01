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
//     d.setDate(d.getDate() - 7)
//     for (let i = 0; i < 40; i++) {
//       const dayOfWeek = d.getDay()
//       if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//         arr.push(d.toISOString().split('T')[0])
//       }
//       d.setDate(d.getDate() + 1)
//       if (arr.length >= 22) break
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
//                     let ei = dayIdx(t.endDate)
//                     if (ei < 0 || si >= cols.length) return null
                    
//                     const left = Math.max(0, si) * COL_W
//                     const width = (Math.min(cols.length - 1, ei) - Math.max(0, si) + 1) * COL_W
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

// import { useMemo } from 'react'
// import { IT_MEMBERS, computeStatus, STATUS_COLOR, today } from './helpers'

// export default function GanttChart({ tasks }) {
//   const COL_W = 45 // Wider columns for daily view
//   const ROW_H = 50 // Increased row height to allow stacking tasks
//   const LABEL_W = 160

//   const cols = useMemo(() => {
//     const arr = []
//     const d = new Date(today)
//     d.setDate(d.getDate() - 7) // Start 1 week back

//     // Generate working days only (No Sat/Sun)
//     for (let i = 0; i < 40; i++) {
//       const dayOfWeek = d.getDay()
//       if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//         arr.push(d.toISOString().split('T')[0])
//       }
//       d.setDate(d.getDate() + 1)
//       if (arr.length >= 22) break // 1 week back + ~2 weeks forward
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

//   // Tooltip positioning helper: if member is in top half, show tooltip below bar
//   const getTooltipStyle = (mIdx) => ({
//     position: 'absolute',
//     top: mIdx < 4 ? '110%' : 'auto',
//     bottom: mIdx < 4 ? 'auto' : '110%',
//     left: 0,
//     background: '#000000',
//     border: '1px solid #334155',
//     borderRadius: 8,
//     padding: '10px 12px',
//     fontSize: 11,
//     color: '#cbd5f5',
//     boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
//     whiteSpace: 'nowrap',
//     opacity: 0,
//     pointerEvents: 'none',
//     transition: 'opacity 0.15s',
//     zIndex: 9999,
//   })

//   const todayIdx = dayIdx(today)

//   return (
//     <div style={{ overflowX: 'auto' }}>
//       <div style={{ display: 'flex', minWidth: LABEL_W + cols.length * COL_W }}>
        
//         {/* Member Labels */}
//         <div style={{ minWidth: LABEL_W, flexShrink: 0, background: '#1e293b', position: 'sticky', left: 0, zIndex: 10 }}>
//           <div style={{ height: 60, borderBottom: '1px solid #334155', display: 'flex',
//             alignItems: 'flex-end', padding: '0 12px 8px', fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>
//             MEMBER
//           </div>
//           {IT_MEMBERS.map(m => (
//             <div key={m} style={{ height: ROW_H, display: 'flex', alignItems: 'center',
//               padding: '0 12px', borderBottom: '1px solid #0f172a', fontSize: 12, color: '#c0cad8', fontWeight: 600 }}>
//               <div style={{ width: 8, height: 8, borderRadius: 99, marginRight: 8, flexShrink: 0,
//                 background: byMember[m]?.some(t => computeStatus(t) === 'Delayed') ? '#ef4444' : '#3b82f6' }} />
//               {m}
//             </div>
//           ))}
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
//           {IT_MEMBERS.map((m, mIdx) => (
//             <div key={m} style={{ position: 'relative', height: ROW_H, borderBottom: '1px solid #0f172a', display: 'flex' }}>
//               {cols.map(d => (
//                 <div key={d} style={{
//                   minWidth: COL_W, width: COL_W, flexShrink: 0,
//                   background: d === today ? 'rgba(59,130,246,0.05)' : 'transparent',
//                   borderLeft: '1px solid #1e293b'
//                 }} />
//               ))}

//               {/* Today Vertical Line (Centered) */}
//               {todayIdx >= 0 && (
//                 <div style={{ 
//                   position: 'absolute', 
//                   left: (todayIdx * COL_W) + (COL_W / 2) - 1, // Offset by half column width
//                   top: 0, 
//                   bottom: 0, 
//                   width: 2, 
//                   background: '#3b82f6', 
//                   zIndex: 5, 
//                   pointerEvents: 'none' 
//                 }} />
//               )}

//               {/* One Week After Vertical Line (Centered) */}
//               {todayIdx + 5 >= 0 && (todayIdx + 5) < cols.length && (
//                 <div style={{ 
//                   position: 'absolute', 
//                   left: ((todayIdx + 5) * COL_W) + (COL_W / 2) - 1, // 5 working days = 1 week
//                   top: 0, 
//                   bottom: 0, 
//                   width: 2, 
//                   background: '#f97316', // Orange color
//                   zIndex: 5, 
//                   pointerEvents: 'none',
//                   borderLeft: '1px dashed rgba(249, 115, 22, 0.5)' // Optional dash effect
//                 }} />
//               )}

//               {/* Task Bars with Staggering */}
//               {byMember[m]?.map((t, tIdx) => {
//                 let si = dayIdx(t.startDate)
//                 let ei = dayIdx(t.endDate)
//                 if (ei < 0 || si >= cols.length) return null
                
//                 const clampedSi = Math.max(0, si)
//                 const clampedEi = Math.min(cols.length - 1, ei)
//                 const left = clampedSi * COL_W
//                 const width = (clampedEi - clampedSi + 1) * COL_W
                
//                 // Stack overlapping tasks by shifting 'top' based on index
//                 const barHeight = 18
//                 const topOffset = 4 + (tIdx * 22) 
                
//                 const st = computeStatus(t)
//                 const color = STATUS_COLOR[st]

//                 return (
//                   <div key={t.id}
//                     className="task-bar-container"
//                     onMouseEnter={e => { e.currentTarget.querySelector('.task-tooltip').style.opacity = 1 }}
//                     onMouseLeave={e => { e.currentTarget.querySelector('.task-tooltip').style.opacity = 0 }}
//                     style={{
//                       position: 'absolute', left: left + 2, top: topOffset,
//                       height: barHeight, width: width - 4, borderRadius: 4,
//                       background: `${color}25`, border: `1px solid ${color}80`,
//                       display: 'flex', alignItems: 'center', padding: '0 6px',
//                       cursor: 'pointer', zIndex: 10 + tIdx
//                     }}>
                    
//                     <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t.progress}%`, background: `${color}30` }} />
//                     <span style={{ fontSize: 9, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 2 }}>
//                       {t.project}
//                     </span>

//                     {/* Improved Tooltip */}
//                     <div className="task-tooltip" style={getTooltipStyle(mIdx)}>
//                       <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.project}</div>
//                       <div style={{ fontSize: 10 }}>📅 {t.startDate} → {t.endDate}</div>
//                       <div style={{ fontSize: 10 }}>👷 Manday: {t.manday} | Status: {st}</div>
//                       {t.targetUAT && <div style={{ fontSize: 10, color: '#8b5cf6' }}>🎯 UAT: {t.targetUAT}</div>}
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           ))}
//         </div>
//       </div>
      
//       {/* Legend & Footer */}
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

export default function GanttChart({ tasks }) {
  const COL_W = 45
  const ROW_H = 50 
  const LABEL_W = 160
  
  const [expanded, setExpanded] = useState({})
  const [hoveredRow, setHoveredRow] = useState(null)

  const toggleMember = (m) => {
    setExpanded(prev => ({ ...prev, [m]: !prev[m] }))
  }

  const cols = useMemo(() => {
    const arr = []
    const d = new Date(today)
    d.setDate(d.getDate() - 7)  // Start 1 week back
    for (let i = 0; i < 40; i++) {
      const dayOfWeek = d.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        arr.push(d.toISOString().split('T')[0])
      }
      d.setDate(d.getDate() + 1)
      if (arr.length >= 22) break  // 1 week back + ~2 weeks forward
    }
    return arr
  }, [today])

  const byMember = useMemo(() => {
    const map = {}
    IT_MEMBERS.forEach(m => { map[m] = [] })
    tasks.forEach(t => { if (map[t.itName]) map[t.itName].push(t) })
    return map
  }, [tasks])

  function dayIdx(dateStr) { return cols.indexOf(dateStr) }

  const getTooltipStyle = (mIdx) => ({
    position: 'absolute',
    top: mIdx < 4 ? '120%' : 'auto',
    bottom: mIdx < 4 ? 'auto' : '120%',
    left: 0,
    background: '#000000', 
    border: '1px solid #475569',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 11,
    color: '#ffffff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.9)',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.1s',
    zIndex: 10000, 
  })

  const todayIdx = dayIdx(today)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', minWidth: LABEL_W + cols.length * COL_W }}>
        
        {/* Member Labels */}
        <div style={{ minWidth: LABEL_W, flexShrink: 0, background: '#1e293b', position: 'sticky', left: 0, zIndex: 30 }}>
          <div style={{ height: 60, borderBottom: '1px solid #334155', display: 'flex',
            alignItems: 'flex-end', padding: '0 12px 8px', fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>
            MEMBER
          </div>
          {IT_MEMBERS.map(m => {
            const memberTasks = byMember[m] || []
            const isExpanded = expanded[m]
            const currentHeight = isExpanded ? (memberTasks.length * 22) + 12 : ROW_H

            return (
              <div key={m} style={{ 
                height: Math.max(ROW_H, currentHeight), 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 12px', borderBottom: '1px solid #0f172a', fontSize: 12, color: '#c0cad8', fontWeight: 600,
                transition: 'height 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, marginRight: 8, flexShrink: 0,
                    background: memberTasks.some(t => computeStatus(t) === 'Delayed') ? '#ef4444' : '#3b82f6' }} />
                  {m}
                </div>
                {memberTasks.length > 2 && (
                  <div 
                    onClick={() => toggleMember(m)}
                    style={{ cursor: 'pointer', fontSize: 10, color: '#64748b', padding: '4px' }}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timeline Grid */}
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ display: 'flex', height: 60, borderBottom: '1px solid #334155' }}>
            {cols.map((d) => {
              const date = new Date(d)
              const isToday = d === today
              return (
                <div key={d} style={{
                  minWidth: COL_W, width: COL_W, flexShrink: 0,
                  background: isToday ? 'rgba(59,130,246,0.1)' : 'transparent',
                  borderLeft: '1px solid #1e293b',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: isToday ? '#89a9ff' : '#64748b'
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}</span>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 400 }}>{date.getDate()}</span>
                </div>
              )
            })}
          </div>

          {/* Data Rows */}
          {IT_MEMBERS.map((m, mIdx) => {
            const memberTasks = byMember[m] || []
            const isExpanded = expanded[m]
            const isHovered = hoveredRow === m
            const currentHeight = isExpanded ? (memberTasks.length * 22) + 12 : ROW_H
            
            return (
              <div key={m} 
                onMouseEnter={() => setHoveredRow(m)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ 
                  position: 'relative', 
                  height: Math.max(ROW_H, currentHeight), 
                  borderBottom: '1px solid #0f172a', 
                  display: 'flex',
                  overflow: (isExpanded || isHovered) ? 'visible' : 'hidden', 
                  transition: 'height 0.2s',
                  zIndex: isHovered ? 50 : 1 
                }}>
                {cols.map(d => (
                  <div key={d} style={{
                    minWidth: COL_W, width: COL_W, flexShrink: 0,
                    background: d === today ? 'rgba(59,130,246,0.05)' : 'transparent',
                    borderLeft: '1px solid #1e293b'
                  }} />
                ))}

                {/* Vertical Line for Today */}
                {todayIdx >= 0 && (
                  <div style={{ position: 'absolute', left: (todayIdx * COL_W) + (COL_W / 2) - 1, top: 0, bottom: 0, width: 2, background: '#3b82f6', zIndex: 5, pointerEvents: 'none' }} />
                )}

                {/* One Week After Vertical Line (Centered) */}
               {todayIdx + 5 >= 0 && (todayIdx + 5) < cols.length && (
                 <div style={{ 
                   position: 'absolute', 
                   left: ((todayIdx + 5) * COL_W) + (COL_W / 2) - 1, // 5 working days = 1 week
                   top: 0, 
                   bottom: 0, 
                   width: 2, 
                   background: '#f97316', // Orange color
                   zIndex: 5, 
                   pointerEvents: 'none',
                   borderLeft: '1px dashed rgba(249, 115, 22, 0.5)' // Optional dash effect
                 }} />
               )}

                {/* Task Bars */}
                {memberTasks.map((t, tIdx) => {
                    let si = dayIdx(t.startDate)
                    // No endDate → extend to last day of the window
                    const effectiveEnd = t.endDate || cols[cols.length - 1]
                    let ei = dayIdx(effectiveEnd)

                    // Task ends before the window starts — skip
                    if (ei < 0) return null
                    // Task starts after the window ends — skip
                    if (si >= cols.length) return null

                    // Clamp: if start is before window, pin to first column
                    const clampedSi = si < 0 ? 0 : si
                    const clampedEi = Math.min(cols.length - 1, ei)

                    const left = clampedSi * COL_W
                    const width = Math.max(COL_W - 4, (clampedEi - clampedSi + 1) * COL_W)
                    const topOffset = 4 + (tIdx * 22)
                    const st = computeStatus(t)
                    const color = STATUS_COLOR[st]

                    return (
                      <div key={t.id}
                        className="task-bar-container"
                        onMouseEnter={e => { 
                          e.currentTarget.querySelector('.task-tooltip').style.opacity = 1
                          e.currentTarget.style.zIndex = 100 
                        }}
                        onMouseLeave={e => { 
                          e.currentTarget.querySelector('.task-tooltip').style.opacity = 0
                          e.currentTarget.style.zIndex = 10 + tIdx 
                        }}
                        style={{
                          position: 'absolute', left: left + 2, top: topOffset,
                          height: 18, width: width - 4, borderRadius: 4,
                          background: `${color}25`, border: `1px solid ${color}80`,
                          display: 'flex', alignItems: 'center', padding: '0 6px',
                          cursor: 'pointer', 
                          zIndex: 10 + tIdx,
                          transition: 'z-index 0s'
                        }}>
                        
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${t.progress}%`, background: `${color}30` }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', zIndex: 2 }}>
                          {t.project}
                        </span>

                        <div className="task-tooltip" style={getTooltipStyle(mIdx)}>
                          <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.project}</div>
                          <div style={{ fontSize: 10 }}>📅 {t.startDate} → {t.endDate}</div>
                          <div style={{ fontSize: 10 }}>👷 Manday: {t.manday} | Status: {st}</div>
                          {t.targetUAT && <div style={{ fontSize: 10, color: '#8b5cf6' }}>🎯 UAT: {t.targetUAT}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', padding: '0 4px' }}>
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {s}
          </div>
        ))}
      </div>
    </div>
  )
}