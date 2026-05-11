import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentHome({ profile, navigate }) {
  const [session, setSession] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [outputs, setOutputs] = useState([])
  const [allLessons, setAllLessons] = useState([])

  useEffect(() => {
    const { data: { user: u } } = supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      // Get active session for this student
      supabase.from('lesson_sessions').select('*, lessons(*)').eq('student_id', user.id).eq('is_active', true).maybeSingle()
        .then(({ data }) => {
          if (data) { setSession(data); setLesson(data.lessons) }
        })
      // Get outputs
      supabase.from('student_outputs').select('*, lessons(theme, week)').eq('student_id', user.id).order('created_at', { ascending: false }).limit(10)
        .then(({ data }) => setOutputs(data || []))
      // Get all lessons
      supabase.from('lessons').select('*, modules(title, color_bg, color_border, color_text)').order('week')
        .then(({ data }) => setAllLessons(data || []))
    })
  }, [])

  const signOut = () => supabase.auth.signOut()

  const pendingOutput = lesson && !outputs.find(o => o.lesson_id === lesson.id && o.type === 'recording')

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ margin:0, fontSize:16, fontWeight:500, color:'#111' }}>Olá, {profile.name} 👋</p>
          <p style={{ margin:0, fontSize:12, color:'#888' }}>Seu programa de inglês</p>
        </div>
        <button onClick={signOut} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Sair</button>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'20px 16px' }}>

        {/* Active lesson / output task */}
        {pendingOutput && (
          <div style={{ background:'#E1F5EE', border:'1.5px solid #1D9E75', borderRadius:12, padding:'16px', marginBottom:16 }}>
            <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:500, color:'#0F6E56', textTransform:'uppercase', letterSpacing:'0.05em' }}>Tarefa de hoje</p>
            <p style={{ margin:'0 0 12px', fontSize:17, fontWeight:500, color:'#085041' }}>"{lesson.theme}"</p>
            <p style={{ margin:'0 0 14px', fontSize:13, color:'#0F6E56' }}>Grave 60–90 segundos em inglês sobre o tema da aula. Não precisa ser perfeito — só fale!</p>
            <button onClick={() => navigate('output', lesson)}
              style={{ fontSize:14, padding:'10px 20px', borderRadius:8, border:'none', background:'#1D9E75', color:'#fff', cursor:'pointer', fontWeight:500 }}>
              Fazer output agora →
            </button>
          </div>
        )}

        {!session && (
          <div style={{ background:'#fff', border:'0.5px solid #e5e5e5', borderRadius:12, padding:'16px', marginBottom:16, textAlign:'center' }}>
            <p style={{ fontSize:14, color:'#888', margin:0 }}>Nenhuma aula ativa no momento. Aguarde seu professor iniciar a próxima sessão.</p>
          </div>
        )}

        {/* Recent outputs */}
        {outputs.length > 0 && (
          <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #e5e5e5', marginBottom:16, overflow:'hidden' }}>
            <div style={{ padding:'12px 14px', borderBottom:'0.5px solid #f0f0f0' }}>
              <p style={{ margin:0, fontSize:14, fontWeight:500, color:'#111' }}>Seus outputs recentes</p>
            </div>
            {outputs.map(o => (
              <div key={o.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'0.5px solid #f9f9f9' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background: o.type==='recording'?'#E1F5EE':'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:14 }}>{o.type==='recording'?'🎤':'✓'}</span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:500, color:'#111' }}>{o.lessons?.theme || 'Aula'}</p>
                  <p style={{ margin:0, fontSize:12, color:'#888' }}>Semana {o.lessons?.week} · {o.type}</p>
                </div>
                {o.teacher_comment && (
                  <div style={{ fontSize:11, background:'#FAEEDA', color:'#633806', padding:'3px 8px', borderRadius:20 }}>comentário</div>
                )}
                {!o.reviewed_at && (
                  <div style={{ fontSize:11, background:'#f0f0f0', color:'#888', padding:'3px 8px', borderRadius:20 }}>aguardando</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress overview */}
        <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #e5e5e5', padding:'14px', marginBottom:16 }}>
          <p style={{ margin:'0 0 10px', fontSize:14, fontWeight:500, color:'#111' }}>Progresso do programa</p>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {allLessons.map(l => {
              const done = outputs.find(o => o.lesson_id === l.id)
              return (
                <div key={l.id} title={`Sem. ${l.week}: ${l.theme}`}
                  style={{ width:20, height:20, borderRadius:4, background: done ? (l.modules?.color_border || '#1D9E75') : '#f0f0f0', border: l.id === lesson?.id ? '2px solid #111' : 'none', cursor:'default' }} />
              )
            })}
          </div>
          <p style={{ margin:'8px 0 0', fontSize:12, color:'#888' }}>{outputs.length} aulas concluídas de 22</p>
        </div>

      </div>
    </div>
  )
}
