// ITBoard.jsx
// import { useState, useMemo, useEffect } from 'react'
// import { IT_MEMBERS, IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES, today, computeStatus, STATUS_COLOR, STATUS_BG } from './helpers'
// import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
// import { useAnnualLeave } from './useAnnualLeave'
// import { useITEntries } from './useITEntries'
// import TaskForm from './TaskForm'
// import './ITBoard.css'

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// function fmtDate(dateStr) {
//   if (!dateStr) return ''
//   return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
// }

// function Badge({ label, color, bg }) {
//   return (
//     <span className="badge" style={{ background: bg, color, borderColor: `${color}40` }}>
//       {label}
//     </span>
//   )
// }

// const uid = () => Math.random().toString(36).slice(2)
// function emptyDetail(deployDate = today) {
//   return { id: uid(), remark: '', discovery: '', testingRequired: true, md: '', pic: '', liveDate: deployDate }
// }
// function emptyRow(deployDate = today) {
//   return { id: uid(), task: { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' }, details: [emptyDetail(deployDate)] }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Annual Leave section
// // ─────────────────────────────────────────────────────────────────────────────

// function ALSection({ itName }) {
//   const { leavesFor, loading, saving, createLeave, updateLeave, deleteLeave } = useAnnualLeave()
//   const myLeaves = leavesFor(itName)

//   const [showForm, setShowForm] = useState(false)
//   const [editing,  setEditing]  = useState(null)
//   const [draft,    setDraft]    = useState(null)

//   const emptyDraft = () => ({ startDate: today, endDate: today, note: '' })

//   function openNew()   { setDraft(emptyDraft()); setEditing(null); setShowForm(true) }
//   function openEdit(leave) {
//     setDraft({ startDate: leave.start_date, endDate: leave.end_date, note: leave.note || '' })
//     setEditing(leave); setShowForm(true)
//   }
//   function setField(k, v) { setDraft(d => ({ ...d, [k]: v })) }

//   async function handleSubmit() {
//     if (!draft.startDate || !draft.endDate) return alert('Start and end date are required.')
//     if (draft.endDate < draft.startDate)    return alert('End date must be on or after start date.')
//     let res
//     if (editing) {
//       res = await updateLeave(editing.id, draft)
//     } else {
//       res = await createLeave({ itName, startDate: draft.startDate, endDate: draft.endDate, note: draft.note })
//     }
//     if (res.success) { setShowForm(false); setDraft(null); setEditing(null) }
//     else alert('Save failed: ' + res.error)
//   }

//   return (
//     <div>
//       <div className="al-section__header">
//         <span className="al-section__label">🌴 Annual Leave ({myLeaves.length})</span>
//         {!showForm && (
//           <button className="btn-add-new-entry" onClick={openNew}>+ Add Leave</button>
//         )}
//       </div>

