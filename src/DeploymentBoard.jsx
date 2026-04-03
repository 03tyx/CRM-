//DeploymentBoard.jsx
import { useState, useEffect } from 'react'
import { PA_MEMBERS, today, IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES } from './helpers'
import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
import { exportDeploymentDocx } from './exportDocx'

const COL_WIDTHS = {
  num: { width: 40, textAlign: 'center', color: '#D1D6D8E0' },
  task: { width: 235, color: '#D1D6D8E0' },
  remarks: { width: 'auto', color: '#D1D6D8E0' },
  discovery: { width: 130, textAlign: 'center', color: '#D1D6D8E0' },
  testing: { width: 80, textAlign: 'center', color: '#D1D6D8E0' },
  md: { width: 70, textAlign: 'center', color: '#D1D6D8E0' },
  pic: { width: 130, textAlign: 'center', color: '#D1D6D8E0' },
  live: { width: 130, textAlign: 'center', color: '#D1D6D8E0' }
};

const ENV_COLOR = { Live: '#22c55e', UAT: '#8b5cf6', Staging: '#f59e0b' }
 
const cellPad = { padding: '6px 8px', verticalAlign: 'top' }
const smallInp = { ...inpStyle, padding: '5px 8px', fontSize: 11 }
 
// ── ID helper ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2)
 
// ── Empty detail row (everything except # and TASK) ───────────────────────────
function emptyDetail() {
  return {
    id:              uid(),
    remark:          '',
    discovery:       '',
    testingRequired: true,
    md:              '',
    pic:             '',
    liveDate:        today,
  }
}
 
