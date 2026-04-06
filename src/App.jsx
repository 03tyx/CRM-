//App.jsx
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
// import { useITEntries } from './useITEntries';
// import { useAnnualLeave } from './useAnnualLeave'

// export default function App() {
//   const {tasks, loading: tasksLoading, saving: tasksSaving, error, createTask, updateTask, deleteTask } = useTasks()
//   const [tab, setTab] = useState('dashboard')
//   const [showNewForm, setShowNewForm] = useState(false)  // only for new task in Tasks tab
//   const [toast, setToast] = useState(null)
  
//   const { leaves } = useAnnualLeave()

//   const isQuickMode = window.location.pathname === '/quick'

//   const { 
//     deployments, 
//     loading: deployLoading, 
//     saving: deploySaving, 
//     saveRows: saveMainRows,
//     createDeployment,
//     deleteDeployment 
//   } = useDeployments()

//   const { getRows, saveRows: saveITRows, entries: itEntries, saving: itSaving } = useITEntries();

//   const loading = tasksLoading || deployLoading;
//   const saving = tasksSaving || deploySaving || itSaving;

//   const delayedCount = useMemo(() =>
//     tasks.filter(t => computeStatus(t) === 'Delayed').length
//   , [tasks])

//   const TABS = [
//     { id: 'dashboard',  label: '📊 Dashboard' },
//     { id: 'tasks',      label: '📋 Tasks', badge: delayedCount > 0 ? delayedCount : null },
//     { id: 'gantt',      label: '📅 Timeline' },
//     { id: 'deployment', label: '🚀 Deployment' },
//     { id: 'itboard',    label: '💻 IT Board' },
//   ]

//   function switchTab(id) {
//     setTab(id)
//     setShowNewForm(false)   // always close new-task form when switching tabs
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
//       <div style={{ height: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <QuickAdd onSave={createTask} saving={saving} standalone />
//       </div>
//     )
//   }

//   return (
//     <div style={{ minHeight: '100vh', background: '#0a0f1e',
//       fontFamily: "'DM Sans','Segoe UI',sans-serif", color: '#e2e8f0' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         ::-webkit-scrollbar { width: 6px; height: 6px; }
//         ::-webkit-scrollbar-track { background: #0f172a; }
//         ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
//         select option { background: #1e293b; }
//         input[type=range] { accent-color: #3b82f6; }
//       `}</style>

//       {/* ── Header — no New Task button here anymore ── */}
//       <div style={{
//         background: 'rgba(10,15,30,0.96)', borderBottom: '1px solid #1e3a5f',
//         padding: '0 24px', display: 'flex', alignItems: 'center',
//         height: 60, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)',
//       }}>
//         <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18,
//           background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
//           WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: 32 }}>
//           ResourceIQ
//         </div>

//         <div style={{ display: 'flex', gap: 4 }}>
//           {TABS.map(t => (
//             <button key={t.id} onClick={() => switchTab(t.id)} style={{
//               background: tab === t.id ? 'rgba(59,130,246,0.15)' : 'transparent',
//               border: tab === t.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
//               color: tab === t.id ? '#93c5fd' : '#D1D6D8E0',
//               borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 600,
//               cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
//             }}>
//               {t.label}
//               {t.badge && (
//                 <span style={{
//                   position: 'absolute', top: -4, right: -4,
//                   background: '#ef4444', color: '#fff',
//                   borderRadius: 99, fontSize: 10, fontWeight: 700,
//                   padding: '1px 5px', lineHeight: '14px',
//                 }}>{t.badge}</span>
//               )}
//             </button>
//           ))}
//         </div>

//         <div style={{ marginLeft: 'auto' }}>
//           {saving && (
//             <span style={{ fontSize: 12, color: '#64748b' }}>⏳ Saving…</span>
//           )}
//         </div>
//       </div>

//       {/* ── Toast ── */}
//       {toast && (
//         <div style={{
//           position: 'fixed', top: 70, right: 24, zIndex: 999,
//           background: toast.type === 'error' ? '#ef4444' : '#22c55e',
//           color: '#fff', padding: '10px 20px', borderRadius: 10,
//           fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
//         }}>{toast.msg}</div>
//       )}

//       {/* ── Body ── */}
//       <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>

//         {loading && (
//           <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
//             <div style={{ fontSize: 24, marginBottom: 10 }}>⏳</div>
//             <div>Loading tasks from Supabase…</div>
//           </div>
//         )}

//         {error && !loading && (
//           <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
//             borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: '#fca5a5' }}>
//             ⚠️ <strong>Connection issue:</strong> {error}
//           </div>
//         )}

//         {!loading && (
//           <>
//             {tab === 'dashboard' && <Dashboard tasks={tasks} />}

//             {tab === 'tasks' && (
//               <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155' }}>
//                 {/* Tasks tab header with + New Task button */}
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                   <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700 }}>
//                     📋 Tasks
//                   </h3>
//                   <button onClick={() => setShowNewForm(s => !s)} style={{
//                     background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none',
//                     borderRadius: 8, color: '#fff', padding: '7px 16px', fontSize: 13,
//                     fontWeight: 600, cursor: 'pointer',
//                   }}>{showNewForm ? '✕ Cancel' : '+ New Task'}</button>
//                 </div>

