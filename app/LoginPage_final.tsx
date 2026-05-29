'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const GOLD = '#C9A84C'
const GOLD2 = '#F0D080'
const MUTED = 'rgba(255,255,255,0.38)'

/* ─── tiny custom cursor (same as main app) ─── */
function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dot.current)  { dot.current.style.left  = e.clientX + 'px'; dot.current.style.top  = e.clientY + 'px' }
      if (ring.current) { ring.current.style.left = e.clientX + 'px'; ring.current.style.top = e.clientY + 'px' }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return (
    <>
      <div ref={dot}  style={{ width:8,  height:8,  borderRadius:'50%', background:GOLD2, position:'fixed', pointerEvents:'none', zIndex:9999, transform:'translate(-50%,-50%)', mixBlendMode:'difference' }} />
      <div ref={ring} style={{ width:36, height:36, borderRadius:'50%', border:'1px solid rgba(201,168,76,0.5)', position:'fixed', pointerEvents:'none', zIndex:9998, transform:'translate(-50%,-50%)', transition:'all 0.12s ease', mixBlendMode:'difference' }} />
    </>
  )
}

type Mode = 'login' | 'magic'

interface LoginPageProps {
  onGuest: () => void
  onAuth:  (user: any) => void
}

export default function LoginPage({ onGuest, onAuth }: LoginPageProps) {
  const [mode,     setMode]     = useState<Mode>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [sent,     setSent]     = useState(false)   // magic-link sent confirmation
  const [showPass, setShowPass] = useState(false)

  // listen for auth state (magic-link redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (session?.user) onAuth(session.user)
    })
    return () => subscription.unsubscribe()
  }, [onAuth])

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else if (data.user) onAuth(data.user)
  }

  async function handleMagic() {
    if (!email) return
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  async function handleSignup() {
    if (!email || !password) return
    setLoading(true); setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else if (data.user) onAuth(data.user)
  }

  const submit = mode === 'magic' ? handleMagic : handleLogin

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Outfit:wght@200;300;400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04040a; color:#f0ece4; font-family:'Outfit',sans-serif; overflow:hidden; cursor:none; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes orbFloat {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(50px,-30px) scale(1.08)}
          66%{transform:translate(-20px,40px) scale(0.94)}
        }
        @keyframes shimmer  { 0%,100%{opacity:.4;transform:scaleX(.7)} 50%{opacity:1;transform:scaleX(1)} }
        @keyframes sweep    {
          0%  {transform:translateX(-110%) skewX(-18deg);opacity:0}
          10% {opacity:1}
          90% {opacity:1}
          100%{transform:translateX(210%) skewX(-18deg);opacity:0}
        }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:.6} 50%{opacity:1} }

        .login-input {
          width:100%; padding:16px 18px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.09);
          border-radius:14px; color:#f0ece4; font-size:14px;
          outline:none; font-family:'Outfit',sans-serif; font-weight:300;
          transition:all .35s cubic-bezier(.25,.46,.45,.94);
        }
        .login-input:focus {
          border-color:rgba(201,168,76,.45);
          background:rgba(255,255,255,0.06);
          box-shadow:0 0 0 4px rgba(201,168,76,.07), 0 12px 40px rgba(0,0,0,.25);
        }
        .login-input::placeholder { color:rgba(255,255,255,.2); }

        .tab-btn {
          flex:1; padding:10px; border:none;
          background:transparent; color:${MUTED};
          font-family:'Outfit',sans-serif; font-size:11px;
          letter-spacing:2px; cursor:pointer; border-radius:10px;
          transition:all .3s ease; position:relative; overflow:hidden;
        }
        .tab-btn.active {
          background:rgba(201,168,76,.14);
          border:1px solid rgba(201,168,76,.28);
          color:${GOLD2};
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12);
        }
        .tab-btn:not(.active):hover { color:rgba(255,255,255,.7); background:rgba(255,255,255,.05); }

        .cta-btn {
          width:100%; padding:16px;
          background:linear-gradient(135deg,${GOLD},${GOLD2});
          color:#000; border:none; border-radius:14px;
          font-weight:600; font-size:13px; letter-spacing:.8px;
          cursor:pointer; font-family:'Outfit',sans-serif;
          box-shadow:0 10px 30px rgba(201,168,76,.3);
          transition:all .3s cubic-bezier(.25,.46,.45,.94);
          position:relative; overflow:hidden;
        }
        .cta-btn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(201,168,76,.4); }
        .cta-btn:active { transform:translateY(0); }
        .cta-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }
        .cta-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
          transform:translateX(-100%);
        }
        .cta-btn:hover::before { animation:sweep .7s ease forwards; }

        .ghost-btn {
          width:100%; padding:14px;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.09);
          border-radius:14px; color:${MUTED};
          font-size:12px; letter-spacing:1.5px;
          cursor:pointer; font-family:'Outfit',sans-serif;
          transition:all .3s ease;
          backdrop-filter:blur(10px);
        }
        .ghost-btn:hover {
          border-color:rgba(255,255,255,.18);
          color:rgba(255,255,255,.7);
          background:rgba(255,255,255,.06);
        }

        .divider {
          display:flex; align-items:center; gap:16px;
          color:rgba(255,255,255,.15); font-size:11px; letter-spacing:2px;
        }
        .divider::before,.divider::after {
          content:''; flex:1; height:1px;
          background:rgba(255,255,255,.07);
        }
      `}</style>

      <CustomCursor />

      {/* ── full-screen bg ── */}
      <div style={{ position:'fixed', inset:0, background:'#04040a', overflow:'hidden' }}>

        {/* ambient orbs */}
        <div style={{ position:'absolute', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,.055) 0%, transparent 65%)', top:'-15%', right:'-10%', animation:'orbFloat 22s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(80,60,180,.04) 0%, transparent 65%)', bottom:'-10%', left:'-8%', animation:'orbFloat 30s ease-in-out infinite reverse' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,.03) 0%, transparent 65%)', top:'40%', left:'30%', animation:'orbFloat 18s ease-in-out infinite 4s' }} />

        {/* grain */}
        <div style={{ position:'absolute', inset:0, opacity:.022, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'200px', pointerEvents:'none' }} />

        {/* subtle grid lines */}
        <div style={{ position:'absolute', inset:0, opacity:.018, backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize:'80px 80px', pointerEvents:'none' }} />
      </div>

      {/* ── centered card ── */}
      <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{
          width:'100%', maxWidth:420,
          background:'rgba(255,255,255,0.035)',
          backdropFilter:'blur(60px) saturate(220%) brightness(115%)',
          WebkitBackdropFilter:'blur(60px) saturate(220%) brightness(115%)',
          border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:28,
          boxShadow:'0 64px 120px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.1)',
          padding:'44px 40px 40px',
          animation:'fadeUp .7s cubic-bezier(.25,.46,.45,.94) both',
          position:'relative', overflow:'hidden',
        }}>

          {/* top highlight line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(to right, transparent, rgba(255,255,255,.18), transparent)' }} />

          {/* logo */}
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:42, fontWeight:600, letterSpacing:14,
              color:GOLD2, textShadow:'0 0 50px rgba(201,168,76,.35)',
              lineHeight:1, marginBottom:10, animation:'fadeUp .5s ease both',
            }}>DSF</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, animation:'fadeUp .55s ease both .06s' }}>
              <div style={{ height:1, width:32, background:`linear-gradient(to right, transparent, ${GOLD})`, animation:'shimmer 3s ease infinite' }} />
              <span style={{ color:GOLD, fontSize:8, letterSpacing:4, fontWeight:500 }}>DATABÁZA SLOVENSKÝCH FILMOV</span>
              <div style={{ height:1, width:32, background:`linear-gradient(to left, transparent, ${GOLD})`, animation:'shimmer 3s ease infinite' }} />
            </div>
          </div>

          {/* mode tabs */}
          <div style={{
            display:'flex', gap:4, padding:4,
            background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)',
            borderRadius:14, marginBottom:28,
            animation:'fadeUp .6s ease both .1s',
          }}>
            <button className={`tab-btn${mode==='login'?' active':''}`} onClick={() => { setMode('login'); setError(null); setSent(false) }}>PRIHLÁSENIE</button>
            <button className={`tab-btn${mode==='magic'?' active':''}`} onClick={() => { setMode('magic'); setError(null); setSent(false) }}>MAGIC LINK</button>
          </div>

          {/* ── SENT confirmation ── */}
          {sent ? (
            <div style={{ textAlign:'center', padding:'24px 0', animation:'fadeUp .4s ease both' }}>
              <div style={{
                width:64, height:64, borderRadius:'50%', margin:'0 auto 20px',
                background:'rgba(201,168,76,.12)', border:'1.5px solid rgba(201,168,76,.35)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
              }}>✉</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:GOLD2, marginBottom:8 }}>Skontroluj email</p>
              <p style={{ color:MUTED, fontSize:12, lineHeight:1.8 }}>Poslali sme ti prihlasovací odkaz na<br /><span style={{ color:'rgba(255,255,255,.6)' }}>{email}</span></p>
              <button onClick={() => setSent(false)} style={{ marginTop:20, background:'none', border:'none', color:GOLD, fontSize:11, letterSpacing:2, cursor:'pointer', fontFamily:'Outfit' }}>← SPÄŤ</button>
            </div>
          ) : (
            <>
              {/* fields */}
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20, animation:'fadeUp .65s ease both .15s' }}>

                {/* email */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:.3, pointerEvents:'none' }}>@</span>
                  <input
                    className="login-input"
                    style={{ paddingLeft:40 }}
                    type="email"
                    placeholder="tvoj@email.sk"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    autoComplete="email"
                  />
                </div>

                {/* password — only in login mode */}
                {mode === 'login' && (
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:15, opacity:.3, pointerEvents:'none' }}>🔑</span>
                    <input
                      className="login-input"
                      style={{ paddingLeft:40, paddingRight:48 }}
                      type={showPass ? 'text' : 'password'}
                      placeholder="heslo"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(null) }}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      autoComplete="current-password"
                    />
                    <button
                      onClick={() => setShowPass(v => !v)}
                      style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:MUTED, cursor:'pointer', fontSize:14, padding:4 }}
                    >{showPass ? '🙈' : '👁'}</button>
                  </div>
                )}

                {mode === 'magic' && (
                  <p style={{ color:MUTED, fontSize:11, letterSpacing:.5, lineHeight:1.7, textAlign:'center' }}>
                    Pošleme ti jednorazový odkaz priamo na email — bez hesla.
                  </p>
                )}
              </div>

              {/* error */}
              {error && (
                <div style={{
                  marginBottom:16, padding:'11px 14px',
                  background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.22)',
                  borderRadius:10, color:'rgba(252,165,165,.9)', fontSize:12, lineHeight:1.5,
                  animation:'fadeUp .3s ease both',
                }}>{error}</div>
              )}

              {/* primary CTA */}
              <button className="cta-btn" onClick={submit} disabled={loading || !email || (mode==='login' && !password)} style={{ marginBottom:12, animation:'fadeUp .7s ease both .2s' }}>
                {loading
                  ? <span style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(0,0,0,.3)', borderTopColor:'#000', borderRadius:'50%', animation:'spin .7s linear infinite', verticalAlign:'middle' }} />
                  : mode === 'magic' ? 'POSLAŤ ODKAZ' : 'PRIHLÁSIŤ SA'
                }
              </button>

              {/* signup link — only in login mode */}
              {mode === 'login' && (
                <button
                  onClick={handleSignup}
                  disabled={loading || !email || !password}
                  style={{
                    width:'100%', padding:'13px',
                    background:'rgba(201,168,76,.07)', border:'1px solid rgba(201,168,76,.2)',
                    borderRadius:14, color:GOLD,
                    fontSize:12, letterSpacing:1.2,
                    cursor: (loading || !email || !password) ? 'not-allowed' : 'pointer',
                    fontFamily:'Outfit', opacity:(loading || !email || !password) ? .4 : 1,
                    transition:'all .3s',
                    marginBottom:20, animation:'fadeUp .75s ease both .25s',
                  }}
                >VYTVORIŤ ÚČET</button>
              )}

              {mode === 'magic' && <div style={{ marginBottom:20 }} />}

              {/* divider */}
              <div className="divider" style={{ marginBottom:16, animation:'fadeUp .8s ease both .3s' }}>ALEBO</div>

              {/* guest */}
              <button className="ghost-btn" onClick={onGuest} style={{ animation:'fadeUp .85s ease both .35s' }}>
                POKRAČOVAŤ BEZ ÚČTU
              </button>
            </>
          )}

          {/* bottom decoration */}
          <div style={{ marginTop:32, textAlign:'center', animation:'fadeUp .9s ease both .4s' }}>
            <div style={{ display:'inline-flex', gap:5, alignItems:'center' }}>
              {[...Array(3)].map((_,i) => (
                <div key={i} style={{ width:3, height:3, borderRadius:'50%', background:GOLD, opacity:.3 + i*.2, animation:`pulse 2s ease infinite ${i*.4}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
