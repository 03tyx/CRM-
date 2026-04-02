// ITBoard.jsx
// import { useState, useMemo, useEffect } from 'react'
// import { IT_MEMBERS, IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES, today, computeStatus, STATUS_COLOR, STATUS_BG } from './helpers'
// import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
// import { useScrum } from './useScrum'
// import { useITEntries } from './useITEntries'
// import TaskForm from './TaskForm'
 
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────
 
// function addWorkdaysSimple(dateStr, n) {
//   // move forward/backward by n workdays (Mon–Fri only)
//   if (!dateStr) return ''
//   const d = new Date(dateStr)
//   const step = n >= 0 ? 1 : -1
//   let remaining = Math.abs(n)
//   while (remaining > 0) {
//     d.setDate(d.getDate() + step)
//     const day = d.getDay()
//     if (day !== 0 && day !== 6) remaining--
//   }
//   return d.toISOString().split('T')[0]
// }
 
// function fmtDate(dateStr) {
//   if (!dateStr) return ''
//   return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
// }
 
// function Badge({ label, color, bg }) {
//   return (
//     <span style={{
//       background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
//       border: `1px solid ${color || '#334155'}40`, borderRadius: 6,
//       padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
//     }}>{label}</span>
//   )
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Daily Scrum section (per IT member)
// // ─────────────────────────────────────────────────────────────────────────────
 
// // function ScrumSection({ itName }) {
// //   const { entries, loading, saving, saveEntry, deleteEntry } = useScrum(itName)
// //   const [showForm, setShowForm] = useState(false)
// //   const [editing,  setEditing]  = useState(null)   // entry id being edited
  
 
// //   // Build a blank new entry — auto-populate dates from the latest entry
// //   function newDraft() {
// //     const latest = entries[0]
// //     const scrumDate = today
 
// //     // Auto-populate "Previous Working Day" from latest entry's "Today" text
// //     const prevDay = latest?.today || ''
// //     return {
// //       id:         null,
// //       scrum_date: scrumDate,
// //       prev_day:   prevDay,
// //       today:      '',
// //       next_day:   '',
// //     }
// //   }
 
// //   const [draft, setDraft] = useState(null)
 
// //   function openNew() {
// //     setDraft(newDraft())
// //     setEditing(null)
// //     setShowForm(true)
// //   }
 
// //   function openEdit(entry) {
// //     setDraft({ ...entry })
// //     setEditing(entry.id)
// //     setShowForm(true)
// //   }
 
// //   function setField(k, v) {
// //     setDraft(d => ({ ...d, [k]: v }))
// //   }
 
// //   async function handleSubmit() {
// //     if (!draft) return
// //     const res = await saveEntry(draft)
// //     if (res.success) {
// //       setShowForm(false)
// //       setDraft(null)
// //       setEditing(null)
// //     } else {
// //       alert('Failed to save: ' + res.error)
// //     }
// //   }
 
// //   function handleCancel() {
// //     setShowForm(false)
// //     setDraft(null)
// //     setEditing(null)
// //   }
 
// //   const ta = (extra = {}) => ({
// //     style: {
// //       background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
// //       color: '#e2e8f0', padding: '8px 10px', fontSize: 12, width: '100%',
// //       outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'inherit',
// //       ...extra.style,
// //     }, ...extra,
// //   })
 
// //   const inp = {
// //     style: {
// //       background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
// //       color: '#e2e8f0', padding: '7px 10px', fontSize: 12, width: '100%', outline: 'none',
// //     }
// //   }
 
// //   return (
// //     <div>
// //       {/* Header */}
// //       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
// //         <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
// //           📋 Daily Scrum
// //         </span>
// //         {!showForm && (
// //           <button onClick={openNew} style={{
// //             background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
// //             borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
// //           }}>+ New Entry</button>
// //         )}
// //       </div>
 
// //       {/* Form */}
// //       {showForm && draft && (
// //         <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid #334155' }}>
// //           <div style={{ marginBottom: 8 }}>
// //             <label style={{ ...lbl, fontSize: 10 }}>Scrum Date</label>
// //             <input {...inp} type="date" value={draft.scrum_date}
// //               onChange={e => setField('scrum_date', e.target.value)} />
// //           </div>
// //           <div style={{ marginBottom: 8 }}>
// //             <label style={{ ...lbl, fontSize: 10 }}>Previous Working Day</label>
// //             <textarea {...ta()} value={draft.prev_day}
// //               placeholder="What was done previously…"
// //               onChange={e => setField('prev_day', e.target.value)} />
// //           </div>
// //           <div style={{ marginBottom: 8 }}>
// //             <label style={{ ...lbl, fontSize: 10 }}>Today</label>
// //             <textarea {...ta()} value={draft.today}
// //               placeholder="What will be done today…"
// //               onChange={e => setField('today', e.target.value)} />
// //           </div>
// //           <div style={{ marginBottom: 12 }}>
// //             <label style={{ ...lbl, fontSize: 10 }}>Next Working Day</label>
// //             <textarea {...ta()} value={draft.next_day}
// //               placeholder="What is planned for next working day…"
// //               onChange={e => setField('next_day', e.target.value)} />
// //           </div>
// //           <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
// //             <button onClick={handleCancel} style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }}>Cancel</button>
// //             <button onClick={handleSubmit} disabled={saving}
// //               style={{ ...btnPrimary, padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
// //               {saving ? '⏳ Saving…' : editing ? 'Update' : 'Save Entry'}
// //             </button>
// //           </div>
// //         </div>
// //       )}
 
// //       {/* Entry list */}
// //       {loading ? (
// //         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>Loading…</div>
// //       ) : entries.length === 0 && !showForm ? (
// //         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No scrum entries yet.</div>
// //       ) : (
// //         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //           {entries.map(entry => (
// //             <div key={entry.id} style={{
// //               background: '#0f172a', borderRadius: 8, padding: 12,
// //               border: '1px solid #1e293b', fontSize: 12,
// //             }}>
// //               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
// //                 <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>
// //                   {fmtDate(entry.scrum_date)}
// //                 </span>
// //                 <div style={{ display: 'flex', gap: 6 }}>
// //                   <button onClick={() => openEdit(entry)} style={{
// //                     background: 'none', border: '1px solid #334155', borderRadius: 5,
// //                     color: '#64748b', padding: '2px 8px', fontSize: 10, cursor: 'pointer',
// //                   }}>✏️ Edit</button>
// //                   <button onClick={() => { if (confirm('Delete this entry?')) deleteEntry(entry.id) }} style={{
// //                     background: 'none', border: 'none',
// //                     color: '#ef4444', padding: '2px 6px', fontSize: 12, cursor: 'pointer',
// //                   }}>🗑</button>
// //                 </div>
// //               </div>
// //               {[
// //                 { label: 'Previous Working Day', value: entry.prev_day },
// //                 { label: 'Today',                value: entry.today    },
// //                 { label: 'Next Working Day',     value: entry.next_day },
// //               ].map(({ label, value }) => value ? (
// //                 <div key={label} style={{ marginBottom: 6 }}>
// //                   <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
// //                     letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
// //                   <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{value}</div>
// //                 </div>
// //               ) : null)}
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   )
// // }
 
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
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//         <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//           🗂 Tasks ({myTasks.length})
//         </span>
//         {!showForm && (
//           <button onClick={() => { setEditing(null); setShowForm(true) }} style={{
//             background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
//             borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
//           }}>+ Add Task</button>
//         )}
//       </div>
 
//       {/* Task form */}
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
 
