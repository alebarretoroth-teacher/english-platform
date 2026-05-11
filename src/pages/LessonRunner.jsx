import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const BLOCK_COLORS = {
  warmup:       { border:'#BA7517', bg:'#FAEEDA', text:'#412402' },
  vocab:        { border:'#185FA5', bg:'#E6F1FB', text:'#0C447C' },
  grammar:      { border:'#534AB7', bg:'#EEEDFE', text:'#3C3489' },
  speaking:     { border:'#993C1D', bg:'#FAECE7', text:'#712B13' },
  listening:    { border:'#3B6D11', bg:'#EAF3DE', text:'#173404' },
  pronunciation:{ border:'#712B13', bg:'#FAECE7', text:'#4A1B0C' },
  recall:       { border:'#0F6E56', bg:'#E1F5EE', text:'#04342C' },
  output:       { border:'#444441', bg:'#F1EFE8', text:'#2C2C2A' },
}

function Timer({ minutes, running }) {
  const [secs, setSecs] = useState((minutes||0) * 60)
  const ref = useRef(null)
  useEffect(() => { setSecs((minutes||0)*60) }, [minutes])
  useEffect(() => {
    if (!running || !minutes) return
    ref.current = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000)
    return () => clearInterval(ref.current)
  }, [running, minutes])
  const m = Math.floor(secs/60), s = secs%60
  const pct = minutes ? Math.round((1 - secs/(minutes*60))*100) : 0
  if (!minutes) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:22, fontWeight:500, color: secs < 60 ? '#E24B4A' : '#111', fontVariantNumeric:'tabular-nums' }}>
        {m}:{String(s).padStart(2,'0')}
      </span>
      <div style={{ width:80, height:4, background:'#eee', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background: secs < 60 ? '#E24B4A' : '#1D9E75', borderRadius:2, transition:'width 1s' }} />
      </div>
    </div>
  )
}

