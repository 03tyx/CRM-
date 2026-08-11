//TaskTable.jsx
// import { useState, useMemo, React, Fragment } from 'react'
// import { IT_MEMBERS, computeStatus, STATUS_COLOR, STATUS_BG, today } from './helpers'
// import TaskForm from './TaskForm'

// function Badge({ label, color, bg }) {
//   return (
//     <span style={{
//       background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
//       border: `1px solid ${color || '#334155'}40`, borderRadius: 6,
//       padding: '2px 10px', fontSize: 11, fontWeight: 600,
//       letterSpacing: '0.04em', whiteSpace: 'nowrap',
//     }}>{label}</span>
//   )
// }

// function ProgressBar({ pct }) {
//   return (
//     <div style={{ background: '#0f172a', borderRadius: 99, height: 6, width: '100%', overflow: 'hidden' }}>
//       <div style={{
//         width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
//         background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
//       }} />
//     </div>
//   )
// }

// const inp = {
//   background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
//   color: '#e2e8f0', padding: '8px 14px', fontSize: 13, outline: 'none',
// }
// const td = { padding: '10px 12px', verticalAlign: 'middle' }

// export default function TaskTable({ tasks, onSave, onDelete, saving }) {
//   const [search, setSearch] = useState('')
//   const [filterMember, setFilterMember] = useState('All')
//   const [filterStatus, setFilterStatus] = useState('All')
//   const [sortCol, setSortCol] = useState('startDate')
//   const [sortDir, setSortDir] = useState('asc')
//   const [editingId, setEditingId] = useState(null)  // id of task being edited inline

//   function toggleSort(col) {
//     if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
//     else { setSortCol(col); setSortDir('asc') }
//   }

//   function clearFilters() {
//     setSearch('')
//     setFilterMember('All')
//     setFilterStatus('All')
//   }

//   const filtered = useMemo(() => {
//     let arr = tasks.filter(t => {
//       const s = computeStatus(t)
//       return (filterMember === 'All' || t.itName === filterMember)
//         && (filterStatus === 'All' || s === filterStatus)
//         && (t.project.toLowerCase().includes(search.toLowerCase())
//           || t.itName.toLowerCase().includes(search.toLowerCase()))
//     })
//     arr = [...arr].sort((a, b) => {
//       const av = a[sortCol] ?? ''
//       const bv = b[sortCol] ?? ''
//       return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
//     })
//     return arr
//   }, [tasks, search, filterMember, filterStatus, sortCol, sortDir])

//   function Th({ col, label }) {
//     const active = sortCol === col
//     return (
//       <th onClick={() => toggleSort(col)} style={{
//         padding: '10px 12px', textAlign: 'left', color: active ? '#93c5fd' : '#ffffff',
//         fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
//         fontSize: 10, whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
//       }}>
//         {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
//       </th>
//     )
//   }

//   return (
//     <div>
//       <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
//         <input value={search} onChange={e => setSearch(e.target.value)}
//           placeholder="🔍  Search project or member…"
//           style={{ ...inp, flex: 1, minWidth: 200 }} />
//         <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={inp}>
//           <option>Select IT member...</option> 
//           {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
//         </select>
//         <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inp}>
//           <option>Select status...</option>
//           {['In Progress', 'Upcoming', 'Delayed', 'On Hold', 'UAT', 'Completed']
//             .map(s => <option key={s}>{s}</option>)}
//         </select>
//         {(search || filterMember !== 'All' || filterStatus !== 'All') && (
//           <button onClick={clearFilters} style={{
//             background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
//             color: '#cbd5f5', padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
//           }}>Clear</button>
//         )}
//       </div>

