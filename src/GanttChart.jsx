import { useMemo } from 'react'
import { IT_MEMBERS, computeStatus, STATUS_COLOR, today } from './helpers'

export default function GanttChart({ tasks }) {
  const DAYS = 56 // 8 weeks total
  const COL_W = 22
  const ROW_H = 38
  const LABEL_W = 155

  const cols = useMemo(() => {
    const arr = []
    const d = new Date(today)
    d.setDate(d.getDate() - 7) // start 1 week back
    for (let i = 0; i < DAYS; i++) {
      arr.push(d.toISOString().split('T')[0])
      d.setDate(d.getDate() + 1)
    }
    return arr
  }, [])

  const byMember = useMemo(() => {
    const map = {}
    IT_MEMBERS.forEach(m => { map[m] = [] })
    tasks.forEach(t => { if (map[t.itName]) map[t.itName].push(t) })
    return map
  }, [tasks])

  function dayIdx(dateStr) { return cols.indexOf(dateStr) }

  const colBgs = cols.map(d => {
    if (d === today) return 'rgba(59,130,246,0.13)'
    const dow = new Date(d).getDay()
    return (dow === 0 || dow === 6) ? 'rgba(255,255,255,0.018)' : 'transparent'
  })

  // month label positions
  const monthLabels = useMemo(() => {
    const labels = []
    cols.forEach((d, i) => {
      const date = new Date(d)
      if (date.getDate() === 1 || i === 0) {
        labels.push({ i, label: date.toLocaleString('en', { month: 'short', year: '2-digit' }) })
      }
    })
    return labels
  }, [cols])

  const todayIdx = dayIdx(today)
  const twoWeekIdx = todayIdx + 14

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', minWidth: LABEL_W + cols.length * COL_W }}>
        {/* Left label column */}
        <div style={{ minWidth: LABEL_W, flexShrink: 0 }}>
          <div style={{ height: 52, borderBottom: '1px solid #1e3a5f', display: 'flex',
            alignItems: 'flex-end', padding: '0 12px 8px',
            fontSize: 10, color: '#f8f9fa', fontWeight: 700, letterSpacing: '0.06em' }}>
            MEMBER
          </div>
          {IT_MEMBERS.map(m => (
            <div key={m} style={{ height: ROW_H, display: 'flex', alignItems: 'center',
              padding: '0 12px', borderBottom: '1px solid #0f172a',
              fontSize: 12, color: '#c0cad8', fontWeight: 600 }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, marginRight: 8, flexShrink: 0,
                background: byMember[m]?.some(t => computeStatus(t) === 'Delayed') ? '#ef4444'
                  : byMember[m]?.filter(t => computeStatus(t) !== 'Completed').length > 0 ? '#3b82f6' : '#22c55e'
              }} />
              {m}
            </div>
          ))}
        </div>

        {/* Timeline grid */}
        <div style={{ position: 'relative', flex: 1 }}>
          {/* Month + day headers */}
          <div style={{ display: 'flex', height: 52, borderBottom: '1px solid #1e3a5f', position: 'relative' }}>
            {monthLabels.map(({ i, label }) => (
              <div key={i} style={{
                position: 'absolute', left: i * COL_W, top: 0, fontSize: 12,
                color: '#ffffff', fontWeight: 700, padding: '4px 4px 0',
                borderLeft: '1px solid #1e3a5f', pointerEvents: 'none', whiteSpace: 'nowrap',
              }}>{label}</div>
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              {cols.map((d, i) => {
                const date = new Date(d)
                const isWknd = date.getDay() === 0 || date.getDay() === 6
                const isMon = date.getDay() === 1
                return (
                  <div key={d} style={{
                    minWidth: COL_W, width: COL_W, flexShrink: 0,
                    background: colBgs[i],
                    borderLeft: isMon ? '1px solid #1e293b' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: d === today ? '#89a9ff' : isWknd ? '#2d3f57' : '#85e5f7',
                    fontWeight: d === today ? 800 : 400,
                  }}>
                    {date.getDate() === 1 || i % 7 === 0 ? date.getDate() : ''}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Member rows */}
          {IT_MEMBERS.map(m => (
            <div key={m} style={{ position: 'relative', height: ROW_H, borderBottom: '1px solid #0f172a', display: 'flex' }}>
              {cols.map((d, i) => (
                <div key={d} style={{
                  minWidth: COL_W, width: COL_W, flexShrink: 0, height: '100%',
                  background: colBgs[i],
                  borderLeft: new Date(d).getDay() === 1 ? '1px solid #1a2a3a' : 'none',
                }} />
              ))}

              {/* Today line */}
              {todayIdx >= 0 && (
                <div style={{
                  position: 'absolute', left: todayIdx * COL_W + COL_W / 2 - 1,
                  top: 0, bottom: 0, width: 2, background: 'rgba(59,130,246,0.6)', zIndex: 2, pointerEvents: 'none',
                }} />
              )}

              {/* Next Two Week line */}
              {twoWeekIdx >= 0 && (
                <div style={{
                  position: 'absolute', left: twoWeekIdx * COL_W + COL_W / 2 - 1,
                  top: 0, bottom: 0, width: 2, background: 'rgba(249,115,22,0.8)', zIndex: 2, pointerEvents: 'none',
                }} />
              )}

              {/* Task bars */}
              {byMember[m]?.map(t => {
                let si = dayIdx(t.startDate)
                let ei = dayIdx(t.endDate)
                // clamp to visible range
                if (ei < 0 || si >= cols.length) return null
                const clampedSi = Math.max(0, si)
                const clampedEi = Math.min(cols.length - 1, ei)
                const left = clampedSi * COL_W
                const width = (clampedEi - clampedSi + 1) * COL_W
                if (width <= 0) return null
                const st = computeStatus(t)
                const color = STATUS_COLOR[st]
                return (
                  <div
                    key={t.id}
                    onMouseEnter={(e)=>{
                      const tip = e.currentTarget.querySelector('.task-tooltip')
                      if(tip) tip.style.opacity = 1
                    }}
                    onMouseLeave={(e)=>{
                      const tip = e.currentTarget.querySelector('.task-tooltip')
                      if(tip) tip.style.opacity = 0
                    }}
                    style={{
                    position: 'absolute',
                    left,
                    top: 6,
                    height: ROW_H - 12,
                    width,
                    borderRadius: 6,
                    overflow: 'visible',
                    background: `${color}28`,
                    border: `1.5px solid ${color}70`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 6,
                    cursor: 'default',
                    zIndex: 3
                  }}>
                    {/* Tooltip */}
                 <div 
                  className="task-tooltip"
                  style={{
                    position: 'absolute',
                    top: m === IT_MEMBERS[0] ? '120%' : undefined,
                    bottom: m === IT_MEMBERS[0] ? undefined : '120%',
                    left: 0,
                    background: '#000000',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 11,
                    color: '#cbd5f5',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.15s',
                    zIndex: 9999,
                    isolation: 'isolate'
                  }}>

                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.project}</div>
                    <div>Start: {t.startDate}</div>
                    <div>End: {t.endDate}</div>
                    <div>Manday: {t.manday}</div>

                    {t.al && <div>AL: {t.al}</div>}
                    {t.targetUAT && <div>Target UAT: {t.targetUAT}</div>}
                    {t.targetLive && <div>Target Live: {t.targetLive}</div>}

                  </div>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${t.progress}%`, background: `${color}38`, borderRadius: 4,
                    }} />
                    <span style={{
                      fontSize: 10, fontWeight: 600, color, zIndex: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: width - 12,
                    }}>{t.project}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.8 }} />
            {s}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
          <div style={{ width: 2, height: 14, background: 'rgba(59,130,246,0.6)' }} />
          Today
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#edf2fa' }}>
        💡 Gaps between bars = available capacity. Hover a bar to see details.
      </div>
    </div>
  )
}