function SegmentDetail({ seg, content }) {
  if (!content) return null
  return (
    <div style={{ padding:'0 0 8px' }}>
      {content.teacher && (
        <div style={{ background:'#f5f5f3', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
          <p style={{ fontSize:11, fontWeight:500, color:'#888', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Para você — professor</p>
          <p style={{ fontSize:13, color:'#333', margin:0, lineHeight:1.6 }}>{content.teacher}</p>
        </div>
      )}
      {content.questions && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Perguntas para fazer</p>
          {content.questions.map((q,i) => (
            <div key={i} style={{ display:'flex', gap:8, padding:'7px 10px', background:'#f9f9f7', borderRadius:8, marginBottom:4 }}>
              <span style={{ color:'#1D9E75' }}>→</span>
              <p style={{ margin:0, fontSize:13, color:'#111', fontStyle:'italic' }}>{q}</p>
            </div>
          ))}
        </div>
      )}
      {content.words && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Vocabulário-alvo</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {content.words.map((w,i) => (
              <span key={i} style={{ fontSize:13, padding:'4px 10px', background:'#E6F1FB', color:'#0C447C', borderRadius:20, fontWeight:500 }}>{w}</span>
            ))}
          </div>
        </div>
      )}
      {content.resource && (
        <div style={{ border:'0.5px solid #ddd', borderRadius:8, padding:'9px 11px', marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 2px' }}>Recurso</p>
          <p style={{ fontSize:13, fontWeight:500, color:'#111', margin:0 }}>{content.resource}</p>
        </div>
      )}
      {content.activity && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Passo a passo</p>
          {content.activity.map((a,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:4, alignItems:'flex-start' }}>
              <span style={{ fontSize:11, background:'#E6F1FB', color:'#185FA5', width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:500 }}>{i+1}</span>
              <p style={{ fontSize:13, color:'#333', margin:0, lineHeight:1.5 }}>{a}</p>
            </div>
          ))}
        </div>
      )}
      {content.examples && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Escreva no quadro</p>
          {content.examples.map((ex,i) => (
            <div key={i} style={{ border:'0.5px solid #e5e5e5', borderRadius:8, padding:'9px 11px', marginBottom:6 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:4 }}>
                <p style={{ fontSize:13, margin:0, fontStyle:'italic', color:'#111' }}>"{ex.a}"</p>
                <p style={{ fontSize:13, margin:0, fontStyle:'italic', color:'#111' }}>"{ex.b}"</p>
              </div>
              <p style={{ fontSize:12, color:'#888', margin:0 }}>{ex.note}</p>
            </div>
          ))}
        </div>
      )}
      {content.script && (
        <div style={{ background:'#f5f5f3', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Script</p>
          <p style={{ fontSize:13, color:'#111', margin:0, fontStyle:'italic', lineHeight:1.6 }}>{content.script}</p>
        </div>
      )}
      {content.activities && (
        <div style={{ marginBottom:10 }}>
          {content.activities.map((a,i) => (
            <div key={i} style={{ border:'0.5px solid #e5e5e5', borderRadius:8, padding:'10px 12px', marginBottom:6 }}>
              <p style={{ fontSize:13, fontWeight:500, color:'#111', margin:'0 0 4px' }}>{a.name}</p>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 4px', lineHeight:1.5 }}>{a.desc}</p>
              <p style={{ fontSize:12, color:'#993C1D', margin:0, fontStyle:'italic' }}>{a.example}</p>
            </div>
          ))}
        </div>
      )}
      {content.tasks && (
        <div style={{ marginBottom:10 }}>
          {Array.isArray(content.tasks) && content.tasks.map((t,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:4, alignItems:'flex-start' }}>
              {t.name ? (
                <div style={{ border:'0.5px solid #e5e5e5', borderRadius:8, padding:'9px 11px', width:'100%' }}>
                  <p style={{ fontSize:13, fontWeight:500, color:'#111', margin:'0 0 3px' }}>{t.name}</p>
                  <p style={{ fontSize:13, color:'#555', margin:'0 0 3px' }}>{t.desc}</p>
                  {t.why && <p style={{ fontSize:12, color:'#888', margin:0 }}>{t.why}</p>}
                </div>
              ) : (
                <>
                  <span style={{ fontSize:12, background:'#EAF3DE', color:'#3B6D11', width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:500, marginTop:1 }}>{i+1}</span>
                  <p style={{ fontSize:13, color:'#111', margin:0, fontStyle:'italic' }}>{t}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {content.drills && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Praticar em voz alta</p>
          {content.drills.map((d,i) => (
            <p key={i} style={{ fontSize:14, color:'#111', margin:'0 0 4px', fontFamily:'monospace' }}>{d}</p>
          ))}
        </div>
      )}
      {content.prompts && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>Perguntas rápidas</p>
          {content.prompts.map((p,i) => (
            <div key={i} style={{ display:'flex', gap:8, padding:'6px 10px', background:'#f5f5f3', borderRadius:8, marginBottom:4 }}>
              <span style={{ fontSize:12, color:'#0F6E56', fontWeight:500 }}>{i+1}.</span>
              <p style={{ fontSize:13, color:'#111', margin:0, fontStyle:'italic' }}>{p}</p>
            </div>
          ))}
        </div>
      )}
      {content.tip && (
        <div style={{ display:'flex', gap:8, padding:'8px 10px', background:'#FAEEDA', borderRadius:8 }}>
          <span style={{ fontSize:13 }}>💡</span>
          <p style={{ fontSize:13, color:'#633806', margin:0 }}>{content.tip}</p>
        </div>
      )}
    </div>
  )
}

export default function LessonRunner({ lesson, profile, onBack }) {
  const [segments, setSegments] = useState([])
  const [current, setCurrent] = useState(0)
  const [expanded, setExpanded] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.from('lesson_segments').select('*').eq('lesson_id', lesson.id).order('position')
      .then(({data}) => { setSegments(data||[]); })
  }, [lesson.id])

  useEffect(() => {
    // Create or get active session
    async function initSession() {
      const { data: { user } } = await supabase.auth.getUser()
      // Find any student profile
      const { data: students } = await supabase.from('profiles').select('id').eq('role','student').limit(1)
      const studentId = students?.[0]?.id
      if (!studentId) return
      const { data: existing } = await supabase.from('lesson_sessions')
        .select('*').eq('lesson_id', lesson.id).eq('is_active', true).maybeSingle()
      if (existing) { setSession(existing); setCurrent(existing.current_segment); return }
      const { data: newSession } = await supabase.from('lesson_sessions')
        .insert({ teacher_id: user.id, student_id: studentId, lesson_id: lesson.id, current_segment: 0 })
        .select().single()
      setSession(newSession)
    }
    initSession()
  }, [lesson.id])

  const advance = async (idx) => {
    setCurrent(idx); setExpanded(idx); setTimerRunning(true)
    if (session) {
      await supabase.from('lesson_sessions').update({ current_segment: idx }).eq('id', session.id)
    }
  }

  const endLesson = async () => {
    if (session) await supabase.from('lesson_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', session.id)
    onBack()
  }

  const seg = segments[current]
  const bc = seg ? (BLOCK_COLORS[seg.type] || BLOCK_COLORS.recall) : BLOCK_COLORS.warmup

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={onBack} style={{ fontSize:13, border:'0.5px solid #ddd', background:'#fff', padding:'5px 10px', borderRadius:8, cursor:'pointer', color:'#555' }}>← Voltar</button>
          <div>
            <p style={{ margin:0, fontSize:14, fontWeight:500, color:'#111' }}>"{lesson.theme}"</p>
            <p style={{ margin:0, fontSize:11, color:'#888' }}>Semana {lesson.week}</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {seg && <Timer key={`${current}-${timerRunning}`} minutes={seg.duration_minutes} running={timerRunning} />}
          <button onClick={endLesson} style={{ fontSize:12, padding:'6px 12px', borderRadius:8, border:'0.5px solid #E24B4A', background:'#FCEBEB', color:'#A32D2D', cursor:'pointer' }}>Encerrar aula</button>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'16px' }}>
        {/* Progress */}
        <div style={{ display:'flex', gap:4, marginBottom:16 }}>
          {segments.map((s,i) => (
            <div key={s.id} style={{ flex:1, height:4, borderRadius:2, background: i < current ? '#1D9E75' : i === current ? bc.border : '#e5e5e5' }} />
          ))}
        </div>

        {/* Segments list */}
        <div style={{ display:'grid', gap:6 }}>
          {segments.map((s, i) => {
            const color = BLOCK_COLORS[s.type] || BLOCK_COLORS.recall
            const isCurrent = i === current
            const isDone = i < current
            const isExp = expanded === i
            const content = s.content || {}
            return (
              <div key={s.id} style={{ background:'#fff', borderRadius:10, border:`${isCurrent?'1.5px':'0.5px'} solid ${isCurrent?color.border:'#e5e5e5'}`, overflow:'hidden', opacity: isDone ? 0.55 : 1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', background: isCurrent ? color.bg : '#fff' }}
                  onClick={() => setExpanded(isExp ? -1 : i)}>
                  <span style={{ fontSize:14, color: isDone ? '#1D9E75' : isCurrent ? color.border : '#ccc' }}>
                    {isDone ? '✓' : isCurrent ? '▶' : '○'}
                  </span>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:isCurrent?500:400, color: isCurrent?color.text:'#111' }}>{s.label}</p>
                    <p style={{ margin:0, fontSize:12, color:'#999' }}>{content.tagline || ''}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {s.duration_minutes && <span style={{ fontSize:11, color:'#aaa' }}>{s.duration_minutes} min</span>}
                    {!isDone && i !== current && (
                      <button onClick={e => { e.stopPropagation(); advance(i) }}
                        style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:`0.5px solid ${color.border}`, background:color.bg, color:color.text, cursor:'pointer' }}>
                        {i === 0 ? 'Iniciar' : 'Avançar'}
                      </button>
                    )}
                    {isCurrent && !isDone && (
                      <button onClick={e => { e.stopPropagation(); advance(i+1) }}
                        style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:`0.5px solid ${color.border}`, background:color.border, color:'#fff', cursor:'pointer' }}>
                        Próximo →
                      </button>
                    )}
                  </div>
                </div>
                {isExp && (
                  <div style={{ padding:'0 14px 12px', borderTop:`0.5px solid ${isCurrent?color.border+'40':'#f0f0f0'}` }}>
                    <div style={{ paddingTop:12 }}>
                      <SegmentDetail seg={s} content={content} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {segments.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#888', fontSize:14 }}>
            Conteúdo desta semana em breve…
          </div>
        )}
      </div>
    </div>
  )
}