//       <div style={{ overflowX: 'auto' }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//           <thead>
//             <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e3a5f' }}>
//               <Th col="itName"    label="Member"   />
//               <Th col="project"   label="Project"  />
//               <Th col="manday"    label="Manday"   />
//               <Th col="startDate" label="Start"    />
//               <Th col="endDate"   label="End"      />
//               <th style={{ padding: '10px 12px', color: '#ffffff', fontWeight: 700,
//                 fontSize: 10, textTransform: 'uppercase', minWidth: 130 }}>Progress</th>
//               <th style={{ padding: '10px 12px', color: '#ffffff', fontWeight: 700,
//                 fontSize: 10, textTransform: 'uppercase' }}>Status</th>
//               <Th col="updatedDate" label="Updated" />
//               <th style={{ padding: '10px 12px', color: '#ffffff', fontWeight: 700,
//                 fontSize: 10, textTransform: 'uppercase' }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(t => {
//               const st = computeStatus(t)
//               const isDelayed = st === 'Delayed'
//               const overdue   = today > t.endDate && st !== 'Completed'
//               const rowBg     = isDelayed ? 'rgba(239,68,68,0.06)' : 'transparent'
//               const isEditing = editingId === t.id

//               return (
//                 <Fragment key={t.id}>
//                   {/* ── Data row ── */}
//                   <tr key={t.id} style={{
//                     borderBottom: isEditing ? 'none' : '1px solid #1e293b',
//                     transition: 'background 0.15s',
//                     background: isEditing ? '#172033' : rowBg,
//                     borderLeft: isDelayed ? '3px solid #ef4444' : '3px solid transparent',
//                   }}
//                     onMouseEnter={e => { if (!isDelayed && !isEditing) e.currentTarget.style.background = '#1e293b' }}
//                     onMouseLeave={e => { e.currentTarget.style.background = isEditing ? '#172033' : rowBg }}
//                   >
//                     <td style={td}><span style={{ color: '#e2e8f0', fontWeight: 600 }}>{t.itName}</span></td>
//                     <td style={td}>
//                       <div style={{ color: '#f1f5f9', fontWeight: 500, maxWidth: 200 }}>{t.project}</div>
//                       {t.targetUAT  && <div style={{ color: '#94a3b8', fontSize: 10 }}>UAT: {t.targetUAT}</div>}
//                       {t.targetLive && <div style={{ color: '#94a3b8', fontSize: 10 }}>LIVE: {t.targetLive}</div>}
//                       {isDelayed && <div style={{ color: '#ef4444', fontSize: 10, fontWeight: 600 }}>⚠️ OVERDUE</div>}
//                     </td>
//                     <td style={{ ...td, textAlign: 'center' }}>
//                       <span style={{ color: '#93c5fd' }}>{t.manday}d</span>
//                     </td>
//                     <td style={td}><span style={{ color: '#e8ecf2' }}>{t.startDate}</span></td>
//                     <td style={td}><span style={{ color: overdue ? '#ef4444' : '#e8ecf2' }}>{t.endDate}</span></td>
//                     <td style={{ ...td, minWidth: 130 }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                         <div style={{ flex: 1 }}><ProgressBar pct={t.progress} /></div>
//                         <span style={{ color: '#94a3b8', fontSize: 11, minWidth: 30 }}>{t.progress}%</span>
//                       </div>
//                     </td>
//                     <td style={td}>
//                       <Badge label={st} color={STATUS_COLOR[st]} bg={STATUS_BG[st]} />
//                     </td>
//                     <td style={td}><span style={{ color: '#94a3b8', fontSize: 11 }}>{t.updatedDate}</span></td>
//                     <td style={td}>
//                       <div style={{ display: 'flex', gap: 6 }}>
//                         <button
//                           onClick={() => setEditingId(isEditing ? null : t.id)}
//                           style={{
//                             background: isEditing ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
//                             border: 'none', borderRadius: 6,
//                             color: isEditing ? '#f59e0b' : '#3b82f6',
//                             padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
//                           }}>
//                           {isEditing ? 'Close' : 'Edit'}
//                         </button>
//                         <button onClick={() => onDelete(t.id)} style={{
//                           background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6,
//                           color: '#ef4444', padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
//                         }}>Del</button>
//                       </div>
//                     </td>
//                   </tr>

