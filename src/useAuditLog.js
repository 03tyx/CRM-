// useAuditLog.js
// Insert audit log entries + real-time subscription for the Audit tab.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TABLE = 'audit_logs'
const PAGE  = 100  // rows per page

export function useAuditLog() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(0)

  const fetchLogs = useCallback(async (pageNum = 0) => {
    setLoading(true)
    const from = pageNum * PAGE
    const to   = from + PAGE - 1

    const { data, count } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    setLogs(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogs(0)

    // Real-time: prepend new log entries as they come in
    const ch = supabase
      .channel('audit-logs-rt')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLE },
        (payload) => {
          setLogs(prev => [payload.new, ...prev].slice(0, PAGE))
          setTotal(t => t + 1)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [fetchLogs])

  // ── Log an action ─────────────────────────────────────────────────────────
  // Call this from useTasks, useDeployments, useITEntries etc.
  const log = useCallback(async ({
    actorEmail,
    actorName,
    action,
    target  = '',
    detail  = {},
  }) => {
    try {
      await supabase.from(TABLE).insert([{
        actor_email: actorEmail,
        actor_name:  actorName,
        action,
        target,
        detail,
        created_at:  new Date().toISOString(),
      }])
    } catch (e) {
      console.error('audit log failed:', e)
    }
  }, [])

  return {
    logs,
    loading,
    total,
    page,
    setPage: (p) => { setPage(p); fetchLogs(p) },
    refetch: () => fetchLogs(page),
    log,
  }
}