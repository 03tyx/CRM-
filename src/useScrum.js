// useScrum.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TABLE = 'daily_scrum'

export function useScrum(itName) {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  const fetchEntries = useCallback(async () => {
    if (!itName) return
    setLoading(true)
    const { data } = await supabase
      .from(TABLE)
      .select('*')
      .eq('it_name', itName)
      .order('scrum_date', { ascending: false })
      .limit(30)                    // last 30 entries
    setEntries(data || [])
    setLoading(false)
  }, [itName])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // ── Save (upsert) a scrum entry for a given date ──────────────────────────
  const saveEntry = useCallback(async ({ id, scrum_date, prev_day, today, next_day }) => {
    setSaving(true)
    try {
      let result
      if (id) {
        // Update existing
        const { data, error } = await supabase
          .from(TABLE)
          .update({ prev_day, today, next_day, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        result = data
        setEntries(e => e.map(x => x.id === id ? result : x))
      } else {
        // Insert new
        const { data, error } = await supabase
          .from(TABLE)
          .insert([{ it_name: itName, scrum_date, prev_day, today, next_day }])
          .select()
          .single()
        if (error) throw error
        result = data
        setEntries(e => [result, ...e])
      }
      return { success: true, data: result }
    } catch (e) {
      console.error('saveEntry failed:', e)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [itName])

  const deleteEntry = useCallback(async (id) => {
    await supabase.from(TABLE).delete().eq('id', id)
    setEntries(e => e.filter(x => x.id !== id))
  }, [])

  return { entries, loading, saving, saveEntry, deleteEntry, refetch: fetchEntries }
}