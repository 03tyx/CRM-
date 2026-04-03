//TaskTable.jsx
import { useState, useMemo, React, Fragment } from 'react'
import { IT_MEMBERS, computeStatus, STATUS_COLOR, STATUS_BG, today } from './helpers'
import TaskForm from './TaskForm'

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
        width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
        background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
      }} />
    </div>
  )
}

const inp = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
  color: '#e2e8f0', padding: '8px 14px', fontSize: 13, outline: 'none',
}
const td = { padding: '10px 12px', verticalAlign: 'middle' }

export default function TaskTable({ tasks, onSave, onDelete, saving }) {
  const [search, setSearch] = useState('')
  const [filterMember, setFilterMember] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortCol, setSortCol] = useState('startDate')
  const [sortDir, setSortDir] = useState('asc')
  const [editingId, setEditingId] = useState(null)  // id of task being edited inline

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function clearFilters() {
    setSearch('')
    setFilterMember('All')
    setFilterStatus('All')
  }

  const filtered = useMemo(() => {
    let arr = tasks.filter(t => {
      const s = computeStatus(t)
      return (filterMember === 'All' || t.itName === filterMember)
        && (filterStatus === 'All' || s === filterStatus)
        && (t.project.toLowerCase().includes(search.toLowerCase())
          || t.itName.toLowerCase().includes(search.toLowerCase()))
    })
    arr = [...arr].sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    })
    return arr
  }, [tasks, search, filterMember, filterStatus, sortCol, sortDir])

  function Th({ col, label }) {
    const active = sortCol === col
    return (
      <th onClick={() => toggleSort(col)} style={{
        padding: '10px 12px', textAlign: 'left', color: active ? '#93c5fd' : '#64748b',
        fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        fontSize: 10, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
      }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search project or member…"
          style={{ ...inp, flex: 1, minWidth: 200 }} />
        <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={inp}>
          <option>Select IT member...</option> 
          {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inp}>
          <option>Select status...</option>
          {['In Progress', 'Upcoming', 'Delayed', 'On Hold', 'UAT', 'Completed']
            .map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterMember !== 'All' || filterStatus !== 'All') && (
          <button onClick={clearFilters} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
            color: '#cbd5f5', padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}>Clear</button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e3a5f' }}>
              <Th col="itName"    label="Member"   />
              <Th col="project"   label="Project"  />
              <Th col="manday"    label="Manday"   />
              <Th col="startDate" label="Start"    />
              <Th col="endDate"   label="End"      />
              <th style={{ padding: '10px 12px', color: '#64748b', fontWeight: 700,
                fontSize: 10, textTransform: 'uppercase', minWidth: 130 }}>Progress</th>
              <th style={{ padding: '10px 12px', color: '#64748b', fontWeight: 700,
                fontSize: 10, textTransform: 'uppercase' }}>Status</th>
              <Th col="updatedDate" label="Updated" />
              <th style={{ padding: '10px 12px', color: '#64748b', fontWeight: 700,
                fontSize: 10, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const st = computeStatus(t)
              const isDelayed = st === 'Delayed'
              const overdue   = today > t.endDate && st !== 'Completed'
              const rowBg     = isDelayed ? 'rgba(239,68,68,0.06)' : 'transparent'
              const isEditing = editingId === t.id

              return (
                <Fragment key={t.id}>
                  {/* ── Data row ── */}
                  <tr key={t.id} style={{
                    borderBottom: isEditing ? 'none' : '1px solid #1e293b',
                    transition: 'background 0.15s',
                    background: isEditing ? '#172033' : rowBg,
                    borderLeft: isDelayed ? '3px solid #ef4444' : '3px solid transparent',
                  }}
                    onMouseEnter={e => { if (!isDelayed && !isEditing) e.currentTarget.style.background = '#1e293b' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isEditing ? '#172033' : rowBg }}
                  >
                    <td style={td}><span style={{ color: '#e2e8f0', fontWeight: 600 }}>{t.itName}</span></td>
                    <td style={td}>
                      <div style={{ color: '#f1f5f9', fontWeight: 500, maxWidth: 200 }}>{t.project}</div>
                      {t.targetUAT  && <div style={{ color: '#64748b', fontSize: 10 }}>UAT: {t.targetUAT}</div>}
                      {t.targetLive && <div style={{ color: '#64748b', fontSize: 10 }}>LIVE: {t.targetLive}</div>}
                      {isDelayed && <div style={{ color: '#ef4444', fontSize: 10, fontWeight: 600 }}>⚠️ OVERDUE</div>}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{ color: '#93c5fd' }}>{t.manday}d</span>
                    </td>
                    <td style={td}><span style={{ color: '#94a3b8' }}>{t.startDate}</span></td>
                    <td style={td}><span style={{ color: overdue ? '#ef4444' : '#94a3b8' }}>{t.endDate}</span></td>
                    <td style={{ ...td, minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}><ProgressBar pct={t.progress} /></div>
                        <span style={{ color: '#94a3b8', fontSize: 11, minWidth: 30 }}>{t.progress}%</span>
                      </div>
                    </td>
                    <td style={td}>
                      <Badge label={st} color={STATUS_COLOR[st]} bg={STATUS_BG[st]} />
                    </td>
                    <td style={td}><span style={{ color: '#475569', fontSize: 11 }}>{t.updatedDate}</span></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setEditingId(isEditing ? null : t.id)}
                          style={{
                            background: isEditing ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                            border: 'none', borderRadius: 6,
                            color: isEditing ? '#f59e0b' : '#3b82f6',
                            padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                          }}>
                          {isEditing ? 'Close' : 'Edit'}
                        </button>
                        <button onClick={() => onDelete(t.id)} style={{
                          background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6,
                          color: '#ef4444', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                        }}>Del</button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Inline edit form row ── */}
                  {isEditing && (
                    <tr key={`${t.id}-edit`}>
                      <td colSpan={9} style={{ padding: '0 0 16px 0', background: '#172033', borderBottom: '2px solid #334155' }}>
                        <div style={{ padding: '16px 16px 0' }}>
                          <TaskForm
                            initial={t}
                            onSave={async form => {
                              await onSave(t.id, form)
                              setEditingId(null)
                            }}
                            onCancel={() => setEditingId(null)}
                            saving={saving}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 13 }}>
            No tasks found
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, color: '#475569', fontSize: 11 }}>
        Showing {filtered.length} of {tasks.length} tasks
      </div>
    </div>
  )
}