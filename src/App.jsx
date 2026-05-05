// App.jsx
// import { useState, useMemo } from 'react'
// import { useTasks } from './useTasks'
// import TaskForm from './TaskForm'
// import TaskTable from './TaskTable'
// import GanttChart from './GanttChart'
// import { useDeployments } from './useDeployments'
// import DeploymentBoard from './DeploymentBoard'
// import Dashboard from './Dashboard'
// import QuickAdd from './QuickAdd'
// import ITBoard from './ITBoard'
// import { computeStatus } from './helpers'
// import { useITEntries } from './useITEntries'
// import { useAnnualLeave } from './useAnnualLeave'
// import './App.css'

// export default function App() {
//   const { tasks, loading: tasksLoading, saving: tasksSaving, error, createTask, updateTask, deleteTask } = useTasks()
//   const [tab,         setTab]         = useState('dashboard')
//   const [showNewForm, setShowNewForm] = useState(false)
//   const [toast,       setToast]       = useState(null)

//   const { leaves } = useAnnualLeave()

//   const isQuickMode = window.location.pathname === '/quick'

//   const {
//     deployments,
//     loading: deployLoading,
//     saving: deploySaving,
//     saveRows: saveMainRows,
//     createDeployment,
//     deleteDeployment,
//   } = useDeployments()

//   const { getRows, saveRows: saveITRows, entries: itEntries, saving: itSaving } = useITEntries()

//   const loading = tasksLoading || deployLoading
//   const saving  = tasksSaving  || deploySaving || itSaving

//   const delayedCount = useMemo(() =>
//     tasks.filter(t => computeStatus(t) === 'Delayed').length
//   , [tasks])

//   const TABS = [
//     { id: 'dashboard',  label: '📊 Dashboard' },
//     { id: 'tasks',      label: '📋 Tasks',      badge: delayedCount > 0 ? delayedCount : null },
//     { id: 'gantt',      label: '📅 Timeline' },
//     { id: 'deployment', label: '🚀 Deployment' },
//     { id: 'itboard',    label: '💻 IT Board' },
//   ]

//   function switchTab(id) {
//     setTab(id)
//     setShowNewForm(false)
//   }

//   function showToast(msg, type = 'success') {
//     setToast({ msg, type })
//     setTimeout(() => setToast(null), 3000)
//   }

//   async function handleCreate(form) {
//     const res = await createTask(form)
//     if (res.success) { showToast('Task added ✓'); setShowNewForm(false) }
//     else showToast(`Error: ${res.error}`, 'error')
//   }

//   async function handleUpdate(id, form) {
//     const res = await updateTask(id, form)
//     if (res.success) showToast('Task updated ✓')
//     else showToast(`Error: ${res.error}`, 'error')
//     return res
//   }

//   async function handleDelete(id) {
//     if (!confirm('Delete this task?')) return
//     const res = await deleteTask(id)
//     if (res.success) showToast('Task deleted')
//     else showToast(`Error: ${res.error}`, 'error')
//   }

//   if (isQuickMode) {
//     return (
//       <div className="quick-page">
//         <QuickAdd onSave={createTask} saving={saving} standalone />
//       </div>
//     )
//   }

//   return (
//     <div className="app-shell">

//       {/* ── Header ── */}
//       <div className="app-header">
//         <div className="app-logo">ResourceIQ</div>

//         <div className="tab-bar">
//           {TABS.map(t => (
//             <button
//               key={t.id}
//               className={`tab-btn ${tab === t.id ? 'active' : ''}`}
//               onClick={() => switchTab(t.id)}
//             >
//               {t.label}
//               {t.badge && <span className="tab-badge">{t.badge}</span>}
//             </button>
//           ))}
//         </div>

//         <div className="header-right">
//           {saving && <span className="saving-indicator">⏳ Saving…</span>}
//         </div>
//       </div>

//       {/* ── Toast ── */}
//       {toast && (
//         <div className={`toast ${toast.type === 'error' ? 'toast--error' : 'toast--success'}`}>
//           {toast.msg}
//         </div>
//       )}

//       {/* ── Body ── */}
//       <div className="app-body">

//         {loading && (
//           <div className="state-loading">
//             <div className="state-loading__icon">⏳</div>
//             <div>Loading tasks from Supabase…</div>
//           </div>
//         )}

//         {error && !loading && (
//           <div className="state-error">
//             ⚠️ <strong>Connection issue:</strong> {error}
//           </div>
//         )}

//         {!loading && (
//           <>
//             {tab === 'dashboard' && <Dashboard tasks={tasks} />}

//             {tab === 'tasks' && (
//               <div className="section-card">
//                 <div className="section-card__header">
//                   <h3 className="section-card__title">📋 Tasks</h3>
//                   <button
//                     className="btn-primary"
//                     onClick={() => setShowNewForm(s => !s)}
//                   >
//                     {showNewForm ? '✕ Cancel' : '+ New Task'}
//                   </button>
//                 </div>

