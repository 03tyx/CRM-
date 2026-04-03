import { useMemo } from 'react'
import { IT_MEMBERS, computeStatus, STATUS_COLOR, STATUS_BG, today } from './helpers'

function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
      border: `1px solid ${color || '#334155'}40`, borderRadius: 6,
      padding: '2px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 99, height: 6, width: '100%', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 99,
        background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
      }} />
    </div>
  )
}

function weekEnd(offset = 0) {
  const d = new Date(today)
  const dow = d.getDay()
  const toFri = dow === 0 ? -2 : 5 - dow
  d.setDate(d.getDate() + toFri + offset * 7)
  return d.toISOString().split('T')[0]
}

function weekStart(offset = 0) {
  const d = new Date(weekEnd(offset))
  d.setDate(d.getDate() - 4)
  return d.toISOString().split('T')[0]
}

export default function Dashboard({ tasks }) {
  const thisWkStart = weekStart(0)
  const thisWkEnd   = weekEnd(0)
  const nextWkStart = weekStart(1)
  const nextWkEnd   = weekEnd(1)

  const statusDist = useMemo(() => {
    const counts = {}
    tasks.forEach(t => { const s = computeStatus(t); counts[s] = (counts[s] || 0) + 1 })
    return counts
  }, [tasks])

  const availability = useMemo(() => IT_MEMBERS.map(m => {
    const active = tasks.filter(t => t.itName === m && computeStatus(t) !== 'Completed')
    const busy = (wkS, wkE) => active.some(t => t.startDate <= wkE && (t.endDate >= wkS))
    const delayed = active.filter(t => computeStatus(t) === 'Delayed').length
    return {
      m,
      thisWeekFree: !busy(thisWkStart, thisWkEnd),
      nextWeekFree: !busy(nextWkStart, nextWkEnd),
      delayed,
      load: active.length,
      active,
    }
  }), [tasks, thisWkStart, thisWkEnd, nextWkStart, nextWkEnd])

  const delayed = tasks.filter(t => computeStatus(t) === 'Delayed')
  const total    = tasks.length
  const completed = tasks.filter(t => computeStatus(t) === 'Completed').length
  const avgProg  = total ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / total) : 0
  const availableNow = availability.filter(a => a.thisWeekFree).length

  return (
    <div>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Tasks',     val: total,          color: '#3b82f6', icon: '📋' },
          { label: 'Completed',       val: completed,      color: '#22c55e', icon: '✅' },
          { label: 'Delayed',         val: delayed.length, color: '#ef4444', icon: '⚠️' },
          { label: 'Avg Progress',    val: `${avgProg}%`,  color: '#8b5cf6', icon: '📊' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: 14,
            padding: '18px 20px', border: `1px solid ${k.color}25` }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, fontFamily: "'Sora',sans-serif" }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#d1d6d8e0', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Team Availability */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
          <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 14,
            fontWeight: 700, marginBottom: 6 }}>👥 Team Availability</h3>
          {/* <div style={{ fontSize: 11, color: '#d1d6d8e0', marginBottom: 14 }}>
            {thisWkStart} → {thisWkEnd} &nbsp;|&nbsp; {nextWkStart} → {nextWkEnd}
          </div> */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 4,
            marginBottom: 8, fontSize: 10, fontWeight: 700, color: '#d1d6d8e0', letterSpacing: '0.06em' }}>
            <div>NAME</div><div>THIS WEEK</div><div>NEXT WEEK</div>
          </div>
          {availability.map(a => (
            <div key={a.m} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px',
              alignItems: 'center', gap: 4, padding: '6px 0',
              borderBottom: '1px solid #0f172a', fontSize: 12 }}>
              <div style={{ color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {a.m}
                {a.delayed > 0 && <span title={`${a.delayed} delayed`} style={{ fontSize: 10 }}>🔴</span>}
              </div>
              {[a.thisWeekFree, a.nextWeekFree].map((free, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: free ? '#22c55e' : '#ef4444' }} />
                  <span style={{ fontSize: 10, color: free ? '#22c55e' : '#ef4444' }}>
                    {free ? 'Free' : 'Busy'}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#0f172a', borderRadius: 10,
            display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#d1d6d8e0' }}>Available this week</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{availableNow} / {IT_MEMBERS.length} members</span>
          </div>
        </div>

        {/* Status overview */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
          <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 14,
            fontWeight: 700, marginBottom: 14 }}>📊 Status Overview</h3>
          {Object.entries(statusDist).map(([s, c]) => (
            <div key={s} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Badge label={s} color={STATUS_COLOR[s]} bg={STATUS_BG[s]} />
                <span style={{ color: '#d1d6d8e0', fontSize: 12 }}>{c} task{c !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(c / total) * 100}%`, height: '100%',
                  background: STATUS_COLOR[s], borderRadius: 99 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #334155' }}>
          </div>
        </div>
      </div>

      {/* Workload */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 20,
        border: '1px solid #334155', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 14,
          fontWeight: 700, marginBottom: 14 }}>🏋️ Current Workload</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {availability.map(a => (
            <div key={a.m} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 140, fontSize: 11, color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
                {a.m}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#0f172a', borderRadius: 99, height: 16, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (a.load / 5) * 100)}%`, height: '100%', borderRadius: 99,
                    background: a.load === 0 ? '#22c55e' : a.load <= 2 ? '#3b82f6' : a.load <= 3 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
              <div style={{ width: 65, fontSize: 11, color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>
                {a.load} active
              </div>
              {a.delayed > 0 && (
                <div style={{ fontSize: 11, color: '#ef4444', flexShrink: 0 }}>⚠️ {a.delayed} delayed</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active tasks this week */}
      <div style={{ background: '#1e293b', borderRadius: 14, padding: 20,
        border: '1px solid #334155', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 14,
          fontWeight: 700, marginBottom: 14 }}>🗓️ Active This Week</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks
            .filter(t => {
              const s = computeStatus(t)
              return t.startDate <= thisWkEnd && t.endDate >= thisWkStart
                && s !== 'Completed'
            })
            // .sort((a, b) => a.priority === 'High' && b.priority !== 'High' ? -1 : 1)
            .map(t => {
              const st = computeStatus(t)
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', background: '#0f172a', borderRadius: 8,
                  border: `1px solid ${STATUS_COLOR[st]}20` }}>
                  <div style={{ width: 6, height: 6, borderRadius: 99, flexShrink: 0,
                    background: STATUS_COLOR[st] }} />
                  <div style={{ flex: 1, fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{t.project}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', minWidth: 100 }}>{t.itName}</div>
                  <div style={{ minWidth: 80 }}><ProgressBar pct={t.progress} /></div>
                  <div style={{ fontSize: 11, color: '#94a3b8', minWidth: 30 }}>{t.progress}%</div>
                  <Badge label={st} color={STATUS_COLOR[st]} bg={STATUS_BG[st]} />
                </div>
              )
            })}
        </div>
      </div>

      {/* Delayed alert */}
      {delayed.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: 16 }}>
          <h3 style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
            ⚠️ Overdue Tasks — Needs Attention ({delayed.length})
          </h3>
          {delayed.map(t => (
            <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'center',
              padding: '7px 0', borderBottom: '1px solid rgba(239,68,68,0.1)', fontSize: 12 }}>
              <span style={{ color: '#fca5a5', fontWeight: 600 }}>{t.itName.split(' ')[0]}</span>
              <span style={{ color: '#94a3b8' }}>—</span>
              <span style={{ color: '#f1f5f9', flex: 1 }}>{t.project}</span>
              <span style={{ color: '#ef4444' }}>Due {t.endDate}</span>
              <span style={{ color: '#f59e0b', minWidth: 35 }}>{t.progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