//                   {/* ── Inline edit form row ── */}
//                   {isEditing && (
//                     <tr key={`${t.id}-edit`}>
//                       <td colSpan={9} style={{ padding: '0 0 16px 0', background: '#172033', borderBottom: '2px solid #334155' }}>
//                         <div style={{ padding: '16px 16px 0' }}>
//                           <TaskForm
//                             initial={t}
//                             onSave={async form => {
//                               await onSave(t.id, form)
//                               setEditingId(null)
//                             }}
//                             onCancel={() => setEditingId(null)}
//                             saving={saving}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </Fragment>
//               )
//             })}
//           </tbody>
//         </table>
//         {filtered.length === 0 && (
//           <div style={{ textAlign: 'center', color: '#475569', padding: 40, fontSize: 13 }}>
//             No tasks found
//           </div>
//         )}
//       </div>
//       <div style={{ marginTop: 12, color: '#aeb3b5e0', fontSize: 11 }}>
//         Showing {filtered.length} of {tasks.length} tasks
//       </div>
//     </div>
//   )
// }

// // TaskTable.jsx
// import { useState, useMemo, Fragment } from 'react'
// import { useAuth } from './useAuth'
// import { computeStatus, computeProjectHealth, STATUS_COLOR, STATUS_BG, today } from './helpers'
// import TaskForm from './TaskForm'
// import './TaskTable.css'

// function Badge({ label, color, bg }) {
//   return (
//     <span className="badge" style={{ background: bg, color, borderColor: `${color}40` }}>
//       {label}
//     </span>
//   )
// }

// function ProgressBar({ pct }) {
//   return (
//     <div className="progress-track">
//       <div
//         className="progress-fill"
//         style={{
//           width: `${pct}%`,
//           background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
//         }}
//       />
//     </div>
//   )
// }

// export default function TaskTable({ tasks, onSave, onDelete, saving }) {
//   const { allProfiles, activeMembers } = useAuth()
//   const [search,       setSearch]       = useState('')
//   const [filterMember, setFilterMember] = useState('All')
//   const [filterStatus, setFilterStatus] = useState('All')
//   const [sortCol,      setSortCol]      = useState('startDate')
//   const [sortDir,      setSortDir]      = useState('asc')
//   const [editingId,    setEditingId]    = useState(null)

//   function toggleSort(col) {
//     if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
//     else { setSortCol(col); setSortDir('asc') }
//   }

//   function clearFilters() {
//     setSearch('')
//     setFilterMember('All')
//     setFilterStatus('All')
//   }

//   const filtered = useMemo(() => {
//     let arr = tasks.filter(t => {
//       const s = computeStatus(t)
//       return (filterMember === 'All' || t.itName === filterMember)
//         && (filterStatus === 'All' || s === filterStatus)
//         && (t.project.toLowerCase().includes(search.toLowerCase())
//           || t.itName.toLowerCase().includes(search.toLowerCase()))
//     })
//     arr = [...arr].sort((a, b) => {
//       const av = a[sortCol] ?? ''
//       const bv = b[sortCol] ?? ''
//       return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
//     })
//     return arr
//   }, [tasks, search, filterMember, filterStatus, sortCol, sortDir])

//   function Th({ col, label }) {
//     const active = sortCol === col
//     return (
//       <th
//         className={`th ${active ? 'th--active' : ''}`}
//         onClick={() => toggleSort(col)}
//       >
//         {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
//       </th>
//     )
//   }

//   return (
//     <div>
//       {/* ── Filter bar ── */}
//       <div className="table-filters">
//         <input
//           className="table-filter-input"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           placeholder="🔍  Search project or member…"
//         />
//         {/* <select
//           className="table-filter-select"
//           value={filterMember}
//           onChange={e => setFilterMember(e.target.value)}
//         >
//           <option>Select IT member...</option>
//           {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
//         </select> */}
//         <select
//           className="table-filter-select"
//           value={filterMember}
//           onChange={e => setFilterMember(e.target.value)}
//         >
//           <option value="All">All IT Members</option>