//                 {showNewForm && (
//                   <div style={{ marginBottom: 20 }}>
//                     <TaskForm
//                       onSave={handleCreate}
//                       saving={saving}
//                       onCancel={() => setShowNewForm(false)}
//                     />
//                   </div>
//                 )}

//                 <TaskTable
//                   tasks={tasks}
//                   onSave={handleUpdate}
//                   onDelete={handleDelete}
//                   saving={saving}
//                 />
//               </div>
//             )}

//             {tab === 'gantt' && (
//               <div className="section-card">
//                 <div className="section-card__header">
//                   <h3 className="section-card__title">📅 Team Capacity & Availability (3-Month View)</h3>
//                 </div>
//                 <GanttChart tasks={tasks} leaves={leaves} />
//               </div>
//             )}

//             {tab === 'deployment' && (
//               <DeploymentBoard
//                 tasks={tasks}
//                 deployments={deployments}
//                 itEntries={itEntries}
//                 saveRows={saveMainRows}
//                 createDeployment={createDeployment}
//                 deleteDeployment={deleteDeployment}
//                 loading={deployLoading}
//                 saving={deploySaving}
//               />
//             )}

//             {tab === 'itboard' && (
//               <ITBoard
//                 tasks={tasks}
//                 deployments={deployments}
//                 itEntries={itEntries}
//                 getRows={getRows}
//                 saveRows={saveITRows}
//                 syncToMainDeployment={saveMainRows}
//                 createTask={createTask}
//                 updateTask={updateTask}
//                 deleteTask={deleteTask}
//                 saving={saving}
//               />
//             )}
//           </>
//         )}
//       </div>

//       <QuickAdd onSave={createTask} saving={saving} />
//     </div>
//   )
// }

// App.jsx
import { useState, useMemo } from 'react'
import { AuthProvider, useAuth } from './useAuth'
import { useTasks } from './useTasks'
import { useDeployments } from './useDeployments'
import { useITEntries } from './useITEntries'
import { useAuditLog } from './useAuditLog'
import { useAnnualLeave } from './useAnnualLeave'
import LoginPage from './LoginPage'
import SetPasswordPage from './SetPasswordPage'
import TaskForm from './TaskForm'
import TaskTable from './TaskTable'
import GanttChart from './GanttChart'
import DeploymentBoard from './DeploymentBoard'
import Dashboard from './Dashboard'
import ITBoard from './ITBoard'
import AuditLog from './AuditLog'
import { computeStatus } from './helpers'
import './App.css'

