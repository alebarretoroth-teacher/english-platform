import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PROMPTS = {
  1: "Describe your daily routine as if you're telling a friend. Use: wake up, commute, deal with, catch up.",
  2: "Tell me about something that happened this week — a good moment or a funny story.",
  3: "When you don't understand something someone said, what do you do? Describe a real situation.",
  4: "What do you usually do on weekends? What's your ideal Sunday?",
  5: "Have you ever traveled somewhere unexpected? Tell me about it.",
  6: "What are your plans for the next month? Use: going to, will, and present continuous.",
  7: "Describe the last time you ate out. What did you order? Was anything wrong?",
  8: "What technology do you use every day? What would you be lost without?",
  9: "How do you take care of your health? What do you do when you're feeling sick?",
  10: "Tell me a story that starts with: 'I was just about to leave when suddenly…'",
}

export default function StudentOutput({ lesson, profile, onBack }) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [duration, setDuration] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [activeTab, setActiveTab] = useState('record')

  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const prompt = PROMPTS[lesson.week] || `Talk for 60–90 seconds about today's theme: "${lesson.theme}". Don't script it — just speak naturally.`

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d+1), 1000)
    } catch(err) {
      alert('Não foi possível acessar o microfone. Verifique as permissões do browser.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    clearInterval(timerRef.current)
    setRecording(false)
  }

  async function submitRecording() {
    if (!audioBlob) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const fileName = `${user.id}/${lesson.id}_${Date.now()}.webm`

    // Upload to Supabase Storage
    let audioStorageUrl = null
    const { data: storageData, error: storageErr } = await supabase.storage.from('outputs').upload(fileName, audioBlob)
    if (!storageErr && storageData) {
      const { data: { publicUrl } } = supabase.storage.from('outputs').getPublicUrl(fileName)
      audioStorageUrl = publicUrl
    }

    // Save output record
    await supabase.from('student_outputs').insert({
      student_id: user.id,
      lesson_id: lesson.id,
      type: 'recording',
      audio_url: audioStorageUrl,
      duration_seconds: duration,
    })
    setUploading(false)
    setDone(true)
  }

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  if (done) return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, border:'0.5px solid #e5e5e5', padding:'32px 28px', maxWidth:400, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
        <p style={{ fontSize:20, fontWeight:500, color:'#111', margin:'0 0 8px' }}>Output entregue!</p>
        <p style={{ fontSize:14, color:'#888', margin:'0 0 20px' }}>Seu professor vai revisar e deixar um comentário.</p>
        <button onClick={onBack} style={{ fontSize:14, padding:'10px 24px', borderRadius:8, border:'none', background:'#1D9E75', color:'#fff', cursor:'pointer' }}>Voltar ao início</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ background:'#fff', borderBottom:'0.5px solid #e5e5e5', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ fontSize:13, border:'0.5px solid #ddd', background:'#fff', padding:'5px 10px', borderRadius:8, cursor:'pointer', color:'#555' }}>← Voltar</button>
        <div>
          <p style={{ margin:0, fontSize:14, fontWeight:500, color:'#111' }}>Output — Semana {lesson.week}</p>
          <p style={{ margin:0, fontSize:11, color:'#888' }}>"{lesson.theme}"</p>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 16px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:20, borderBottom:'0.5px solid #e5e5e5' }}>
          {[['record','🎤 Gravação'],['flashcards','🃏 Flashcards']].map(([t,l]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding:'9px 16px', border:'none', background:'transparent', borderBottom:`2px solid ${activeTab===t?'#1D9E75':'transparent'}`, cursor:'pointer', fontSize:13, fontWeight:activeTab===t?500:400, color:activeTab===t?'#085041':'#888', marginBottom:-1 }}>
              {l}
            </button>
          ))}
        </div>

        {activeTab === 'record' && (
          <>
            {/* Prompt */}
            <div style={{ background:'#E1F5EE', border:'0.5px solid #1D9E75', borderRadius:12, padding:'14px 16px', marginBottom:20 }}>
              <p style={{ margin:'0 0 6px', fontSize:11, fontWeight:500, color:'#0F6E56', textTransform:'uppercase', letterSpacing:'0.05em' }}>Fale sobre isso</p>
              <p style={{ margin:0, fontSize:15, color:'#085041', lineHeight:1.6 }}>{prompt}</p>
            </div>

            {/* Tips */}
            <div style={{ border:'0.5px solid #e5e5e5', borderRadius:10, padding:'12px 14px', marginBottom:20, background:'#fff' }}>
              <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:500, color:'#555', textTransform:'uppercase', letterSpacing:'0.05em' }}>Dicas</p>
              {["Não escreva antes — fale direto","Tudo bem errar — isso é normal","Meta: 60 a 90 segundos","Fale como se fosse para uma amiga"].map((t,i) => (
                <p key={i} style={{ margin:'0 0 4px', fontSize:13, color:'#666', display:'flex', gap:8 }}><span style={{ color:'#1D9E75' }}>·</span>{t}</p>
              ))}
            </div>

            {/* Recorder */}
            <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #e5e5e5', padding:'20px', textAlign:'center' }}>
              {!audioUrl ? (
                <>
                  {recording && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontSize:32, marginBottom:4 }}>🔴</div>
                      <p style={{ fontSize:24, fontWeight:500, color:'#111', fontVariantNumeric:'tabular-nums', margin:0 }}>{fmt(duration)}</p>
                      {duration >= 90 && <p style={{ fontSize:12, color:'#1D9E75', margin:'4px 0 0' }}>Ótimo! Você pode parar agora.</p>}
                    </div>
                  )}
                  {!recording && <p style={{ fontSize:14, color:'#888', marginBottom:16 }}>Toque para começar a gravar</p>}
                  <button onClick={recording ? stopRecording : startRecording}
                    style={{ fontSize:15, padding:'14px 32px', borderRadius:50, border:'none', background:recording?'#E24B4A':'#1D9E75', color:'#fff', cursor:'pointer', fontWeight:500 }}>
                    {recording ? '⏹ Parar gravação' : '🎤 Começar a gravar'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize:13, color:'#888', margin:'0 0 12px' }}>Ouça antes de enviar</p>
                  <audio src={audioUrl} controls style={{ width:'100%', marginBottom:16 }} />
                  <p style={{ fontSize:12, color:'#888', margin:'0 0 12px' }}>Duração: {fmt(duration)}</p>
                  <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                    <button onClick={() => { setAudioBlob(null); setAudioUrl(null); setDuration(0) }}
                      style={{ fontSize:13, padding:'9px 18px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#555' }}>Regravar</button>
                    <button onClick={submitRecording} disabled={uploading}
                      style={{ fontSize:13, padding:'9px 18px', borderRadius:8, border:'none', background:uploading?'#9FE1CB':'#1D9E75', color:'#fff', cursor:uploading?'not-allowed':'pointer', fontWeight:500 }}>
                      {uploading ? 'Enviando…' : 'Enviar para o professor ✓'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'flashcards' && (
          <FlashCards lessonId={lesson.id} />
        )}
      </div>
    </div>
  )
}

