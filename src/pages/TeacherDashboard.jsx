import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOD_COLORS = [
  null,
  { border:'#1D9E75', bg:'#E1F5EE', text:'#085041' },
  { border:'#378ADD', bg:'#E6F1FB', text:'#0C447C' },
  { border:'#7F77DD', bg:'#EEEDFE', text:'#3C3489' },
  { border:'#D85A30', bg:'#FAECE7', text:'#712B13' },
]

export default function TeacherDashboard({ profile, navigate }) {
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [outputs, setOutputs] = useState([])
  const [open, setOpen] = useState(1)

  useEffect(() => {
    supabase.from('modules').select('*').order('number').then(({data}) => setModules(data||[]))
    supabase.from('lessons').select('*').order('week').then(({data}) => setLessons(data||[]))
    supabase.from('student_outputs').select('*').order('created_at',{ascending:false}).limit(20).then(({data}) => setOutputs(data||[]))
  }, [])

  const pending = outputs.filter(o => !o.reviewed_at).length

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:500, color:'#111' }}>English Platform</p>
          <p style={{ margin:0, fontSize:12, color:'#888' }}>{profile.name}</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {pending > 0 && (
            <button onClick={() => navigate('review')} style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:'0.5px solid #BA7517', background:'#FAEEDA', cursor:'pointer', color:'#633806', fontWeight:500 }}>
              {pending} output{pending>1?'s':''} para revisar
            </button>
          )}
          <button onClick={() => supabase.auth.signOut()} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Sair</button>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'20px 16px' }}>
        <h2 style={{ fontSize:20, fontWeight:500, color:'#111', margin:'0 0 4px' }}>Plano de Aulas</h2>
        <p style={{ fontSize:13, color:'#888', margin:'0 0 20px' }}>Danilelly · 22 semanas · Evolve 2, 3 & 4</p>

        {modules.map(mod => {
          const mc = MOD_COLORS[mod.number] || MOD_COLORS[1]
          const modLessons = lessons.filter(l => l.module_id === mod.id)
          const isOpen = open === mod.id
          return (
            <div key={mod.id} style={{ background:'#fff', borderRadius:12, border:'0.5px solid #e5e5e5', marginBottom:10, overflow:'hidden' }}>
              <div onClick={() => setOpen(isOpen?null:mod.id)}
                style={{ padding:'14px 16px', background:isOpen?mc.bg:'#fff', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:mc.border }}>{mod.title}</span>
                    <span style={{ fontSize:11, background:mc.border, color:'#fff', padding:'2px 8px', borderRadius:20 }}>{mod.cefr}</span>
                  </div>
                  <p style={{ margin:0, fontSize:15, fontWeight:500, color:mc.text }}>{mod.subtitle}</p>
                  <p style={{ margin:0, fontSize:12, color:'#888' }}>Semanas {mod.weeks_start}–{mod.weeks_end}</p>
                </div>
                <span style={{ color:'#aaa' }}>{isOpen?'▲':'▼'}</span>
              </div>
              {isOpen && (
                <div style={{ padding:'8px 12px' }}>
                  {modLessons.map(lesson => (
                    <div key={lesson.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', borderRadius:8, marginBottom:4, background:'#fafaf9', border:'0.5px solid #efefef' }}>
                      <div>
                        <span style={{ fontSize:11, color:'#aaa', marginRight:8 }}>Sem. {lesson.week}</span>
                        <span style={{ fontSize:13, fontWeight:500, color:'#111' }}>"{lesson.theme}"</span>
                        <p style={{ margin:'2px 0 0', fontSize:12, color:'#888' }}>{lesson.focus}</p>
                      </div>
                      <button onClick={() => navigate('lesson', lesson)}
                        style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:`0.5px solid ${mc.border}`, background:mc.bg, color:mc.text, cursor:'pointer', fontWeight:500 }}>
                        {lesson.week === 1 ? 'Abrir aula →' : 'Em breve'}
                      </button>
                    </div>
                  ))}
                  {modLessons.length === 0 && <p style={{ fontSize:13, color:'#aaa', padding:'8px 10px', margin:0 }}>Conteúdo em breve</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
