//useTasks.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { fromDb, toDb } from './helpers'

const TABLE = 'tasks'
const SUBTASKS_TABLE = 'subtasks'
const LOGS_TABLE = 'task_logs'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // ── Fetch Tasks ─────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      setTasks((data || []).map(fromDb))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch Subtasks ──────────────────────────────────────
  const fetchSubtasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from(SUBTASKS_TABLE)
        .select('*')

      if (error) throw error
      setSubtasks(data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  // ── Realtime ────────────────────────────────────────────
  useEffect(() => {
    fetchTasks()
    fetchSubtasks()

    const channel = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: SUBTASKS_TABLE }, fetchSubtasks)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchTasks, fetchSubtasks])

  // ── Logging ─────────────────────────────────────────────
  const logAction = useCallback(async ({
    task_id,
    action_type,
    field_name = null,
    old_value = null,
    new_value = null
  }) => {
    try {
      await supabase.from(LOGS_TABLE).insert([{
        task_id,
        action_type,
        field_name,
        old_value,
        new_value,
        changed_by: 'current_user'
      }])
    } catch (e) {
      console.error('log error', e)
    }
  }, [])

  // ── Parent Progress ─────────────────────────────────────
  const updateParentProgress = useCallback(async (taskId) => {
    // 🔥 IMPORTANT: fetch fresh subtasks (avoid stale state)
    const { data } = await supabase
      .from(SUBTASKS_TABLE)
      .select('*')
      .eq('task_id', taskId)

    if (!data || data.length === 0) return

    const completed = data.filter(s => s.done).length
    const progress = Math.round((completed / data.length) * 100)

    const { data: updated } = await supabase
      .from(TABLE)
      .update({ progress })
      .eq('id', taskId)
      .select()
      .single()

    setTasks(ts => ts.map(t => t.id === taskId ? fromDb(updated) : t))
  }, [])

  // ── Create Task ─────────────────────────────────────────
  const createTask = useCallback(async (form) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .insert([toDb(form)])
        .select()
        .single()

      if (error) throw error

      setTasks(ts => [...ts, fromDb(data)])

      await logAction({ task_id: data.id, action_type: 'CREATE' })

      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [logAction])

  // ── Update Task ─────────────────────────────────────────
  const updateTask = useCallback(async (id, form) => {
    setSaving(true)
    try {
      const oldTask = tasks.find(t => t.id === id)

      const { data, error } = await supabase
        .from(TABLE)
        .update(toDb(form))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTasks(ts => ts.map(t => t.id === id ? fromDb(data) : t))

      // log field changes
      Object.keys(form).forEach(key => {
        if (oldTask?.[key] !== form[key]) {
          logAction({
            task_id: id,
            action_type: 'UPDATE',
            field_name: key,
            old_value: oldTask?.[key],
            new_value: form[key]
          })
        }
      })

      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [tasks, logAction])

  // ── Delete Task ─────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    setSaving(true)
    try {
      await supabase.from(TABLE).delete().eq('id', id)

      setTasks(ts => ts.filter(t => t.id !== id))

      await logAction({ task_id: id, action_type: 'DELETE' })

      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [logAction])

  // ── Subtasks ────────────────────────────────────────────
  const createSubtask = useCallback(async (taskId, subtask) => {
    const { data, error } = await supabase
      .from(SUBTASKS_TABLE)
      .insert([{ ...subtask, task_id: taskId }])
      .select()
      .single()

    if (error) return { success: false }

    setSubtasks(st => [...st, data])

    await updateParentProgress(taskId)

    return { success: true }
  }, [updateParentProgress])

  const updateSubtask = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from(SUBTASKS_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false }

    setSubtasks(st => st.map(s => s.id === id ? data : s))

    await updateParentProgress(data.task_id)

    return { success: true }
  }, [updateParentProgress])

  const deleteSubtask = useCallback(async (id, taskId) => {
    await supabase.from(SUBTASKS_TABLE).delete().eq('id', id)

    setSubtasks(st => st.filter(s => s.id !== id))

    await updateParentProgress(taskId)

    return { success: true }
  }, [updateParentProgress])

  return {
    tasks,
    subtasks,
    loading,
    saving,
    error,

    createTask,
    updateTask,
    deleteTask,

    createSubtask,
    updateSubtask,
    deleteSubtask,

    refetch: fetchTasks
  }
}