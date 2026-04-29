// DeploymentBoard.jsx
import { useState, useEffect } from 'react'
import { PA_MEMBERS, today, IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES } from './helpers'
import { lbl, inpStyle } from './ui'
import { exportDeploymentDocx } from './exportDocx'
import './DeploymentBoard.css'

const ENV_COLOR = { Live: '#22c55e', UAT: '#8b5cf6', Staging: '#f59e0b' }

const uid = () => Math.random().toString(36).slice(2)

function emptyDetail(deployDate = today) {
  return { id: uid(), remark: '', discovery: '', testingRequired: true, md: '', pic: '', liveDate: deployDate }
}

function emptyRow(deployDate = today) {
  return {
    id:      uid(),
    task:    { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' },
    details: [emptyDetail(deployDate)],
  }
}

// ── DeploymentForm ────────────────────────────────────────────────────────────
function DeploymentForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', deployDate: today, environment: 'Live', notes: '' })
  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = () => {
    if (!form.deployDate) return alert('Deploy Date is required.')
    onSave(form)
  }

  return (
    <div className="dep-form">
      <h3 className="dep-form__title">🚀 New Deployment</h3>
      <div className="dep-form__grid">
        <div>
          <label style={lbl}>Deploy Date *</label>
          <input style={inpStyle} type="date" value={form.deployDate} onChange={e => set('deployDate', e.target.value)} />
        </div>
        <div className="dep-form__field--full">
          <label style={lbl}>Internal Notes</label>
          <textarea
            className="dep-form__textarea"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Internal notes (not included in Word export)"
          />
        </div>
        <div>
          <label style={lbl}>Created By</label>
          <select style={inpStyle} value={form.createdBy} onChange={e => set('createdBy', e.target.value)}>
            <option value="">Select…</option>
            {PA_MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="dep-form__actions">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-submit" onClick={submit} disabled={saving}>
          {saving ? '⏳ Creating…' : 'Create Deployment'}
        </button>
      </div>
    </div>
  )
}

// ── TaskCell ──────────────────────────────────────────────────────────────────
function TaskCell({ value, onChange }) {
  const [mode,        setMode]        = useState(value.feedbackLogId ? 'feedbacklog' : 'manual')
  const [customUrl,   setCustomUrl]   = useState(value.feedbackLogUrl   || '')
  const [customLabel, setCustomLabel] = useState(value.feedbackLogLabel || '')

  function handleFLSelect(id) {
    if (id === '__custom__') {
      onChange({ ...value, feedbackLogId: '__custom__', feedbackLogUrl: customUrl, feedbackLogLabel: customLabel })
    } else {
      const fl = FEEDBACK_LOGS.find(f => f.id === id)
      onChange({ ...value, feedbackLogId: id, feedbackLogUrl: fl?.url || '', feedbackLogLabel: fl?.label || '' })
    }
  }

  return (
    <div className="task-cell">
      <div className="task-cell__mode-bar">
        {['manual', 'feedbacklog'].map(m => (
          <button
            key={m}
            className={`task-cell__mode-btn ${mode === m ? 'task-cell__mode-btn--active' : 'task-cell__mode-btn--idle'}`}
            onClick={() => setMode(m)}
          >
            {m === 'manual' ? 'Manual' : 'Feedback Log'}
          </button>
        ))}
      </div>

      {mode === 'manual' && (
        <input
          className="dep-inp"
          value={value.manual || ''}
          onChange={e => onChange({ ...value, manual: e.target.value })}
          placeholder="Type task name…"
        />
      )}

      {mode === 'feedbacklog' && (
        <>
          <select
            className="dep-inp"
            value={value.feedbackLogId || ''}
            onChange={e => handleFLSelect(e.target.value)}
          >
            <option value="">Select Feedback Log…</option>
            {FEEDBACK_LOGS.map(fl => <option key={fl.id} value={fl.id}>{fl.label}</option>)}
            <option value="__custom__">— Enter manually —</option>
          </select>

          {value.feedbackLogId === '__custom__' && (
            <>
              <input
                className="dep-inp"
                value={customLabel}
                onChange={e => { setCustomLabel(e.target.value); onChange({ ...value, feedbackLogLabel: e.target.value }) }}
                placeholder="Display text for hyperlink…"
                style={{ marginTop: 2 }}
              />
              <input
                className="dep-inp"
                value={customUrl}
                onChange={e => { setCustomUrl(e.target.value); onChange({ ...value, feedbackLogUrl: e.target.value }) }}
                placeholder="https://docs.google.com/…"
                style={{ marginTop: 2 }}
              />
            </>
          )}

          {value.feedbackLogId && value.feedbackLogId !== '__custom__' && value.feedbackLogUrl && (
            <a className="task-cell__link" href={value.feedbackLogUrl} target="_blank" rel="noopener noreferrer">
              🔗 Open in Google Docs
            </a>
          )}
        </>
      )}
    </div>
  )
}

// ── Main DeploymentBoard ──────────────────────────────────────────────────────
export default function DeploymentBoard({
  deployments, loading, saving,
  createDeployment, deleteDeployment, saveRows, PAMember, itEntries = [],
}) {
  const [showForm,   setShowForm]   = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [exporting,  setExporting]  = useState(null)
  const [isSaving,   setIsSaving]   = useState(null)
  const [justSaved,  setJustSaved]  = useState({})
  const [depRows,    setDepRows]    = useState({})

  useEffect(() => {
    if (!deployments?.length) return
    setDepRows(current => {
      const next = { ...current }
      deployments.forEach(dep => {
        // Only hydrate once (no local edits yet). Strip any _itOwned rows —
        // depRows must be PA-only so PA Save never overwrites IT entries.
        if (!next[dep.id]) {
          next[dep.id] = (dep.rows || []).filter(r => r._itOwned !== true)
        }
      })
      return next
    })
  }, [deployments])

  // depRows = PA-owned rows only. IT rows always read from itEntries prop (DB truth).
  const getPARows  = (depId) => depRows[depId] || []
  const setRows    = (depId, updater) =>
    setDepRows(d => ({ ...d, [depId]: typeof updater === 'function' ? updater(d[depId] || []) : updater }))
  const addRow       = (dep)              => setRows(dep.id, rows => [...rows, emptyRow(dep.deploy_date)])
  const removeRow    = (depId, rowId)     => setRows(depId, rows => rows.filter(r => r.id !== rowId))
  const patchRowTask = (depId, rowId, task) =>
    setRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, task } : r))
  const addDetail    = (dep, rowId)       =>
    setRows(dep.id, rows => rows.map(r =>
      r.id === rowId ? { ...r, details: [...r.details, emptyDetail(dep.deploy_date)] } : r
    ))
  const removeDetail = (depId, rowId, detailId) =>
    setRows(depId, rows => rows.flatMap(r => {
      if (r.id !== rowId) return [r]
      const next = r.details.filter(d => d.id !== detailId)
      if (next.length === 0) return []
      return [{ ...r, details: next }]
    }))
  const patchDetail = (depId, rowId, detailId, patch) =>
    setRows(depId, rows => rows.map(r =>
      r.id !== rowId ? r : {
        ...r, details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d),
      }
    ))

  async function handleCreate(form) {
    const res = await createDeployment({ ...form, createdBy: PAMember || form.createdBy })
    if (res.success) { setShowForm(false); setExpandedId(res.deployment?.id) }
  }

  async function handleSave(depId) {
    setIsSaving(depId)
    try {
      // Save PA rows only — never write IT rows into the main deployment record.
      // IT members write exclusively to their own it_entries row, so concurrent
      // saves by different IT members never conflict with each other or with PA.
      const paRows = getPARows(depId)
      const res    = await saveRows(depId, paRows)
      if (!res.success) throw new Error(res.error)
      setJustSaved(s => ({ ...s, [depId]: true }))
      setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
    } catch (e) {
      alert('Save failed: ' + (e.message || e))
    } finally {
      setIsSaving(null)
    }
  }

  // Shared: resolve task label from a row's task object
  function resolveTaskLabel(task) {
    if (!task) return ''
    const fl = FEEDBACK_LOGS.find(f => f.id === task.feedbackLogId)
    if (task.feedbackLogId && task.feedbackLogId !== '__custom__') return fl?.label || task.manual || ''
    if (task.feedbackLogId === '__custom__') return task.feedbackLogLabel || task.manual || ''
    return task.manual || ''
  }

  // Shared: convert a flat list of rows → export-ready flat list of detail shapes
  function rowsToExportShapes(rows) {
    return rows.flatMap(row => {
      const taskLabel = resolveTaskLabel(row.task)
      const taskUrl   = row.task?.feedbackLogUrl || null
      const flId      = row.task?.feedbackLogId
      return (row.details || []).map(d => {
        const isBug = d.discovery === 'bug'
        let remark  = d.remark || ''
        if (flId && flId !== '__custom__') remark = `#${flId} - ${remark}`
        else if (flId === '__custom__' && row.task?.feedbackLogLabel) remark = `#${row.task.feedbackLogLabel} - ${remark}`
        if (isBug) remark = `${remark} (bug)`
        if (!d.testingRequired) remark = remark ? `${remark}\nno testing required` : 'no testing required'
        return {
          taskLabel, taskUrl, remarks: remark,
          pic: d.discovery === 'self-discovered' ? '' : (d.pic || ''),
          md: d.md || '', discovery: d.discovery,
          testingRequired: d.testingRequired, deployLiveDate: d.liveDate || today,
        }
      })
    })
  }

  // PA rows from local state + all IT members' rows from itEntries (DB truth, no duplication)
  function getAllRows(depId) {
    const paRows = getPARows(depId)
    const itRows = itEntries
      .filter(e => String(e.deployment_id) === String(depId))
      .flatMap(e => e.rows || [])
    return [...paRows, ...itRows]
  }

  async function handleExport(dep) {
    setExporting(dep.id)
    try {
      const exportRows = rowsToExportShapes(getAllRows(dep.id))
      await exportDeploymentDocx({ deployment: dep, tasks: exportRows, liveDate: dep.deploy_date })
    } finally { setExporting(null) }
  }

  function handleCopy(dep) {
    const lines = []
    let idx = 0
    for (const row of getAllRows(dep.id)) {
      const taskLabel = resolveTaskLabel(row.task)
      for (const d of row.details ?? []) {
        const remark     = d.remark || ''
        const isSelfDisc = d.discovery === 'self-discovered'
        const isBug      = d.discovery === 'bug'
        if (!remark && !isSelfDisc && !isBug) continue
        idx++
        const suffixes = []
        if (isSelfDisc)         suffixes.push('(self-discovered)')
        if (isBug)              suffixes.push('(bug)')
        if (!d.testingRequired) suffixes.push('(no testing required)')
        lines.push(`${idx}. ${taskLabel}: ${remark}${suffixes.length ? ' ' + suffixes.join(' ') : ''}`)
      }
    }
    const text = lines.join('\n')
    if (!text) { alert('No remarks to copy.'); return }
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => {
        const ta = document.createElement('textarea')
        ta.value = text; document.body.appendChild(ta); ta.select()
        document.execCommand('copy'); document.body.removeChild(ta)
        alert('Copied to clipboard!')
      })
  }

  if (loading) return <div className="dep-loading">Loading…</div>

  // Table header helper
  const TH = (label, extra = {}) => (
    <th className="dep-th" style={extra}>{label}</th>
  )

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dep-board__header">
        <div>
          <h2 className="dep-board__title">🚀 Deployment Board</h2>
          <p className="dep-board__subtitle">Export weekly deployment list</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ New Deployment'}
        </button>
      </div>

      {showForm && (
        <DeploymentForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
      )}

      {deployments.length === 0 && !showForm && (
        <div className="dep-board__empty">
          No deployments yet. Click <strong>+ New Deployment</strong> to start.
        </div>
      )}

      {/* ── Deployment cards ── */}
      <div className="dep-card-list">
        {deployments.map(dep => {
          const expanded   = expandedId === dep.id
          const envColor   = ENV_COLOR[dep.environment] || '#64748b'
          const rows       = getPARows(dep.id)          // PA rows for the editable table
          const totalCount = getAllRows(dep.id).length  // PA + IT for the header count

          return (
            <div key={dep.id} className="dep-card" style={{ borderColor: `${envColor}35` }}>

              {/* ── Card header ── */}
              <div className="dep-card__header">
                <div className="dep-card__env-stripe" style={{ background: envColor }} />
                <div className="dep-card__meta">
                  <div className="dep-card__subtitle">
                    📅 {dep.deploy_date} &nbsp;·&nbsp;
                    <span style={{ color: envColor }}>{dep.environment}</span>
                    &nbsp;·&nbsp; {totalCount} task{totalCount !== 1 ? 's' : ''}
                    {dep.created_by && <> &nbsp;·&nbsp; by {dep.created_by.split(' ')[0]}</>}
                  </div>
                </div>
                <div className="dep-card__actions">
                  <button className="btn-collapse" onClick={() => setExpandedId(expanded ? null : dep.id)}>
                    {expanded ? '▲ Collapse' : '▼ Manage'}
                  </button>
                  <button
                    className={`btn-save ${justSaved[dep.id] ? 'btn-save--saved' : 'btn-save--idle'}`}
                    onClick={() => handleSave(dep.id)}
                    disabled={isSaving === dep.id}
                  >
                    {isSaving === dep.id ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
                  </button>
                  <button className="btn-export" onClick={() => handleExport(dep)} disabled={exporting === dep.id}>
                    {exporting === dep.id ? '⏳ Exporting…' : '📄 Export Word'}
                  </button>
                  <button className="btn-copy-remarks" onClick={() => handleCopy(dep)}>
                    📋 Copy
                  </button>
                  <button className="btn-delete-dep" onClick={() => { if (confirm('Delete this deployment?')) deleteDeployment(dep.id) }}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* ── Expanded manage panel ── */}
              {expanded && (
                <div className="dep-card__panel">
                  {rows.length > 0 && (
                    <div className="dep-table-scroll">
                      <table className="dep-table">
                        <thead>
                          <tr>
                            {TH('#',                  { width: 32,  textAlign: 'center' })}
                            {TH('Task',               { minWidth: 200 })}
                            {TH('Remarks from iFAST', { minWidth: 200 })}
                            {TH('Self-Disc / Bug',    { minWidth: 130 })}
                            {TH('Testing?',           { minWidth: 80, textAlign: 'center' })}
                            {TH('MD',                 { minWidth: 70 })}
                            {TH('PIC',                { minWidth: 130 })}
                            {TH('LIVE on',            { minWidth: 130 })}
                            {TH('',                   { width: 60 })}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIdx) => {
                            const span = row.details.length
                            return row.details.map((d, di) => {
                              const isSelfDisc   = d.discovery === 'self-discovered'
                              const isLastDetail = di === span - 1
                              return (
                                <tr
                                  key={d.id}
                                  className={isLastDetail ? 'dep-tr--last-detail' : 'dep-tr--mid-detail'}
                                >
                                  {di === 0 && (
                                    <td rowSpan={span} className="dep-td--span dep-td--num">
                                      {rowIdx + 1}
                                    </td>
                                  )}
                                  {di === 0 && (
                                    <td rowSpan={span} className="dep-td--span" style={{ minWidth: 200, verticalAlign: 'top' }}>
                                      <TaskCell value={row.task} onChange={task => patchRowTask(dep.id, row.id, task)} />
                                      <button className="btn-add-row" onClick={() => addDetail(dep, row.id)}>
                                        + add row
                                      </button>
                                    </td>
                                  )}
                                  <td className="dep-td" style={{ minWidth: 200 }}>
                                    <input
                                      className="dep-inp"
                                      value={d.remark}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })}
                                      placeholder="Remark…"
                                      style={{ width: '100%' }}
                                    />
                                    {!d.testingRequired && (
                                      <div className="dep-no-testing-note">no testing required</div>
                                    )}
                                  </td>
                                  <td className="dep-td" style={{ minWidth: 130 }}>
                                    <select
                                      className="dep-inp"
                                      value={d.discovery}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}
                                    >
                                      {DISCOVERY_TYPES.map(dt => (
                                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="dep-td" style={{ minWidth: 80, textAlign: 'center' }}>
                                    <button
                                      className={`btn-testing ${d.testingRequired ? 'btn-testing--yes' : 'btn-testing--no'}`}
                                      onClick={() => patchDetail(dep.id, row.id, d.id, { testingRequired: !d.testingRequired })}
                                    >
                                      {d.testingRequired ? 'Yes' : 'No'}
                                    </button>
                                  </td>
                                  <td className="dep-td" style={{ minWidth: 70 }}>
                                    <input
                                      className="dep-inp"
                                      type="number" min="0" step="0.01"
                                      value={d.md}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })}
                                      placeholder="3.25"
                                      style={{ width: 64 }}
                                    />
                                  </td>
                                  <td className="dep-td" style={{ minWidth: 130 }}>
                                    <select
                                      className={`dep-inp ${isSelfDisc ? 'dep-inp--disabled' : ''}`}
                                      value={d.pic}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { pic: e.target.value })}
                                      disabled={isSelfDisc}
                                      style={{ cursor: isSelfDisc ? 'not-allowed' : 'auto' }}
                                    >
                                      <option value="">Select…</option>
                                      {IFA_MEMBERS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                    {isSelfDisc && <div className="dep-self-disc-note">N/A (self-disc.)</div>}
                                  </td>
                                  <td className="dep-td" style={{ minWidth: 130 }}>
                                    <input
                                      className="dep-inp"
                                      type="date"
                                      value={d.liveDate || today}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })}
                                      style={{ width: 130 }}
                                    />
                                  </td>
                                  <td className="dep-td" style={{ width: 60, textAlign: 'center' }}>
                                    <button
                                      className="btn-remove-row"
                                      onClick={() => removeDetail(dep.id, row.id, d.id)}
                                      title={span === 1 ? 'Remove task' : 'Remove this row'}
                                    >
                                      {span === 1 ? '🗑' : '✕'}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {rows.length === 0 && (
                    <div className="dep-empty">
                      No tasks yet. Click <strong style={{ color: 'var(--blue)' }}>+ Add Task</strong> to add one.
                    </div>
                  )}

                  <button className="btn-add-task" onClick={() => addRow(dep)}>+ Add Task</button>

                  <div className="dep-hint">
                    💡 Fill in <strong>Remarks from iFAST</strong> for each row, then click
                    <strong style={{ color: 'var(--blue)' }}> 💾 Save</strong> to persist, and
                    <strong style={{ color: 'var(--green)' }}> Export Word</strong> → downloads as
                    <strong style={{ color: 'var(--text-muted)' }}> CRM_Deployment_List_{dep.deploy_date}.docx</strong>
                  </div>

                  {/* ── IT Members' entries (read-only) ── */}
                  {(() => {
                    const depITEntries = itEntries.filter(e => String(e.deployment_id) === String(dep.id))
                    if (depITEntries.length === 0) return null
                    return (
                      <div className="dep-it-section">
                        <div className="dep-it-section__title">👤 IT Members' Deployment Items</div>
                        {depITEntries.map(entry => {
                          const entryRows = entry.rows || []
                          if (entryRows.length === 0) return null
                          return (
                            <div key={entry.id} className="dep-it-entry">
                              <div className="dep-it-entry__name">{entry.it_name}</div>
                              <div style={{ overflowX: 'auto' }}>
                                <table className="dep-table" style={{ tableLayout: 'fixed' }}>
                                  <thead>
                                    <tr>
                                      {TH('#',             { width: 40,  textAlign: 'center' })}
                                      {TH('Task',          { width: 235 })}
                                      {TH('Remarks',       { width: 'auto' })}
                                      {TH('Self-Disc/Bug', { width: 130, textAlign: 'center' })}
                                      {TH('Testing?',      { width: 80,  textAlign: 'center' })}
                                      {TH('MD',            { width: 70,  textAlign: 'center' })}
                                      {TH('PIC',           { width: 130, textAlign: 'center' })}
                                      {TH('LIVE on',       { width: 130, textAlign: 'center' })}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entryRows.map((row, rowIdx) =>
                                      row.details?.map((d, di) => {
                                        const fl        = FEEDBACK_LOGS.find(f => f.id === row.task?.feedbackLogId)
                                        const taskLabel = row.task?.feedbackLogId && row.task.feedbackLogId !== '__custom__'
                                          ? (fl?.label || row.task.manual || '')
                                          : row.task?.feedbackLogId === '__custom__'
                                          ? (row.task.feedbackLogLabel || row.task.manual || '')
                                          : (row.task?.manual || '')
                                        const taskUrl = row.task?.feedbackLogUrl || null
                                        return (
                                          <tr key={d.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                            {di === 0 && (
                                              <td rowSpan={row.details.length} style={{ width: 40, padding: 8, color: '#a4acb7', verticalAlign: 'middle', fontWeight: 700, textAlign: 'center' }}>
                                                {rowIdx + 1}
                                              </td>
                                            )}
                                            {di === 0 && (
                                              <td rowSpan={row.details.length} style={{ width: 235, padding: 8, verticalAlign: 'top' }}>
                                                {taskUrl
                                                  ? <a href={taskUrl} target="_blank" rel="noopener noreferrer" className="task-cell__link" style={{ fontSize: 12 }}>{taskLabel}</a>
                                                  : <span style={{ color: '#f1f5f9' }}>{taskLabel}</span>}
                                              </td>
                                            )}
                                            <td className="dep-td dep-td--readonly-muted">{d.remark || ''}</td>
                                            <td className="dep-td dep-td--readonly-muted" style={{ textAlign: 'center' }}>
                                              {d.discovery === 'self-discovered' ? 'Self-Disc' : d.discovery === 'bug' ? 'Bug' : '—'}
                                            </td>
                                            <td className={`dep-td ${d.testingRequired ? 'dep-td--readonly-test-y' : 'dep-td--readonly-test-n'}`}>
                                              {d.testingRequired ? 'Yes' : 'No'}
                                            </td>
                                            <td className="dep-td dep-td--readonly-muted" style={{ textAlign: 'center' }}>{d.md || '—'}</td>
                                            <td className="dep-td dep-td--readonly-muted" style={{ textAlign: 'center' }}>{d.pic || '—'}</td>
                                            <td className="dep-td dep-td--readonly-live">{d.liveDate || '—'}</td>
                                          </tr>
                                        )
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
