//TaskForm.jsx
import { useState } from 'react'
import { IT_MEMBERS, addWorkdays, computeStatus, STATUS_COLOR, STATUS_BG, today } from './helpers'
import './TaskForm.css'
import { useEffect } from 'react'

const lbl = {
  display: 'block', color: '#94a3b8', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
}
const btnPrimary = {
  background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff',
  border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13,
  fontWeight: 600, cursor: 'pointer',
}
const btnGhost = {
  background: 'transparent', color: '#94a3b8', border: '1px solid #334155',
  borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
      border: `1px solid ${color || '#334155'}40`, borderRadius: 6,
      padding: '2px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 99, height: 6, width: '100%', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
        background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
      }} />
    </div>
  )
}

const blank = {
  itName: '', project: '', manday: '', al: [], startDate: '',
  endDate: '', progress: 0, status: 'In Progress',
  updatedDate: today, targetUAT: '', targetLive: '',
}

export default function TaskForm({ onSave, initial, onCancel, saving }) {
  const [form, setForm] = useState({
    ...blank,
    ...(initial || {})
  })
  const [endLocked, setEndLocked] = useState(!!initial?.endDate)

  const [isManualStatus, setIsManualStatus] = useState(!!initial?.status)

  function set(k, v) {
    setForm(f => {
      const upd = { ...f, [k]: v }
      if ((k === 'manday' || k === 'startDate' || k === 'al') && !endLocked) {
        if (upd.manday && upd.startDate) {
          upd.endDate = addWorkdays(upd.startDate, Number(upd.manday), upd.al || [])
        }
      }
      return upd
    })
  }

  const computed = computeStatus({ ...form, start_date: form.startDate, end_date: form.endDate })

  useEffect(() => {
    if (!isManualStatus) {
      setForm(f => ({
        ...f,
        status: computed
      }))
    }
  }, [computed, isManualStatus])

  useEffect(() => {
    // If progress reaches 100, force "Completed" and exit manual mode
    if (Number(form.progress) === 100) {
      setIsManualStatus(false);
      setForm(f => ({ ...f, status: 'Completed' }));
    } else {
      // If it's less than 100, we revert to auto-mode (computed)
      setIsManualStatus(false);
    }
  }, [form.progress, form.startDate, form.endDate]);

  const inp = (extra = {}) => ({
    style: {
      background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
      color: '#e2e8f0', padding: '8px 12px', fontSize: 13, width: '100%',
      outline: 'none', ...extra.style,
    }, ...extra,
  })

  function handleSubmit() {
    if (!form.itName || !form.project || !form.startDate) {
      alert('Please fill in Member, Project, and Start Date.')
      return
    }
    onSave({ ...form, updatedDate: today })
  }

  return (
    <div style={{ background: '#1e293b', borderRadius: 16, padding: 28, border: '1px solid #334155' }}>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
      <h3 style={{ color: '#f8fafc', fontFamily: "'Sora',sans-serif", marginBottom: 20, fontSize: 16, fontWeight: 700 }}>
        {initial ? '✏️ Edit Task' : '➕ New Task'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        <div>
          <label style={lbl}>IT Member *</label>
          <select {...inp()} value={form.itName} onChange={e => set('itName', e.target.value)}>
            <option value="">Select member...</option>
            {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Project / Task Name *</label>
          <input {...inp()} value={form.project} onChange={e => set('project', e.target.value)} placeholder="e.g. CRM Module v2" />
        </div>

        <div>
          <label style={lbl}>Expected Manday</label>
          <input {...inp()} type="number" min="0.5" step="0.5" value={form.manday} onChange={e => set('manday', e.target.value)} />
        </div>

        {/* Start Date + End Date on same row */}
        <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Start Date *</label>
            <input {...inp()} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>
              End Date
              <span onClick={() => setEndLocked(l => !l)} style={{
                marginLeft: 8, fontSize: 10, cursor: 'pointer', userSelect: 'none',
                color: endLocked ? '#f59e0b' : '#64748b',
              }}>
                {endLocked ? '🔒 locked' : '🔓 auto'}
              </span>
            </label>
            <input {...inp()} type="date" value={form.endDate}
              onChange={e => { setEndLocked(true); set('endDate', e.target.value) }} />
          </div>
        </div>

        {/* Target UAT + Target LIVE on same row */}
        <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Target UAT <span style={{ fontSize: 10, color: '#64748b' }}>(optional)</span></label>
            <input {...inp()} type="date" value={form.targetUAT} onChange={e => set('targetUAT', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Target LIVE <span style={{ fontSize: 10, color: '#64748b' }}>(optional)</span></label>
            <input {...inp()} type="date" value={form.targetLive} onChange={e => set('targetLive', e.target.value)} />
          </div>
        </div>

        {/* Progress — slider + number input together */}
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Progress</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min="0" max="100" step="5" value={form.progress}
              onChange={e => set('progress', Number(e.target.value))}
              style={{ flex: 1, accentColor: '#3b82f6' }} />
            <input
              type="number" min="0" max="100" step="1"
              value={form.progress}
              onChange={e => {
                const val = e.target.value
                // allow empty input
                if (val === '') {
                  set('progress', '')
                  return
                }

                const v = Math.min(100, Math.max(0, Number(val)))
                set('progress', v)
              }}
              style={{
                background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                color: '#e2e8f0', padding: '6px 10px', fontSize: 13,
                width: 68, outline: 'none', textAlign: 'center',
              }}
            />
            <span style={{ color: '#64748b', fontSize: 13 }}>%</span>
          </div>
          <div style={{ marginTop: 8 }}><ProgressBar pct={form.progress} /></div>
        </div>

        <div>
          <label style={lbl}>Status <span style={{ fontSize: 10, color: '#64748b' }}>(auto or override)</span></label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select {...inp({ style: { flex: 1 } })} value={form.status} onChange={e => {
                const val = e.target.value

                set('status', val)

                setIsManualStatus(val !== computed);

              }}>
              <option>In Progress</option>
              <option>On Hold</option>
              <option>UAT</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
            <Badge label={computed} color={STATUS_COLOR[computed]} bg={STATUS_BG[computed]} />
          </div>
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Updated Date</label>
          <input {...inp({ style: { background: '#0a1628', color: '#475569' } })} value={today} readOnly />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
        {onCancel && <button onClick={onCancel} style={btnGhost} disabled={saving}>Cancel</button>}
        <button onClick={handleSubmit} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
          {saving ? '⏳ Saving…' : initial ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </div>
  )
}
