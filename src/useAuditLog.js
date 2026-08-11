// useAuditLog.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TABLE = 'audit_logs'
const PAGE  = 100

export function useAuditLog({ read = true } = {}) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(0)

  const fetchLogs = useCallback(async (pageNum = 0) => {
    if (!read) {
      setLogs([])
      setTotal(0)
      setLoading(false)
      return
    }

    setLoading(true)

    const from = pageNum * PAGE
    const to   = from + PAGE - 1

    const { data, count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('fetch audit logs error:', error)
      setLogs([])
      setTotal(0)
    } else {
      setLogs(data || [])
      setTotal(count || 0)
    }

    setLoading(false)
  }, [read])

  useEffect(() => {
    fetchLogs(0)

    if (!read) return undefined

    const channel = supabase
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

    return () => {
      channel.unsubscribe()
    }
  }, [fetchLogs, read])

  const log = useCallback(async ({
    actorEmail,
    actorName,
    action,
    target = '',
    detail = {},
  }) => {
    try {
      await supabase.from(TABLE).insert([{
        actor_email: actorEmail,
        actor_name: actorName,
        action,
        target,
        detail,
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
    setPage: (p) => {
      setPageState(p)
      fetchLogs(p)
    },
    refetch: () => fetchLogs(page),
    log,
  }
}
