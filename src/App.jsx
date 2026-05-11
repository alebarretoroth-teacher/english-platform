import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import LessonPage from './pages/LessonPage'
import StudentHome from './pages/StudentHome'
import StudentOutput from './pages/StudentOutput'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [page, setPage] = useState('home')
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveSessionId, setLiveSessionId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  const navigate = (p, data=null) => { setPage(p); setPageData(data) }

  async function openLesson(lesson) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: students } = await supabase.from('profiles').select('id').eq('role','student').limit(1)
    const studentId = students?.[0]?.id
    let sid = null
    if (studentId) {
      const { data: existing } = await supabase.from('lesson_sessions')
        .select('id').eq('lesson_id', lesson.id).eq('is_active', true).maybeSingle()
      if (existing) { sid = existing.id }
      else {
        const { data: created } = await supabase.from('lesson_sessions')
          .insert({ teacher_id: user.id, student_id: studentId, lesson_id: lesson.id, current_segment: 0 })
          .select('id').single()
        sid = created?.id
      }
    }
    setLiveSessionId(sid)
    navigate('lesson', lesson)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'system-ui' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" />
        <p style={{ fontSize:14, color:'#888', marginTop:12 }}>Carregando…</p>
      </div>
    </div>
  )

  if (!session || !profile) return <Login onLogin={loadProfile} />

  if (profile.role === 'teacher') {
    if (page === 'lesson') return (
      <LessonPage lesson={pageData} profile={profile} isTeacher={true}
        sessionId={liveSessionId} onBack={() => navigate('home')} />
    )
    if (page === 'review') return <ReviewPage onBack={() => navigate('home')} />
    return <TeacherDashboard profile={profile} navigate={(p,d) => p==='lesson' ? openLesson(d) : navigate(p,d)} />
  }

  if (profile.role === 'student') {
    if (page === 'lesson') return (
      <LessonPage lesson={pageData} profile={profile} isTeacher={false}
        sessionId={liveSessionId} onBack={() => navigate('home')} />
    )
    return <StudentHome profile={profile} navigate={navigate} openLesson={async (lesson) => {
      const { data: s } = await supabase.from('lesson_sessions')
        .select('id').eq('lesson_id', lesson.id).eq('is_active', true).maybeSingle()
      setLiveSessionId(s?.id || null)
      navigate('lesson', lesson)
    }} />
  }

  return null
}