//       {showForm && draft && (
//         <div className="al-form">
//           <div className="al-form__grid">
//             <div>
//               <label className="al-form__label">Start Date *</label>
//               <input className="al-form__inp" type="date" value={draft.startDate} onChange={e => setField('startDate', e.target.value)} />
//             </div>
//             <div>
//               <label className="al-form__label">End Date *</label>
//               <input className="al-form__inp" type="date" value={draft.endDate} min={draft.startDate} onChange={e => setField('endDate', e.target.value)} />
//             </div>
//           </div>
//           <div style={{ marginBottom: 12 }}>
//             <label className="al-form__label">Note (optional)</label>
//             <input className="al-form__inp" value={draft.note} placeholder="e.g. Family trip" onChange={e => setField('note', e.target.value)} />
//           </div>
//           <div className="al-form__actions">
//             <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => { setShowForm(false); setDraft(null); setEditing(null) }}>Cancel</button>
//             <button className="btn-submit" style={{ padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
//               {saving ? '⏳ Saving…' : editing ? 'Update' : 'Add Leave'}
//             </button>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <div style={{ color: '#475569', fontSize: 12 }}>Loading…</div>
//       ) : myLeaves.length === 0 && !showForm ? (
//         <div style={{ color: '#475569', fontSize: 12 }}>No annual leave recorded.</div>
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {myLeaves.map(leave => {
//             const days = Math.round((new Date(leave.end_date) - new Date(leave.start_date)) / 86400000) + 1
//             return (
//               <div key={leave.id} className="al-entry">
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                     <span className="al-entry__dates">{fmtDate(leave.start_date)}</span>
//                     <span style={{ color: '#475569' }}>→</span>
//                     <span className="al-entry__dates">{fmtDate(leave.end_date)}</span>
//                     <span style={{ color: '#475569', fontSize: 11 }}>({days} day{days !== 1 ? 's' : ''})</span>
//                   </div>
//                   {leave.note && <div className="al-entry__note">{leave.note}</div>}
//                 </div>
//                 <div className="al-entry__actions">
//                   <button className="btn-icon-edit" onClick={() => openEdit(leave)}>✏️</button>
//                   <button className="btn-icon-delete" onClick={() => { if (confirm('Delete this leave?')) deleteLeave(leave.id) }}>🗑</button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Tasks section (filtered to this IT member)
// // ─────────────────────────────────────────────────────────────────────────────

// function TasksSection({ itName, tasks, createTask, updateTask, deleteTask, saving }) {
//   const [showForm, setShowForm] = useState(false)
//   const [editing,  setEditing]  = useState(null)

//   const myTasks = useMemo(() =>
//     tasks.filter(t => t.itName === itName)
//          .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
//     [tasks, itName]
//   )

//   async function handleSave(form) {
//     if (editing) {
//       const res = await updateTask(editing.id, form)
//       if (res.success) { setEditing(null); setShowForm(false) }
//     } else {
//       const res = await createTask({ ...form, itName })
//       if (res.success) setShowForm(false)
//     }
//   }

//   return (
//     <div>
//       <div className="tasks-section__header">
//         <span className="tasks-section__label">🗂 Tasks ({myTasks.length})</span>
//         {!showForm && (
//           <button className="btn-add-new-entry" onClick={() => { setEditing(null); setShowForm(true) }}>
//             + Add Task
//           </button>
//         )}
//       </div>

//       {showForm && (
//         <div style={{ marginBottom: 12 }}>
//           <TaskForm
//             initial={editing ? { ...editing, itName } : { itName }}
//             onSave={handleSave}
//             onCancel={() => { setShowForm(false); setEditing(null) }}
//             saving={saving}
//           />
//         </div>
//       )}

//       {myTasks.length === 0 && !showForm ? (
//         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No tasks yet.</div>
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {myTasks.map(task => {
//             const status = computeStatus({ ...task, start_date: task.startDate, end_date: task.endDate })
//             return (
//               <div key={task.id} className="task-mini-card">
//                 <div className="task-mini-card__inner">
//                   <div className="task-mini-card__body">
//                     <div className="task-mini-card__top">
//                       <span className="task-mini-card__name">{task.project}</span>
//                       <Badge label={status} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />
//                       {task.priority === 'High' && <Badge label="High" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
//                     </div>
//                     <div className="task-mini-card__dates">
//                       {task.targetLive && <span>🎯 Live: {fmtDate(task.targetLive)}</span>}
//                       {task.manday    && <span>⏱ {task.manday} MD</span>}
//                     </div>
//                     <div className="task-mini-progress">
//                       <div className="task-mini-progress__track">
//                         <div
//                           className="task-mini-progress__fill"
//                           style={{
//                             width:      `${task.progress || 0}%`,
//                             background: task.progress === 100 ? '#22c55e' : task.progress > 60 ? '#3b82f6' : '#f59e0b',
//                           }}
//                         />
//                       </div>
//                       <span className="task-mini-progress__pct">{task.progress || 0}%</span>
//                     </div>
//                   </div>
//                   <div className="task-mini-card__actions">
//                     <button className="btn-icon-edit" onClick={() => { setEditing(task); setShowForm(true) }}>✏️</button>
//                     <button className="btn-icon-delete" onClick={() => { if (confirm('Delete task?')) deleteTask(task.id) }}>🗑</button>
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TaskCell — shared with DeploymentBoard
// // ─────────────────────────────────────────────────────────────────────────────

// function TaskCell({ value, onChange }) {
//   const [mode,        setMode]        = useState(value.feedbackLogId ? 'feedbacklog' : 'manual')
//   const [customUrl,   setCustomUrl]   = useState(value.feedbackLogUrl   || '')
//   const [customLabel, setCustomLabel] = useState(value.feedbackLogLabel || '')

//   function handleFLSelect(id) {
//     if (id === '__custom__') {
//       onChange({ ...value, feedbackLogId: '__custom__', feedbackLogUrl: customUrl, feedbackLogLabel: customLabel })
//     } else {
//       const fl = FEEDBACK_LOGS.find(f => f.id === id)
//       onChange({ ...value, feedbackLogId: id, feedbackLogUrl: fl?.url || '', feedbackLogLabel: fl?.label || '' })
//     }
//   }

//   return (
//     <div className="task-cell">
//       <div className="task-cell__mode-bar">
//         {['manual', 'feedbacklog'].map(m => (
//           <button
//             key={m}
//             className={`task-cell__mode-btn ${mode === m ? 'task-cell__mode-btn--active' : 'task-cell__mode-btn--idle'}`}
//             onClick={() => setMode(m)}
//           >
//             {m === 'manual' ? 'Manual' : 'Feedback Log'}
//           </button>
//         ))}
//       </div>
//       {mode === 'manual' && (
//         <input className="dep-inp" value={value.manual || ''} onChange={e => onChange({ ...value, manual: e.target.value })} placeholder="Type task name…" />
//       )}
//       {mode === 'feedbacklog' && (
//         <>
//           <select className="dep-inp" value={value.feedbackLogId || ''} onChange={e => handleFLSelect(e.target.value)}>
//             <option value="">Select Feedback Log…</option>
//             {FEEDBACK_LOGS.map(fl => <option key={fl.id} value={fl.id}>{fl.label}</option>)}
//             <option value="__custom__">— Enter manually —</option>
//           </select>
//           {value.feedbackLogId === '__custom__' && (
//             <>
//               <input className="dep-inp" value={customLabel} onChange={e => { setCustomLabel(e.target.value); onChange({ ...value, feedbackLogLabel: e.target.value }) }} placeholder="Display text for hyperlink…" style={{ marginTop: 2 }} />
//               <input className="dep-inp" value={customUrl}   onChange={e => { setCustomUrl(e.target.value);   onChange({ ...value, feedbackLogUrl: e.target.value })   }} placeholder="https://docs.google.com/…"    style={{ marginTop: 2 }} />
//             </>
//           )}
//           {value.feedbackLogId && value.feedbackLogId !== '__custom__' && value.feedbackLogUrl && (
//             <a className="task-cell__link" href={value.feedbackLogUrl} target="_blank" rel="noopener noreferrer">🔗 Open in Google Docs</a>
//           )}
//         </>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // IT Deployment Section — same table as DeploymentBoard
// // ─────────────────────────────────────────────────────────────────────────────

// function ITDeploymentSection({ itName, deployments = [], entries, getRows, saveRows, syncToMainDeployment, isSaving }) {

//   const TH = (label, extra = {}) => (
//     <th className="dep-th" style={extra}>{label}</th>
//   )

//   const [localRows, setLocalRows] = useState({})
//   const [justSaved, setJustSaved] = useState({})
//   const [dirty,     setDirty]     = useState(new Set())

//   useEffect(() => {
//     setLocalRows(current => {
//       const next = { ...current }
//       deployments.forEach(dep => {
//         const key = String(dep.id)
//         if (dirty.has(key)) return
//         const entry = entries.find(e => String(e.deployment_id) === key && e.it_name === itName)
//         if (entry?.rows) next[dep.id] = entry.rows
//       })
//       return next
//     })
//   }, [entries, deployments, itName])

//   const getDepRows   = (depId)          => localRows[depId] || []
//   const setDepRows   = (depId, updater) => {
//     setDirty(d => new Set(d).add(String(depId)))
//     setLocalRows(r => ({ ...r, [depId]: typeof updater === 'function' ? updater(r[depId] || []) : updater }))
//   }
//   const addRow       = (dep)                          => setDepRows(dep.id, rows => [...rows, emptyRow(dep.deploy_date)])
//   const patchRowTask = (depId, rowId, taskPatch)        => {
//     setDirty(d => new Set(d).add(String(depId)))
//     setLocalRows(prev => ({
//       ...prev,
//       [depId]: (prev[depId] || []).map(r => r.id === rowId ? { ...r, task: taskPatch } : r),
//     }))
//   }
//   const addDetail    = (dep, rowId)                   => setDepRows(dep.id, rows => rows.map(r => r.id === rowId ? { ...r, details: [...r.details, emptyDetail(dep.deploy_date)] } : r))
//   const removeDetail = (depId, rowId, detailId)         =>
//     setDepRows(depId, rows => rows.flatMap(r => {
//       if (r.id !== rowId) return [r]
//       const next = r.details.filter(d => d.id !== detailId)
//       return next.length === 0 ? [] : [{ ...r, details: next }]
//     }))
//   const patchDetail  = (depId, rowId, detailId, patch)  => {
//     setDirty(d => new Set(d).add(String(depId)))
//     setLocalRows(prev => ({
//       ...prev,
//       [depId]: (prev[depId] || []).map(r =>
//         r.id !== rowId ? r : { ...r, details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d) }
//       ),
//     }))
//   }

//   async function handleSave(depId) {
//     const rows = getDepRows(depId)
//     // Write exclusively to this IT member's own it_entries record.
//     // Never touch the main deployment rows — PA saves and other IT member saves
//     // are fully isolated, preventing concurrent-save data loss.
//     const res = await saveRows(depId, itName, rows)
//     if (res.success) {
//       setJustSaved(s => ({ ...s, [depId]: true }))
//       setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
//     } else {
//       alert('Save failed: ' + res.error)
//     }
//   }

//   if (deployments.length === 0) {
//     return <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
//   }

//   return (
//     <div className="it-dep-list">
//       {deployments.map(dep => {
//         const rows = getDepRows(dep.id)
//         return (
//           <div key={dep.id} className="it-dep-card">
//             <div className="it-dep-card__header">
//               <div>
//                 <span className="it-dep-card__title">{dep.title || dep.deploy_date}</span>
//                 <span className="it-dep-card__date">📅 {dep.deploy_date}</span>
//               </div>
//               <button
//                 className={`btn-save ${justSaved[dep.id] ? 'btn-save--saved' : 'btn-save--idle'}`}
//                 onClick={() => handleSave(dep.id)}
//                 disabled={isSaving}
//               >
//                 {isSaving ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
//               </button>
//             </div>

//             <div className="it-dep-card__panel">
//               {rows.length > 0 && (
//                 <div className="dep-table-scroll" style={{ marginBottom: 14 }}>
//                   <table className="dep-table">
//                     <thead>
//                       <tr>
//                         {TH('#',                  { width: 32, textAlign: 'center' })}
//                         {TH('Task',               { minWidth: 200 })}
//                         {TH('Remarks from iFAST', { minWidth: 200 })}
//                         {TH('Self-Disc / Bug',    { minWidth: 130 })}
//                         {TH('Testing?',           { minWidth: 80, textAlign: 'center' })}
//                         {TH('MD',                 { minWidth: 70 })}
//                         {TH('PIC',                { minWidth: 130 })}
//                         {TH('LIVE on',            { minWidth: 130 })}
//                         {TH('',                   { width: 60 })}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {rows.map((row, rowIdx) => {
//                         const span = row.details.length
//                         return row.details.map((d, di) => {
//                           const isSelfDisc   = d.discovery === 'self-discovered'
//                           const isLastDetail = di === span - 1
//                           return (
//                             <tr key={d.id} className={isLastDetail ? 'dep-tr--last-detail' : 'dep-tr--mid-detail'}>
//                               {di === 0 && (
//                                 <td rowSpan={span} className="dep-td--span dep-td--num">{rowIdx + 1}</td>
//                               )}
//                               {di === 0 && (
//                                 <td rowSpan={span} className="dep-td--span" style={{ minWidth: 200, verticalAlign: 'top' }}>
//                                   <TaskCell value={row.task} onChange={task => patchRowTask(dep.id, row.id, task)} />
//                                   <button className="btn-add-row" onClick={() => addDetail(dep, row.id)}>+ add row</button>
//                                 </td>
//                               )}
//                               <td className="dep-td" style={{ minWidth: 200 }}>
//                                 <input className="dep-inp" value={d.remark} onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })} placeholder="e.g. #012 -xxx" style={{ width: '100%' }} />
//                                 {!d.testingRequired && <div className="dep-no-testing-note">no testing required</div>}
//                               </td>
//                               <td className="dep-td" style={{ minWidth: 130 }}>
//                                 <select className="dep-inp" value={d.discovery} onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}>
//                                   {DISCOVERY_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
//                                 </select>
//                               </td>
//                               <td className="dep-td" style={{ minWidth: 80, textAlign: 'center' }}>
//                                 <button
//                                   className={`btn-testing ${d.testingRequired ? 'btn-testing--yes' : 'btn-testing--no'}`}
//                                   onClick={() => patchDetail(dep.id, row.id, d.id, { testingRequired: !d.testingRequired })}
//                                 >
//                                   {d.testingRequired ? 'Yes' : 'No'}
//                                 </button>
//                               </td>
//                               <td className="dep-td" style={{ minWidth: 70 }}>
//                                 <input className="dep-inp" type="number" min="0" step="0.01" value={d.md} onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })} placeholder="3.25" style={{ width: 64 }} />
//                               </td>
//                               <td className="dep-td" style={{ minWidth: 130 }}>
//                                 <select
//                                   className={`dep-inp ${isSelfDisc ? 'dep-inp--disabled' : ''}`}
//                                   value={d.pic}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { pic: e.target.value })}
//                                   disabled={isSelfDisc}
//                                   style={{ cursor: isSelfDisc ? 'not-allowed' : 'auto' }}
//                                 >
//                                   <option value="">Select…</option>
//                                   {IFA_MEMBERS.map(m => <option key={m}>{m}</option>)}
//                                 </select>
//                                 {isSelfDisc && <div className="dep-self-disc-note">N/A (self-disc.)</div>}
//                               </td>
//                               <td className="dep-td" style={{ minWidth: 130 }}>
//                                 <input className="dep-inp" type="date" value={d.liveDate || today} onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })} style={{ width: 130 }} />
//                               </td>
//                               <td className="dep-td" style={{ width: 60, textAlign: 'center' }}>
//                                 <button className="btn-remove-row" onClick={() => removeDetail(dep.id, row.id, d.id)} title={span === 1 ? 'Remove task' : 'Remove this row'}>
//                                   {span === 1 ? '🗑' : '✕'}
//                                 </button>
//                               </td>
//                             </tr>
//                           )
//                         })
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {rows.length === 0 && (
//                 <div className="dep-empty">
//                   No tasks yet. Click <strong style={{ color: 'var(--blue)' }}>+ Add Task</strong> to add one.
//                 </div>
//               )}

//               <button className="btn-add-task" onClick={() => addRow(dep)}>+ Add Task</button>
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Single IT member card
// // ─────────────────────────────────────────────────────────────────────────────

// function ITMemberCard({ itName, tasks = [], deployments = [], itEntries = [], getRows, saveRows, syncToMainDeployment, createTask, updateTask, deleteTask, saving }) {
//   const [expanded,  setExpanded]  = useState(false)
//   const [activeTab, setActiveTab] = useState('tasks')

//   const myTaskCount  = tasks.filter(t => t.itName === itName).length
//   const myEntryCount = itEntries.filter(e => e.it_name === itName && (e.rows?.length || 0) > 0).length

//   const tabs = [
//     { id: 'tasks',       label: `🗂 Tasks (${myTaskCount})`         },
//     { id: 'deployments', label: `🚀 Deployments (${myEntryCount})` },
//     { id: 'al',          label: '🌴 Annual Leave'                   },
//   ]

//   return (
//     <div className="member-card">
//       <div className="member-card__header" onClick={() => setExpanded(e => !e)}>
//         <div className="member-card__avatar">
//           {itName.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase()}
//         </div>
//         <div className="member-card__name-wrap">
//           <div className="member-card__name">{itName}</div>
//           <div className="member-card__meta">
//             {myTaskCount} task{myTaskCount !== 1 ? 's' : ''} · {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
//           </div>
//         </div>
//         <span className="member-card__chevron">{expanded ? '▲' : '▼'}</span>
//       </div>

//       {expanded && (
//         <div className="member-card__body">
//           <div className="member-card__tabs">
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 className={`member-card__tab ${activeTab === tab.id ? 'member-card__tab--active' : ''}`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//           <div className="member-card__content">
//             {activeTab === 'tasks' && (
//               <TasksSection
//                 itName={itName} tasks={tasks}
//                 createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} saving={saving}
//               />
//             )}
//             {activeTab === 'deployments' && (
//               <ITDeploymentSection
//                 itName={itName}
//                 deployments={deployments}
//                 entries={itEntries}
//                 getRows={getRows}
//                 saveRows={saveRows}
//                 syncToMainDeployment={syncToMainDeployment}
//                 isSaving={saving}
//               />
//             )}
//             {activeTab === 'al' && <ALSection itName={itName} />}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main ITBoard
// // ─────────────────────────────────────────────────────────────────────────────

// export default function ITBoard({ tasks = [], deployments = [], itEntries = [], getRows, saveRows, syncToMainDeployment, createTask, updateTask, deleteTask, saving }) {
//   const [search, setSearch] = useState('')

//   const filtered = IT_MEMBERS.filter(name => name.toLowerCase().includes(search.toLowerCase()))

//   return (
//     <div>
//       <div className="itboard__header">
//         <div>
//           <h2 className="itboard__title">👤 IT Board</h2>
//           <p className="itboard__subtitle">Per-member tasks and deployment items.</p>
//         </div>
//         <input
//           className="itboard__search"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           placeholder="Search member…"
//         />
//       </div>

//       <div className="itboard__list">
//         {filtered.map(name => (
//           <ITMemberCard
//             key={name} itName={name}
//             tasks={tasks} deployments={deployments} itEntries={itEntries}
//             getRows={getRows} saveRows={saveRows} syncToMainDeployment={syncToMainDeployment}
//             createTask={createTask} updateTask={updateTask} deleteTask={deleteTask}
//             saving={saving}
//           />
//         ))}
//         {filtered.length === 0 && (
//           <div className="itboard__empty">No members match "{search}"</div>
//         )}
//       </div>
//     </div>
//   )
// }

// ITBoard.jsx
import { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import { IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES, today, computeStatus, STATUS_COLOR, STATUS_BG } from './helpers'
import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
import { useAnnualLeave } from './useAnnualLeave'
import { useITEntries } from './useITEntries'
import TaskForm from './TaskForm'
import './ITBoard.css'
import { supabase } from './supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Badge({ label, color, bg }) {
  return (
    <span className="badge" style={{ background: bg, color, borderColor: `${color}40` }}>
      {label}
    </span>
  )
}

const uid = () => Math.random().toString(36).slice(2)
function emptyDetail(deployDate = today) {
  return { id: uid(), remark: '', discovery: '', testingRequired: true, md: '', pic: '', liveDate: deployDate, testScenario: '' }
}
function emptyRow(deployDate = today) {
  return { id: uid(), task: { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' }, details: [emptyDetail(deployDate)] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Rich Text Editor
// ─────────────────────────────────────────────────────────────────────────────

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null)
  const isComposing = useRef(false)

  // Sync external value into the editor only on mount or when value changes
  // from outside (e.g. loading saved data). Avoid re-setting while user types.
  useEffect(() => {
    if (!editorRef.current) return
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function exec(cmd, val = null) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    handleInput()
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML || '')
  }

  const btnStyle = (active = false) => ({
    background: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
    border: '1px solid #334155',
    borderRadius: 4,
    color: active ? '#93c5fd' : '#94a3b8',
    padding: '2px 7px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: '18px',
  })

  return (
    <div style={{ border: '1px solid #334155', borderRadius: 8, overflow: 'hidden', background: '#0f172a' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 3, padding: '5px 8px', borderBottom: '1px solid #1e293b', flexWrap: 'wrap' }}>
        <button style={btnStyle()} onMouseDown={e => { e.preventDefault(); exec('bold') }}><b>B</b></button>
        <button style={btnStyle()} onMouseDown={e => { e.preventDefault(); exec('italic') }}><i>I</i></button>
        <button style={btnStyle()} onMouseDown={e => { e.preventDefault(); exec('underline') }}><u>U</u></button>
        <span style={{ width: 1, background: '#334155', margin: '0 3px' }} />
        <button style={btnStyle()} onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}>• List</button>
        <button style={btnStyle()} onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }}>1. List</button>
        <span style={{ width: 1, background: '#334155', margin: '0 3px' }} />
        <button style={{ ...btnStyle(), color: '#ef4444' }} onMouseDown={e => { e.preventDefault(); exec('removeFormat'); onChange('') }}>Clear</button>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={() => { isComposing.current = false; handleInput() }}
        data-placeholder={placeholder || 'Enter test scenarios…'}
        style={{
          minHeight: 80,
          padding: '8px 10px',
          fontSize: 12,
          color: '#e2e8f0',
          outline: 'none',
          lineHeight: 1.6,
          fontFamily: 'inherit',
        }}
        onFocus={e => { if (!editorRef.current?.innerHTML) editorRef.current.style.opacity = 1 }}
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 18px; margin: 4px 0; }
        [contenteditable] li { margin: 2px 0; }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Annual Leave section
// ─────────────────────────────────────────────────────────────────────────────

function ALSection({ itName }) {
  const { leavesFor, loading, saving, createLeave, updateLeave, deleteLeave } = useAnnualLeave()
  const myLeaves = leavesFor(itName)

  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [draft,    setDraft]    = useState(null)

  const emptyDraft = () => ({ startDate: today, endDate: today, note: '' })

  function openNew()   { setDraft(emptyDraft()); setEditing(null); setShowForm(true) }
  function openEdit(leave) {
    setDraft({ startDate: leave.start_date, endDate: leave.end_date, note: leave.note || '' })
    setEditing(leave); setShowForm(true)
  }
  function setField(k, v) { setDraft(d => ({ ...d, [k]: v })) }

  async function handleSubmit() {
    if (!draft.startDate || !draft.endDate) return alert('Start and end date are required.')
    if (draft.endDate < draft.startDate)    return alert('End date must be on or after start date.')
    let res
    if (editing) {
      res = await updateLeave(editing.id, draft)
    } else {
      res = await createLeave({ itName, startDate: draft.startDate, endDate: draft.endDate, note: draft.note })
    }
    if (res.success) { setShowForm(false); setDraft(null); setEditing(null) }
    else alert('Save failed: ' + res.error)
  }

  return (
    <div>
      <div className="al-section__header">
        <span className="al-section__label">🌴 Annual Leave ({myLeaves.length})</span>
        {!showForm && (
          <button className="btn-add-new-entry" onClick={openNew}>+ Add Leave</button>
        )}
      </div>

      {showForm && draft && (
        <div className="al-form">
          <div className="al-form__grid">
            <div>
              <label className="al-form__label">Start Date *</label>
              <input className="al-form__inp" type="date" value={draft.startDate} onChange={e => setField('startDate', e.target.value)} />
            </div>
            <div>
              <label className="al-form__label">End Date *</label>
              <input className="al-form__inp" type="date" value={draft.endDate} min={draft.startDate} onChange={e => setField('endDate', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="al-form__label">Note (optional)</label>
            <input className="al-form__inp" value={draft.note} placeholder="e.g. Family trip" onChange={e => setField('note', e.target.value)} />
          </div>
          <div className="al-form__actions">
            <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => { setShowForm(false); setDraft(null); setEditing(null) }}>Cancel</button>
            <button className="btn-submit" style={{ padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
              {saving ? '⏳ Saving…' : editing ? 'Update' : 'Add Leave'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#475569', fontSize: 12 }}>Loading…</div>
      ) : myLeaves.length === 0 && !showForm ? (
        <div style={{ color: '#475569', fontSize: 12 }}>No annual leave recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myLeaves.map(leave => {
            const days = Math.round((new Date(leave.end_date) - new Date(leave.start_date)) / 86400000) + 1
            return (
              <div key={leave.id} className="al-entry">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="al-entry__dates">{fmtDate(leave.start_date)}</span>
                    <span style={{ color: '#475569' }}>→</span>
                    <span className="al-entry__dates">{fmtDate(leave.end_date)}</span>
                    <span style={{ color: '#475569', fontSize: 11 }}>({days} day{days !== 1 ? 's' : ''})</span>
                  </div>
                  {leave.note && <div className="al-entry__note">{leave.note}</div>}
                </div>
                <div className="al-entry__actions">
                  <button className="btn-icon-edit" onClick={() => openEdit(leave)}>✏️</button>
                  <button className="btn-icon-delete" onClick={() => { if (confirm('Delete this leave?')) deleteLeave(leave.id) }}>🗑</button>
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
      <div className="tasks-section__header">
        <span className="tasks-section__label">🗂 Tasks ({myTasks.length})</span>
        {!showForm && (
          <button className="btn-add-new-entry" onClick={() => { setEditing(null); setShowForm(true) }}>
            + Add Task
          </button>
        )}
      </div>

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

      {myTasks.length === 0 && !showForm ? (
        <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No tasks yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myTasks.map(task => {
            const status = computeStatus({ ...task, start_date: task.startDate, end_date: task.endDate })
            return (
              <div key={task.id} className="task-mini-card">
                <div className="task-mini-card__inner">
                  <div className="task-mini-card__body">
                    <div className="task-mini-card__top">
                      <span className="task-mini-card__name">{task.project}</span>
                      <Badge label={status} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />
                      {task.priority === 'High' && <Badge label="High" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
                    </div>
                    <div className="task-mini-card__dates">
                      {task.targetLive && <span>🎯 Live: {fmtDate(task.targetLive)}</span>}
                      {task.manday    && <span>⏱ {task.manday} MD</span>}
                    </div>
                    <div className="task-mini-progress">
                      <div className="task-mini-progress__track">
                        <div
                          className="task-mini-progress__fill"
                          style={{
                            width:      `${task.progress || 0}%`,
                            background: task.progress === 100 ? '#22c55e' : task.progress > 60 ? '#3b82f6' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span className="task-mini-progress__pct">{task.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="task-mini-card__actions">
                    <button className="btn-icon-edit" onClick={() => { setEditing(task); setShowForm(true) }}>✏️</button>
                    <button className="btn-icon-delete" onClick={() => { if (confirm('Delete task?')) deleteTask(task.id) }}>🗑</button>
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
// TaskCell — shared with DeploymentBoard
// ─────────────────────────────────────────────────────────────────────────────

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
        <input className="dep-inp" value={value.manual || ''} onChange={e => onChange({ ...value, manual: e.target.value })} placeholder="Type task name…" />
      )}
      {mode === 'feedbacklog' && (
        <>
          <select className="dep-inp" value={value.feedbackLogId || ''} onChange={e => handleFLSelect(e.target.value)}>
            <option value="">Select Feedback Log…</option>
            {FEEDBACK_LOGS.map(fl => <option key={fl.id} value={fl.id}>{fl.label}</option>)}
            <option value="__custom__">— Enter manually —</option>
          </select>
          {value.feedbackLogId === '__custom__' && (
            <>
              <input className="dep-inp" value={customLabel} onChange={e => { setCustomLabel(e.target.value); onChange({ ...value, feedbackLogLabel: e.target.value }) }} placeholder="Display text for hyperlink…" style={{ marginTop: 2 }} />
              <input className="dep-inp" value={customUrl}   onChange={e => { setCustomUrl(e.target.value);   onChange({ ...value, feedbackLogUrl: e.target.value })   }} placeholder="https://docs.google.com/…"    style={{ marginTop: 2 }} />
            </>
          )}
          {value.feedbackLogId && value.feedbackLogId !== '__custom__' && value.feedbackLogUrl && (
            <a className="task-cell__link" href={value.feedbackLogUrl} target="_blank" rel="noopener noreferrer">🔗 Open in Google Docs</a>
          )}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IT Deployment Section — same table as DeploymentBoard
// ─────────────────────────────────────────────────────────────────────────────

function ITDeploymentSection({ itName, deployments = [], entries, getRows, saveRows, syncToMainDeployment, isSaving }) {

  const TH = (label, extra = {}) => (
    <th className="dep-th" style={extra}>{label}</th>
  )

  const [localRows, setLocalRows] = useState({})
  const [justSaved, setJustSaved] = useState({})
  const [dirty,     setDirty]     = useState(new Set())

  useEffect(() => {
    setLocalRows(current => {
      const next = { ...current }
      deployments.forEach(dep => {
        const key = String(dep.id)
        if (dirty.has(key)) return
        const entry = entries.find(e => String(e.deployment_id) === key && e.it_name === itName)
        if (entry?.rows) next[dep.id] = entry.rows
      })
      return next
    })
  }, [entries, deployments, itName])

  const getDepRows   = (depId)          => localRows[depId] || []
  const setDepRows   = (depId, updater) => {
    setDirty(d => new Set(d).add(String(depId)))
    setLocalRows(r => ({ ...r, [depId]: typeof updater === 'function' ? updater(r[depId] || []) : updater }))
  }
  const addRow       = (dep)                          => setDepRows(dep.id, rows => [...rows, emptyRow(dep.deploy_date)])
  const patchRowTask = (depId, rowId, taskPatch)      => {
    setDirty(d => new Set(d).add(String(depId)))
    setLocalRows(prev => ({
      ...prev,
      [depId]: (prev[depId] || []).map(r => r.id === rowId ? { ...r, task: taskPatch } : r),
    }))
  }
  const addDetail    = (dep, rowId)                   => setDepRows(dep.id, rows => rows.map(r => r.id === rowId ? { ...r, details: [...r.details, emptyDetail(dep.deploy_date)] } : r))
  const removeDetail = (depId, rowId, detailId)       =>
    setDepRows(depId, rows => rows.flatMap(r => {
      if (r.id !== rowId) return [r]
      const next = r.details.filter(d => d.id !== detailId)
      return next.length === 0 ? [] : [{ ...r, details: next }]
    }))
  const patchDetail  = (depId, rowId, detailId, patch) => {
    setDirty(d => new Set(d).add(String(depId)))
    setLocalRows(prev => ({
      ...prev,
      [depId]: (prev[depId] || []).map(r =>
        r.id !== rowId ? r : { ...r, details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d) }
      ),
    }))
  }

  async function handleSave(depId) {
    const rows = getDepRows(depId)
    const res  = await saveRows(depId, itName, rows)
    if (res.success) {
      setJustSaved(s => ({ ...s, [depId]: true }))
      setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
    } else {
      alert('Save failed: ' + res.error)
    }
  }

  if (deployments.length === 0) {
    return <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
  }

  // Number of data columns (excluding action col): # Task Remark Disc Test MD PIC Live = 8
  // const DATA_COLS = 8

  return (
    <div className="it-dep-list">
      {deployments.map(dep => {
        const rows = getDepRows(dep.id)
        return (
          <div key={dep.id} className="it-dep-card">
            <div className="it-dep-card__header">
              <div>
                <span className="it-dep-card__title">{dep.title || dep.deploy_date}</span>
                <span className="it-dep-card__date">📅 {dep.deploy_date}</span>
              </div>
              <button
                className={`btn-save ${justSaved[dep.id] ? 'btn-save--saved' : 'btn-save--idle'}`}
                onClick={() => handleSave(dep.id)}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
              </button>
            </div>

            <div className="it-dep-card__panel">
              {rows.length > 0 && (
                <div className="dep-table-scroll" style={{ marginBottom: 14 }}>
                  <table className="dep-table">
                    <thead>
                      <tr>
                        {TH('#',                  { width: 32, textAlign: 'center' })}
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
                            <Fragment key={d.id}>
                              {/* ── Main data row ── */}
                              <tr className={isLastDetail && !d.testScenario ? 'dep-tr--last-detail' : 'dep-tr--mid-detail'}>
                                {di === 0 && (
                                  <td rowSpan={span * 2} className="dep-td--span dep-td--num">{rowIdx + 1}</td>
                                )}
                                {di === 0 && (
                                  <td rowSpan={span * 2} className="dep-td--span" style={{ minWidth: 200, verticalAlign: 'top' }}>
                                    <TaskCell value={row.task} onChange={task => patchRowTask(dep.id, row.id, task)} />
                                    <button className="btn-add-row" onClick={() => addDetail(dep, row.id)}>+ add row</button>
                                  </td>
                                )}
                                <td className="dep-td" style={{ minWidth: 200 }}>
                                  <input className="dep-inp" value={d.remark} onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })} placeholder="e.g. #012 - xxx" style={{ width: '100%' }} />
                                  {!d.testingRequired && <div className="dep-no-testing-note">no testing required</div>}
                                </td>
                                <td className="dep-td" style={{ minWidth: 130 }}>
                                  <select className="dep-inp" value={d.discovery} onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}>
                                    {DISCOVERY_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
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
                                  <input className="dep-inp" type="number" min="0" step="0.01" value={d.md} onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })} placeholder="3.25" style={{ width: 64 }} />
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
                                  <input className="dep-inp" type="date" value={d.liveDate || today} onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })} style={{ width: 130 }} />
                                </td>
                                <td className="dep-td" style={{ width: 60, textAlign: 'center' }}>
                                  <button className="btn-remove-row" onClick={() => removeDetail(dep.id, row.id, d.id)} title={span === 1 ? 'Remove task' : 'Remove this row'}>
                                    {span === 1 ? '🗑' : '✕'}
                                  </button>
                                </td>
                              </tr>

                              {/* ── Test Scenario row (spans all cols except # and Task) ── */}
                              <tr className={isLastDetail ? 'dep-tr--last-detail' : 'dep-tr--mid-detail'}>
                                <td colSpan={7} style={{ padding: '4px 8px 10px', background: 'rgba(139,92,246,0.04)', borderTop: '1px dashed #1e293b' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                                    Test Scenarios from iFAST
                                  </div>
                                  <RichTextEditor
                                    value={d.testScenario || ''}
                                    onChange={val => patchDetail(dep.id, row.id, d.id, { testScenario: val })}
                                    placeholder="Describe test scenarios for this remark…"
                                  />
                                </td>
                              </tr>
                            </Fragment>
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
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Single IT member card
// ─────────────────────────────────────────────────────────────────────────────

function ITMemberCard({ itName, tasks = [], deployments = [], itEntries = [], getRows, saveRows, syncToMainDeployment, createTask, updateTask, deleteTask, saving }) {
  const [expanded,  setExpanded]  = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const myTaskCount  = tasks.filter(t => t.itName === itName).length
  const myEntryCount = itEntries.filter(e => e.it_name === itName && (e.rows?.length || 0) > 0).length

  const tabs = [
    { id: 'tasks',       label: `🗂 Tasks (${myTaskCount})`         },
    { id: 'deployments', label: `🚀 Deployments (${myEntryCount})` },
    { id: 'al',          label: '🌴 Annual Leave'                   },
  ]

  return (
    <div className="member-card">
      <div className="member-card__header" onClick={() => setExpanded(e => !e)}>
        <div className="member-card__avatar">
          {itName.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase()}
        </div>
        <div className="member-card__name-wrap">
          <div className="member-card__name">{itName}</div>
          <div className="member-card__meta">
            {myTaskCount} task{myTaskCount !== 1 ? 's' : ''} · {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span className="member-card__chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="member-card__body">
          <div className="member-card__tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`member-card__tab ${activeTab === tab.id ? 'member-card__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="member-card__content">
            {activeTab === 'tasks' && (
              <TasksSection
                itName={itName} tasks={tasks}
                createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} saving={saving}
              />
            )}
            {activeTab === 'deployments' && (
              <ITDeploymentSection
                itName={itName}
                deployments={deployments}
                entries={itEntries}
                getRows={getRows}
                saveRows={saveRows}
                syncToMainDeployment={syncToMainDeployment}
                isSaving={saving}
              />
            )}
            {activeTab === 'al' && <ALSection itName={itName} />}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ITBoard
// ─────────────────────────────────────────────────────────────────────────────

// export default function ITBoard({ tasks = [], deployments = [], itEntries = [], getRows, saveRows, syncToMainDeployment, createTask, updateTask, deleteTask, saving }) {
//   const [search, setSearch] = useState('')

//   const filtered = IT_MEMBERS.filter(name => name.toLowerCase().includes(search.toLowerCase()))

//   return (
//     <div>
//       <div className="itboard__header">
//         <div>
//           <h2 className="itboard__title">👤 IT Board</h2>
//           <p className="itboard__subtitle">Per-member tasks and deployment items.</p>
//         </div>
//         <input
//           className="itboard__search"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           placeholder="Search member…"
//         />
//       </div>

//       <div className="itboard__list">
//         {filtered.map(name => (
//           <ITMemberCard
//             key={name} itName={name}
//             tasks={tasks} deployments={deployments} itEntries={itEntries}
//             getRows={getRows} saveRows={saveRows} syncToMainDeployment={syncToMainDeployment}
//             createTask={createTask} updateTask={updateTask} deleteTask={deleteTask}
//             saving={saving}
//           />
//         ))}
//         {filtered.length === 0 && (
//           <div className="itboard__empty">No members match "{search}"</div>
//         )}
//       </div>
//     </div>
//   )
// }

export default function ITBoard({
  tasks = [],
  deployments = [],
  itEntries = [],
  getRows,
  saveRows,
  syncToMainDeployment,
  createTask,
  updateTask,
  deleteTask,
  saving
}) {
  const [search, setSearch] = useState('')
  const [itMembers, setItMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchITMembers() {
      setMembersLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('it_name')
        .eq('role', 'it_user')
        .eq('status', 'active')
        .not('it_name', 'is', null)
        .order('it_name')

      if (cancelled) return

      if (error) {
        console.error('Failed to fetch IT members:', error)
        setItMembers([])
      } else {
        setItMembers(
          [...new Set(
            (data || [])
              .map(row => row.it_name?.trim())
              .filter(Boolean)
          )]
        )
      }

      setMembersLoading(false)
    }

    fetchITMembers()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = itMembers.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="itboard__header">
        <div>
          <h2 className="itboard__title">👤 IT Board</h2>
          <p className="itboard__subtitle">
            Per-member tasks and deployment items.
          </p>
        </div>

        <input
          className="itboard__search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search member…"
        />
      </div>

      {membersLoading ? (
        <div className="itboard__empty">
          Loading IT members...
        </div>
      ) : (
        <div className="itboard__list">
          {filtered.map(name => (
            <ITMemberCard
              key={name}
              itName={name}
              tasks={tasks}
              deployments={deployments}
              itEntries={itEntries}
              getRows={getRows}
              saveRows={saveRows}
              syncToMainDeployment={syncToMainDeployment}
              createTask={createTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
              saving={saving}
            />
          ))}

          {filtered.length === 0 && (
            <div className="itboard__empty">
              No members match "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
