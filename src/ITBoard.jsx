// ITBoard.jsx
import { useState, useMemo, useCallback } from 'react'
import { IT_MEMBERS, FEEDBACK_LOGS, today, computeStatus, STATUS_COLOR, STATUS_BG, addWorkdays } from './helpers'
import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
import { useScrum } from './useScrum'
import TaskForm from './TaskForm'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addWorkdaysSimple(dateStr, n) {
  // move forward/backward by n workdays (Mon–Fri only)
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const step = n >= 0 ? 1 : -1
  let remaining = Math.abs(n)
  while (remaining > 0) {
    d.setDate(d.getDate() + step)
    const day = d.getDay()
    if (day !== 0 && day !== 6) remaining--
  }
  return d.toISOString().split('T')[0]
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
      border: `1px solid ${color || '#334155'}40`, borderRadius: 6,
      padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Scrum section (per IT member)
// ─────────────────────────────────────────────────────────────────────────────

function ScrumSection({ itName }) {
  const { entries, loading, saving, saveEntry, deleteEntry } = useScrum(itName)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)   // entry id being edited

  // Build a blank new entry — auto-populate dates from the latest entry
  function newDraft() {
    const latest = entries[0]
    const scrumDate = today

    // Auto-populate "Previous Working Day" from latest entry's "Today" text
    const prevDay = latest?.today || ''
    return {
      id:         null,
      scrum_date: scrumDate,
      prev_day:   prevDay,
      today:      '',
      next_day:   '',
    }
  }

  const [draft, setDraft] = useState(null)

  function openNew() {
    setDraft(newDraft())
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(entry) {
    setDraft({ ...entry })
    setEditing(entry.id)
    setShowForm(true)
  }

  function setField(k, v) {
    setDraft(d => ({ ...d, [k]: v }))
  }

  async function handleSubmit() {
    if (!draft) return
    const res = await saveEntry(draft)
    if (res.success) {
      setShowForm(false)
      setDraft(null)
      setEditing(null)
    } else {
      alert('Failed to save: ' + res.error)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setDraft(null)
    setEditing(null)
  }

  const ta = (extra = {}) => ({
    style: {
      background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
      color: '#e2e8f0', padding: '8px 10px', fontSize: 12, width: '100%',
      outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'inherit',
      ...extra.style,
    }, ...extra,
  })

  const inp = {
    style: {
      background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
      color: '#e2e8f0', padding: '7px 10px', fontSize: 12, width: '100%', outline: 'none',
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📋 Daily Scrum
        </span>
        {!showForm && (
          <button onClick={openNew} style={{
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
          }}>+ New Entry</button>
        )}
      </div>

      {/* Form */}
      {showForm && draft && (
        <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid #334155' }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ ...lbl, fontSize: 10 }}>Scrum Date</label>
            <input {...inp} type="date" value={draft.scrum_date}
              onChange={e => setField('scrum_date', e.target.value)} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ ...lbl, fontSize: 10 }}>Previous Working Day</label>
            <textarea {...ta()} value={draft.prev_day}
              placeholder="What was done previously…"
              onChange={e => setField('prev_day', e.target.value)} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ ...lbl, fontSize: 10 }}>Today</label>
            <textarea {...ta()} value={draft.today}
              placeholder="What will be done today…"
              onChange={e => setField('today', e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ ...lbl, fontSize: 10 }}>Next Working Day</label>
            <textarea {...ta()} value={draft.next_day}
              placeholder="What is planned for next working day…"
              onChange={e => setField('next_day', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={handleCancel} style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ ...btnPrimary, padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : editing ? 'Update' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {/* Entry list */}
      {loading ? (
        <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>Loading…</div>
      ) : entries.length === 0 && !showForm ? (
        <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No scrum entries yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(entry => (
            <div key={entry.id} style={{
              background: '#0f172a', borderRadius: 8, padding: 12,
              border: '1px solid #1e293b', fontSize: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>
                  {fmtDate(entry.scrum_date)}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(entry)} style={{
                    background: 'none', border: '1px solid #334155', borderRadius: 5,
                    color: '#64748b', padding: '2px 8px', fontSize: 10, cursor: 'pointer',
                  }}>✏️ Edit</button>
                  <button onClick={() => { if (confirm('Delete this entry?')) deleteEntry(entry.id) }} style={{
                    background: 'none', border: 'none',
                    color: '#ef4444', padding: '2px 6px', fontSize: 12, cursor: 'pointer',
                  }}>🗑</button>
                </div>
              </div>
              {[
                { label: 'Previous Working Day', value: entry.prev_day },
                { label: 'Today',                value: entry.today    },
                { label: 'Next Working Day',     value: entry.next_day },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ marginBottom: 6 }}>
                  <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                  <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{value}</div>
                </div>
              ) : null)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks section (filtered to this IT member)
// ─────────────────────────────────────────────────────────────────────────────

function TasksSection({ itName, tasks, createTask, updateTask, deleteTask, saving }) {
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)

  const myTasks = useMemo(() =>
    tasks.filter(t => t.itName === itName)
         .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
    [tasks, itName]
  )

  async function handleSave(form) {
    if (editing) {
      const res = await updateTask(editing.id, form)
      if (res.success) { setEditing(null); setShowForm(false) }
    } else {
      const res = await createTask({ ...form, itName })
      if (res.success) setShowForm(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🗂 Tasks ({myTasks.length})
        </span>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true) }} style={{
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
          }}>+ Add Task</button>
        )}
      </div>

      {/* Task form */}
      {showForm && (
        <div style={{ marginBottom: 12 }}>
          <TaskForm
            initial={editing ? { ...editing, itName } : { itName }}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null) }}
            saving={saving}
          />
        </div>
      )}

      {/* Task list */}
      {myTasks.length === 0 && !showForm ? (
        <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No tasks yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myTasks.map(task => {
            const status  = computeStatus({ ...task, start_date: task.startDate, end_date: task.endDate })
            // const mySubs  = subtasks.filter(s => s.task_id === task.id)
            return (
              <div key={task.id} style={{
                background: '#0f172a', borderRadius: 8, padding: '10px 12px',
                border: '1px solid #1e293b', fontSize: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, marginBottom: 4,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.project}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge label={status} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />
                      {task.priority === 'High' && <Badge label="High" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
                      {task.targetLive && (
                        <span style={{ color: '#64748b', fontSize: 10 }}>🎯 Live: {fmtDate(task.targetLive)}</span>
                      )}
                      {task.manday && (
                        <span style={{ color: '#64748b', fontSize: 10 }}>⏱ {task.manday} MD</span>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, background: '#1e293b', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${task.progress || 0}%`, height: '100%', borderRadius: 99,
                          background: task.progress === 100 ? '#22c55e' : task.progress > 60 ? '#3b82f6' : '#f59e0b',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <span style={{ color: '#475569', fontSize: 10, whiteSpace: 'nowrap' }}>{task.progress || 0}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditing(task); setShowForm(true) }} style={{
                      background: 'none', border: '1px solid #334155', borderRadius: 5,
                      color: '#64748b', padding: '2px 7px', fontSize: 10, cursor: 'pointer',
                    }}>✏️</button>
                    <button onClick={() => { if (confirm('Delete task?')) deleteTask(task.id) }} style={{
                      background: 'none', border: 'none',
                      color: '#ef4444', padding: '2px 5px', fontSize: 11, cursor: 'pointer',
                    }}>🗑</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Deployment Remarks section (filtered to this IT member)
// ─────────────────────────────────────────────────────────────────────────────

function DeploymentRemarksSection({ itName, deployments }) {
  // Find all detail rows across all deployments that belong to this IT member
  const myRemarks = useMemo(() => {
    const results = []
    for (const dep of deployments) {
      const rows = Array.isArray(dep.rows) ? dep.rows : []
      for (const row of rows) {
        const taskLabel = row.task?.manual
          || (FEEDBACK_LOGS.find(f => f.id === row.task?.feedbackLogId)?.label)
          || row.task?.feedbackLogLabel
          || ''
        const taskUrl = row.task?.feedbackLogUrl || null

        for (const d of (row.details || [])) {
          if (d.pic === itName) {
            results.push({
              depDate:   dep.deploy_date,
              depTitle:  dep.title || dep.deploy_date,
              taskLabel,
              taskUrl,
              remark:    d.remark || '',
              liveDate:  d.liveDate || dep.deploy_date,
              discovery: d.discovery,
              testingRequired: d.testingRequired,
            })
          }
        }
      }
    }
    // Sort by live date descending
    return results.sort((a, b) => (b.liveDate || '').localeCompare(a.liveDate || ''))
  }, [deployments, itName])

  if (myRemarks.length === 0) {
    return (
      <div>
        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 10 }}>🚀 Deployment Remarks</div>
        <div style={{ color: '#475569', fontSize: 12 }}>No deployment remarks assigned.</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10 }}>
        🚀 Deployment Remarks ({myRemarks.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {myRemarks.map((r, i) => (
          <div key={i} style={{
            background: '#0f172a', borderRadius: 8, padding: '10px 12px',
            border: '1px solid #1e293b', fontSize: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {r.taskUrl ? (
                  <a href={r.taskUrl} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontWeight: 600, fontSize: 12, textDecoration: 'underline' }}>
                    {r.taskLabel || 'Untitled'}
                  </a>
                ) : (
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{r.taskLabel || 'Untitled'}</span>
                )}
              </div>
              <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {fmtDate(r.liveDate)}
              </span>
            </div>
            {r.remark && (
              <div style={{ color: '#94a3b8', marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {r.remark}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {r.discovery === 'bug' && (
                <Badge label="Bug" color="#ef4444" bg="rgba(239,68,68,0.1)" />
              )}
              {r.discovery === 'self-discovered' && (
                <Badge label="Self-Disc" color="#f59e0b" bg="rgba(245,158,11,0.1)" />
              )}
              {r.testingRequired === false && (
                <Badge label="No Testing" color="#ef4444" bg="rgba(239,68,68,0.1)" />
              )}
              <span style={{ color: '#334155', fontSize: 10 }}>📦 {r.depTitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Single IT member card
// ─────────────────────────────────────────────────────────────────────────────

function ITMemberCard({ itName, tasks, deployments, createTask, updateTask, deleteTask, saving }) {
  const [expanded, setExpanded]   = useState(false)
  const [activeTab, setActiveTab] = useState('scrum')  // 'scrum' | 'tasks' | 'deployments'

  const myTaskCount = tasks.filter(t => t.itName === itName).length
  const myDepCount  = useMemo(() => {
    let count = 0
    for (const dep of deployments) {
      for (const row of (dep.rows || [])) {
        for (const d of (row.details || [])) {
          if (d.pic === itName) count++
        }
      }
    }
    return count
  }, [deployments, itName])

  const tabs = [
    { id: 'scrum',       label: '📋 Scrum'       },
    { id: 'tasks',       label: `🗂 Tasks (${myTaskCount})`       },
    { id: 'deployments', label: `🚀 Deployments (${myDepCount})` },
  ]

  return (
    <div style={{
      background: '#1e293b', borderRadius: 14,
      border: '1px solid #334155', overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 20px', display: 'flex', alignItems: 'center',
          gap: 12, cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          {itName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{itName}</div>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
            {myTaskCount} task{myTaskCount !== 1 ? 's' : ''}
            &nbsp;·&nbsp;
            {myDepCount} deployment remark{myDepCount !== 1 ? 's' : ''}
          </div>
        </div>
        <span style={{ color: '#475569', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #0f172a' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', background: '#0f172a', padding: '0 16px', gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                color: activeTab === tab.id ? '#3b82f6' : '#475569',
                padding: '10px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                transition: 'color 0.2s',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: 20 }}>
            {activeTab === 'scrum' && (
              <ScrumSection itName={itName} />
            )}
            {activeTab === 'tasks' && (
              <TasksSection
                itName={itName}
                tasks={tasks}
                // subtasks={subtasks}
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                saving={saving}
              />
            )}
            {activeTab === 'deployments' && (
              <DeploymentRemarksSection itName={itName} deployments={deployments} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ITBoard
// ─────────────────────────────────────────────────────────────────────────────

export default function ITBoard({ tasks, deployments, createTask, updateTask, deleteTask, saving }) {
  const [search, setSearch] = useState('')

  const filtered = IT_MEMBERS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }}>
            👤 IT Board
          </h2>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            Per-member tasks, deployment remarks and daily scrum
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search member…"
          style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
            color: '#e2e8f0', padding: '7px 12px', fontSize: 13, outline: 'none', width: 200,
          }}
        />
      </div>

      {/* Member cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(name => (
          <ITMemberCard
            key={name}
            itName={name}
            tasks={tasks}
            // subtasks={subtasks}
            deployments={deployments}
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            saving={saving}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 13 }}>
            No members match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}