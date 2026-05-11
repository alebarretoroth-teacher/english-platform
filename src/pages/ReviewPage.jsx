import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ReviewPage({ onBack }) {
  const [outputs, setOutputs] = useState([])
  const [comment, setComment] = useState({})
  const [saving, setSaving] = useState({})

  useEffect(() => {
    supabase.from('student_outputs')
      .select('*, profiles(name), lessons(theme, week)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOutputs(data || []))
  }, [])

  async function saveComment(id) {
    setSaving(s => ({ ...s, [id]: true }))
    await supabase.from('student_outputs').update({
      teacher_comment: comment[id] || '',
      reviewed_at: new Date().toISOString()
    }).eq('id', id)
    setOutputs(prev => prev.map(o => o.id === id ? { ...o, reviewed_at: new Date().toISOString(), teacher_comment: comment[id] } : o))
    setSaving(s => ({ ...s, [id]: false }))
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const fmtSec = s => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}` : '—'

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ fontSize:13, border:'0.5px solid #ddd', background:'#fff', padding:'5px 10px', borderRadius:8, cursor:'pointer', color:'#555' }}>← Voltar</button>
        <p style={{ margin:0, fontSize:15, fontWeight:500, color:'#111' }}>Revisar outputs</p>
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'20px 16px' }}>
        {outputs.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px', color:'#888', fontSize:14 }}>
            Nenhum output enviado ainda.
          </div>
        )}

        {outputs.map(o => (
          <div key={o.id} style={{ background:'#fff', borderRadius:12, border:`0.5px solid ${o.reviewed_at?'#e5e5e5':'#1D9E75'}`, marginBottom:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 14px', borderBottom:'0.5px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center', background: o.reviewed_at ? '#fff' : '#f0fbf6' }}>
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:500, color:'#111' }}>
                  Semana {o.lessons?.week} — "{o.lessons?.theme}"
                </p>
                <p style={{ margin:0, fontSize:12, color:'#888' }}>
                  {o.profiles?.name} · {fmt(o.created_at)} · {fmtSec(o.duration_seconds)}
                </p>
              </div>
              <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background: o.reviewed_at ? '#E1F5EE' : '#FAEEDA', color: o.reviewed_at ? '#0F6E56' : '#633806' }}>
                {o.reviewed_at ? 'revisado' : 'novo'}
              </span>
            </div>

            <div style={{ padding:'12px 14px' }}>
              {o.audio_url && (
                <div style={{ marginBottom:12 }}>
                  <p style={{ fontSize:12, color:'#888', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Gravação</p>
                  <audio src={o.audio_url} controls style={{ width:'100%' }} />
                </div>
              )}

              <p style={{ fontSize:12, color:'#888', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Comentário para a aluna</p>
              <textarea
                defaultValue={o.teacher_comment || ''}
                onChange={e => setComment(c => ({ ...c, [o.id]: e.target.value }))}
                placeholder="Ex: Great storytelling! Work on the past continuous — 'I was working' not 'I worked at that moment'."
                style={{ width:'100%', minHeight:72, padding:'8px 10px', borderRadius:8, border:'0.5px solid #ddd', fontSize:13, resize:'vertical', boxSizing:'border-box', marginBottom:8, fontFamily:'system-ui' }}
              />
              <button onClick={() => saveComment(o.id)} disabled={saving[o.id]}
                style={{ fontSize:12, padding:'7px 16px', borderRadius:8, border:'none', background:saving[o.id]?'#9FE1CB':'#1D9E75', color:'#fff', cursor:'pointer' }}>
                {saving[o.id] ? 'Salvando…' : o.reviewed_at ? 'Atualizar comentário' : 'Marcar como revisado ✓'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
