import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const STAGES = [
  { id: 'context',    label: 'Contexto',    icon: '🌍', color: '#185FA5', bg: '#E6F1FB' },
  { id: 'vocab',      label: 'Vocabulário', icon: '📝', color: '#0F6E56', bg: '#E1F5EE' },
  { id: 'grammar',    label: 'Gramática',   icon: '⚙️', color: '#534AB7', bg: '#EEEDFE' },
  { id: 'task',       label: 'Tarefa real', icon: '🎯', color: '#993C1D', bg: '#FAECE7' },
  { id: 'output',     label: 'Output',      icon: '🎤', color: '#444441', bg: '#F1EFE8' },
]

const LESSON_1 = {
  week: 1,
  theme: "Who are you today?",
  subtitle: "Talking about routines and habits",
  stages: {
    context: {
      title: "What does your day look like?",
      text: "Everyone has a routine — the things we do regularly, almost without thinking. Some people love their routines. Others find them boring. Today we're going to talk about daily life: what you do, when you do it, and how you feel about it.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      imageCaption: "A typical morning — or is it?",
      audioText: "Everyone has a routine — the things we do regularly, almost without thinking.",
      discussion: [
        "What's the first thing you do every morning?",
        "Is there anything you do every single day without fail?",
        "Do you consider yourself a 'morning person' or a 'night person'?",
      ]
    },
    vocab: {
      title: "Key vocabulary",
      words: [
        { word: "routine", phonetic: "/ruːˈtiːn/", def: "a regular way of doing things", example: "My morning routine takes about 30 minutes.", emoji: "🔄" },
        { word: "commute", phonetic: "/kəˈmjuːt/", def: "to travel regularly to work or study", example: "I commute to work by metro every day.", emoji: "🚇" },
        { word: "deal with", phonetic: "/diːl wɪð/", def: "to handle or manage something", example: "I have to deal with a lot of emails in the morning.", emoji: "📧" },
        { word: "catch up", phonetic: "/kætʃ ʌp/", def: "to do something you didn't have time for before", example: "On weekends, I catch up on sleep.", emoji: "😴" },
        { word: "tend to", phonetic: "/tend tuː/", def: "to usually do something", example: "I tend to wake up before my alarm.", emoji: "⏰" },
      ]
    },
    grammar: {
      title: "Present Simple vs. Present Continuous",
      explanation: "We use the Present Simple for habits and routines — things that happen regularly. We use the Present Continuous for temporary situations happening around now.",
      examples: [
        { simple: "I wake up at 7am.", continuous: "I'm waking up earlier this week.", note: "Permanent habit vs. temporary change" },
        { simple: "She commutes by bus.", continuous: "She's working from home this month.", note: "Regular routine vs. current situation" },
        { simple: "He tends to skip breakfast.", continuous: "He's trying to eat better lately.", note: "General tendency vs. current effort" },
      ],
      exercises: [
        { q: "I usually _____ (wake up) at 7, but this week I _____ (wake up) at 6.", a: ["wake up", "am waking up"] },
        { q: "She _____ (commute) to work every day, but today she _____ (work) from home.", a: ["commutes", "is working"] },
        { q: "They _____ (tend to) eat late, but they _____ (try) to change that.", a: ["tend to", "are trying"] },
      ]
    },
    task: {
      title: "Real task — Tell me about your routine",
      instructions: "You have 2 minutes to talk about your daily routine. Use the vocabulary and grammar from today. Try to include:",
      prompts: [
        "What time you wake up and what you do first",
        "How you commute or start your workday",
        "Something you're doing differently lately (use present continuous!)",
        "One thing you wish you could change about your routine",
      ],
      usefulPhrases: [
        "I tend to...", "I usually...", "Every morning I...",
        "Lately I've been...", "I'm currently trying to...", "I deal with... by..."
      ]
    },
    output: {
      title: "Your output — record yourself",
      instruction: "Describe your routine as if you're talking to a new friend. Don't script it — just speak naturally for 60 to 90 seconds.",
      prompt: "Tell me about a typical day in your life right now. What do you do every day? What's different lately?",
      tips: ["Don't worry about perfection", "It's okay to pause and think", "Use the vocabulary from today", "Try to speak for at least 60 seconds"]
    }
  }
}