//                 {/* New task form — only visible here */}
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
//               <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                   <h3 style={{ color: '#f1f5f9', fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700 }}>
//                     📅 Team Capacity & Availability (3-Month View)
//                   </h3>
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
//                 saving={deploySaving} />
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
import { useTasks } from './useTasks'
import TaskForm from './TaskForm'
import TaskTable from './TaskTable'
import GanttChart from './GanttChart'
import { useDeployments } from './useDeployments'
import DeploymentBoard from './DeploymentBoard'
import Dashboard from './Dashboard'
import QuickAdd from './QuickAdd'
import ITBoard from './ITBoard'
import { computeStatus } from './helpers'
import { useITEntries } from './useITEntries'
import { useAnnualLeave } from './useAnnualLeave'
import './App.css'

export default function App() {
  const { tasks, loading: tasksLoading, saving: tasksSaving, error, createTask, updateTask, deleteTask } = useTasks()
  const [tab,         setTab]         = useState('dashboard')
  const [showNewForm, setShowNewForm] = useState(false)
  const [toast,       setToast]       = useState(null)

  const { leaves } = useAnnualLeave()

  const isQuickMode = window.location.pathname === '/quick'

  const {
    deployments,
    loading: deployLoading,
    saving: deploySaving,
    saveRows: saveMainRows,
    createDeployment,
    deleteDeployment,
  } = useDeployments()

  const { getRows, saveRows: saveITRows, entries: itEntries, saving: itSaving } = useITEntries()

  const loading = tasksLoading || deployLoading
  const saving  = tasksSaving  || deploySaving || itSaving

  const delayedCount = useMemo(() =>
    tasks.filter(t => computeStatus(t) === 'Delayed').length
  , [tasks])

  const TABS = [
    { id: 'dashboard',  label: '📊 Dashboard' },
    { id: 'tasks',      label: '📋 Tasks',      badge: delayedCount > 0 ? delayedCount : null },
    { id: 'gantt',      label: '📅 Timeline' },
    { id: 'deployment', label: '🚀 Deployment' },
    { id: 'itboard',    label: '💻 IT Board' },
  ]

  function switchTab(id) {
    setTab(id)
    setShowNewForm(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleCreate(form) {
    const res = await createTask(form)
    if (res.success) { showToast('Task added ✓'); setShowNewForm(false) }
    else showToast(`Error: ${res.error}`, 'error')
  }

  async function handleUpdate(id, form) {
    const res = await updateTask(id, form)
    if (res.success) showToast('Task updated ✓')
    else showToast(`Error: ${res.error}`, 'error')
    return res
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    const res = await deleteTask(id)
    if (res.success) showToast('Task deleted')
    else showToast(`Error: ${res.error}`, 'error')
  }

  if (isQuickMode) {
    return (
      <div className="quick-page">
        <QuickAdd onSave={createTask} saving={saving} standalone />
      </div>
    )
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
            <div>Loading tasks from Supabase…</div>
          </div>
        )}

        {error && !loading && (
          <div className="state-error">
            ⚠️ <strong>Connection issue:</strong> {error}
          </div>
        )}

        {!loading && (
          <>
            {tab === 'dashboard' && <Dashboard tasks={tasks} />}

            {tab === 'tasks' && (
              <div className="section-card">
                <div className="section-card__header">
                  <h3 className="section-card__title">📋 Tasks</h3>
                  <button
                    className="btn-primary"
                    onClick={() => setShowNewForm(s => !s)}
                  >
                    {showNewForm ? '✕ Cancel' : '+ New Task'}
                  </button>
                </div>

                {showNewForm && (
                  <div style={{ marginBottom: 20 }}>
                    <TaskForm
                      onSave={handleCreate}
                      saving={saving}
                      onCancel={() => setShowNewForm(false)}
                    />
                  </div>
                )}

                <TaskTable
                  tasks={tasks}
                  onSave={handleUpdate}
                  onDelete={handleDelete}
                  saving={saving}
                />
              </div>
            )}

            {tab === 'gantt' && (
              <div className="section-card">
                <div className="section-card__header">
                  <h3 className="section-card__title">📅 Team Capacity & Availability (3-Month View)</h3>
                </div>
                <GanttChart tasks={tasks} leaves={leaves} />
              </div>
            )}

            {tab === 'deployment' && (
              <DeploymentBoard
                tasks={tasks}
                deployments={deployments}
                itEntries={itEntries}
                saveRows={saveMainRows}
                createDeployment={createDeployment}
                deleteDeployment={deleteDeployment}
                loading={deployLoading}
                saving={deploySaving}
              />
            )}

            {tab === 'itboard' && (
              <ITBoard
                tasks={tasks}
                deployments={deployments}
                itEntries={itEntries}
                getRows={getRows}
                saveRows={saveITRows}
                syncToMainDeployment={saveMainRows}
                createTask={createTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
                saving={saving}
              />
            )}
          </>
        )}
      </div>

      <QuickAdd onSave={createTask} saving={saving} />
    </div>
  )
}