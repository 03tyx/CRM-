// useAnnualLeave.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TABLE = 'annual_leave'

export function useAnnualLeave() {
  const [leaves,  setLeaves]  = useState([])   // all AL entries across all members
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from(TABLE)
      .select('*')
      .order('start_date', { ascending: true })
    setLeaves(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const ch = supabase.channel('al-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchAll])

  // ── Create ────────────────────────────────────────────────────────────────
  const createLeave = useCallback(async ({ itName, startDate, endDate, note }) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .insert([{ it_name: itName, start_date: startDate, end_date: endDate, note: note || '' }])
        .select()
        .single()
      if (error) throw error
      setLeaves(l => [...l, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
      return { success: true, data }
    } catch (e) {
      console.error('createLeave failed:', e)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  // ── Update ────────────────────────────────────────────────────────────────
  const updateLeave = useCallback(async (id, { startDate, endDate, note }) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ start_date: startDate, end_date: endDate, note: note || '', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      setLeaves(l => l.map(x => x.id === id ? data : x)
                      .sort((a, b) => a.start_date.localeCompare(b.start_date)))
      return { success: true, data }
    } catch (e) {
      console.error('updateLeave failed:', e)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteLeave = useCallback(async (id) => {
    try {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
      setLeaves(l => l.filter(x => x.id !== id))
      return { success: true }
    } catch (e) {
      console.error('deleteLeave failed:', e)
      return { success: false, error: e.message }
    }
  }, [])

  // ── Get leaves for one member ─────────────────────────────────────────────
  const leavesFor = useCallback((itName) =>
    leaves.filter(l => l.it_name === itName),
  [leaves])

  return { leaves, loading, saving, createLeave, updateLeave, deleteLeave, leavesFor, refetch: fetchAll }
}