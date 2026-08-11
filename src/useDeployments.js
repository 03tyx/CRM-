//useDeployment.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useDeployments() {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving,  setSaving]          = useState(false)

  // ── Fetch deployments (rows jsonb is stored directly on the record) ───────
  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('deployments')
      .select('*')
      .order('deploy_date', { ascending: false })
    setDeployments(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('deploys-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetch])

  // ── Create deployment ─────────────────────────────────────────────────────
  const createDeployment = useCallback(async (form) => {
    setSaving(true)
    const { data, error } = await supabase
      .from('deployments')
      .insert([{
        title:       form.title,
        deploy_date: form.deployDate,
        environment: form.environment,
        notes:       form.notes       || null,
        created_by:  form.createdBy   || null,
        created_at:  new Date().toISOString(),
        rows:        [],              // start with empty rows
      }])
      .select()
      .single()
    setSaving(false)
    if (error) return { success: false, error: error.message }
    setDeployments(d => [data, ...d])
    return { success: true, deployment: data }
  }, [])

  // ── Delete deployment ─────────────────────────────────────────────────────
  const deleteDeployment = useCallback(async (id) => {
    await supabase.from('deployments').delete().eq('id', id)
    setDeployments(d => d.filter(x => x.id !== id))
  }, [])

  // ── Save UI rows as JSON directly on the deployment record ────────────────
  const saveRows = useCallback(async (deploymentId, rows) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ rows })
        .eq('id', deploymentId)
      if (error) throw error
      setDeployments(d => d.map(dep =>
        dep.id === deploymentId ? { ...dep, rows } : dep
      ))
      return { success: true }
    } catch (e) {
      console.error('saveRows failed:', e)
      return { success: false, error: e.message }
    } finally {
      setSaving(false)
    }
  }, [])

  return { deployments, loading, saving, createDeployment, deleteDeployment, saveRows, refetch: fetch }
}