// ── Inner app (has access to auth context) ──────────────────────────────────
function AppInner() {
  const { session, profile, loading: authLoading,
          isSuperAdmin, displayName, signOut,
          needsPasswordSet, clearNeedsPasswordSet } = useAuth()
  const { log } = useAuditLog()

  const { tasks, loading: tasksLoading, saving: tasksSaving,
          error, createTask, updateTask, deleteTask } = useTasks()
  const { leaves }     = useAnnualLeave()
  const { deployments, loading: deployLoading, saving: deploySaving,
          saveRows: saveMainRows, createDeployment, deleteDeployment } = useDeployments()
  const { entries: itEntries, saving: itSaving, saveRows: saveITRows } = useITEntries()

  const [tab,         setTab]         = useState('dashboard')
  const [showNewForm, setShowNewForm] = useState(false)
  const [toast,       setToast]       = useState(null)

  const loading = tasksLoading || deployLoading
  const saving  = tasksSaving  || deploySaving || itSaving

  const delayedCount = useMemo(() =>
    tasks.filter(t => computeStatus(t) === 'Delayed').length
  , [tasks])

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="state-loading">
          <div className="state-loading__icon">⏳</div>
          <div>Loading…</div>
        </div>
      </div>
    )
  }
  if (!session) return <LoginPage />

  // User clicked invite link — they're signed in but must set a password first
  if (needsPasswordSet) return <SetPasswordPage onDone={clearNeedsPasswordSet} />
  if (!profile) {
    return (
      <div className="app-shell">
        <div className="state-loading">
          <div className="state-loading__icon">⏳</div>
          <div>Loading profile…</div>
        </div>
      </div>
    )
  }

  // ── Tabs (audit only for super admins) ───────────────────────────────────
  const TABS = [
    { id: 'dashboard',  label: '📊 Dashboard' },
    { id: 'tasks',      label: '📋 Tasks',    badge: delayedCount > 0 ? delayedCount : null },
    { id: 'gantt',      label: '📅 Timeline' },
    { id: 'deployment', label: '🚀 Deployment' },
    { id: 'itboard',    label: '💻 IT Board' },
    ...(isSuperAdmin ? [{ id: 'audit', label: '🔍 Audit Log' }] : []),
  ]

  function switchTab(id) { setTab(id); setShowNewForm(false) }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const actor = { actorEmail: session.user.email, actorName: displayName }

  // ── Audit-wrapped handlers ───────────────────────────────────────────────
  async function handleCreate(form) {
    const res = await createTask(form)
    if (res.success) {
      showToast('Task added ✓')
      setShowNewForm(false)
      log({ ...actor, action: 'CREATE_TASK', target: form.project,
            detail: { itName: form.itName, startDate: form.startDate } })
    } else { showToast(`Error: ${res.error}`, 'error') }
  }

  async function handleUpdate(id, form) {
    const old = tasks.find(t => t.id === id)
    const res = await updateTask(id, form)
    if (res.success) {
      showToast('Task updated ✓')
      log({ ...actor, action: 'UPDATE_TASK', target: form.project,
            detail: { before: old, after: form } })
    } else { showToast(`Error: ${res.error}`, 'error') }
    return res
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    const task = tasks.find(t => t.id === id)
    const res  = await deleteTask(id)
    if (res.success) {
      showToast('Task deleted')
      log({ ...actor, action: 'DELETE_TASK', target: task?.project || id })
    } else { showToast(`Error: ${res.error}`, 'error') }
  }

  async function auditedSaveMainRows(depId, rows) {
    const dep = deployments.find(d => d.id === depId)
    const res = await saveMainRows(depId, rows)
    if (res.success)
      log({ ...actor, action: 'SAVE_DEPLOYMENT',
            target: dep?.deploy_date || String(depId),
            detail: { rowCount: rows.length } })
    return res
  }

  async function auditedCreateDeployment(form) {
    const res = await createDeployment(form)
    if (res.success)
      log({ ...actor, action: 'CREATE_DEPLOYMENT',
            target: form.deployDate, detail: { environment: form.environment } })
    return res
  }

  async function auditedDeleteDeployment(id) {
    const dep = deployments.find(d => d.id === id)
    await deleteDeployment(id)
    log({ ...actor, action: 'DELETE_DEPLOYMENT', target: dep?.deploy_date || String(id) })
  }

  async function auditedSaveITRows(depId, itName, rows) {
    const dep = deployments.find(d => d.id === depId)
    const res = await saveITRows(depId, itName, rows)
    if (res.success)
      log({ ...actor, action: 'SAVE_IT_ENTRY',
            target: `${itName} · ${dep?.deploy_date || depId}`,
            detail: { rowCount: rows.length } })
    return res
  }

  return (
    <div className="app-shell">

      {/* ── Header ── */}
      <div className="app-header">
        <div className="app-logo">ResourceIQ</div>

        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
              {t.badge && <span className="tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        <div className="header-right">
          {saving && <span className="saving-indicator">⏳ Saving…</span>}
          <div className="header-user">
            <span className="header-user__name">{displayName}</span>
            {isSuperAdmin && <span className="header-user__role">Admin</span>}
          </div>
          <button className="btn-signout" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast--error' : 'toast--success'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Body ── */}
      <div className="app-body">
        {loading && (
          <div className="state-loading">
            <div className="state-loading__icon">⏳</div>
            <div>Loading…</div>
          </div>
        )}
        {error && !loading && (
          <div className="state-error">⚠️ <strong>Connection issue:</strong> {error}</div>
        )}

        {!loading && (
          <>
            {tab === 'dashboard' && <Dashboard tasks={tasks} />}

            {tab === 'tasks' && (
              <div className="section-card">
                <div className="section-card__header">
                  <h3 className="section-card__title">📋 Tasks</h3>
                  <button className="btn-primary" onClick={() => setShowNewForm(s => !s)}>
                    {showNewForm ? '✕ Cancel' : '+ New Task'}
                  </button>
                </div>
                {showNewForm && (
                  <div style={{ marginBottom: 20 }}>
                    <TaskForm onSave={handleCreate} saving={saving}
                      onCancel={() => setShowNewForm(false)} />
                  </div>
                )}
                <TaskTable tasks={tasks} onSave={handleUpdate}
                  onDelete={handleDelete} saving={saving} />
              </div>
            )}

            {tab === 'gantt' && (
              <div className="section-card">
                <div className="section-card__header">
                  <h3 className="section-card__title">
                    📅 Team Capacity & Availability (3-Month View)
                  </h3>
                </div>
                <GanttChart tasks={tasks} leaves={leaves} />
              </div>
            )}

            {tab === 'deployment' && (
              <DeploymentBoard
                tasks={tasks}
                deployments={deployments}
                itEntries={itEntries}
                saveRows={auditedSaveMainRows}
                createDeployment={auditedCreateDeployment}
                deleteDeployment={auditedDeleteDeployment}
                loading={deployLoading}
                saving={deploySaving}
              />
            )}

            {tab === 'itboard' && (
              <ITBoard
                tasks={tasks}
                deployments={deployments}
                itEntries={itEntries}
                saveRows={auditedSaveITRows}
                syncToMainDeployment={auditedSaveMainRows}
                createTask={handleCreate}
                updateTask={handleUpdate}
                deleteTask={handleDelete}
                saving={saving}
              />
            )}

            {tab === 'audit' && isSuperAdmin && <AuditLog />}
          </>
        )}
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}