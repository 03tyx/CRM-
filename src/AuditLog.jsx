// AuditLog.jsx
import { useState } from 'react'
import { useAuditLog } from './useAuditLog'
import './AuditLog.css'

const ACTION_COLOR = {
  CREATE_TASK:        '#22c55e',
  UPDATE_TASK:        '#3b82f6',
  DELETE_TASK:        '#ef4444',
  CREATE_DEPLOYMENT:  '#22c55e',
  SAVE_DEPLOYMENT:    '#3b82f6',
  DELETE_DEPLOYMENT:  '#ef4444',
  SAVE_IT_ENTRY:      '#8b5cf6',
  CREATE_LEAVE:       '#f59e0b',
  DELETE_LEAVE:       '#ef4444',
}

const ACTION_ICON = {
  CREATE_TASK:        '➕',
  UPDATE_TASK:        '✏️',
  DELETE_TASK:        '🗑️',
  CREATE_DEPLOYMENT:  '🚀',
  SAVE_DEPLOYMENT:    '💾',
  DELETE_DEPLOYMENT:  '🗑️',
  SAVE_IT_ENTRY:      '📋',
  CREATE_LEAVE:       '🌴',
  DELETE_LEAVE:       '🌴',
}

function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function ActionBadge({ action }) {
  const color = ACTION_COLOR[action] || '#94a3b8'
  const icon  = ACTION_ICON[action]  || '•'
  const label = action.replace(/_/g, ' ')
  return (
    <span
      className="audit-badge"
      style={{ color, background: `${color}18`, borderColor: `${color}35` }}
    >
      {icon} {label}
    </span>
  )
}

export default function AuditLog() {
  const { logs, loading, total, page, setPage } = useAuditLog()
  const [expanded, setExpanded] = useState(null)
  const [search,   setSearch]   = useState('')

  const PAGE = 100
  const totalPages = Math.max(1, Math.ceil(total / PAGE))

  const filtered = logs.filter(l =>
    !search ||
    l.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.target?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="audit-root">
      <div className="audit-header">
        <div>
          <h2 className="audit-title">🔍 Audit Log</h2>
          <p className="audit-subtitle">{total} total entries · real-time</p>
        </div>
        <input
          className="audit-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search actor, action, target…"
        />
      </div>

      {loading ? (
        <div className="audit-loading">Loading audit log…</div>
      ) : filtered.length === 0 ? (
        <div className="audit-empty">No log entries found.</div>
      ) : (
        <div className="audit-list">
          {filtered.map(log => (
            <div key={log.id} className="audit-row">
              <div className="audit-row__left">
                <div className="audit-row__time">{fmtTime(log.created_at)}</div>
                <div className="audit-row__actor">
                  <span className="audit-row__name">{log.actor_name || log.actor_email}</span>
                  {log.actor_name && (
                    <span className="audit-row__email">{log.actor_email}</span>
                  )}
                </div>
              </div>

              <div className="audit-row__mid">
                <ActionBadge action={log.action} />
                {log.target && (
                  <span className="audit-row__target">{log.target}</span>
                )}
              </div>

              <div className="audit-row__right">
                {log.detail && Object.keys(log.detail).length > 0 && (
                  <button
                    className="audit-detail-btn"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    {expanded === log.id ? '▲ Hide' : '▼ Detail'}
                  </button>
                )}
              </div>

              {expanded === log.id && log.detail && (
                <div className="audit-detail">
                  <pre>{JSON.stringify(log.detail, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="audit-pagination">
          <button
            className="audit-page-btn"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >← Prev</button>
          <span className="audit-page-info">Page {page + 1} of {totalPages}</span>
          <button
            className="audit-page-btn"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
          >Next →</button>
        </div>
      )}
    </div>
  )
}