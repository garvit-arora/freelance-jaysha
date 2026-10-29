import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRightLeft, ArrowLeft } from 'lucide-react'
import { PageHeader } from './Calendar'
import entries from './dictionary-data.json'
import { PhraseDropdown } from './PhraseDropdown'
import SlideCommit from './SlideCommit'
import './personal-pages.css'
import './translator.css'
import './romantic-login.css'
import { cloud, setupMessage, useSession } from './lib/cloud'

export function DictionaryPage() {
  const [selected, setSelected] = useState('')
  const [translation, setTranslation] = useState('')
  const [translating, setTranslating] = useState(false)
  useEffect(() => {
    setTranslation('')
    if (!selected) { setTranslating(false); return }
    setTranslating(true)
    const timer = window.setTimeout(() => {
      setTranslation(entries.find(entry => entry.term === selected)?.meaning || '')
      setTranslating(false)
    }, 1000 + Math.floor(Math.random() * 1001))
    return () => window.clearTimeout(timer)
  }, [selected])
  return <main className="world-page translator-page"><PageHeader title="Dictionary" />
    <div className="translator-heading"><h1>Jaysha-to-English translator</h1><div className="translator-introduction">
      <p>Because understanding Jaysha is an art. And apparently, I’ve been studying for five years.</p>
      <p>She says one thing. Means another. And somehow, you’re supposed to know the difference.</p>
      <p>This is an attempt to decode the language, interpret the silences and translate the things that were never meant to be taken literally.</p>
      <p>This document contains a collection of commonly used phrases, their hidden meanings, and recommended responses.</p>
      <p>So, for the benefit of humanity (and mostly myself), I’ve decided to document a few of these mysteries.</p>
      <p className="translator-introduction-disclaimer">Disclaimer: Even after five years, the translator is not always accurate.</p>
    </div></div>
    <section className="translator-workspace" aria-label="Jaysha-to-English phrase translator">
      <div className="translator-source"><PhraseDropdown value={selected} onChange={setSelected} /><div className={`translator-text ${selected ? '' : 'is-placeholder'}`}>{selected || 'Select a phrase to translate'}</div></div>
      <div className="translator-direction" aria-hidden="true"><ArrowRightLeft size={23} /></div>
      <div className="translator-target"><div className="translator-language">English <span>Translation</span></div><div className={`translator-result ${!translation ? 'is-placeholder' : ''}`} role="status" aria-live="polite" aria-atomic="true" aria-busy={translating}>{translating ? <span className="translator-loading">Translating<span aria-hidden="true">?</span></span> : translation || 'Translation'}</div></div>
    </section><footer className="translator-footer"><span>{entries.length} phrases. One very special language.</span><span>Jaysha ? English</span></footer>
  </main>
}

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')
  const destination = next === '/impressions' || (next?.startsWith('/calendar') && !next.startsWith('//')) ? next! : '/calendar'
  const { session, loading } = useSession()
  const recovery = params.get('reset') === '1'
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const loginForm = useRef<HTMLFormElement>(null)
  const slideContainer = useRef<HTMLDivElement>(null)
  const signingIn = useRef(false)
  const [slideWidth, setSlideWidth] = useState(280)
  useEffect(() => {
    const element = slideContainer.current
    if (!element) return
    const resize = () => setSlideWidth(Math.max(180, Math.floor(element.clientWidth)))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => { if (session && !recovery && !signingIn.current) navigate(destination, { replace: true }) }, [session, destination, navigate, recovery])
  async function login() {
    setError(''); setNotice('')
    if (!loginForm.current?.reportValidity()) throw new Error('Enter your email and password.')
    if (!cloud) { setError(setupMessage); throw new Error(setupMessage) }
    if (busy) throw new Error('Please wait.')
    signingIn.current = true
    setBusy(true)
    const form = new FormData(loginForm.current)
    const password = String(form.get('password'))
    localStorage.setItem('archive-remember', form.get('remember') ? 'yes' : 'no')
    try {
      if (recovery) {
        const { error } = await cloud.auth.updateUser({ password })
        if (error) throw error
      } else {
        const { error } = await cloud.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw new Error('Unable to sign in. Check your email and password and try again.')
      }
    } catch (error) {
      signingIn.current = false
      setError(error instanceof Error ? error.message : 'Unable to connect. Please try again.')
      throw error
    } finally { setBusy(false) }
  }
  async function resetPassword() {
    setError(''); setNotice('')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter your email above, then choose Forgot Password.'); return }
    if (!cloud) { setError(setupMessage); return }
    setBusy(true)
    const { error } = await cloud.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login?reset=1` })
    if (error) setError(error.message)
    else setNotice('If this account exists, a password reset link has been sent to your email.')
    setBusy(false)
  }
  return <main className="romantic-login">
    <div className="romantic-login-background" aria-hidden="true" />
    <section className="romantic-login-card" aria-label="Sign in to our memories">
      <div className="romantic-login-photo"><img src="/bg-post-timeline.jpeg" alt="A favorite photograph of Jaysha" fetchPriority="high" /></div>
      <div className="romantic-login-panel">
        <Link className="romantic-login-back" to={destination}><ArrowLeft size={14} /> Back</Link>
        <div className="romantic-login-form">
          <span className="romantic-login-kicker">{recovery ? 'A fresh start' : 'Your own little world'}</span>
          <h1>Where every moment<br />leads back to you.</h1>
          <form ref={loginForm} onSubmit={event => { event.preventDefault(); void login().then(() => navigate(destination, { replace: true })).catch(() => {}) }}>
            {!recovery && <label className="romantic-login-field"><span className="romantic-input-label">Email address</span><input type="email" name="email" autoComplete="username" placeholder="Enter email" value={email} onChange={event => setEmail(event.target.value)} required /></label>}
            <label className="romantic-login-field romantic-login-password"><span className="romantic-input-label">{recovery ? 'New password' : 'Password'}</span><input type={visible ? 'text' : 'password'} name="password" autoComplete={recovery ? 'new-password' : 'current-password'} placeholder={recovery ? 'Enter new password' : 'Enter password'} required /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></label>
            {!recovery && <div className="romantic-login-options"><label><input type="checkbox" name="remember" defaultChecked /> Remember me</label><button type="button" disabled={busy} onClick={resetPassword}>Forgot password?</button></div>}
            {error && <p className="romantic-login-error" role="alert">{error}</p>}{notice && <p className="romantic-login-notice" role="status">{notice}</p>}
            <div className="romantic-login-slide" ref={slideContainer}><SlideCommit label={recovery ? 'Slide to save password' : 'Slide to login'} doneLabel={recovery ? 'Password saved' : 'Welcome home'} errorLabel="Please try again" onConfirm={login} onDone={() => navigate(destination, { replace: true })} disabled={busy || loading} trackColor="#131313" handleColor="#eae7df" successColor="#eae7df" dangerColor="#8b4c43" width={slideWidth} height={56} radius={28} holdMs={0} /></div>
            <button type="submit" className="sr-only" tabIndex={-1}>Login</button>
          </form>

        </div>
        <p className="romantic-login-note">In every version of my life,<br />I?d find my way back to you.</p>
      </div>
    </section>
  </main>
}
