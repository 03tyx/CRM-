//QuickAdd.jsx
import { useState } from 'react'
import { IT_MEMBERS, addWorkdays, today } from './helpers'
import { useRef, useEffect } from 'react'

const inpStyle = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
  color: '#e2e8f0', padding: '8px 10px', fontSize: 13, width: '100%',
  outline: 'none',
}
const lbl = {
  display: 'block', color: '#94a3b8', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
}

export default function QuickAdd({ onSave, saving, standalone = false }) {
  const [open, setOpen] = useState(standalone)
  const [form, setForm] = useState({
    itName: '', project: '', manday: 1, priority: 'High',
    startDate: today, endDate: addWorkdays(today, 1),
  })
  const [done, setDone] = useState(false)

  const inputRef = useRef()

  useEffect(() => {
    if (standalone) inputRef.current?.focus()
  }, [standalone])

  function set(k, v) {
    setForm(f => {
      const u = { ...f, [k]: v }
      // auto-calc end date when manday or startDate changes
      if ((k === 'manday' || k === 'startDate') && u.manday && u.startDate) {
        u.endDate = addWorkdays(u.startDate, Number(u.manday))
      }
      return u
    })
  }

  async function handleSave() {
    if (!form.itName || !form.project) return alert('Name and Project are required.')
    const res = await onSave({
      itName: form.itName,
      project: form.project,
      manday: form.manday,
      al: '',
      startDate: form.startDate,
      endDate: form.endDate,
      progress: 0,
      priority: form.priority,
      status: 'In Progress',
      updatedDate: today,
      targetUAT: '',
      targetLive: '',
    })
    if (res?.success !== false) {
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setForm({ itName: '', project: '', manday: 1, priority: 'High', startDate: today, endDate: addWorkdays(today, 1) })
        setOpen(false)
      }, 1200)
    }
  }

  return (
    <>
      {/* Floating button */}
      {!standalone && (
      <button
        onClick={() => setOpen(o => !o)}
        title="Quick Add Task"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: open ? '#334155' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          color: '#fff',
        }}>
        {open ? '✕' : '⚡'}
      </button>)}

      {/* Widget panel */}
      {(open || standalone) && (
        <div style={{
          position: 'fixed', bottom: 90, right: 28, zIndex: 200,
          width: 300,
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, fontFamily: "'Sora',sans-serif" }}>
              ⚡ Quick Task
            </span>
            <span style={{ fontSize: 10, color: '#475569' }}>Saves to Supabase</span>
          </div>

          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#22c55e', fontSize: 28 }}>✓</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={lbl}>IT Name</label>
                <select style={inpStyle} value={form.itName} onChange={e => set('itName', e.target.value)}>
                  <option value="">Select member…</option>
                  {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Project</label>
                <input ref={inputRef} style={inpStyle} value={form.project}
                  onChange={e => set('project', e.target.value)}
                  placeholder="e.g. Bug Fix #123"
                  onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Manday</label>
                  <input ref={inputRef} style={inpStyle} type="number" min="0.5" step="0.5"
                    value={form.manday} onChange={e => set('manday', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Priority</label>
                  <select style={inpStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
                    <option>High</option><option>Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>Start</label>
                  <input ref={inputRef} style={{ ...inpStyle, fontSize: 11 }} type="date"
                    value={form.startDate} onChange={e => set('startDate', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lbl}>End (auto)</label>
                  <input ref={inputRef} style={{ ...inpStyle, fontSize: 11, color: '#64748b' }} type="date"
                    value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  marginTop: 4,
                  background: saving ? '#1e3a5f' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  padding: '10px 0', fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', width: '100%',
                }}>
                {saving ? '⏳ Saving…' : '+ Save Task'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
