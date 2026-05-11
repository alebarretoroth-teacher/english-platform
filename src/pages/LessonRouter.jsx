import { LESSON_1, LESSON_0_W1, LESSON_0_W2, LESSON_0_W3 } from './LessonPage'
import LessonPage from './LessonPage'

const LESSON_MAP = {
  '-2': LESSON_0_W1,
  '-1': LESSON_0_W2,
  '0':  LESSON_0_W3,
  '1':  LESSON_1,
}

export default function LessonRouter({ lesson, profile, isTeacher, sessionId, onBack }) {
  const data = LESSON_MAP[String(lesson?.week)]
  if (!data) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui', flexDirection:'column', gap:12 }}>
      <p style={{ fontSize:18, color:'#888' }}>🚧 Conteúdo em breve</p>
      <p style={{ fontSize:14, color:'#aaa' }}>Semana {lesson?.week} — {lesson?.theme}</p>
      <button onClick={onBack} style={{ fontSize:13, padding:'8px 16px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer' }}>← Voltar</button>
    </div>
  )
  return <LessonPage lessonData={data} lesson={lesson} profile={profile} isTeacher={isTeacher} sessionId={sessionId} onBack={onBack} />
}
