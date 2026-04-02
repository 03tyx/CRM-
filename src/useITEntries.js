// useITEntries.js
// Stores each IT member's task rows (same structure as dep.rows in Deployment Board)
// keyed by (deployment_id, it_name). One record per member per deployment.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const TABLE = 'it_deployment_entries'

export function useITEntries() {
  const [entries,  setEntries]  = useState([])   // [{ id, deployment_id, it_name, rows }]
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from(TABLE)
      .select('*')
      .order('it_name', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const ch = supabase.channel('it-entries-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetchAll])

  // ── Get the rows for one member in one deployment ─────────────────────────
  const getRows = useCallback((deploymentId, itName) => {
    const entry = entries.find(
      e => String(e.deployment_id) === String(deploymentId) && e.it_name === itName
    )
    return entry?.rows || []
  }, [entries])  // re-creates whenever entries changes so callers always get fresh data

  // ── Save (upsert) rows for one member in one deployment ───────────────────
  const saveRows = useCallback(async (deploymentId, itName, rows) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .upsert(
          {
            deployment_id: Number(deploymentId),
            it_name:       itName,
            rows,
            updated_at:    new Date().toISOString(),
          },
          { onConflict: 'deployment_id,it_name' }
        )
        .select()
        .single()
      if (error) throw error
      setEntries(e => {
        const idx = e.findIndex(
          x => String(x.deployment_id) === String(deploymentId) && x.it_name === itName
        )
        if (idx >= 0) {
          const next = [...e]; next[idx] = data; return next
        }
        return [...e, data]
      })
      return { success: true, data }
    } catch (e) {
      console.error('saveRows failed:', e)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  return { entries, loading, saving, saveRows, refetch: fetchAll }
}