//           {activeMembers.map(member => (
//             <option key={member.id} value={member.it_name}>
//               {member.it_name}
//             </option>
//           ))}
//         </select>
//         <select
//           className="table-filter-select"
//           value={filterStatus}
//           onChange={e => setFilterStatus(e.target.value)}
//         >
//           <option>Select status...</option>
//           {['In Progress', 'Upcoming', 'Delayed', 'On Hold', 'UAT', 'Completed']
//             .map(s => <option key={s}>{s}</option>)}
//         </select>
//         {(search || filterMember !== 'All' || filterStatus !== 'All') && (
//           <button className="table-filter-clear" onClick={clearFilters}>Clear</button>
//         )}
//       </div>

//       {/* ── Table ── */}
//       <div className="table-scroll">
//         <table className="task-table">
//           <thead>
//             <tr>
//               <Th col="itName"      label="Member"   />
//               <Th col="project"     label="Project"  />
//               <th className="th--static">Health</th>
//               <Th col="manday"      label="Manday"   />
//               <Th col="startDate"   label="Start"    />
//               <Th col="endDate"     label="End"      />
//               <th className="th--static th--progress">Progress</th>
//               <th className="th--static">Status</th>
//               <Th col="updatedDate" label="Updated"  />
//               <th className="th--static">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(t => {
//               const st        = computeStatus(t)
//               const health      = computeProjectHealth(t)
//               const memberProfile = (allProfiles || []).find(
//                 member => member.it_name === t.itName
//               )

//               const isInactive = memberProfile?.status === 'inactive'
//               const isDelayed = st === 'Delayed'
//               const overdue   = today > t.endDate && st !== 'Completed'
//               const isEditing = editingId === t.id

//               const rowClass = [
//                 'task-row',
//                 isDelayed  ? 'task-row--delayed'  : 'task-row--normal',
//                 isEditing  ? 'task-row--editing'  : '',
//               ].filter(Boolean).join(' ')

//               return (
//                 <Fragment key={t.id}>
//                   {/* ── Data row ── */}
//                   <tr
//                     className={rowClass}
//                     onMouseEnter={e => {
//                       if (!isDelayed && !isEditing)
//                         e.currentTarget.style.background = 'var(--bg-row-hover)'
//                     }}
//                     onMouseLeave={e => {
//                       if (!isDelayed && !isEditing)
//                         e.currentTarget.style.background = ''
//                     }}
//                   >
//                     {/* <td className="td">
//                       <span className="td-member">{t.itName}</span>
//                     </td> */}
//                    <td className="td">
//                     <div className="td-member">
//                       <div>{t.itName}</div>
//                       {isInactive && (
//                         <span className="td-member__inactive">
//                           Inactive
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                     <td className="td">
//                       <div className="td-project">{t.project}</div>
//                       {t.targetUAT  && <div className="td-project__uat">UAT: {t.targetUAT}</div>}
//                       {t.targetLive && <div className="td-project__live">LIVE: {t.targetLive}</div>}
//                       {isDelayed    && <div className="td-project__overdue">⚠️ OVERDUE</div>}
//                     </td>
//                   <td className="td">
//                     <Badge
//                       label={`${health.icon} ${health.label}`}
//                       color={health.color}
//                       bg={health.bg}
//                     />
//                   </td>
//                     <td className="td td-manday">{t.manday}d</td>
//                     <td className="td td-date">{t.startDate}</td>
//                     <td className="td">
//                       <span className={overdue ? 'td-date--overdue' : 'td-date--due'}>{t.endDate}</span>
//                     </td>
//                     <td className="td td-progress">
//                       <div className="td-progress__inner">
//                         <div className="td-progress__bar"><ProgressBar pct={t.progress} /></div>
//                         <span className="td-progress__pct">{t.progress}%</span>
//                       </div>
//                     </td>
//                     <td className="td">
//                       <Badge label={st} color={STATUS_COLOR[st]} bg={STATUS_BG[st]} />
//                     </td>
//                     <td className="td td-updated">{t.updatedDate}</td>
//                     <td className="td">
//                       <div className="td-actions">
//                         <button
//                           className={`btn-edit ${isEditing ? 'btn-edit--open' : ''}`}
//                           onClick={() => setEditingId(isEditing ? null : t.id)}
//                         >
//                           {isEditing ? 'Close' : 'Edit'}
//                         </button>
//                         <button className="btn-delete" onClick={() => onDelete(t.id)}>Del</button>
//                       </div>
//                     </td>
//                   </tr>

