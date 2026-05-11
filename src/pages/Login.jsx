import { useState } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f3', fontFamily:'system-ui, sans-serif', padding:16 },
  card: { background:'#fff', borderRadius:16, border:'0.5px solid #e0e0e0', padding:'32px 28px', width:'100%', maxWidth:380 },
  logo: { textAlign:'center', marginBottom:28 },
  logoText: { fontSize:22, fontWeight:500, color:'#111', margin:0 },
  logoSub: { fontSize:13, color:'#888', margin:'4px 0 0' },
  tabs: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:24 },
  tab: (active) => ({ padding:'8px 0', borderRadius:8, border:`1.5px solid ${active?'#1D9E75':'#e0e0e0'}`, background:active?'#E1F5EE':'#fff', cursor:'pointer', fontSize:13, fontWeight:active?500:400, color:active?'#085041':'#555', textAlign:'center' }),
  label: { fontSize:12, color:'#666', marginBottom:4, display:'block' },
  input: { width:'100%', padding:'9px 11px', borderRadius:8, border:'0.5px solid #ddd', fontSize:14, outline:'none', marginBottom:12, boxSizing:'border-box' },
  btn: (loading) => ({ width:'100%', padding:'11px 0', borderRadius:8, border:'none', background:loading?'#9FE1CB':'#1D9E75', color:'#fff', fontSize:14, fontWeight:500, cursor:loading?'not-allowed':'pointer' }),
  err: { fontSize:12, color:'#E24B4A', background:'#FCEBEB', borderRadius:8, padding:'8px 10px', marginBottom:12 },
}

export default function Login({ onLogin }) {
  const [role, setRole] = useState('teacher')
  const [mode, setMode] = useState('login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handle(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (mode === 'register') {
      const { data, error: signErr } = await supabase.auth.signUp({ email, password })
      if (signErr) { setError(signErr.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, name, role })
        setDone(true)
      }
    } else {
      const { data, error: signErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signErr) { setError(signErr.message); setLoading(false); return }
      if (data.user) onLogin(data.user.id)
    }
    setLoading(false)
  }

  if (done) return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ textAlign:'center', padding:'12px 0' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>✓</div>
          <p style={{ fontSize:16, fontWeight:500, color:'#111', margin:'0 0 8px' }}>Conta criada!</p>
          <p style={{ fontSize:13, color:'#888', margin:0 }}>Verifique o email para confirmar e faça login.</p>
          <button style={{ marginTop:16, ...S.btn(false), width:'auto', padding:'9px 20px' }} onClick={() => { setDone(false); setMode('login') }}>Ir para login</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <p style={S.logoText}>English Platform</p>
          <p style={S.logoSub}>Programa Danilelly · Prof. Ale</p>
        </div>

        <div style={S.tabs}>
          {['teacher','student'].map(r => (
            <button key={r} style={S.tab(role===r)} onClick={() => setRole(r)}>
              {r === 'teacher' ? '👤 Professor' : '🎓 Aluna'}
            </button>
          ))}
        </div>

        <form onSubmit={handle}>
          {mode === 'register' && <>
            <label style={S.label}>Nome</label>
            <input style={S.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome completo" required />
          </>}
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemplo.com" required />
          <label style={S.label}>Senha</label>
          <input style={S.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          {error && <div style={S.err}>{error}</div>}
          <button type="submit" style={S.btn(loading)} disabled={loading}>
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p style={{ fontSize:12, color:'#888', textAlign:'center', marginTop:16 }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <span style={{ color:'#1D9E75', cursor:'pointer' }} onClick={() => { setMode(mode==='login'?'register':'login'); setError('') }}>
            {mode === 'login' ? 'Cadastrar' : 'Fazer login'}
          </span>
        </p>
      </div>
    </div>
  )
}
