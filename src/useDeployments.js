import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { today } from './helpers'

export function useDeployments() {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving,  setSaving]          = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('deployments')
      .select('*, deployment_tasks(task_id), rows')
      .order('deploy_date', { ascending: false })
    setDeployments(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
    const ch = supabase.channel('deploys-rt')
      .on('postgres_changes', { event:'*', schema:'public', table:'deployments' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [fetch])

  const createDeployment = useCallback(async (form) => {
    setSaving(true)
    const { data, error } = await supabase.from('deployments').insert([{
      title:       form.title,
      deploy_date: form.deployDate,
      environment: form.environment,
      notes:       form.notes || null,
      created_by:  form.createdBy || null,
      created_at:  new Date().toISOString(),
    }]).select().single()
    setSaving(false)
    if (error) return { success: false, error: error.message }
    setDeployments(d => [data, ...d])
    return { success: true, deployment: data }
  }, [])

  const linkTask = useCallback(async (deploymentId, taskId) => {
    await supabase.from('deployment_tasks').upsert([{ deployment_id: deploymentId, task_id: taskId }])
    fetch()
  }, [fetch])

  const unlinkTask = useCallback(async (deploymentId, taskId) => {
    await supabase.from('deployment_tasks').delete()
      .eq('deployment_id', deploymentId).eq('task_id', taskId)
    fetch()
  }, [fetch])

  const deleteDeployment = useCallback(async (id) => {
    await supabase.from('deployment_tasks').delete().eq('deployment_id', id)
    await supabase.from('deployments').delete().eq('id', id)
    setDeployments(d => d.filter(x => x.id !== id))
  }, [])

  // const saveDeploymentTasks = useCallback(async (deploymentId, rows) => {
  //   setSaving(true);
  //   try {
  //     for (const row of rows) {
  //       // 1. Prepare Task Data based on UI 'Row'
  //       const fl = FEEDBACK_LOGS.find(f => f.id === row.task.feedbackLogId);
  //       const projectTitle = row.task.feedbackLogId && row.task.feedbackLogId !== '__custom__'
  //         ? (fl?.label || row.task.manual || 'Untitled')
  //         : (row.task.manual || row.task.feedbackLogLabel || 'Untitled');

  //       // We create a task for each detail sub-row
  //       for (const d of row.details) {
  //         const { data: newTask, error: taskErr } = await supabase
  //           .from('tasks')
  //           .insert([{
  //             project: projectTitle,
  //             it_name: d.pic || 'Unassigned',
  //             manday: d.md || 0,
  //             start_date: today,
  //             target_live: d.liveDate,
  //             status: 'In Progress',
  //             ready_for_deployment: true
  //           }])
  //           .select()
  //           .single();

  //         if (taskErr) throw taskErr;

  //         // 2. Link to Deployment
  //         await supabase
  //           .from('deployment_tasks')
  //           .insert([{ deployment_id: deploymentId, task_id: newTask.id }]);
  //       }
  //     }
  //     fetch(); // Refresh deployment_tasks counts
  //     return { success: true };
  //   } catch (e) {
  //     console.error(e);
  //     return { success: false, error: e.message };
  //   } finally {
  //     setSaving(false);
  //   }
  // }, [fetch]);

  const saveDeploymentTasks = useCallback(async (deploymentId, rows) => {
    setSaving(true);
    try {
      // Loop through each task row defined in the UI
      for (const row of rows) {
        // Use the manual task name if provided, otherwise default to Deployment + Date
        const manualTitle = row.task?.manual || row.task?.feedbackLogLabel;
        const defaultTitle = `CRM Deployment ${row.details[0]?.liveDate || today}`;
        const finalProjectTitle = manualTitle || defaultTitle;

        // Create a separate task entry for every detail sub-row
        for (const d of row.details) {
          // Construct the task record
          const { data: newTask, error: taskErr } = await supabase
            .from('tasks')
            .insert([{
              project: finalProjectTitle,
              it_name: d.pic || 'Unassigned',
              manday: parseFloat(d.md) || 0, // Ensure numeric type
              start_date: today,
              target_live: d.liveDate || today,
              status: 'In Progress',
              ready_for_deployment: true,
              // Note: If you want to save the 'remark' to the DB, 
              // ensure your 'tasks' table has a 'notes' or 'remarks' column
            }])
            .select()
            .single();

          if (taskErr) throw taskErr;

          // 2. Explicitly link to the deployment_tasks join table
          const { error: linkErr } = await supabase
            .from('deployment_tasks')
            .insert([{ 
              deployment_id: deploymentId, 
              task_id: newTask.id 
            }]);

          if (linkErr) throw linkErr;
        }
      }
      
      await fetch(); // Force a refresh of the local deployment list
      return { success: true };
    } catch (e) {
      console.error('Save failed:', e);
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, [fetch]);
  
  // ── Save UI rows (raw JSON) to the deployments.rows column ──────────────
  const saveRows = useCallback(async (deploymentId, rows) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ rows })
        .eq('id', deploymentId)
      if (error) throw error
      // Update local state so the saved rows are immediately reflected
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

  return { deployments, loading, saving, createDeployment, linkTask, unlinkTask, deleteDeployment, saveDeploymentTasks, saveRows, refetch: fetch }
}