//                   {/* ── Inline edit form row ── */}
//                   {isEditing && (
//                     <tr className="task-row-edit">
//                       <td colSpan={10}>
//                         <div className="task-row-edit__inner">
//                           <TaskForm
//                             initial={t}
//                             onSave={async form => {
//                               await onSave(t.id, form)
//                               setEditingId(null)
//                             }}
//                             onCancel={() => setEditingId(null)}
//                             saving={saving}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </Fragment>
//               )
//             })}
//           </tbody>
//         </table>

//         {filtered.length === 0 && (
//           <div className="table-empty">No tasks found</div>
//         )}
//       </div>

//       <div className="table-footer">
//         Showing {filtered.length} of {tasks.length} tasks
//       </div>
//     </div>
//   )
// }

// TaskTable.jsx
import { useState, useMemo, Fragment, useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  computeStatus,
  computeProjectHealth,
  STATUS_COLOR,
  STATUS_BG,
  today,
} from './helpers'
import TaskForm from './TaskForm'
import './TaskTable.css'

const FILTER_STORAGE_KEY = 'project-tracker-task-filters'

const TASK_STATUSES = [
  'In Progress',
  'UAT',
  'On Hold',
  'Completed',
]

const SCHEDULE_HEALTH = [
  'On Track',
  'At Risk',
  'Critical',
  'Overdue',
]

function Badge({ label, color, bg }) {
  return (
    <span
      className="badge"
      style={{
        background: bg,
        color,
        borderColor: `${color}40`,
      }}
    >
      {label}
    </span>
  )
}