function AudioPlayer({ text, label }) {
  const [playing, setPlaying] = useState(false)
  const uttRef = useRef(null)

  const speak = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return }
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-US'; utt.rate = 0.9
    const voices = window.speechSynthesis.getVoices()
    const eng = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'))
    if (eng) utt.voice = eng
    utt.onend = () => setPlaying(false)
    uttRef.current = utt
    window.speechSynthesis.speak(utt)
    setPlaying(true)
  }

  return (
    <button onClick={speak} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, border:`0.5px solid ${playing?'#1D9E75':'#ddd'}`, background:playing?'#E1F5EE':'#fff', cursor:'pointer', fontSize:13, color:playing?'#085041':'#555' }}>
      <span style={{ fontSize:14 }}>{playing ? '⏸' : '🔊'}</span>
      {label || (playing ? 'Pausar' : 'Ouvir')}
    </button>
  )
}

function ContextStage({ data }) {
  return (
    <div>
      <img src={data.image} alt="" style={{ width:'100%', height:200, objectFit:'cover', borderRadius:10, marginBottom:16 }} />
      <p style={{ fontSize:16, color:'#333', lineHeight:1.8, marginBottom:16 }}>{data.text}</p>
      <AudioPlayer text={data.text} label="Ouvir o texto" />
      <div style={{ marginTop:20, background:'#f5f5f3', borderRadius:10, padding:'14px 16px' }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Discuss with your teacher</p>
        {data.discussion.map((q,i) => (
          <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
            <span style={{ color:'#185FA5', fontWeight:500, flexShrink:0 }}>{i+1}.</span>
            <p style={{ fontSize:14, color:'#333', margin:0, lineHeight:1.5, fontStyle:'italic' }}>{q}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VocabStage({ data }) {
  const [active, setActive] = useState(null)
  return (
    <div style={{ display:'grid', gap:8 }}>
      {data.words.map((w,i) => (
        <div key={i} onClick={() => setActive(active===i?null:i)}
          style={{ border:`1.5px solid ${active===i?'#1D9E75':'#e5e5e5'}`, borderRadius:10, padding:'12px 14px', cursor:'pointer', background:active===i?'#f0fbf6':'#fff', transition:'all 0.15s' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>{w.emoji}</span>
              <div>
                <p style={{ margin:0, fontSize:16, fontWeight:500, color:'#111' }}>{w.word}</p>
                <p style={{ margin:0, fontSize:12, color:'#888', fontFamily:'monospace' }}>{w.phonetic}</p>
              </div>
            </div>
            <AudioPlayer text={w.word} label="" />
          </div>
          {active===i && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:'0.5px solid #e5e5e5' }}>
              <p style={{ fontSize:13, color:'#555', margin:'0 0 6px' }}>{w.def}</p>
              <p style={{ fontSize:14, color:'#333', margin:'0 0 8px', fontStyle:'italic' }}>"{w.example}"</p>
              <AudioPlayer text={w.example} label="Ouvir exemplo" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function GrammarStage({ data }) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  return (
    <div>
      <div style={{ background:'#EEEDFE', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <p style={{ fontSize:14, color:'#3C3489', lineHeight:1.7, margin:0 }}>{data.explanation}</p>
      </div>
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:12, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Examples</p>
        {data.examples.map((ex,i) => (
          <div key={i} style={{ border:'0.5px solid #e5e5e5', borderRadius:8, padding:'10px 12px', marginBottom:8 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:4 }}>
              <div style={{ background:'#f5f5f3', borderRadius:6, padding:'6px 10px' }}>
                <p style={{ fontSize:11, color:'#888', margin:'0 0 2px' }}>Present Simple</p>
                <p style={{ fontSize:13, color:'#111', margin:0, fontStyle:'italic' }}>{ex.simple}</p>
              </div>
              <div style={{ background:'#E6F1FB', borderRadius:6, padding:'6px 10px' }}>
                <p style={{ fontSize:11, color:'#185FA5', margin:'0 0 2px' }}>Present Continuous</p>
                <p style={{ fontSize:13, color:'#0C447C', margin:0, fontStyle:'italic' }}>{ex.continuous}</p>
              </div>
            </div>
            <p style={{ fontSize:12, color:'#888', margin:0 }}>{ex.note}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize:12, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>Practice</p>
      {data.exercises.map((ex,i) => {
        const parts = ex.q.split('_____')
        return (
          <div key={i} style={{ border:'0.5px solid #e5e5e5', borderRadius:8, padding:'12px', marginBottom:8 }}>
            <p style={{ fontSize:14, color:'#333', margin:'0 0 8px', lineHeight:1.7 }}>
              {parts[0]}
              <input value={answers[`${i}a`]||''} onChange={e=>setAnswers({...answers,[`${i}a`]:e.target.value})}
                style={{ width:120, padding:'2px 6px', borderRadius:4, border:`1px solid ${checked[i]?(answers[`${i}a`]?.toLowerCase().trim()===ex.a[0].toLowerCase()?'#1D9E75':'#E24B4A'):'#ccc'}`, fontSize:13, textAlign:'center', margin:'0 4px' }} />
              {parts[1]}
              {parts[2] !== undefined && <>
                <input value={answers[`${i}b`]||''} onChange={e=>setAnswers({...answers,[`${i}b`]:e.target.value})}
                  style={{ width:140, padding:'2px 6px', borderRadius:4, border:`1px solid ${checked[i]?(answers[`${i}b`]?.toLowerCase().trim()===ex.a[1].toLowerCase()?'#1D9E75':'#E24B4A'):'#ccc'}`, fontSize:13, textAlign:'center', margin:'0 4px' }} />
                {parts[2]}
              </>}
            </p>
            {!checked[i]
              ? <button onClick={()=>setChecked({...checked,[i]:true})} style={{ fontSize:12, padding:'4px 12px', borderRadius:6, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Check</button>
              : <p style={{ fontSize:12, color:'#888', margin:0 }}>Answer: <span style={{ color:'#0F6E56', fontWeight:500 }}>{ex.a.join(' / ')}</span></p>
            }
          </div>
        )
      })}
    </div>
  )
}

function TaskStage({ data }) {
  return (
    <div>
      <div style={{ background:'#FAECE7', border:'0.5px solid #D85A30', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <p style={{ fontSize:14, color:'#712B13', margin:'0 0 10px', lineHeight:1.6 }}>{data.instructions}</p>
        {data.prompts.map((p,i) => (
          <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
            <span style={{ color:'#D85A30', fontWeight:500 }}>→</span>
            <p style={{ fontSize:14, color:'#712B13', margin:0 }}>{p}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize:12, fontWeight:500, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 8px' }}>Useful phrases</p>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {data.usefulPhrases.map((p,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:4, background:'#fff', border:'0.5px solid #ddd', borderRadius:20, padding:'4px 10px' }}>
            <span style={{ fontSize:13, color:'#111', fontStyle:'italic' }}>{p}</span>
            <AudioPlayer text={p} label="" />
          </div>
        ))}
      </div>
    </div>
  )
}

function OutputStage({ data, profile }) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [sent, setSent] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr; chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(); setRecording(true); setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d+1), 1000)
    } catch { alert('Permita acesso ao microfone') }
  }

  function stop() { mediaRef.current?.stop(); clearInterval(timerRef.current); setRecording(false) }

  async function submit() {
    if (!audioBlob) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const path = `${user.id}/week1_${Date.now()}.webm`
    await supabase.storage.from('outputs').upload(path, audioBlob).catch(()=>{})
    const { data: urlData } = supabase.storage.from('outputs').getPublicUrl(path)
    await supabase.from('student_outputs').insert({
      student_id: user.id, lesson_id: 1, type: 'recording',
      audio_url: urlData?.publicUrl, duration_seconds: duration
    })
    setUploading(false); setSent(true)
  }

  if (sent) return (
    <div style={{ textAlign:'center', padding:'32px 16px' }}>
      <p style={{ fontSize:40, margin:'0 0 12px' }}>🎉</p>
      <p style={{ fontSize:18, fontWeight:500, color:'#111', margin:'0 0 8px' }}>Output enviado!</p>
      <p style={{ fontSize:14, color:'#888' }}>Sua professora vai ouvir e deixar um comentário.</p>
    </div>
  )

  return (
    <div>
      <div style={{ background:'#E1F5EE', border:'0.5px solid #1D9E75', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
        <p style={{ fontSize:15, color:'#085041', margin:0, lineHeight:1.7, fontStyle:'italic' }}>"{data.prompt}"</p>
      </div>
      <div style={{ display:'grid', gap:6, marginBottom:20 }}>
        {data.tips.map((t,i) => (
          <p key={i} style={{ fontSize:13, color:'#666', margin:0, display:'flex', gap:8 }}><span style={{ color:'#1D9E75' }}>✓</span>{t}</p>
        ))}
      </div>
      <div style={{ background:'#fff', border:'0.5px solid #e5e5e5', borderRadius:12, padding:'20px', textAlign:'center' }}>
        {!audioUrl ? (
          <>
            {recording && <p style={{ fontSize:28, fontWeight:500, color:'#E24B4A', fontVariantNumeric:'tabular-nums', margin:'0 0 12px' }}>{fmt(duration)}</p>}
            {!recording && <p style={{ fontSize:14, color:'#888', margin:'0 0 16px' }}>Toque para gravar</p>}
            <button onClick={recording ? stop : start}
              style={{ fontSize:15, padding:'13px 28px', borderRadius:50, border:'none', background:recording?'#E24B4A':'#1D9E75', color:'#fff', cursor:'pointer', fontWeight:500 }}>
              {recording ? '⏹ Parar' : '🎤 Gravar'}
            </button>
            {duration >= 90 && <p style={{ fontSize:12, color:'#1D9E75', margin:'8px 0 0' }}>Ótimo! Pode parar quando quiser.</p>}
          </>
        ) : (
          <>
            <p style={{ fontSize:13, color:'#888', margin:'0 0 10px' }}>Ouça antes de enviar — {fmt(duration)}</p>
            <audio src={audioUrl} controls style={{ width:'100%', marginBottom:14 }} />
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={() => { setAudioBlob(null); setAudioUrl(null); setDuration(0) }}
                style={{ fontSize:13, padding:'8px 16px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Regravar</button>
              <button onClick={submit} disabled={uploading}
                style={{ fontSize:13, padding:'8px 16px', borderRadius:8, border:'none', background:uploading?'#9FE1CB':'#1D9E75', color:'#fff', cursor:'pointer', fontWeight:500 }}>
                {uploading ? 'Enviando…' : 'Enviar ✓'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function LessonPage({ lesson, profile, isTeacher, sessionId, onBack }) {
  const [stage, setStage] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const L = LESSON_1

  // Teacher advances stage → sync to DB
  async function advanceStage(idx) {
    if (!isTeacher) return
    setStage(idx)
    if (sessionId) {
      await supabase.from('lesson_sessions').update({ current_segment: idx }).eq('id', sessionId)
    }
  }

  // Student subscribes to stage changes
  useEffect(() => {
    if (isTeacher || !sessionId) return
    const ch = supabase.channel(`session-${sessionId}`)
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'lesson_sessions', filter:`id=eq.${sessionId}` },
        payload => { setStage(payload.new.current_segment || 0) })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [sessionId, isTeacher])

  const stageData = L.stages[STAGES[stage].id]
  const sc = STAGES[stage]

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'12px 16px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {onBack && <button onClick={onBack} style={{ fontSize:13, border:'0.5px solid #ddd', background:'#fff', padding:'5px 10px', borderRadius:8, cursor:'pointer', color:'#555' }}>←</button>}
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:500, color:'#111' }}>Week {L.week} — {L.theme}</p>
              <p style={{ margin:0, fontSize:11, color:'#888' }}>{L.subtitle}</p>
            </div>
          </div>
          {isTeacher && <span style={{ fontSize:11, background:'#E1F5EE', color:'#0F6E56', padding:'3px 8px', borderRadius:20 }}>Você controla</span>}
          {!isTeacher && <span style={{ fontSize:11, background:'#E6F1FB', color:'#185FA5', padding:'3px 8px', borderRadius:20 }}>Ao vivo</span>}
        </div>
      </div>

      {/* Stage tabs */}
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5' }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', overflowX:'auto' }}>
          {STAGES.map((s,i) => (
            <button key={s.id}
              onClick={() => isTeacher && advanceStage(i)}
              style={{ padding:'10px 14px', border:'none', background:'transparent', borderBottom:`2px solid ${stage===i?s.color:'transparent'}`, cursor:isTeacher?'pointer':'default', fontSize:13, fontWeight:stage===i?500:400, color:stage===i?s.color:'#888', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, opacity: i > stage && !isTeacher ? 0.4 : 1 }}>
              <span>{s.icon}</span>{s.label}
              {i < stage && <span style={{ fontSize:10, color:'#1D9E75' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'20px 16px' }}>
        <div style={{ background:sc.bg, borderRadius:8, padding:'8px 14px', marginBottom:16, display:'inline-flex', alignItems:'center', gap:6 }}>
          <span>{sc.icon}</span>
          <p style={{ margin:0, fontSize:13, fontWeight:500, color:sc.color }}>{stageData?.title || sc.label}</p>
        </div>

        {STAGES[stage].id === 'context' && <ContextStage data={stageData} />}
        {STAGES[stage].id === 'vocab' && <VocabStage data={stageData} />}
        {STAGES[stage].id === 'grammar' && <GrammarStage data={stageData} />}
        {STAGES[stage].id === 'task' && <TaskStage data={stageData} />}
        {STAGES[stage].id === 'output' && <OutputStage data={stageData} profile={profile} />}

        {isTeacher && stage < STAGES.length - 1 && (
          <div style={{ marginTop:24, paddingTop:16, borderTop:'0.5px solid #e5e5e5', display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => advanceStage(stage + 1)}
              style={{ fontSize:14, padding:'10px 24px', borderRadius:8, border:'none', background:sc.color, color:'#fff', cursor:'pointer', fontWeight:500 }}>
              Avançar para {STAGES[stage+1]?.label} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