function FlashCards({ lessonId }) {
  const [segments, setSegments] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [words, setWords] = useState([])

  useEffect(() => {
    supabase.from('lesson_segments').select('content').eq('lesson_id', lessonId).eq('type','vocab').single()
      .then(({ data }) => {
        if (data?.content?.words) setWords(data.content.words)
      })
  }, [lessonId])

  if (words.length === 0) return (
    <div style={{ textAlign:'center', padding:'40px 20px', color:'#888', fontSize:14 }}>Flashcards desta aula em breve.</div>
  )

  const word = words[idx]
  return (
    <div style={{ textAlign:'center' }}>
      <div onClick={() => setFlipped(!flipped)}
        style={{ background:'#fff', borderRadius:16, border:'1.5px solid #1D9E75', padding:'40px 24px', marginBottom:16, cursor:'pointer', minHeight:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!flipped
          ? <p style={{ fontSize:24, fontWeight:500, color:'#111', margin:0 }}>{word}</p>
          : <p style={{ fontSize:15, color:'#555', margin:0, lineHeight:1.6 }}>Use em uma frase sobre sua vida real.<br/><br/><em style={{ fontSize:18, color:'#111' }}>"{word}"</em></p>
        }
      </div>
      <p style={{ fontSize:12, color:'#aaa', marginBottom:12 }}>{flipped ? 'Toque para ver a palavra' : 'Toque para ver o desafio'}</p>
      <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
        <button onClick={() => { setIdx(Math.max(0,idx-1)); setFlipped(false) }} disabled={idx===0}
          style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:idx===0?'not-allowed':'pointer', color:'#555', opacity:idx===0?.4:1 }}>← Anterior</button>
        <span style={{ fontSize:13, color:'#888', padding:'8px 12px' }}>{idx+1} / {words.length}</span>
        <button onClick={() => { setIdx(Math.min(words.length-1,idx+1)); setFlipped(false) }} disabled={idx===words.length-1}
          style={{ padding:'8px 16px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:idx===words.length-1?'not-allowed':'pointer', color:'#555', opacity:idx===words.length-1?.4:1 }}>Próxima →</button>
      </div>
    </div>
  )
}