//       {/* Task list */}
//       {myTasks.length === 0 && !showForm ? (
//         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No tasks yet.</div>
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {myTasks.map(task => {
//             const status  = computeStatus({ ...task, start_date: task.startDate, end_date: task.endDate })
//             // const mySubs  = subtasks.filter(s => s.task_id === task.id)
//             return (
//               <div key={task.id} style={{
//                 background: '#0f172a', borderRadius: 8, padding: '10px 12px',
//                 border: '1px solid #1e293b', fontSize: 12,
//               }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13, marginBottom: 4,
//                       whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                       {task.project}
//                     </div>
//                     <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
//                       <Badge label={status} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />
//                       {task.priority === 'High' && <Badge label="High" color="#ef4444" bg="rgba(239,68,68,0.1)" />}
//                       {task.targetLive && (
//                         <span style={{ color: '#64748b', fontSize: 10 }}>🎯 Live: {fmtDate(task.targetLive)}</span>
//                       )}
//                       {task.manday && (
//                         <span style={{ color: '#64748b', fontSize: 10 }}>⏱ {task.manday} MD</span>
//                       )}
//                     </div>
//                     {/* Progress bar */}
//                     <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
//                       <div style={{ flex: 1, background: '#1e293b', borderRadius: 99, height: 4, overflow: 'hidden' }}>
//                         <div style={{
//                           width: `${task.progress || 0}%`, height: '100%', borderRadius: 99,
//                           background: task.progress === 100 ? '#22c55e' : task.progress > 60 ? '#3b82f6' : '#f59e0b',
//                           transition: 'width 0.3s',
//                         }} />
//                       </div>
//                       <span style={{ color: '#475569', fontSize: 10, whiteSpace: 'nowrap' }}>{task.progress || 0}%</span>
//                     </div>
//                   </div>
//                   <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
//                     <button onClick={() => { setEditing(task); setShowForm(true) }} style={{
//                       background: 'none', border: '1px solid #334155', borderRadius: 5,
//                       color: '#64748b', padding: '2px 7px', fontSize: 10, cursor: 'pointer',
//                     }}>✏️</button>
//                     <button onClick={() => { if (confirm('Delete task?')) deleteTask(task.id) }} style={{
//                       background: 'none', border: 'none',
//                       color: '#ef4444', padding: '2px 5px', fontSize: 11, cursor: 'pointer',
//                     }}>🗑</button>
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
// // Shared table styles (same as DeploymentBoard)
// // ─────────────────────────────────────────────────────────────────────────────
// const cellPad  = { padding: '6px 8px', verticalAlign: 'top' }
// const smallInp = { ...inpStyle, padding: '5px 8px', fontSize: 11 }
// const spanTd   = { ...cellPad, background: '#131e2e', borderRight: '1px solid #1e293b' }
// const uid      = () => Math.random().toString(36).slice(2)
 
// function emptyDetail() {
//   return { id: uid(), remark: '', discovery: '', testingRequired: true, md: '', pic: '', liveDate: today }
// }
// function emptyRow() {
//   return { id: uid(), task: { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' }, details: [emptyDetail()] }
// }
 
// // ── Exact same TaskCell as DeploymentBoard ────────────────────────────────────
// function TaskCell({ value, onChange }) {
//   const [mode,        setMode]        = useState('manual')
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
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
//       <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
//         {['manual', 'feedbacklog'].map(m => (
//           <button key={m} onClick={() => setMode(m)} style={{
//             background: mode === m ? 'rgba(59,130,246,0.25)' : 'rgba(100,116,139,0.1)',
//             border: `1px solid ${mode === m ? '#3b82f6' : '#334155'}`,
//             borderRadius: 5, color: mode === m ? '#93c5fd' : '#64748b',
//             fontSize: 10, padding: '2px 7px', cursor: 'pointer', fontWeight: 600,
//           }}>{m === 'manual' ? 'Manual' : 'Feedback Log'}</button>
//         ))}
//       </div>
//       {mode === 'manual' && (
//         <input value={value.manual || ''} onChange={e => onChange({ ...value, manual: e.target.value })}
//           placeholder="Type task name…" style={smallInp} />
//       )}
//       {mode === 'feedbacklog' && (
//         <>
//           <select value={value.feedbackLogId || ''} onChange={e => handleFLSelect(e.target.value)} style={smallInp}>
//             <option value="">Select Feedback Log…</option>
//             {FEEDBACK_LOGS.map(fl => <option key={fl.id} value={fl.id}>{fl.label}</option>)}
//             <option value="__custom__">— Enter manually —</option>
//           </select>
//           {value.feedbackLogId === '__custom__' && (
//             <>
//               <input value={customLabel}
//                 onChange={e => { setCustomLabel(e.target.value); onChange({ ...value, feedbackLogLabel: e.target.value }) }}
//                 placeholder="Display text for hyperlink…" style={{ ...smallInp, marginTop: 2 }} />
//               <input value={customUrl}
//                 onChange={e => { setCustomUrl(e.target.value); onChange({ ...value, feedbackLogUrl: e.target.value }) }}
//                 placeholder="https://docs.google.com/…" style={{ ...smallInp, marginTop: 2 }} />
//             </>
//           )}
//           {value.feedbackLogId && value.feedbackLogId !== '__custom__' && value.feedbackLogUrl && (
//             <a href={value.feedbackLogUrl} target="_blank" rel="noopener noreferrer"
//               style={{ fontSize: 10, color: '#3b82f6', textDecoration: 'underline', marginTop: 2 }}>
//               🔗 Open in Google Docs
//             </a>
//           )}
//         </>
//       )}
//     </div>
//   )
// }
 
// // ─────────────────────────────────────────────────────────────────────────────
// // Deployment section per IT member — exact same table as DeploymentBoard
// // IT can add/edit/delete their own rows only. Cannot delete the deployment.
// // ─────────────────────────────────────────────────────────────────────────────
// function ITDeploymentSection({ itName, deployments = [], entries, getRows, saveRows, syncToMainDeployment,isSaving }) {
 
//   const TH = (label, extra = {}) => (
//     <th style={{
//       padding: '8px 8px', textAlign: 'left', color: '#475569', fontSize: 10,
//       fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
//       background: '#0f172a', ...extra,
//     }}>{label}</th>
//   )
 
//   // Local state per deployment: rows + save status
//   const [localRows,  setLocalRows]  = useState({})  // depId → Row[]
//   const [justSaved,  setJustSaved]  = useState({})  // depId → bool
 
//   // Hydrate from entries — runs whenever entries or deployments change.
//   // Only overwrites a deployment's local rows if the user hasn't made local edits
//   // (tracked via the 'dirty' set).
//   const [dirty, setDirty] = useState(new Set())
 
//   useEffect(() => {
//     setLocalRows(current => {
//       const next = { ...current }
//       deployments.forEach(dep => {
//         const key = String(dep.id)
//         if (dirty.has(key)) return  // user is editing — don't overwrite
//         const entry = entries.find(
//           e => String(e.deployment_id) === key && e.it_name === itName
//         )
//         if (entry?.rows) {
//           next[dep.id] = entry.rows
//         }
//       })
//       return next
//     })
//   }, [entries, deployments, itName])  // deliberately excludes dirty so it doesn't loop
 
//   const getDepRows   = (depId) => localRows[depId] || []
//   const setDepRows   = (depId, updater) => {
//     setDirty(d => new Set(d).add(String(depId)))  // mark as user-edited
//     setLocalRows(r => ({ ...r, [depId]: typeof updater === 'function' ? updater(r[depId] || []) : updater }))
//   }
 
//   const addRow       = (depId) => setDepRows(depId, rows => [...rows, emptyRow()])
//   // const patchRowTask = (depId, rowId, task) =>
//   //   setDepRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, task } : r))
//   const patchRowTask = (depId, rowId, taskPatch) => {
//     setDirty(d => new Set(d).add(String(depId)));
//     setLocalRows(prev => {
//       const rows = prev[depId] || [];
//       return {
//         ...prev,
//         [depId]: rows.map(r => 
//           r.id === rowId ? { ...r, task: taskPatch } : r
//         )
//       };
//     });
//   };
//   const addDetail    = (depId, rowId) =>
//     setDepRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, details: [...r.details, emptyDetail()] } : r))
//   const removeDetail = (depId, rowId, detailId) =>
//     setDepRows(depId, rows => rows.flatMap(r => {
//       if (r.id !== rowId) return [r]
//       const next = r.details.filter(d => d.id !== detailId)
//       return next.length === 0 ? [] : [{ ...r, details: next }]
//     }))
//   // const patchDetail  = (depId, rowId, detailId, patch) =>
//   //   setDepRows(depId, rows => rows.map(r => r.id !== rowId ? r : {
//   //     ...r, details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d),
//   //   }))
//   const patchDetail = (depId, rowId, detailId, patch) => {
//     setDirty(d => new Set(d).add(String(depId)));
//     setLocalRows(prev => {
//       const rows = prev[depId] || [];
//       return {
//         ...prev,
//         [depId]: rows.map(r => 
//           r.id !== rowId ? r : {
//             ...r,
//             details: r.details.map(d => 
//               d.id === detailId ? { ...d, ...patch } : d // Removed forced itName
//             ),
//           }
//         )
//       };
//     });
//   };
 
//   // async function handleSave(depId) {
//   //   const rows = getDepRows(depId)
//   //   const res  = await saveRows(depId, itName, rows)
//   //   if (res.success) {
//   //     setJustSaved(s => ({ ...s, [depId]: true }))
//   //     setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
//   //   } else {
//   //     alert('Save failed: ' + res.error)
//   //   }
//   // }
 
//   async function handleSave(depId) {
//     const rows = getDepRows(depId)
 
//     // Save only to it_deployment_entries — DeploymentBoard reads this separately
//     const res = await saveRows(depId, itName, rows)
 
//     if (res.success) {
//         // 2. Sync to main Deployment Board
//         const mainDep = deployments.find(d => d.id === depId)

//         if (mainDep && syncToMainDeployment) {
//           const otherRows = (mainDep.rows || []).filter(row =>
//             !row.details.some(d => d.pic === itName)
//           )

//           // const updatedRows = [...otherRows, ...rows]
//           function normalizeRows(rows, itName) {
//             return rows.map(r => ({
//               ...r,
//               details: r.details.map(d => ({
//                 ...d,
//                 pic: d.pic || itName // ensure PIC always exists
//               }))
//             }))
//           }

//           const updatedRows = [
//             ...otherRows,
//             ...normalizeRows(rows, itName)
//           ]

//           await syncToMainDeployment(depId, updatedRows)
//         }

//         setJustSaved(s => ({ ...s, [depId]: true }))
//         setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)

//       } else {
//         alert('Save failed: ' + res.error)
//       }

 
// // 2. Sync to the main Deployment Board record for Word Export
//   // const mainDep = deployments.find(d => String(d.id) === String(depId));
  
//   // if (mainDep && typeof syncToMainDeployment === 'function') {
//   //   const existingMainRows = Array.isArray(mainDep.rows) ? mainDep.rows : [];
    
//   //   // Filter logic:
//   //   // We remove any rows in the main deployment that were originally created 
//   //   // by this IT member (matching row.id) to avoid duplicates.
//   //   const otherMemberRows = existingMainRows.filter(mainRow => 
//   //     !rows.some(localRow => localRow.id === mainRow.id)
//   //   );

//   //   // Merge: Others' tasks + This member's updated tasks
//   //   const mergedRows = [...otherMemberRows, ...rows];

//   //   // This updates the 'deployments' table, which DeploymentBoard.jsx 
//   //   // uses to generate the Word Document.
//   //   await syncToMainDeployment(depId, mergedRows);
//   // }

//   // // UI feedback
//   // setDirty(d => { const next = new Set(d); next.delete(String(depId)); return next; });
//   // setJustSaved(s => ({ ...s, [depId]: true }));
//   // setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000);
// }
 
//   if (deployments.length === 0) {
//     return <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
//   }
 
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//       {deployments.map(dep => {
//         const rows = getDepRows(dep.id)
//         return (
//           <div key={dep.id} style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', overflow: 'hidden' }}>
 
//             {/* Deployment header */}
//             <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//               borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: 8 }}>
//               <div>
//                 <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
//                   {dep.title || dep.deploy_date}
//                 </span>
//                 <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>
//                   📅 {dep.deploy_date}
//                 </span>
//               </div>
//               {/* Save button — no delete deployment */}
//               <button
//                 onClick={() => handleSave(dep.id)}
//                 disabled={isSaving}
//                 style={{
//                   background: justSaved[dep.id] ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
//                   border: `1px solid ${justSaved[dep.id] ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
//                   borderRadius: 8, color: justSaved[dep.id] ? '#22c55e' : '#3b82f6',
//                   padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
//                 }}>
//                 {isSaving ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
//               </button>
//             </div>
 
//             {/* Exact same table as DeploymentBoard */}
//             <div style={{ padding: 14 }}>
//               {rows.length > 0 && (
//                 <div style={{ overflowX: 'auto', marginBottom: 14 }}>
//                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                     <thead>
//                       <tr>
//                         {TH('#',                { width: 32,  textAlign: 'center' })}
//                         {TH('Task',             { minWidth: 200 })}
//                         {TH('Remarks from ASP', { minWidth: 200 })}
//                         {TH('Self-Disc / Bug',  { minWidth: 130 })}
//                         {TH('Testing?',         { minWidth: 80, textAlign: 'center' })}
//                         {TH('MD',               { minWidth: 70 })}
//                         {TH('PIC',              { minWidth: 130 })}
//                         {TH('LIVE on',          { minWidth: 130 })}
//                         {TH('',                 { width: 60 })}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {rows.map((row, rowIdx) => {
//                         const span = row.details.length
//                         return row.details.map((d, di) => {
//                           const isSelfDisc   = d.discovery === 'self-discovered'
//                           const isLastDetail = di === span - 1
//                           return (
//                             <tr key={d.id} style={{ borderBottom: isLastDetail ? '2px solid #0f172a' : '1px dashed #293548' }}>
 
//                               {di === 0 && (
//                                 <td rowSpan={span} style={{ ...spanTd, textAlign: 'center', width: 32,
//                                   color: '#94a3b8', fontWeight: 700, fontSize: 13, verticalAlign: 'middle' }}>
//                                   {rowIdx + 1}
//                                 </td>
//                               )}
 
//                               {di === 0 && (
//                                 <td rowSpan={span} style={{ ...spanTd, minWidth: 200, verticalAlign: 'top' }}>
//                                   <TaskCell value={row.task} onChange={task => patchRowTask(dep.id, row.id, task)} />
//                                   <button onClick={() => addDetail(dep.id, row.id)} style={{
//                                     marginTop: 10, display: 'block', background: 'none',
//                                     border: '1px dashed #334155', borderRadius: 5, color: '#475569',
//                                     fontSize: 10, padding: '2px 10px', cursor: 'pointer',
//                                   }}>+ add row</button>
//                                 </td>
//                               )}
 
//                               {/* REMARKS FROM ASP */}
//                               <td style={{ ...cellPad, minWidth: 200 }}>
//                                 <input value={d.remark}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })}
//                                   placeholder="Remark…" style={{ ...smallInp, width: '100%' }} />
//                                 {!d.testingRequired && (
//                                   <div style={{ fontSize: 10, color: '#ef4444', fontStyle: 'italic', marginTop: 3 }}>
//                                     no testing required
//                                   </div>
//                                 )}
//                               </td>
 
//                               {/* SELF-DISC / BUG */}
//                               <td style={{ ...cellPad, minWidth: 130 }}>
//                                 <select value={d.discovery}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}
//                                   style={smallInp}>
//                                   {DISCOVERY_TYPES.map(dt => (
//                                     <option key={dt.value} value={dt.value}>{dt.label}</option>
//                                   ))}
//                                 </select>
//                               </td>
 
//                               {/* TESTING REQUIRED */}
//                               <td style={{ ...cellPad, minWidth: 80, textAlign: 'center' }}>
//                                 <button onClick={() => patchDetail(dep.id, row.id, d.id, { testingRequired: !d.testingRequired })}
//                                   style={{
//                                     background: d.testingRequired ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
//                                     border: `1px solid ${d.testingRequired ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
//                                     borderRadius: 6, color: d.testingRequired ? '#22c55e' : '#ef4444',
//                                     padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700,
//                                   }}>
//                                   {d.testingRequired ? 'Yes' : 'No'}
//                                 </button>
//                               </td>
 
//                               {/* MD */}
//                               <td style={{ ...cellPad, minWidth: 70 }}>
//                                 <input type="number" min="0" step="0.01" value={d.md}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })}
//                                   placeholder="3.25" style={{ ...smallInp, width: 64 }} />
//                               </td>
 
//                               {/* PIC — greyed out if self-discovered */}
//                               <td style={{ ...cellPad, minWidth: 130 }}>
//                                 <select value={d.pic}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { pic: e.target.value })}
//                                   disabled={isSelfDisc}
//                                   style={{ ...smallInp, opacity: isSelfDisc ? 0.35 : 1, cursor: isSelfDisc ? 'not-allowed' : 'auto' }}>
//                                   <option value="">Select…</option>
//                                   {IFA_MEMBERS.map(m => <option key={m}>{m}</option>)}
//                                 </select>
//                                 {isSelfDisc && (
//                                   <div style={{ fontSize: 10, color: '#475569', marginTop: 2, fontStyle: 'italic' }}>
//                                     N/A (self-disc.)
//                                   </div>
//                                 )}
//                               </td>
 
//                               {/* DEPLOYING LIVE ON */}
//                               <td style={{ ...cellPad, minWidth: 130 }}>
//                                 <input type="date" value={d.liveDate || today}
//                                   onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })}
//                                   style={{ ...smallInp, width: 130 }} />
//                               </td>
 
//                               {/* REMOVE */}
//                               <td style={{ ...cellPad, width: 60, textAlign: 'center' }}>
//                                 <button onClick={() => removeDetail(dep.id, row.id, d.id)}
//                                   title={span === 1 ? 'Remove task' : 'Remove this row'}
//                                   style={{
//                                     background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6,
//                                     color: '#ef4444', padding: '4px 8px', fontSize: 12, cursor: 'pointer',
//                                   }}>
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
//                 <div style={{ color: '#475569', fontSize: 12, padding: '6px 0 10px' }}>
//                   No tasks yet. Click <strong style={{ color: '#3b82f6' }}>+ Add Task</strong> to add one.
//                 </div>
//               )}
 
//               <button onClick={() => addRow(dep.id)} style={{
//                 background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
//                 borderRadius: 8, color: '#3b82f6', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
//               }}>+ Add Task</button>
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
//   const [expanded, setExpanded]   = useState(false)
//   const [activeTab, setActiveTab] = useState('scrum')
 
 
//   const myTaskCount  = tasks.filter(t => t.itName === itName).length
//   const myEntryCount = itEntries.filter(e => e.it_name === itName && (e.rows?.length || 0) > 0).length
 
//   const tabs = [
//     // { id: 'scrum',       label: '📋 Scrum'                          },
//     { id: 'tasks',       label: `🗂 Tasks (${myTaskCount})`          },
//     { id: 'deployments', label: `🚀 Deployments (${myEntryCount})`  },
//   ]
 
//   return (
//     <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
//       <div onClick={() => setExpanded(e => !e)} style={{
//         padding: '14px 20px', display: 'flex', alignItems: 'center',
//         gap: 12, cursor: 'pointer', userSelect: 'none',
//       }}>
//         <div style={{
//           width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
//           background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           color: '#fff', fontWeight: 700, fontSize: 14,
//         }}>
//           {itName.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase()}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{itName}</div>
//           <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
//             {myTaskCount} task{myTaskCount !== 1 ? 's' : ''}
//             &nbsp;·&nbsp;
//             {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
//           </div>
//         </div>
//         <span style={{ color: '#475569', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
//       </div>
 
//       {expanded && (
//         <div style={{ borderTop: '1px solid #0f172a' }}>
//           <div style={{ display: 'flex', background: '#0f172a', padding: '0 16px', gap: 4 }}>
//             {tabs.map(tab => (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
//                 background: 'none', border: 'none',
//                 borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
//                 color: activeTab === tab.id ? '#3b82f6' : '#475569',
//                 padding: '10px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
//               }}>{tab.label}</button>
//             ))}
//           </div>
//           <div style={{ padding: 20 }}>
//             {/* {activeTab === 'scrum' && <ScrumSection itName={itName} />} */}
//             {activeTab === 'tasks' && (
//               <TasksSection itName={itName} tasks={tasks}
//                 createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} saving={saving} />
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
 
//   const filtered = IT_MEMBERS.filter(name =>
//     name.toLowerCase().includes(search.toLowerCase())
//   )
 
//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
//         <div>
//           <h2 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }}>
//             👤 IT Board
//           </h2>
//           <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
//             Per-member tasks and depoyment items.
//           </p>
//         </div>
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member…"
//           style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
//             color: '#e2e8f0', padding: '7px 12px', fontSize: 13, outline: 'none', width: 200 }} />
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
//           <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 13 }}>
//             No members match "{search}"
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
 
// function ITDeploymentCard({ dep, itName, itEntries, addEntry, updateEntry, deleteEntry, saving}) {
//   const myEntries = itEntries.filter(e => e.deployment_id === dep.id && e.it_name === itName)
//   const [showForm, setShowForm] = useState(false)
//   const [draft,    setDraft]    = useState(null)
 
//   const smallInp = {
//     style: {
//       background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
//       color: '#e2e8f0', padding: '6px 8px', fontSize: 12, width: '100%',
//       outline: 'none',
//     }
//   }
//   const smallTa = {
//     style: {
//       background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
//       color: '#e2e8f0', padding: '6px 8px', fontSize: 12, width: '100%',
//       outline: 'none', resize: 'vertical', minHeight: 56, fontFamily: 'inherit',
//     }
//   }
 
//   function openAdd() {
//     setDraft(emptyEntryDraft(dep.id, itName, dep.deploy_date))
//     setShowForm(true)
//   }
 
//   function openEdit(entry) {
//     setDraft({
//       id:           entry.id,
//       deploymentId: entry.deployment_id,
//       itName:       entry.it_name,
//       taskLabel:    entry.task_label,
//       remark:       entry.remark,
//       liveDate:     entry.live_date || dep.deploy_date,
//     })
//     setShowForm(true)
//   }
 
//   function setField(k, v) { setDraft(d => ({ ...d, [k]: v })) }
 
//   async function handleSubmit() {
//     if (!draft) return
//     let res
//     if (draft.id) {
//       res = await updateEntry(draft.id, { taskLabel: draft.taskLabel, remark: draft.remark, liveDate: draft.liveDate })
//     } else {
//       res = await addEntry({ deploymentId: draft.deploymentId, itName: draft.itName, taskLabel: draft.taskLabel, remark: draft.remark, liveDate: draft.liveDate })
//     }
//     if (res.success) { setShowForm(false); setDraft(null) }
//     else alert('Save failed: ' + res.error)
//   }
 
//   return (
//     <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10, overflow: 'hidden' }}>
//       {/* Deployment header — read only, no delete */}
//       <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         borderBottom: '1px solid #1e293b' }}>
//         <div>
//           <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
//             {dep.title || dep.deploy_date}
//           </span>
//           <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>
//             📅 {fmtDate(dep.deploy_date)}
//           </span>
//         </div>
//         <button onClick={openAdd} style={{
//           background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
//           borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
//         }}>+ Add Remark</button>
//       </div>
 
//       {/* Entry form */}
//       {showForm && draft && (
//         <div style={{ padding: 12, borderBottom: '1px solid #1e293b', background: '#131e2e' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
//             <div>
//               <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//                 letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Task / Item</label>
//               <input {...smallInp} value={draft.taskLabel}
//                 placeholder="e.g. Fix payment bug"
//                 onChange={e => setField('taskLabel', e.target.value)} />
//             </div>
//             <div>
//               <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//                 letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Deploying LIVE on</label>
//               <input {...smallInp} type="date" value={draft.liveDate || ''}
//                 onChange={e => setField('liveDate', e.target.value)} />
//             </div>
//           </div>
//           <div style={{ marginBottom: 10 }}>
//             <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//               letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Remark</label>
//             <textarea {...smallTa} value={draft.remark}
//               placeholder="Describe what was done…"
//               onChange={e => setField('remark', e.target.value)} />
//           </div>
//           <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
//             <button onClick={() => { setShowForm(false); setDraft(null) }}
//               style={{ ...btnGhost, padding: '5px 12px', fontSize: 12 }}>Cancel</button>
//             <button onClick={handleSubmit} disabled={saving}
//               style={{ ...btnPrimary, padding: '5px 12px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
//               {saving ? '⏳ Saving…' : draft.id ? 'Update' : 'Add'}
//             </button>
//           </div>
//         </div>
//       )}
 
//       {/* My entries */}
//       {myEntries.length === 0 && !showForm ? (
//         <div style={{ color: '#334155', fontSize: 12, padding: '10px 14px', fontStyle: 'italic' }}>
//           No remarks added yet.
//         </div>
//       ) : (
//         <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
//           {myEntries.map(entry => (
//             <div key={entry.id} style={{
//               background: '#1e293b', borderRadius: 8, padding: '8px 12px',
//               border: '1px solid #334155', fontSize: 12,
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   {entry.task_label && (
//                     <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 3 }}>{entry.task_label}</div>
//                   )}
//                   {entry.remark && (
//                     <div style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{entry.remark}</div>
//                   )}
//                   {entry.live_date && (
//                     <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
//                       🎯 {fmtDate(entry.live_date)}
//                     </div>
//                   )}
//                 </div>
//                 <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
//                   <button onClick={() => openEdit(entry)} style={{
//                     background: 'none', border: '1px solid #334155', borderRadius: 5,
//                     color: '#64748b', padding: '2px 7px', fontSize: 10, cursor: 'pointer',
//                   }}>✏️</button>
//                   <button onClick={() => { if (confirm('Delete this remark?')) deleteEntry(entry.id) }} style={{
//                     background: 'none', border: 'none',
//                     color: '#ef4444', padding: '2px 5px', fontSize: 11, cursor: 'pointer',
//                   }}>🗑</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
 
// function DeploymentSection({ itName, deployments = [], itEntries = [], addEntry, updateEntry, deleteEntry, saving }) {
//   return (
//     <div>
//       <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
//         letterSpacing: '0.06em', marginBottom: 12 }}>
//         🚀 Deployments ({deployments.length})
//       </div>
//       {deployments.length === 0 ? (
//         <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
//       ) : (
//         deployments.map(dep => (
//           <ITDeploymentCard
//             key={dep.id}
//             dep={dep}
//             itName={itName}
//             itEntries={itEntries}
//             getRows={getRows}
//             saveRows={saveRows}
//             addEntry={addEntry}
//             updateEntry={updateEntry}
//             deleteEntry={deleteEntry}
//             saving={saving}
//           />
//         ))
//       )}
//     </div>
//   )
// }

// ITBoard.jsx
import { useState, useMemo, useEffect } from 'react'
import { IT_MEMBERS, IFA_MEMBERS, FEEDBACK_LOGS, DISCOVERY_TYPES, today, computeStatus, STATUS_COLOR, STATUS_BG } from './helpers'
import { lbl, inpStyle, btnPrimary, btnGhost } from './ui'
import { useScrum } from './useScrum'
import { useAnnualLeave } from './useAnnualLeave'
import { useITEntries } from './useITEntries'
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
 
// function ScrumSection({ itName }) {
//   const { entries, loading, saving, saveEntry, deleteEntry } = useScrum(itName)
//   const [showForm, setShowForm] = useState(false)
//   const [editing,  setEditing]  = useState(null)   // entry id being edited
  
 
//   // Build a blank new entry — auto-populate dates from the latest entry
//   function newDraft() {
//     const latest = entries[0]
//     const scrumDate = today
 
//     // Auto-populate "Previous Working Day" from latest entry's "Today" text
//     const prevDay = latest?.today || ''
//     return {
//       id:         null,
//       scrum_date: scrumDate,
//       prev_day:   prevDay,
//       today:      '',
//       next_day:   '',
//     }
//   }
 
//   const [draft, setDraft] = useState(null)
 
//   function openNew() {
//     setDraft(newDraft())
//     setEditing(null)
//     setShowForm(true)
//   }
 
//   function openEdit(entry) {
//     setDraft({ ...entry })
//     setEditing(entry.id)
//     setShowForm(true)
//   }
 
//   function setField(k, v) {
//     setDraft(d => ({ ...d, [k]: v }))
//   }
 
//   async function handleSubmit() {
//     if (!draft) return
//     const res = await saveEntry(draft)
//     if (res.success) {
//       setShowForm(false)
//       setDraft(null)
//       setEditing(null)
//     } else {
//       alert('Failed to save: ' + res.error)
//     }
//   }
 
//   function handleCancel() {
//     setShowForm(false)
//     setDraft(null)
//     setEditing(null)
//   }
 
//   const ta = (extra = {}) => ({
//     style: {
//       background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
//       color: '#e2e8f0', padding: '8px 10px', fontSize: 12, width: '100%',
//       outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'inherit',
//       ...extra.style,
//     }, ...extra,
//   })
 
//   const inp = {
//     style: {
//       background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
//       color: '#e2e8f0', padding: '7px 10px', fontSize: 12, width: '100%', outline: 'none',
//     }
//   }
 
//   return (
//     <div>
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
//         <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//           📋 Daily Scrum
//         </span>
//         {!showForm && (
//           <button onClick={openNew} style={{
//             background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
//             borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
//           }}>+ New Entry</button>
//         )}
//       </div>
 
//       {/* Form */}
//       {showForm && draft && (
//         <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid #334155' }}>
//           <div style={{ marginBottom: 8 }}>
//             <label style={{ ...lbl, fontSize: 10 }}>Scrum Date</label>
//             <input {...inp} type="date" value={draft.scrum_date}
//               onChange={e => setField('scrum_date', e.target.value)} />
//           </div>
//           <div style={{ marginBottom: 8 }}>
//             <label style={{ ...lbl, fontSize: 10 }}>Previous Working Day</label>
//             <textarea {...ta()} value={draft.prev_day}
//               placeholder="What was done previously…"
//               onChange={e => setField('prev_day', e.target.value)} />
//           </div>
//           <div style={{ marginBottom: 8 }}>
//             <label style={{ ...lbl, fontSize: 10 }}>Today</label>
//             <textarea {...ta()} value={draft.today}
//               placeholder="What will be done today…"
//               onChange={e => setField('today', e.target.value)} />
//           </div>
//           <div style={{ marginBottom: 12 }}>
//             <label style={{ ...lbl, fontSize: 10 }}>Next Working Day</label>
//             <textarea {...ta()} value={draft.next_day}
//               placeholder="What is planned for next working day…"
//               onChange={e => setField('next_day', e.target.value)} />
//           </div>
//           <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
//             <button onClick={handleCancel} style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }}>Cancel</button>
//             <button onClick={handleSubmit} disabled={saving}
//               style={{ ...btnPrimary, padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
//               {saving ? '⏳ Saving…' : editing ? 'Update' : 'Save Entry'}
//             </button>
//           </div>
//         </div>
//       )}
 
//       {/* Entry list */}
//       {loading ? (
//         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>Loading…</div>
//       ) : entries.length === 0 && !showForm ? (
//         <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>No scrum entries yet.</div>
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//           {entries.map(entry => (
//             <div key={entry.id} style={{
//               background: '#0f172a', borderRadius: 8, padding: 12,
//               border: '1px solid #1e293b', fontSize: 12,
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
//                 <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11 }}>
//                   {fmtDate(entry.scrum_date)}
//                 </span>
//                 <div style={{ display: 'flex', gap: 6 }}>
//                   <button onClick={() => openEdit(entry)} style={{
//                     background: 'none', border: '1px solid #334155', borderRadius: 5,
//                     color: '#64748b', padding: '2px 8px', fontSize: 10, cursor: 'pointer',
//                   }}>✏️ Edit</button>
//                   <button onClick={() => { if (confirm('Delete this entry?')) deleteEntry(entry.id) }} style={{
//                     background: 'none', border: 'none',
//                     color: '#ef4444', padding: '2px 6px', fontSize: 12, cursor: 'pointer',
//                   }}>🗑</button>
//                 </div>
//               </div>
//               {[
//                 { label: 'Previous Working Day', value: entry.prev_day },
//                 { label: 'Today',                value: entry.today    },
//                 { label: 'Next Working Day',     value: entry.next_day },
//               ].map(({ label, value }) => value ? (
//                 <div key={label} style={{ marginBottom: 6 }}>
//                   <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
//                     letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
//                   <div style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{value}</div>
//                 </div>
//               ) : null)}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
 
// ─────────────────────────────────────────────────────────────────────────────
// Annual Leave section (per IT member)
// ─────────────────────────────────────────────────────────────────────────────

function ALSection({ itName }) {
  const { leavesFor, loading, saving, createLeave, updateLeave, deleteLeave } = useAnnualLeave()
  const myLeaves = leavesFor(itName)

  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)  // leave object being edited
  const [draft,    setDraft]    = useState(null)

  const emptyDraft = () => ({ startDate: today, endDate: today, note: '' })

  function openNew() {
    setDraft(emptyDraft())
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(leave) {
    setDraft({ startDate: leave.start_date, endDate: leave.end_date, note: leave.note || '' })
    setEditing(leave)
    setShowForm(true)
  }

  function setField(k, v) { setDraft(d => ({ ...d, [k]: v })) }

  async function handleSubmit() {
    if (!draft.startDate || !draft.endDate) return alert('Start and end date are required.')
    if (draft.endDate < draft.startDate) return alert('End date must be on or after start date.')
    let res
    if (editing) {
      res = await updateLeave(editing.id, draft)
    } else {
      res = await createLeave({ itName, startDate: draft.startDate, endDate: draft.endDate, note: draft.note })
    }
    if (res.success) { setShowForm(false); setDraft(null); setEditing(null) }
    else alert('Save failed: ' + res.error)
  }

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
          🌴 Annual Leave ({myLeaves.length})
        </span>
        {!showForm && (
          <button onClick={openNew} style={{
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
          }}>+ Add Leave</button>
        )}
      </div>

      {/* Form */}
      {showForm && draft && (
        <div style={{ background: '#0f172a', borderRadius: 10, padding: 14, marginBottom: 12, border: '1px solid #334155' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Start Date *</label>
              <input {...inp} type="date" value={draft.startDate}
                onChange={e => setField('startDate', e.target.value)} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>End Date *</label>
              <input {...inp} type="date" value={draft.endDate} min={draft.startDate}
                onChange={e => setField('endDate', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Note (optional)</label>
            <input {...inp} value={draft.note} placeholder="e.g. Family trip"
              onChange={e => setField('note', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setDraft(null); setEditing(null) }}
              style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ ...btnPrimary, padding: '6px 14px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : editing ? 'Update' : 'Add Leave'}
            </button>
          </div>
        </div>
      )}

      {/* Leave list */}
      {loading ? (
        <div style={{ color: '#475569', fontSize: 12 }}>Loading…</div>
      ) : myLeaves.length === 0 && !showForm ? (
        <div style={{ color: '#475569', fontSize: 12 }}>No annual leave recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myLeaves.map(leave => {
            const days = Math.round((new Date(leave.end_date) - new Date(leave.start_date)) / 86400000) + 1
            return (
              <div key={leave.id} style={{
                background: '#0f172a', borderRadius: 8, padding: '10px 12px',
                border: '1px solid #1e293b', fontSize: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                      {fmtDate(leave.start_date)}
                    </span>
                    <span style={{ color: '#475569' }}>→</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                      {fmtDate(leave.end_date)}
                    </span>
                    <span style={{ color: '#475569', fontSize: 11 }}>({days} day{days !== 1 ? 's' : ''})</span>
                  </div>
                  {leave.note && (
                    <div style={{ color: '#64748b', marginTop: 3, fontSize: 11 }}>{leave.note}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEdit(leave)} style={{
                    background: 'none', border: '1px solid #334155', borderRadius: 5,
                    color: '#64748b', padding: '2px 7px', fontSize: 10, cursor: 'pointer',
                  }}>✏️</button>
                  <button onClick={() => { if (confirm('Delete this leave?')) deleteLeave(leave.id) }} style={{
                    background: 'none', border: 'none',
                    color: '#ef4444', padding: '2px 5px', fontSize: 11, cursor: 'pointer',
                  }}>🗑</button>
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
// Shared table styles (same as DeploymentBoard)
// ─────────────────────────────────────────────────────────────────────────────
const cellPad  = { padding: '6px 8px', verticalAlign: 'top' }
const smallInp = { ...inpStyle, padding: '5px 8px', fontSize: 11 }
const spanTd   = { ...cellPad, background: '#131e2e', borderRight: '1px solid #1e293b' }
const uid      = () => Math.random().toString(36).slice(2)
 
function emptyDetail() {
  return { id: uid(), remark: '', discovery: '', testingRequired: true, md: '', pic: '', liveDate: today }
}
function emptyRow() {
  return { id: uid(), task: { manual: '', feedbackLogId: '', feedbackLogUrl: '', feedbackLogLabel: '' }, details: [emptyDetail()] }
}
 
// ── Exact same TaskCell as DeploymentBoard ────────────────────────────────────
function TaskCell({ value, onChange }) {
  const [mode,        setMode]        = useState('manual')
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
        <input value={value.manual || ''} onChange={e => onChange({ ...value, manual: e.target.value })}
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
 
// ─────────────────────────────────────────────────────────────────────────────
// Deployment section per IT member — exact same table as DeploymentBoard
// IT can add/edit/delete their own rows only. Cannot delete the deployment.
// ─────────────────────────────────────────────────────────────────────────────
function ITDeploymentSection({ itName, deployments = [], entries, getRows, saveRows, syncToMainDeployment,isSaving }) {
 
  const TH = (label, extra = {}) => (
    <th style={{
      padding: '8px 8px', textAlign: 'left', color: '#475569', fontSize: 10,
      fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap',
      background: '#0f172a', ...extra,
    }}>{label}</th>
  )
 
  // Local state per deployment: rows + save status
  const [localRows,  setLocalRows]  = useState({})  // depId → Row[]
  const [justSaved,  setJustSaved]  = useState({})  // depId → bool
 
  // Hydrate from entries — runs whenever entries or deployments change.
  // Only overwrites a deployment's local rows if the user hasn't made local edits
  // (tracked via the 'dirty' set).
  const [dirty, setDirty] = useState(new Set())
 
  useEffect(() => {
    setLocalRows(current => {
      const next = { ...current }
      deployments.forEach(dep => {
        const key = String(dep.id)
        if (dirty.has(key)) return  // user is editing — don't overwrite
        const entry = entries.find(
          e => String(e.deployment_id) === key && e.it_name === itName
        )
        if (entry?.rows) {
          next[dep.id] = entry.rows
        }
      })
      return next
    })
  }, [entries, deployments, itName])  // deliberately excludes dirty so it doesn't loop
 
  const getDepRows   = (depId) => localRows[depId] || []
  const setDepRows   = (depId, updater) => {
    setDirty(d => new Set(d).add(String(depId)))  // mark as user-edited
    setLocalRows(r => ({ ...r, [depId]: typeof updater === 'function' ? updater(r[depId] || []) : updater }))
  }
 
  const addRow       = (depId) => setDepRows(depId, rows => [...rows, emptyRow()])
  // const patchRowTask = (depId, rowId, task) =>
  //   setDepRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, task } : r))
  const patchRowTask = (depId, rowId, taskPatch) => {
    setDirty(d => new Set(d).add(String(depId)));
    setLocalRows(prev => {
      const rows = prev[depId] || [];
      return {
        ...prev,
        [depId]: rows.map(r => 
          r.id === rowId ? { ...r, task: taskPatch } : r
        )
      };
    });
  };
  const addDetail    = (depId, rowId) =>
    setDepRows(depId, rows => rows.map(r => r.id === rowId ? { ...r, details: [...r.details, emptyDetail()] } : r))
  const removeDetail = (depId, rowId, detailId) =>
    setDepRows(depId, rows => rows.flatMap(r => {
      if (r.id !== rowId) return [r]
      const next = r.details.filter(d => d.id !== detailId)
      return next.length === 0 ? [] : [{ ...r, details: next }]
    }))
  // const patchDetail  = (depId, rowId, detailId, patch) =>
  //   setDepRows(depId, rows => rows.map(r => r.id !== rowId ? r : {
  //     ...r, details: r.details.map(d => d.id === detailId ? { ...d, ...patch } : d),
  //   }))
  const patchDetail = (depId, rowId, detailId, patch) => {
    setDirty(d => new Set(d).add(String(depId)));
    setLocalRows(prev => {
      const rows = prev[depId] || [];
      return {
        ...prev,
        [depId]: rows.map(r => 
          r.id !== rowId ? r : {
            ...r,
            details: r.details.map(d => 
              d.id === detailId ? { ...d, ...patch } : d // Removed forced itName
            ),
          }
        )
      };
    });
  };
 
  // async function handleSave(depId) {
  //   const rows = getDepRows(depId)
  //   const res  = await saveRows(depId, itName, rows)
  //   if (res.success) {
  //     setJustSaved(s => ({ ...s, [depId]: true }))
  //     setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)
  //   } else {
  //     alert('Save failed: ' + res.error)
  //   }
  // }
 
  async function handleSave(depId) {
    const rows = getDepRows(depId)
 
    // Save only to it_deployment_entries — DeploymentBoard reads this separately
    const res = await saveRows(depId, itName, rows)
 
    if (res.success) {
        // 2. Sync to main Deployment Board
        const mainDep = deployments.find(d => d.id === depId)

        if (mainDep && syncToMainDeployment) {
          const otherRows = (mainDep.rows || []).filter(row =>
            !row.details.some(d => d.pic === itName)
          )

          // const updatedRows = [...otherRows, ...rows]
          function normalizeRows(rows, itName) {
            return rows.map(r => ({
              ...r,
              details: r.details.map(d => ({
                ...d,
                pic: d.pic || itName // ensure PIC always exists
              }))
            }))
          }

          const updatedRows = [
            ...otherRows,
            ...normalizeRows(rows, itName)
          ]

          await syncToMainDeployment(depId, updatedRows)
        }

        setJustSaved(s => ({ ...s, [depId]: true }))
        setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000)

      } else {
        alert('Save failed: ' + res.error)
      }

 
// 2. Sync to the main Deployment Board record for Word Export
  // const mainDep = deployments.find(d => String(d.id) === String(depId));
  
  // if (mainDep && typeof syncToMainDeployment === 'function') {
  //   const existingMainRows = Array.isArray(mainDep.rows) ? mainDep.rows : [];
    
  //   // Filter logic:
  //   // We remove any rows in the main deployment that were originally created 
  //   // by this IT member (matching row.id) to avoid duplicates.
  //   const otherMemberRows = existingMainRows.filter(mainRow => 
  //     !rows.some(localRow => localRow.id === mainRow.id)
  //   );

  //   // Merge: Others' tasks + This member's updated tasks
  //   const mergedRows = [...otherMemberRows, ...rows];

  //   // This updates the 'deployments' table, which DeploymentBoard.jsx 
  //   // uses to generate the Word Document.
  //   await syncToMainDeployment(depId, mergedRows);
  // }

  // // UI feedback
  // setDirty(d => { const next = new Set(d); next.delete(String(depId)); return next; });
  // setJustSaved(s => ({ ...s, [depId]: true }));
  // setTimeout(() => setJustSaved(s => ({ ...s, [depId]: false })), 2000);
}
 
  if (deployments.length === 0) {
    return <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
  }
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {deployments.map(dep => {
        const rows = getDepRows(dep.id)
        return (
          <div key={dep.id} style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', overflow: 'hidden' }}>
 
            {/* Deployment header */}
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
                  {dep.title || dep.deploy_date}
                </span>
                <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>
                  📅 {dep.deploy_date}
                </span>
              </div>
              {/* Save button — no delete deployment */}
              <button
                onClick={() => handleSave(dep.id)}
                disabled={isSaving}
                style={{
                  background: justSaved[dep.id] ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                  border: `1px solid ${justSaved[dep.id] ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
                  borderRadius: 8, color: justSaved[dep.id] ? '#22c55e' : '#3b82f6',
                  padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                }}>
                {isSaving ? '⏳ Saving…' : justSaved[dep.id] ? '✓ Saved' : '💾 Save'}
              </button>
            </div>
 
            {/* Exact same table as DeploymentBoard */}
            <div style={{ padding: 14 }}>
              {rows.length > 0 && (
                <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {TH('#',                { width: 32,  textAlign: 'center' })}
                        {TH('Task',             { minWidth: 200 })}
                        {TH('Remarks from ASP', { minWidth: 200 })}
                        {TH('Self-Disc / Bug',  { minWidth: 130 })}
                        {TH('Testing?',         { minWidth: 80, textAlign: 'center' })}
                        {TH('MD',               { minWidth: 70 })}
                        {TH('PIC',              { minWidth: 130 })}
                        {TH('LIVE on',          { minWidth: 130 })}
                        {TH('',                 { width: 60 })}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => {
                        const span = row.details.length
                        return row.details.map((d, di) => {
                          const isSelfDisc   = d.discovery === 'self-discovered'
                          const isLastDetail = di === span - 1
                          return (
                            <tr key={d.id} style={{ borderBottom: isLastDetail ? '2px solid #0f172a' : '1px dashed #293548' }}>
 
                              {di === 0 && (
                                <td rowSpan={span} style={{ ...spanTd, textAlign: 'center', width: 32,
                                  color: '#94a3b8', fontWeight: 700, fontSize: 13, verticalAlign: 'middle' }}>
                                  {rowIdx + 1}
                                </td>
                              )}
 
                              {di === 0 && (
                                <td rowSpan={span} style={{ ...spanTd, minWidth: 200, verticalAlign: 'top' }}>
                                  <TaskCell value={row.task} onChange={task => patchRowTask(dep.id, row.id, task)} />
                                  <button onClick={() => addDetail(dep.id, row.id)} style={{
                                    marginTop: 10, display: 'block', background: 'none',
                                    border: '1px dashed #334155', borderRadius: 5, color: '#475569',
                                    fontSize: 10, padding: '2px 10px', cursor: 'pointer',
                                  }}>+ add row</button>
                                </td>
                              )}
 
                              {/* REMARKS FROM ASP */}
                              <td style={{ ...cellPad, minWidth: 200 }}>
                                <input value={d.remark}
                                  onChange={e => patchDetail(dep.id, row.id, d.id, { remark: e.target.value })}
                                  placeholder="Remark…" style={{ ...smallInp, width: '100%' }} />
                                {!d.testingRequired && (
                                  <div style={{ fontSize: 10, color: '#ef4444', fontStyle: 'italic', marginTop: 3 }}>
                                    no testing required
                                  </div>
                                )}
                              </td>
 
                              {/* SELF-DISC / BUG */}
                              <td style={{ ...cellPad, minWidth: 130 }}>
                                <select value={d.discovery}
                                  onChange={e => patchDetail(dep.id, row.id, d.id, { discovery: e.target.value })}
                                  style={smallInp}>
                                  {DISCOVERY_TYPES.map(dt => (
                                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                                  ))}
                                </select>
                              </td>
 
                              {/* TESTING REQUIRED */}
                              <td style={{ ...cellPad, minWidth: 80, textAlign: 'center' }}>
                                <button onClick={() => patchDetail(dep.id, row.id, d.id, { testingRequired: !d.testingRequired })}
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
                                <input type="number" min="0" step="0.01" value={d.md}
                                  onChange={e => patchDetail(dep.id, row.id, d.id, { md: e.target.value })}
                                  placeholder="3.25" style={{ ...smallInp, width: 64 }} />
                              </td>
 
                              {/* PIC — greyed out if self-discovered */}
                              <td style={{ ...cellPad, minWidth: 130 }}>
                                <select value={d.pic}
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
                                <input type="date" value={d.liveDate || today}
                                  onChange={e => patchDetail(dep.id, row.id, d.id, { liveDate: e.target.value })}
                                  style={{ ...smallInp, width: 130 }} />
                              </td>
 
                              {/* REMOVE */}
                              <td style={{ ...cellPad, width: 60, textAlign: 'center' }}>
                                <button onClick={() => removeDetail(dep.id, row.id, d.id)}
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
                <div style={{ color: '#475569', fontSize: 12, padding: '6px 0 10px' }}>
                  No tasks yet. Click <strong style={{ color: '#3b82f6' }}>+ Add Task</strong> to add one.
                </div>
              )}
 
              <button onClick={() => addRow(dep.id)} style={{
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 8, color: '#3b82f6', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}>+ Add Task</button>
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
  const [expanded, setExpanded]   = useState(false)
  const [activeTab, setActiveTab] = useState('scrum')
 
 
  const myTaskCount  = tasks.filter(t => t.itName === itName).length
  const myEntryCount = itEntries.filter(e => e.it_name === itName && (e.rows?.length || 0) > 0).length
 
  const tabs = [
    // { id: 'scrum',       label: '📋 Scrum'                          },
    { id: 'tasks',       label: `🗂 Tasks (${myTaskCount})`          },
    { id: 'deployments', label: `🚀 Deployments (${myEntryCount})`  },
    { id: 'al',          label: '🌴 Annual Leave'                    },
  ]
 
  return (
    <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
      <div onClick={() => setExpanded(e => !e)} style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        gap: 12, cursor: 'pointer', userSelect: 'none',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
          {itName.split(' ').map(w => w[0]).join('').slice(1, 3).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{itName}</div>
          <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
            {myTaskCount} task{myTaskCount !== 1 ? 's' : ''}
            &nbsp;·&nbsp;
            {deployments.length} deployment{deployments.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span style={{ color: '#475569', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
      </div>
 
      {expanded && (
        <div style={{ borderTop: '1px solid #0f172a' }}>
          <div style={{ display: 'flex', background: '#0f172a', padding: '0 16px', gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                color: activeTab === tab.id ? '#3b82f6' : '#475569',
                padding: '10px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}>{tab.label}</button>
            ))}
          </div>
          <div style={{ padding: 20 }}>
            {/* {activeTab === 'scrum' && <ScrumSection itName={itName} />} */}
            {activeTab === 'tasks' && (
              <TasksSection itName={itName} tasks={tasks}
                createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} saving={saving} />
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
            {activeTab === 'al' && (
              <ALSection itName={itName} />
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
 
export default function ITBoard({ tasks = [], deployments = [], itEntries = [], getRows, saveRows, syncToMainDeployment, createTask, updateTask, deleteTask, saving }) {
  const [search, setSearch] = useState('')
 
  const filtered = IT_MEMBERS.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )
 
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }}>
            👤 IT Board
          </h2>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            Per-member tasks and depoyment items.
          </p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member…"
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
            color: '#e2e8f0', padding: '7px 12px', fontSize: 13, outline: 'none', width: 200 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(name => (
          <ITMemberCard
            key={name} itName={name}
            tasks={tasks} deployments={deployments} itEntries={itEntries}
            getRows={getRows} saveRows={saveRows} syncToMainDeployment={syncToMainDeployment}
            createTask={createTask} updateTask={updateTask} deleteTask={deleteTask}
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
 
function ITDeploymentCard({ dep, itName, itEntries, addEntry, updateEntry, deleteEntry, saving}) {
  const myEntries = itEntries.filter(e => e.deployment_id === dep.id && e.it_name === itName)
  const [showForm, setShowForm] = useState(false)
  const [draft,    setDraft]    = useState(null)
 
  const smallInp = {
    style: {
      background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
      color: '#e2e8f0', padding: '6px 8px', fontSize: 12, width: '100%',
      outline: 'none',
    }
  }
  const smallTa = {
    style: {
      background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
      color: '#e2e8f0', padding: '6px 8px', fontSize: 12, width: '100%',
      outline: 'none', resize: 'vertical', minHeight: 56, fontFamily: 'inherit',
    }
  }
 
  function openAdd() {
    setDraft(emptyEntryDraft(dep.id, itName, dep.deploy_date))
    setShowForm(true)
  }
 
  function openEdit(entry) {
    setDraft({
      id:           entry.id,
      deploymentId: entry.deployment_id,
      itName:       entry.it_name,
      taskLabel:    entry.task_label,
      remark:       entry.remark,
      liveDate:     entry.live_date || dep.deploy_date,
    })
    setShowForm(true)
  }
 
  function setField(k, v) { setDraft(d => ({ ...d, [k]: v })) }
 
  async function handleSubmit() {
    if (!draft) return
    let res
    if (draft.id) {
      res = await updateEntry(draft.id, { taskLabel: draft.taskLabel, remark: draft.remark, liveDate: draft.liveDate })
    } else {
      res = await addEntry({ deploymentId: draft.deploymentId, itName: draft.itName, taskLabel: draft.taskLabel, remark: draft.remark, liveDate: draft.liveDate })
    }
    if (res.success) { setShowForm(false); setDraft(null) }
    else alert('Save failed: ' + res.error)
  }
 
  return (
    <div style={{ background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b', marginBottom: 10, overflow: 'hidden' }}>
      {/* Deployment header — read only, no delete */}
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1e293b' }}>
        <div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
            {dep.title || dep.deploy_date}
          </span>
          <span style={{ color: '#475569', fontSize: 11, marginLeft: 8 }}>
            📅 {fmtDate(dep.deploy_date)}
          </span>
        </div>
        <button onClick={openAdd} style={{
          background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 6, color: '#3b82f6', padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
        }}>+ Add Remark</button>
      </div>
 
      {/* Entry form */}
      {showForm && draft && (
        <div style={{ padding: 12, borderBottom: '1px solid #1e293b', background: '#131e2e' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Task / Item</label>
              <input {...smallInp} value={draft.taskLabel}
                placeholder="e.g. Fix payment bug"
                onChange={e => setField('taskLabel', e.target.value)} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Deploying LIVE on</label>
              <input {...smallInp} type="date" value={draft.liveDate || ''}
                onChange={e => setField('liveDate', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Remark</label>
            <textarea {...smallTa} value={draft.remark}
              placeholder="Describe what was done…"
              onChange={e => setField('remark', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setDraft(null) }}
              style={{ ...btnGhost, padding: '5px 12px', fontSize: 12 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ ...btnPrimary, padding: '5px 12px', fontSize: 12, opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : draft.id ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}
 
      {/* My entries */}
      {myEntries.length === 0 && !showForm ? (
        <div style={{ color: '#334155', fontSize: 12, padding: '10px 14px', fontStyle: 'italic' }}>
          No remarks added yet.
        </div>
      ) : (
        <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {myEntries.map(entry => (
            <div key={entry.id} style={{
              background: '#1e293b', borderRadius: 8, padding: '8px 12px',
              border: '1px solid #334155', fontSize: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {entry.task_label && (
                    <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 3 }}>{entry.task_label}</div>
                  )}
                  {entry.remark && (
                    <div style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{entry.remark}</div>
                  )}
                  {entry.live_date && (
                    <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      🎯 {fmtDate(entry.live_date)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEdit(entry)} style={{
                    background: 'none', border: '1px solid #334155', borderRadius: 5,
                    color: '#64748b', padding: '2px 7px', fontSize: 10, cursor: 'pointer',
                  }}>✏️</button>
                  <button onClick={() => { if (confirm('Delete this remark?')) deleteEntry(entry.id) }} style={{
                    background: 'none', border: 'none',
                    color: '#ef4444', padding: '2px 5px', fontSize: 11, cursor: 'pointer',
                  }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
 
function DeploymentSection({ itName, deployments = [], itEntries = [], addEntry, updateEntry, deleteEntry, saving }) {
  return (
    <div>
      <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 12 }}>
        🚀 Deployments ({deployments.length})
      </div>
      {deployments.length === 0 ? (
        <div style={{ color: '#475569', fontSize: 12 }}>No deployments created yet.</div>
      ) : (
        deployments.map(dep => (
          <ITDeploymentCard
            key={dep.id}
            dep={dep}
            itName={itName}
            itEntries={itEntries}
            getRows={getRows}
            saveRows={saveRows}
            addEntry={addEntry}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
            saving={saving}
          />
        ))
      )}
    </div>
  )
}