// ── Empty task row (owns # and TASK, starts with one detail row) ──────────────
function emptyRow() {
  return {
    id:      uid(),
    task:    { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' },
    details: [emptyDetail()],
  }
}
 
// ── DeploymentForm ────────────────────────────────────────────────────────────
function DeploymentForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', deployDate: today, environment: 'Live', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = () => {
    if (!form.deployDate) return alert('Deploy Date is required.')
    onSave(form)
  }
  return (
    <div style={{ background: '#1e293b', borderRadius: 16, padding: 24, border: '1px solid #334155', marginBottom: 20 }}>
      <h3 style={{ color: '#f8fafc', fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
        🚀 New Deployment
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={lbl}>Deploy Date *</label>
          <input style={inpStyle} type="date" value={form.deployDate} onChange={e => set('deployDate', e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Internal Notes</label>
          <textarea style={{ ...inpStyle, height: 60, resize: 'vertical' }}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Internal notes (not included in Word export)" />
        </div>
        <div>
          <label style={lbl}>Created By</label>
          <select style={inpStyle} value={form.createdBy} onChange={e => set('createdBy', e.target.value)}>
            <option value="">Select…</option>
            {PA_MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnGhost}>Cancel</button>
        <button onClick={submit} style={btnPrimary} disabled={saving}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
        {['manual', 'feedbacklog'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? 'rgba(59,130,246,0.25)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${mode === m ? '#3b82f6' : '#334155'}`,
            borderRadius: 5, color: mode === m ? '#93c5fd' : '#64748b',
            fontSize: 10, padding: '2px 7px', cursor: 'pointer', fontWeight: 600,
          }}>{m === 'manual' ? 'Manual' : 'Feedback Log'}</button>
        ))}
      </div>
 
      {mode === 'manual' && (
        <input value={value.manual || ''}
          onChange={e => onChange({ ...value, manual: e.target.value })}
          placeholder="Type task name…" style={smallInp} />
      )}
 
      {mode === 'feedbacklog' && (
        <>
          <select value={value.feedbackLogId || ''} onChange={e => handleFLSelect(e.target.value)} style={smallInp}>
            <option value="">Select Feedback Log…</option>
            {FEEDBACK_LOGS.map(fl => <option key={fl.id} value={fl.id}>{fl.label}</option>)}
            <option value="__custom__">— Enter manually —</option>
          </select>
 
          {value.feedbackLogId === '__custom__' && (
            <>
              <input value={customLabel}
                onChange={e => { setCustomLabel(e.target.value); onChange({ ...value, feedbackLogLabel: e.target.value }) }}
                placeholder="Display text for hyperlink…" style={{ ...smallInp, marginTop: 2 }} />
              <input value={customUrl}
                onChange={e => { setCustomUrl(e.target.value); onChange({ ...value, feedbackLogUrl: e.target.value }) }}
                placeholder="https://docs.google.com/…" style={{ ...smallInp, marginTop: 2 }} />
            </>
          )}
 
          {value.feedbackLogId && value.feedbackLogId !== '__custom__' && value.feedbackLogUrl && (
            <a href={value.feedbackLogUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: '#3b82f6', textDecoration: 'underline', marginTop: 2 }}>
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
  const [showForm,    setShowForm]    = useState(false)
  const [expandedId,  setExpandedId]  = useState(null)
  const [exporting,   setExporting]   = useState(null)
  const [isSaving,    setIsSaving]    = useState(null)
  const [justSaved,   setJustSaved]   = useState({})
 
  // depRows[depId] = Row[]
  const [depRows, setDepRows] = useState({})
 
  // ── Hydrate depRows from dep.rows (saved in Supabase) when deployments load
  useEffect(() => {
    if (!deployments?.length) return
    setDepRows(current => {
      const next = { ...current }
      deployments.forEach(dep => {
        // Only hydrate if we don't already have local edits for this dep
        if (!next[dep.id] && Array.isArray(dep.rows) && dep.rows.length > 0) {
          next[dep.id] = dep.rows
        }
      })
      return next
    })
  }, [deployments])
 
  // ── Row / detail helpers ─────────────────────────────────────────────────
  const getRows = (depId) => depRows[depId] || []
 
  const setRows = (depId, updater) =>
    setDepRows(d => ({ ...d, [depId]: typeof updater === 'function' ? updater(d[depId] || []) : updater }))
 
  // Add a new top-level task row
  const addRow = (depId) =>
    setRows(depId, rows => [...rows, emptyRow()])
 
  // Remove an entire task row
  const removeRow = (depId, rowId) =>
    setRows(depId, rows => rows.filter(r => r.id !== rowId))
 
  // Patch the task field of a row
  const patchRowTask = (depId, rowId, task) =>
    setRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, task } : r))
 
  // Add a detail sub-row to a task
  const addDetail = (depId, rowId) =>
    setRows(depId, rows => rows.map(r =>
      r.id === rowId ? { ...r, details: [...r.details, emptyDetail()] } : r
    ))
 
  // Remove a detail sub-row (keep at least one; if last, remove the whole task)
  const removeDetail = (depId, rowId, detailId) =>
    setRows(depId, rows => rows.flatMap(r => {
      if (r.id !== rowId) return [r]
      const next = r.details.filter(d => d.id !== detailId)
      if (next.length === 0) return []          // remove whole task if no details left
      return [{ ...r, details: next }]
    }))
 
  // Patch a single detail field
  const patchDetail = (depId, rowId, detailId, patch) =>
    setRows(depId, rows => rows.map(r =>
      r.id !== rowId ? r : {
        ...r,
        details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d),
      }
    ))
 
  // ── Create deployment ────────────────────────────────────────────────────
  async function handleCreate(form) {
    const res = await createDeployment({ ...form, createdBy: PAMember || form.createdBy })
    if (res.success) { setShowForm(false); setExpandedId(res.deployment?.id) }
  }
 
  // ── Save rows to Supabase (deployments.rows column) ─────────────────────
  async function handleSave(depId) {
    setIsSaving(depId)
    try {
      const rows = getRows(depId)
      const res = await saveRows(depId, rows)
      if (!res.success) throw new Error(res.error)
      setJustSaved(s => ({ ...s, [depId]: true }))
      setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
    } catch (e) {
      alert('Save failed: ' + (e.message || e))
    } finally {
      setIsSaving(null)
    }
  }
 
  // ── Export ───────────────────────────────────────────────────────────────
  async function handleExport(dep) {
    setExporting(dep.id)
    try {
      // const rows = getRows(dep.id)
      const deploymentRows = getRows(dep.id)

      const itRows = itEntries
        .filter(e => String(e.deployment_id) === String(dep.id))
        .flatMap(e => e.rows || [])

      const rows = [...deploymentRows, ...itRows]
      const exportRows = rows.flatMap(row => {
        const fl = FEEDBACK_LOGS.find(f => f.id === row.task.feedbackLogId)
        const taskLabel =
          row.task.feedbackLogId && row.task.feedbackLogId !== '__custom__'
            ? (fl?.label || row.task.manual || '')
            : row.task.feedbackLogId === '__custom__'
            ? (row.task.feedbackLogLabel || row.task.manual || '')
            : (row.task.manual || '')
        const taskUrl = row.task.feedbackLogUrl || null
        const flId    = row.task.feedbackLogId
 
        return row.details.map((d, di) => {
          const isBug = d.discovery === 'bug'
          let remark = d.remark || ''
          if (flId && flId !== '__custom__') remark = `#${flId} - ${remark}`
          else if (flId === '__custom__' && row.task.feedbackLogLabel) remark = `#${row.task.feedbackLogLabel} - ${remark}`
          if (isBug) remark = `${remark} (bug)`
          if (!d.testingRequired) remark = remark ? `${remark}\nno testing required` : 'no testing required'
 
          return {
            taskLabel:       taskLabel,   // always set — exportDocx handles blank display for subsequent blocks
            taskUrl:         taskUrl,
            remarks:         remark,
            pic:             d.discovery === 'self-discovered' ? '' : (d.pic || ''),
            md:              d.md || '',
            discovery:       d.discovery,
            testingRequired: d.testingRequired,
            deployLiveDate:  d.liveDate || today,
          }
        })
      })
      await exportDeploymentDocx({ deployment: dep, tasks: exportRows, liveDate: dep.deploy_date })
    } finally { setExporting(null) }
  }
 
  if (loading) return <div style={{ color: '#475569', textAlign: 'center', padding: 60 }}>Loading…</div>
 
  const TH = (label, extra = {}) => (
    <th style={{
      padding: '8px 8px', textAlign: 'left', color: '#475569', fontSize: 10,
      fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
      background: '#0f172a', ...extra,
    }}>{label}</th>
  )
 
  // Shared style for the spanned # and TASK cells
  const spanTd = { ...cellPad, background: '#131e2e', borderRight: '1px solid #1e293b' }
 
  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700 }}>
            🚀 Deployment Board
          </h2>
          <p style={{ color: '#d1d6d8e0', fontSize: 12, marginTop: 4 }}>Export weekly deployment list</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={btnPrimary}>
          {showForm ? 'Cancel' : '+ New Deployment'}
        </button>
      </div>
 
      {showForm && (
        <DeploymentForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} PAMember={PAMember} />
      )}
 
      {deployments.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: '#d1d6d8e0', padding: 60, fontSize: 13 }}>
          No deployments yet. Click <strong>+ New Deployment</strong> to start.
        </div>
      )}
 
      {/* ── Deployment cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {deployments.map(dep => {
          const expanded  = expandedId === dep.id
          const envColor  = ENV_COLOR[dep.environment] || '#64748b'
          const rows      = getRows(dep.id)
 
          return (
            <div key={dep.id} style={{ background: '#1e293b', borderRadius: 14, border: `1px solid ${envColor}35`, overflow: 'hidden' }}>
 
              {/* ── Card header ── */}
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 4, height: 36, borderRadius: 99, background: envColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{dep.title}</div> */}
                  <div style={{ color: '#d1d6d8e0', fontSize: 13, marginTop: 2 }}>
                    📅 {dep.deploy_date} &nbsp;·&nbsp;
                    <span style={{ color: envColor }}>{dep.environment}</span>
                    &nbsp;·&nbsp; {rows.length} task{rows.length !== 1 ? 's' : ''}
                    {dep.created_by && <> &nbsp;·&nbsp; by {dep.created_by.split(' ')[0]}</>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setExpandedId(expanded ? null : dep.id)} style={{
                    background: 'rgba(100,116,139,0.15)', border: '1px solid #334155',
                    borderRadius: 8, color: '#94a3b8', padding: '6px 12px', fontSize: 12, cursor: 'pointer',
                  }}>{expanded ? '▲ Collapse' : '▼ Manage'}</button>
                  <button
                    onClick={() => handleSave(dep.id)}
                    disabled={isSaving === dep.id}
                    style={{
                      background: justSaved[dep.id] ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                      border: `1px solid ${justSaved[dep.id] ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
                      borderRadius: 8,
                      color: justSaved[dep.id] ? '#22c55e' : '#3b82f6',
                      padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                    }}>
                    {isSaving === dep.id ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
                  </button>
                  <button onClick={() => handleExport(dep)} disabled={exporting === dep.id} style={{
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 8, color: '#22c55e', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  }}>{exporting === dep.id ? '⏳ Exporting…' : '📄 Export Word'}</button>
                  <button onClick={() => { if (confirm('Delete this deployment?')) deleteDeployment(dep.id) }} style={{
                    background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8,
                    color: '#ef4444', padding: '6px 10px', fontSize: 13, cursor: 'pointer',
                  }}>🗑️</button>
                </div>
              </div>
 
              {/* ── Expanded manage panel ── */}
              {expanded && (
                <div style={{ borderTop: '1px solid #0f172a', padding: 20 }}>
 
                  {rows.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr>
                            {TH('#',                { width: 32,  textAlign: 'center', color: '#D1D6D8E0' })}
                            {TH('Task',             { minWidth: 200, color: '#D1D6D8E0' })}
                            {TH('Remarks from iFAST', { minWidth: 200, color: '#D1D6D8E0' })}
                            {TH('Self-Disc / Bug',  { minWidth: 130, color: '#D1D6D8E0' })}
                            {TH('Testing?',         { minWidth: 80, textAlign: 'center', color: '#D1D6D8E0' })}
                            {TH('MD',               { minWidth: 70, color: '#D1D6D8E0' })}
                            {TH('PIC',              { minWidth: 130, color: '#D1D6D8E0' })}
                            {TH('LIVE on',          { minWidth: 130, color: '#D1D6D8E0' })}
                            {TH('',                 { width: 60, color: '#D1D6D8E0' })}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIdx) => {
                            const span = row.details.length
 
                            return row.details.map((d, di) => {
                              const isSelfDisc   = d.discovery === 'self-discovered'
                              const isLastDetail = di === span - 1
                              const trStyle = {
                                borderBottom: isLastDetail
                                  ? '2px solid #0f172a'       // thick border between tasks
                                  : '1px dashed #293548',     // thin dashed between detail rows
                              }
 
                              return (
                                <tr key={d.id} style={trStyle}>
 
                                  {/* # — rowSpan across all detail rows of this task */}
                                  {di === 0 && (
                                    <td rowSpan={span} style={{
                                      ...spanTd,
                                      textAlign: 'center', width: 32,
                                      color: '#94a3b8', fontWeight: 700, fontSize: 13,
                                      verticalAlign: 'middle',
                                    }}>
                                      {rowIdx + 1}
                                    </td>
                                  )}
 
                                  {/* TASK — rowSpan, also holds the "+ add row" button */}
                                  {di === 0 && (
                                    <td rowSpan={span} style={{ ...spanTd, minWidth: 200, verticalAlign: 'top' }}>
                                      <TaskCell
                                        value={row.task}
                                        onChange={task => patchRowTask(dep.id, row.id, task)} />
                                      <button
                                        onClick={() => addDetail(dep.id, row.id)}
                                        style={{
                                          marginTop: 10, display: 'block',
                                          background: 'none', border: '1px dashed #334155',
                                          borderRadius: 5, color: '#D1D6D8E0',
                                          fontSize: 10, padding: '2px 10px', cursor: 'pointer',
                                        }}>+ add row</button>
                                    </td>
                                  )}
 
                                  {/* REMARKS FROM ASP */}
                                  <td style={{ ...cellPad, minWidth: 200 }}>
                                    <input
                                      value={d.remark}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })}
                                      placeholder="Remark…"
                                      style={{ ...smallInp, width: '100%' }} />
                                    {!d.testingRequired && (
                                      <div style={{ fontSize: 10, color: '#ef4444', fontStyle: 'italic', marginTop: 3 }}>
                                        no testing required
                                      </div>
                                    )}
                                  </td>
 
                                  {/* SELF-DISC / BUG */}
                                  <td style={{ ...cellPad, minWidth: 130 }}>
                                    <select
                                      value={d.discovery}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}
                                      style={smallInp}>
                                      {DISCOVERY_TYPES.map(dt => (
                                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                                      ))}
                                    </select>
                                  </td>
 
                                  {/* TESTING REQUIRED */}
                                  <td style={{ ...cellPad, minWidth: 80, textAlign: 'center' }}>
                                    <button
                                      onClick={() => patchDetail(dep.id, row.id, d.id, { testingRequired: !d.testingRequired })}
                                      style={{
                                        background: d.testingRequired ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                        border: `1px solid ${d.testingRequired ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                        borderRadius: 6, color: d.testingRequired ? '#22c55e' : '#ef4444',
                                        padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700,
                                      }}>
                                      {d.testingRequired ? 'Yes' : 'No'}
                                    </button>
                                  </td>
 
                                  {/* MD */}
                                  <td style={{ ...cellPad, minWidth: 70 }}>
                                    <input
                                      type="number" min="0" step="0.01"
                                      value={d.md}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })}
                                      placeholder="3.25"
                                      style={{ ...smallInp, width: 64 }} />
                                  </td>
 
                                  {/* PIC — greyed out if self-discovered */}
                                  <td style={{ ...cellPad, minWidth: 130 }}>
                                    <select
                                      value={d.pic}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { pic: e.target.value })}
                                      disabled={isSelfDisc}
                                      style={{ ...smallInp, opacity: isSelfDisc ? 0.35 : 1, cursor: isSelfDisc ? 'not-allowed' : 'auto' }}>
                                      <option value="">Select…</option>
                                      {IFA_MEMBERS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                    {isSelfDisc && (
                                      <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontStyle: 'italic' }}>
                                        N/A (self-disc.)
                                      </div>
                                    )}
                                  </td>
 
                                  {/* DEPLOYING LIVE ON */}
                                  <td style={{ ...cellPad, minWidth: 130 }}>
                                    <input
                                      type="date"
                                      value={d.liveDate || today}
                                      onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })}
                                      style={{ ...smallInp, width: 130 }} />
                                  </td>
 
                                  {/* REMOVE — detail row or whole task if last */}
                                  <td style={{ ...cellPad, width: 60, textAlign: 'center' }}>
                                    <button
                                      onClick={() => removeDetail(dep.id, row.id, d.id)}
                                      title={span === 1 ? 'Remove task' : 'Remove this row'}
                                      style={{
                                        background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6,
                                        color: '#ef4444', padding: '4px 8px', fontSize: 12, cursor: 'pointer',
                                      }}>
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
                    <div style={{ color: '#d1d6d8e0', fontSize: 12, padding: '10px 0 14px' }}>
                      No tasks yet. Click <strong style={{ color: '#3b82f6' }}>+ Add Task</strong> to add one.
                    </div>
                  )}
 
                  <button onClick={() => addRow(dep.id)} style={{
                    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: 8, color: '#3b82f6', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  }}>+ Add Task</button>
 
                  <div style={{ marginTop: 14, padding: '10px 14px', background: '#0f172a', borderRadius: 8,
                    fontSize: 11, color: '#d1d6d8e0', border: '1px solid #1e293b' }}>
                    💡 Fill in <strong style={{ color: '#d1d6d8e0' }}>Remarks from iFAST</strong> for each row, then click
                    <strong style={{ color: '#3b82f6' }}> 💾 Save</strong> to persist your tasks, and
                    <strong style={{ color: '#22c55e' }}> Export Word</strong> → downloads as
                    <strong style={{ color: '#94a3b8' }}> {'CRM_Deployment_List_{dep.deploy_date}.docx'}</strong>
                  </div>
 
                  {/* ── IT Members' entries (read-only view) ── */}
                  {(() => {
                    const depITEntries = itEntries.filter(e => String(e.deployment_id) === String(dep.id))
                    if (depITEntries.length === 0) return null
                    return (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ color: '#d1d6d8e0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.06em', marginBottom: 10 }}>
                          👤 IT Members' Deployment Items
                        </div>
                        {depITEntries.map(entry => {
                          const entryRows = entry.rows || []
                          if (entryRows.length === 0) return null
                          return (
                            <div key={entry.id} style={{ marginBottom: 12 }}>
                              <div style={{ color: '#d1d6d8e0', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                                {entry.it_name}
                              </div>
                              <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed'}}>
                                  <thead>
                                    <tr style={{ background: '#0f172a', color: '#d1d6d8e0' }}>
                                      {TH('#', COL_WIDTHS.num)}
                                      {TH('Task', COL_WIDTHS.task)}
                                      {TH('Remarks', COL_WIDTHS.remarks)}
                                      {TH('Self-Disc/Bug', COL_WIDTHS.discovery)}
                                      {TH('Testing?', COL_WIDTHS.testing)}
                                      {TH('MD', COL_WIDTHS.md)}
                                      {TH('PIC', COL_WIDTHS.pic)}
                                      {TH('LIVE on', COL_WIDTHS.live)}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entryRows.map((row, rowIdx) =>
                                      row.details?.map((d, di) => {
                                        const fl = FEEDBACK_LOGS.find(f => f.id === row.task?.feedbackLogId)
                                        const taskLabel = row.task?.feedbackLogId && row.task.feedbackLogId !== '__custom__'
                                          ? (fl?.label || row.task.manual || '')
                                          : row.task?.feedbackLogId === '__custom__'
                                          ? (row.task.feedbackLogLabel || row.task.manual || '')
                                          : (row.task?.manual || '')
                                        const taskUrl = row.task?.feedbackLogUrl || null
                                        return (
                                          <tr key={d.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                            {di === 0 && (
                                              <td rowSpan={row.details.length} style={{ ...COL_WIDTHS.num, padding: '8px', color: '#a4acb7', verticalAlign: 'middle', fontWeight: 700 }}>
                                                {rowIdx + 1}
                                              </td>
                                            )}
                                            {di === 0 && (
                                              <td rowSpan={row.details.length} style={{ ...COL_WIDTHS.task, padding: '8px', verticalAlign: 'top' }}>
                                                {taskUrl
                                                  ? <a href={taskUrl} target="_blank" rel="noopener noreferrer"
                                                      style={{ color: '#3b82f6', textDecoration: 'underline', fontSize: 12 }}>{taskLabel}</a>
                                                  : <span style={{ color: '#f1f5f9' }}>{taskLabel}</span>}
                                              </td>
                                            )}
                                            <td style={{ ...COL_WIDTHS.remarks, padding: '8px', color: '#94a3b8' }}>{d.remark || ''}</td>
                                            <td style={{ ...COL_WIDTHS.discovery, padding: '8px', color: '#94a3b8' }}>
                                              {d.discovery === 'self-discovered' ? 'Self-Disc' : d.discovery === 'bug' ? 'Bug' : '—'}
                                            </td>
                                            <td style={{ ...COL_WIDTHS.testing, padding: '6px 8px', textAlign: 'center',
                                              color: d.testingRequired ? '#22c55e' : '#ef4444' }}>
                                              {d.testingRequired ? 'Yes' : 'No'}
                                            </td>
                                            <td style={{ ...COL_WIDTHS.md, padding: '8px', color: '#94a3b8'}}>{d.md || '—'}</td>
                                            <td style={{ ...COL_WIDTHS.pic, padding: '8px', color: '#94a3b8' }}>{d.pic || '—'}</td>
                                            <td style={{ ...COL_WIDTHS.liveDate, padding: '8px', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>
                                              {d.liveDate || '—'}
                                            </td>
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