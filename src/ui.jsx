import { STATUS_COLOR, STATUS_BG, PRIORITY_COLOR } from './helpers'

export function Badge({ label, color, bg }) {
  return (
    <span style={{
      background: bg || 'rgba(255,255,255,0.08)', color: color || '#cbd5e1',
      border: `1px solid ${(color||'#334155')}40`, borderRadius: 6,
      padding: '2px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

export function StatusBadge({ status }) {
  return <Badge label={status} color={STATUS_COLOR[status]} bg={STATUS_BG[status]} />
}

export function PriorityBadge({ priority }) {
  return <Badge label={priority} color={PRIORITY_COLOR[priority]} />
}

export function ProgressBar({ pct }) {
  return (
    <div style={{ background:'#0f172a', borderRadius:99, height:6, width:'100%', overflow:'hidden' }}>
      <div style={{
        width:`${pct}%`, height:'100%', borderRadius:99, transition:'width 0.4s ease',
        background: pct===100?'#22c55e':pct>70?'#3b82f6':pct>40?'#f59e0b':'#ef4444',
      }}/>
    </div>
  )
}

export const lbl = {
  display:'block', color:'#94a3b8', fontSize:11, fontWeight:600,
  letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6,
}

export const inpStyle = {
  background:'#0f172a', border:'1px solid #334155', borderRadius:8,
  color:'#e2e8f0', padding:'8px 12px', fontSize:13, width:'100%', outline:'none',
}

export const btnPrimary = {
  background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'#fff',
  border:'none', borderRadius:8, padding:'9px 20px', fontSize:13,
  fontWeight:600, cursor:'pointer',
}

export const btnGhost = {
  background:'transparent', color:'#94a3b8', border:'1px solid #334155',
  borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:600, cursor:'pointer',
}

export const card = {
  background:'#1e293b', borderRadius:14, padding:20, border:'1px solid #334155',
}

export function SectionCard({ children, title, style={} }) {
  return (
    <div style={{ ...card, ...style }}>
      {title && <h3 style={{ color:'#f1f5f9', fontFamily:"'Sora',sans-serif",
        fontSize:14, fontWeight:700, marginBottom:14 }}>{title}</h3>}
      {children}
    </div>
  )
}
