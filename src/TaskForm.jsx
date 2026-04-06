//TaskForm.jsx
// 

// TaskForm.jsx
import { useState, useEffect } from 'react'
import { IT_MEMBERS, addWorkdays, computeStatus, STATUS_COLOR, STATUS_BG, today } from './helpers'
import './TaskForm.css'

function Badge({ label, color, bg }) {
  return (
    <span className="badge" style={{ background: bg, color, borderColor: `${color}40` }}>
      {label}
    </span>
  )
}

function ProgressBar({ pct }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          background: pct === 100 ? '#22c55e' : pct > 70 ? '#3b82f6' : pct > 40 ? '#f59e0b' : '#ef4444',
        }}
      />
    </div>
  )
}

const blank = {
  itName: '', project: '', manday: '', al: [], startDate: '',
  endDate: '', progress: 0, status: 'In Progress',
  updatedDate: today, targetUAT: '', targetLive: '',
}

export default function TaskForm({ onSave, initial, onCancel, saving }) {
  const [form, setForm] = useState({ ...blank, ...(initial || {}) })
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
      setForm(f => ({ ...f, status: computed }))
    }
  }, [computed, isManualStatus])

  useEffect(() => {
    if (Number(form.progress) === 100) {
      setIsManualStatus(false)
      setForm(f => ({ ...f, status: 'Completed' }))
    } else {
      setIsManualStatus(false)
    }
  }, [form.progress, form.startDate, form.endDate])

  function handleSubmit() {
    if (!form.itName || !form.project || !form.startDate) {
      alert('Please fill in Member, Project, and Start Date.')
      return
    }
    onSave({ ...form, updatedDate: today })
  }

  return (
    <div className="task-form">
      <style>{`input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }`}</style>

      <h3 className="task-form__title">
        {initial ? '✏️ Edit Task' : '➕ New Task'}
      </h3>

      <div className="task-form__grid">

        <div className="task-form__field">
          <label className="field-label">IT Member *</label>
          <select
            className="form-select"
            value={form.itName}
            onChange={e => set('itName', e.target.value)}
          >
            <option value="">Select member...</option>
            {IT_MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="task-form__field">
          <label className="field-label">Project / Task Name *</label>
          <input
            className="form-input"
            value={form.project}
            onChange={e => set('project', e.target.value)}
            placeholder="e.g. CRM Module v2"
          />
        </div>

        <div className="task-form__field">
          <label className="field-label">Expected Manday</label>
          <input
            className="form-input"
            type="number"
            min="0.5"
            step="0.5"
            value={form.manday}
            onChange={e => set('manday', e.target.value)}
          />
        </div>

        {/* Start Date + End Date */}
        <div className="task-form__field--pair">
          <div>
            <label className="field-label">Start Date *</label>
            <input
              className="form-input"
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">
              End Date
              <span
                className={`field-label__lock-toggle ${endLocked ? 'field-label__lock-toggle--locked' : 'field-label__lock-toggle--auto'}`}
                onClick={() => setEndLocked(l => !l)}
              >
                {endLocked ? '🔒 locked' : '🔓 auto'}
              </span>
            </label>
            <input
              className="form-input"
              type="date"
              value={form.endDate}
              onChange={e => { setEndLocked(true); set('endDate', e.target.value) }}
            />
          </div>
        </div>

        {/* Target UAT + Target LIVE */}
        <div className="task-form__field--pair">
          <div>
            <label className="field-label">
              Target UAT <span className="field-label__hint">(optional)</span>
            </label>
            <input
              className="form-input"
              type="date"
              value={form.targetUAT}
              onChange={e => set('targetUAT', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">
              Target LIVE <span className="field-label__hint">(optional)</span>
            </label>
            <input
              className="form-input"
              type="date"
              value={form.targetLive}
              onChange={e => set('targetLive', e.target.value)}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="task-form__field--full">
          <label className="field-label">Progress</label>
          <div className="progress-row">
            <input
              className="progress-row__range"
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.progress}
              onChange={e => set('progress', Number(e.target.value))}
            />
            <input
              className="progress-row__number"
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={e => {
                const val = e.target.value
                if (val === '') { set('progress', ''); return }
                set('progress', Math.min(100, Math.max(0, Number(val))))
              }}
            />
            <span className="progress-row__unit">%</span>
          </div>
          <div className="progress-bar-wrap">
            <ProgressBar pct={form.progress} />
          </div>
        </div>

        {/* Status */}
        <div className="task-form__field">
          <label className="field-label">
            Status <span className="field-label__hint">(auto or override)</span>
          </label>
          <div className="status-row-wrap">
            <select
              className="form-select status-select"
              value={form.status}
              onChange={e => {
                const val = e.target.value
                set('status', val)
                setIsManualStatus(val !== computed)
              }}
            >
              <option>In Progress</option>
              <option>On Hold</option>
              <option>UAT</option>
              <option>Upcoming</option>
              <option>Completed</option>
            </select>
            <Badge label={computed} color={STATUS_COLOR[computed]} bg={STATUS_BG[computed]} />
          </div>
        </div>

        {/* Updated Date */}
        <div className="task-form__field--full">
          <label className="field-label">Updated Date</label>
          <input className="form-input form-input--readonly" value={today} readOnly />
        </div>
      </div>

      <div className="task-form__actions">
        {onCancel && (
          <button className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        )}
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? '⏳ Saving…' : initial ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </div>
  )
}