import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const C = { teal:'#1D9E75', tealBg:'#E1F5EE', tealDark:'#085041', blue:'#378ADD', blueBg:'#E6F1FB', blueDark:'#0C447C', purple:'#7F77DD', purpleBg:'#EEEDFE', purpleDark:'#3C3489', coral:'#D85A30', coralBg:'#FAECE7', coralDark:'#712B13' }
const MOD_COLORS = [null, {border:C.teal,bg:C.tealBg,text:C.tealDark},{border:C.blue,bg:C.blueBg,text:C.blueDark},{border:C.purple,bg:C.purpleBg,text:C.purpleDark},{border:C.coral,bg:C.coralBg,text:C.coralDark}]

const S = {
  page: { minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' },
  header: { background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  body: { maxWidth:720, margin:'0 auto', padding:'20px 16px' },
  card: { background:'#fff', borderRadius:12, border:'0.5px solid #e5e5e5', marginBottom:12, overflow:'hidden' },
  pill: (bg,color) => ({ fontSize:11, background:bg, color, padding:'2px 8px', borderRadius:20, fontWeight:500 }),
}

export default function TeacherDashboard({ profile, navigate }) {
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [outputs, setOutputs] = useState([])
  const [openMod, setOpenMod] = useState(1)

  useEffect(() => {
    supabase.from('modules').select('*').order('number').then(({data}) => setModules(data||[]))
    supabase.from('lessons').select('*').order('week').then(({data}) => setLessons(data||[]))
    supabase.from('student_outputs').select('*').order('created_at', {ascending:false}).limit(10).then(({data}) => setOutputs(data||[]))
  }, [])

  const signOut = () => supabase.auth.signOut()

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:500, color:'#111' }}>English Platform</p>
          <p style={{ margin:0, fontSize:12, color:'#888' }}>Professor — {profile.name}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => navigate('review')} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>
            Revisar outputs {outputs.filter(o=>!o.reviewed_at).length > 0 && `(${outputs.filter(o=>!o.reviewed_at).length})`}
          </button>
          <button onClick={signOut} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Sair</button>
        </div>
      </div>

      <div style={S.body}>
        <h2 style={{ fontSize:20, fontWeight:500, color:'#111', margin:'0 0 4px' }}>Plano de Aulas</h2>
        <p style={{ fontSize:13, color:'#888', margin:'0 0 20px' }}>Danilelly · 22 semanas · Evolve 2, 3 & 4</p>

        {outputs.filter(o=>!o.reviewed_at).length > 0 && (
          <div style={{ background:'#FAEEDA', border:'0.5px solid #BA7517', borderRadius:10, padding:'10px 14px', marginBottom:16, cursor:'pointer' }} onClick={() => navigate('review')}>
            <p style={{ margin:0, fontSize:13, color:'#633806', fontWeight:500 }}>
              ⏰ {outputs.filter(o=>!o.reviewed_at).length} output{outputs.filter(o=>!o.reviewed_at).length>1?'s':''} da Danilelly aguardando revisão
            </p>
          </div>
        )}

        {modules.map(mod => {
          const mc = MOD_COLORS[mod.number] || MOD_COLORS[1]
          const modLessons = lessons.filter(l => l.module_id === mod.id)
          const isOpen = openMod === mod.id
          return (
            <div key={mod.id} style={S.card}>
              <div style={{ padding:'14px 16px', background: isOpen ? mc.bg : '#fff', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: isOpen ? `0.5px solid ${mc.border}40` : 'none' }}
                onClick={() => setOpenMod(isOpen ? null : mod.id)}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:12, fontWeight:500, color:mc.border }}>{mod.title}</span>
                    <span style={S.pill(mc.border,'#fff')}>{mod.cefr}</span>
                  </div>
                  <p style={{ margin:0, fontSize:15, fontWeight:500, color:mc.text }}>{mod.subtitle}</p>
                  <p style={{ margin:0, fontSize:12, color:'#888' }}>Semanas {mod.weeks_start}–{mod.weeks_end}</p>
                </div>
                <span style={{ fontSize:16, color:'#aaa' }}>{isOpen ? '▲' : '▼'}</span>
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
                      <button
                        onClick={() => navigate('lesson', lesson)}
                        style={{ fontSize:12, padding:'6px 14px', borderRadius:8, border:`0.5px solid ${mc.border}`, background:mc.bg, color:mc.text, cursor:'pointer', fontWeight:500, whiteSpace:'nowrap' }}>
                        Abrir aula →
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
