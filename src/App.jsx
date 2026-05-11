import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import LessonRunner from './pages/LessonRunner'
import StudentHome from './pages/StudentHome'
import StudentOutput from './pages/StudentOutput'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [page, setPage] = useState('home')
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const navigate = (p, data = null) => { setPage(p); setPageData(data) }

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
    if (page === 'lesson') return <LessonRunner lesson={pageData} profile={profile} onBack={() => navigate('home')} />
    if (page === 'review') return <ReviewPage onBack={() => navigate('home')} />
    return <TeacherDashboard profile={profile} navigate={navigate} />
  }

  if (profile.role === 'student') {
    if (page === 'output') return <StudentOutput lesson={pageData} profile={profile} onBack={() => navigate('home')} />
    return <StudentHome profile={profile} navigate={navigate} />
  }

  return null
}