function ProgressBar({ pct }) {
  return (
    <div
      className="progress-fill"
      style={{
        width: `${pct}%`,
        background:
          pct === 100
            ? '#22c55e'
            : pct > 70
              ? '#3b82f6'
              : pct > 40
                ? '#f59e0b'
                : '#ef4444',
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Multi-select dropdown                                                       */
/* -------------------------------------------------------------------------- */

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  allLabel = null,
}) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false)
        setSearchValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return options

    const keyword = searchValue.toLowerCase()

    return options.filter(option =>
      option.toLowerCase().includes(keyword)
    )
  }, [options, searchValue])

  const allSelected =
    options.length > 0 &&
    selected.length === options.length

  function toggleOption(option) {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  function selectAll() {
    onChange([...options])
  }

  function clearSelection() {
    onChange([])
  }

  let displayText = label

  if (selected.length === 0) {
    displayText = allLabel || label
  } else if (allSelected) {
    displayText = allLabel || `All ${label}`
  } else if (selected.length === 1) {
    displayText = selected[0]
  } else {
    displayText = `${selected.length} selected`
  }

  return (
    <div
      className="multi-select"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`multi-select__trigger ${open ? 'multi-select__trigger--open' : ''}`}
        onClick={() => setOpen(value => !value)}
      >
        <span className="multi-select__trigger-text">
          {displayText}
        </span>

        <span className="multi-select__arrow">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="multi-select__menu">
          {searchable && (
            <div className="multi-select__search">
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search member..."
                autoFocus
              />
            </div>
          )}

          {allLabel && (
            <label className="multi-select__option multi-select__option--all">
              <input
                type="checkbox"
                checked={allSelected || selected.length === 0}
                onChange={() => {
                  if (allSelected || selected.length === 0) {
                    clearSelection()
                  } else {
                    selectAll()
                  }
                }}
              />

              <span>{allLabel}</span>
            </label>
          )}

          <div className="multi-select__options">
            {filteredOptions.length === 0 ? (
              <div className="multi-select__empty">
                No options found
              </div>
            ) : (
              filteredOptions.map(option => (
                <label
                  key={option}
                  className="multi-select__option"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                  />

                  <span>{option}</span>
                </label>
              ))
            )}
          </div>

          {selected.length > 0 && !allSelected && (
            <div className="multi-select__footer">
              <button
                type="button"
                onClick={clearSelection}
              >
                Clear
              </button>

              <button
                type="button"
                onClick={selectAll}
              >
                Select All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function TaskTable({
  tasks,
  onSave,
  onDelete,
  saving,
}) {
  const { allProfiles, activeMembers } = useAuth()

  const [search, setSearch] = useState('')

  const [filterMembers, setFilterMembers] = useState([])

  const [filterStatuses, setFilterStatuses] = useState([])

  const [filterHealth, setFilterHealth] = useState([])

  const [sortCol, setSortCol] = useState('startDate')
  const [sortDir, setSortDir] = useState('asc')

  const [editingId, setEditingId] = useState(null)

  /* ------------------------------------------------------------------------ */
  /* Restore filters from localStorage                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY)

      if (!saved) return

      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed.members)) {
        setFilterMembers(parsed.members)
      }

      if (Array.isArray(parsed.statuses)) {
        setFilterStatuses(parsed.statuses)
      }

      if (Array.isArray(parsed.health)) {
        setFilterHealth(parsed.health)
      }

      if (typeof parsed.search === 'string') {
        setSearch(parsed.search)
      }
    } catch (error) {
      console.error(
        'Unable to restore task filters:',
        error
      )
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Save filters                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    try {
      localStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({
          members: filterMembers,
          statuses: filterStatuses,
          health: filterHealth,
          search,
        })
      )
    } catch (error) {
      console.error(
        'Unable to save task filters:',
        error
      )
    }
  }, [
    filterMembers,
    filterStatuses,
    filterHealth,
    search,
  ])

  /* ------------------------------------------------------------------------ */
  /* Active members from DB                                                   */
  /* ------------------------------------------------------------------------ */

  const memberOptions = useMemo(() => {
    return (activeMembers || [])
      .filter(
        member =>
          member.role === 'it_user' &&
          member.status === 'active' &&
          member.it_name
      )
      .map(member => member.it_name)
      .filter(
        (name, index, array) =>
          array.indexOf(name) === index
      )
      .sort((a, b) => a.localeCompare(b))
  }, [activeMembers])

  /* ------------------------------------------------------------------------ */
  /* Remove inactive members from persisted member filters                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!memberOptions.length) return

    setFilterMembers(current =>
      current.filter(member =>
        memberOptions.includes(member)
      )
    )
  }, [memberOptions])

  /* ------------------------------------------------------------------------ */
  /* Sorting                                                                   */
  /* ------------------------------------------------------------------------ */

  function toggleSort(col) {
    if (sortCol === col) {
      setSortDir(d =>
        d === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Clear all filters                                                         */
  /* ------------------------------------------------------------------------ */

  function clearFilters() {
    setSearch('')
    setFilterMembers([])
    setFilterStatuses([])
    setFilterHealth([])

    try {
      localStorage.removeItem(FILTER_STORAGE_KEY)
    } catch (error) {
      console.error(
        'Unable to clear saved filters:',
        error
      )
    }
  }

  const hasFilters =
    search.trim() !== '' ||
    filterMembers.length > 0 ||
    filterStatuses.length > 0 ||
    filterHealth.length > 0

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                 */
  /* ------------------------------------------------------------------------ */

  const filtered = useMemo(() => {
    let arr = tasks.filter(t => {
      const status = computeStatus(t)
      const health = computeProjectHealth(t)
      // console.log('PROJECT HEALTH DEBUG', {
      //   project: t.project,
      //   startDate: t.startDate,
      //   endDate: t.endDate,
      //   today,
      //   actualProgress: t.progress,
      //   expectedProgress: health.expectedProgress,
      //   performanceRatio: health.performanceRatio,
      //   health: health.label,
      // })

      /*
       * Search
       * --------------------------------------------------------------
       * Search project OR member.
       */
      const matchesSearch =
        !search.trim() ||
        t.project
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        t.itName
          ?.toLowerCase()
          .includes(search.toLowerCase())

      /*
       * Member filter
       * --------------------------------------------------------------
       * OR between selected members.
       *
       * No selection = All Members.
       */
      const matchesMember =
        filterMembers.length === 0 ||
        filterMembers.includes(t.itName)

      /*
       * Status filter
       * --------------------------------------------------------------
       * OR between selected statuses.
       *
       * No selection = All statuses.
       */
      const matchesStatus =
        filterStatuses.length === 0 ||
        filterStatuses.includes(status)

      /*
       * Schedule health filter
       * --------------------------------------------------------------
       * OR between selected health values.
       *
       * No selection = All health states.
       */
      const matchesHealth =
        filterHealth.length === 0 ||
        filterHealth.includes(health.label)

      /*
       * AND between filter groups.
       */
      return (
        matchesSearch &&
        matchesMember &&
        matchesStatus &&
        matchesHealth
      )
    })

    arr = [...arr].sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''

      if (av === bv) return 0

      return sortDir === 'asc'
        ? av < bv
          ? -1
          : 1
        : av > bv
          ? -1
          : 1
    })

    return arr
  }, [
    tasks,
    search,
    filterMembers,
    filterStatuses,
    filterHealth,
    sortCol,
    sortDir,
  ])

  /* ------------------------------------------------------------------------ */
  /* Table header                                                              */
  /* ------------------------------------------------------------------------ */

  function Th({ col, label }) {
    const active = sortCol === col

    return (
      <th
        className={`th ${
          active ? 'th--active' : ''
        }`}
        onClick={() => toggleSort(col)}
      >
        {label}{' '}
        {active
          ? sortDir === 'asc'
            ? '↑'
            : '↓'
          : ''}
      </th>
    )
  }

  return (
    <div className="task-table-wrapper">

      {/* ------------------------------------------------------------------ */}
      {/* Filter bar                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="table-filter-bar">

        {/* Search */}
        <input
          className="table-filter-input"
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
          placeholder="🔍 Search project or member..."
        />

        {/* Member */}
        <MultiSelectDropdown
          label="Members"
          allLabel="All Members"
          options={memberOptions}
          selected={filterMembers}
          onChange={setFilterMembers}
          searchable
        />

        {/* Task Status */}
        <MultiSelectDropdown
          label="Task Status"
          options={TASK_STATUSES}
          selected={filterStatuses}
          onChange={setFilterStatuses}
        />

        {/* Schedule Health */}
        <MultiSelectDropdown
          label="Schedule Health"
          options={SCHEDULE_HEALTH}
          selected={filterHealth}
          onChange={setFilterHealth}
        />

        {/* Clear All */}
        {hasFilters && (
          <button
            className="table-filter-clear"
            onClick={clearFilters}
          >
            Clear All
          </button>
        )}

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Result count                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="table-filter-results">
        Showing{' '}
        <strong>{filtered.length}</strong>{' '}
        of{' '}
        <strong>{tasks.length}</strong>{' '}
        tasks
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="table-scroll">
        <table className="task-table">

          <thead>
            <tr>
              <Th col="itName" label="Member" />
              <Th col="project" label="Project" />

              <th className="th--static">
                Health
              </th>

              <Th col="manday" label="Manday" />
              <Th col="startDate" label="Start" />
              <Th col="endDate" label="End" />

              <th className="th--static th--progress">
                Progress
              </th>

              <th className="th--static">
                Status
              </th>

              <Th
                col="updatedDate"
                label="Updated"
              />

              <th className="th--static">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(t => {
              const st = computeStatus(t)
              const health =
                computeProjectHealth(t)

              const memberProfile =
                (allProfiles || []).find(
                  member =>
                    member.it_name === t.itName
                )

              const isInactive =
                memberProfile?.status ===
                'inactive'

              const isDelayed =
                st === 'Delayed'

              const overdue =
                today > t.endDate &&
                st !== 'Completed'

              const isEditing =
                editingId === t.id

              const rowClass = [
                'task-row',
                isDelayed
                  ? 'task-row--delayed'
                  : 'task-row--normal',
                isEditing
                  ? 'task-row--editing'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <Fragment key={t.id}>

                  {/* Data row */}
                  <tr
                    className={rowClass}
                    onMouseEnter={e => {
                      if (
                        !isDelayed &&
                        !isEditing
                      ) {
                        e.currentTarget.style.background =
                          'var(--bg-row-hover)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (
                        !isDelayed &&
                        !isEditing
                      ) {
                        e.currentTarget.style.background =
                          ''
                      }
                    }}
                  >

                    {/* Member */}
                    <td className="td">
                      <div className="td-member">

                        <div>
                          {t.itName}
                        </div>

                        {isInactive && (
                          <span className="td-member__inactive">
                            Inactive
                          </span>
                        )}

                      </div>
                    </td>

                    {/* Project */}
                    <td className="td">
                      <div className="td-project">
                        {t.project}
                      </div>

                      {t.targetUAT && (
                        <div className="td-project__uat">
                          UAT: {t.targetUAT}
                        </div>
                      )}

                      {t.targetLive && (
                        <div className="td-project__live">
                          LIVE: {t.targetLive}
                        </div>
                      )}

                      {isDelayed && (
                        <div className="td-project__overdue">
                          ⚠️ OVERDUE
                        </div>
                      )}
                    </td>

                    {/* Health */}
                    <td className="td">
                      <Badge
                        label={`${health.icon} ${health.label}`}
                        color={health.color}
                        bg={health.bg}
                      />
                    </td>

                    {/* Manday */}
                    <td className="td td-manday">
                      {t.manday}d
                    </td>

                    {/* Start */}
                    <td className="td td-date">
                      {t.startDate}
                    </td>

                    {/* End */}
                    <td className="td">
                      <span
                        className={
                          overdue
                            ? 'td-date--overdue'
                            : 'td-date--due'
                        }
                      >
                        {t.endDate}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="td td-progress">
                      <div className="td-progress__inner">
                        <div className="td-progress__bar">
                          <ProgressBar
                            pct={t.progress}
                          />
                        </div>

                        <span className="td-progress__pct">
                          {t.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="td">
                      <Badge
                        label={st}
                        color={STATUS_COLOR[st]}
                        bg={STATUS_BG[st]}
                      />
                    </td>

                    {/* Updated */}
                    <td className="td td-updated">
                      {t.updatedDate}
                    </td>

                    {/* Actions */}
                    <td className="td">
                      <div className="td-actions">

                        <button
                          className={`btn-edit ${
                            isEditing
                              ? 'btn-edit--open'
                              : ''
                          }`}
                          onClick={() =>
                            setEditingId(
                              isEditing
                                ? null
                                : t.id
                            )
                          }
                        >
                          {isEditing
                            ? 'Close'
                            : 'Edit'}
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() =>
                            onDelete(t.id)
                          }
                        >
                          Del
                        </button>

                      </div>
                    </td>

                  </tr>

                  {/* Inline edit form */}
                  {isEditing && (
                    <tr className="task-row-edit">
                      <td colSpan={10}>
                        <div className="task-row-edit__inner">
                          <TaskForm
                            initial={t}
                            onSave={async form => {
                              await onSave(
                                t.id,
                                form
                              )
                              setEditingId(null)
                            }}
                            onCancel={() =>
                              setEditingId(null)
                            }
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
          <div className="table-empty">
            No tasks found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="table-footer">
        Showing {filtered.length} of {tasks.length} tasks
      </div>

    </div>
  )
}