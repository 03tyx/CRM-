import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { fromDb, toDb } from './helpers'

const TABLE = 'tasks'

export function useTasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [saving, setSaving]   = useState(false)

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from(TABLE)
        .select('*')
        .order('start_date', { ascending: true })
      if (err) throw err
      setTasks((data || []).map(fromDb))
    } catch (e) {
      console.error('fetchTasks error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchTasks])

  // ── Create ─────────────────────────────────────────────────────────────────
  const createTask = useCallback(async (form) => {
    setSaving(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from(TABLE)
        .insert([toDb(form)])
        .select()
        .single()
      if (err) throw err
      setTasks(ts => [...ts, fromDb(data)])
      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateTask = useCallback(async (id, form) => {
    setSaving(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from(TABLE)
        .update(toDb(form))
        .eq('id', id)
        .select()
        .single()
      if (err) throw err
      setTasks(ts => ts.map(t => t.id === id ? fromDb(data) : t))
      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase.from(TABLE).delete().eq('id', id)
      if (err) throw err
      setTasks(ts => ts.filter(t => t.id !== id))
      return { success: true }
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  return { tasks, loading, saving, error, createTask, updateTask, deleteTask, refetch: fetchTasks }
}
