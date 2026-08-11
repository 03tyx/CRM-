//AdminPanel.jsx
import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { computeStatus } from './helpers'
import './AdminPanel.css'

const ROLES = [
  { value: 'it_user', label: 'IT_USER' },
  { value: 'super_admin', label: 'Admin' },
]

function normalizeRole(role) {
  if (!role) return 'it_user'

  const normalized = String(role).trim().toLowerCase()

  if (
    normalized === 'super_admin' ||
    normalized === 'admin'
  ) {
    return 'super_admin'
  }

  return 'it_user'
}
const MEMBER_STATUS = ['active', 'inactive']

export default function AdminPanel({ currentUserId }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, it_name, role, status, created_at, updated_at')
      .order('email', { ascending: true })

    if (error) {
      setError(error.message)
      setMembers([])
    } else {
      // setMembers(data || [])
      setMembers(
        (data || []).map(member => ({
          ...member,
          role: normalizeRole(member.role),
        }))
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function countActiveTasks(displayName) {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, status, progress, end_date, start_date')
      .eq('it_name', displayName)

    if (error) throw error

    return (data || []).filter(task => computeStatus(task) !== 'Completed').length
  }

  async function updateMember(member, patch) {
    if (member.id === currentUserId && Object.prototype.hasOwnProperty.call(patch, 'role')) {
      setError('Super admins cannot change their own role from this screen.')
      return
    }

    if (patch.status === 'inactive') {
      const activeCount = await countActiveTasks(member.it_name || member.email)
      if (activeCount > 0) {
        setError(`This member currently has ${activeCount} active tasks. Please reassign the tasks before deactivating the member.`)
        return
      }
    }

    setSavingId(member.id)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', member.id)
      .select('id, email, it_name, role, status, created_at, updated_at')
      .single()

    if (error) {
      setError(error.message)
    } else {
      // setMembers(list => list.map(row => row.id === member.id ? data : row))
      setMembers(list =>
        list.map(row =>
          row.id === member.id
            ? {
                ...data,
                role: normalizeRole(data.role),
              }
            : row
        )
      )
    }

    setSavingId(null)
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <h2 className="admin-panel__title">Super Admin</h2>
          <p className="admin-panel__subtitle">Manage IT user roles and access.</p>
        </div>
        <button className="btn-primary" onClick={fetchMembers} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="state-error">{error}</div>}

      <div className="admin-panel__table-wrap">
        <table className="admin-panel__table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Access</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="admin-panel__empty">Loading members...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan="5" className="admin-panel__empty">No profiles found.</td></tr>
            ) : members.map(member => {
              const saving = savingId === member.id
              const isSelf = member.id === currentUserId
              
              return (
                <tr key={member.id}>
                  <td>
                    <div className="admin-panel__member-name">{member.it_name || member.email}</div>
                    <div className="admin-panel__member-email">{member.email}</div>
                  </td>
                  <td>
                    {/* <select
                      className="admin-panel__select"
                      value={member.role}
                      disabled={saving || isSelf}
                      onChange={e => updateMember(member, { role: e.target.value })}
                    >
                      {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select> */}
                    <select
                      className="admin-panel__select"
                      value={normalizeRole(member.role)}
                      disabled={saving || isSelf}
                      onChange={e =>
                        updateMember(member, { role: e.target.value })
                      }
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="admin-panel__select"
                      value={member.status || 'active'}
                      disabled={saving || isSelf}
                      onChange={e => updateMember(member, { status: e.target.value })}
                    >
                      {MEMBER_STATUS.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{member.status === 'active' ? 'Enabled' : 'Disabled'}</td>
                  <td>{member.updated_at ? new Date(member.updated_at).toLocaleString() : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


