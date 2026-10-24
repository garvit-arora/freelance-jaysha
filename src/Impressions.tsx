import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCheck, Heart, Info, MessageCircle, Search, Send, X, Plus, Pencil, Trash2, Camera, LogOut, MoreVertical, Smile } from 'lucide-react'
import { cloud, mediaAction, useSession } from './lib/cloud'
import './impressions.css'
import './impressions-dark.css'
import './impressions-whatsapp.css'

type Contact = { id: string; name: string; label: string; avatar: string; color: string; avatar_url: string; avatar_file_id: string; preview: string }
type Message = { id: string; contact_id: string; sender_id: string | null; body: string; photo_url: string; created_at: string; updated_at: string | null }
function Avatar({ contact }: { contact?: Contact }) {
  return <span className="impressions-avatar" style={{ background: contact?.avatar_url ? undefined : '#30302d' }}>{contact?.avatar_url ? <img src={contact.avatar_url} alt="" /> : contact?.avatar || 'Y'}</span>
}

export function ImpressionsPage() {
  const { session, loading: authLoading } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeId, setActiveId] = useState('')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [threadQuery, setThreadQuery] = useState('')
  const [showThreadSearch, setShowThreadSearch] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [senderId, setSenderId] = useState('me')
  const [mobileChat, setMobileChat] = useState(false)
  const [details, setDetails] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [editing, setEditing] = useState<Message | null>(null)
  const [contactForm, setContactForm] = useState<{ id?: string; name: string; label: string } | null>(null)
  const [confirmation, setConfirmation] = useState<{ kind: 'message' | 'contact' | 'photo'; id: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [retry, setRetry] = useState(0)
  const feed = useRef<HTMLDivElement>(null)
  const photoPicker = useRef<HTMLInputElement>(null)
  const active = contacts.find(item => item.id === activeId)
  const filtered = contacts.filter(item => `${item.name} ${item.label}`.toLowerCase().includes(query.toLowerCase()))
  async function loadContacts() {
    if (!cloud) throw new Error('The cloud connection is unavailable.')
    const { data, error } = await cloud.from('impression_contacts').select('*').order('created_at').order('id')
    if (error) throw error
    setContacts(data || [])
    setActiveId(previous => data?.some(item => item.id === previous) ? previous : data?.[0]?.id || '')
  }
  useEffect(() => {
    let live = true
    setLoading(true)
    if (!cloud) { setError('The cloud connection is unavailable.'); setLoading(false); return }
    cloud.from('impression_contacts').select('*').order('created_at').order('id').then(({ data, error }) => {
      if (!live) return
      if (error) setError(error.message)
      else { setContacts(data || []); setActiveId(previous => data?.some(item => item.id === previous) ? previous : data?.[0]?.id || '') }
      setLoading(false)
    })
    return () => { live = false }
  }, [retry])
  useEffect(() => {
    let live = true
    setMessages([]); setEditing(null); setDraft(''); setThreadQuery(''); setShowThreadSearch(false); setEmojiOpen(false); setThreadLoading(!!activeId)
    if (!cloud || !activeId) return
    cloud.from('impression_messages').select('*').eq('contact_id', activeId).order('created_at').order('id').then(({ data, error }) => {
      if (!live) return
      if (error) setError(error.message)
      else setMessages(data || [])
      setThreadLoading(false)
    })
    return () => { live = false }
  }, [activeId, retry])
  useEffect(() => { if (feed.current) feed.current.scrollTop = feed.current.scrollHeight }, [messages.length, activeId])
  useEffect(() => { if (!session) { setEditing(null); setContactForm(null); setConfirmation(null) } }, [session])
  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!session || !cloud || !draft.trim() || !active || busy) return
    setBusy(true); setError('')
    try {
      const values = { body: draft.trim(), sender_id: senderId === 'me' ? null : senderId }
      const result = editing
        ? await cloud.from('impression_messages').update({ ...values, updated_at: new Date().toISOString() }).eq('id', editing.id).select().single()
        : await cloud.from('impression_messages').insert({ ...values, contact_id: active.id }).select().single()
      if (result.error) throw result.error
      setMessages(previous => editing ? previous.map(item => item.id === result.data.id ? result.data : item) : [...previous, result.data])
      setDraft(''); setEditing(null)
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save your message. Please retry.') }
    finally { setBusy(false) }
  }
  async function saveContact(event: React.FormEvent) {
    event.preventDefault()
    if (!session || !cloud || !contactForm?.name.trim()) return
    setBusy(true); setError('')
    try {
      const values = { name: contactForm.name.trim(), label: contactForm.label.trim() }
      const result = contactForm.id ? await cloud.from('impression_contacts').update(values).eq('id', contactForm.id).select().single() : await cloud.from('impression_contacts').insert({ ...values, avatar: values.name[0].toUpperCase() }).select().single()
      if (result.error) throw result.error
      await loadContacts(); setActiveId(result.data.id); setContactForm(null); setMobileChat(true)
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not save contact.') }
    finally { setBusy(false) }
  }
  async function removeConfirmed() {
    if (!session || !cloud || !confirmation) return
    setBusy(true); setError('')
    try {
      if (confirmation.kind === 'message') {
        const { error } = await cloud.from('impression_messages').delete().eq('id', confirmation.id)
        if (error) throw error
        setMessages(previous => previous.filter(item => item.id !== confirmation.id))
        if (editing?.id === confirmation.id) { setEditing(null); setDraft('') }
      } else {
        await mediaAction({ action: confirmation.kind === 'contact' ? 'deleteContact' : 'removeProfile', contactId: confirmation.id })
        await loadContacts()
      }
      setConfirmation(null)
    } catch (error) { setError(error instanceof Error ? error.message : 'Deletion failed. Please retry.') }
    finally { setBusy(false) }
  }
  async function uploadPhoto(file?: File) {
    if (!file || !active || !session || busy) return
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { setError('Choose an image smaller than 10 MB.'); return }
    setBusy(true); setError(''); setUploadProgress('Uploading profile picture…')
    try {
      const auth = await mediaAction({ action: 'signProfile', contactId: active.id })
      const form = new FormData(); form.append('file', file); form.append('fileName', file.name); form.append('folder', auth.folder)
      for (const key of ['token', 'signature', 'expire', 'publicKey']) form.append(key, String(auth[key]))
      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'ImageKit upload failed.')
      await mediaAction({ action: 'saveProfile', contactId: active.id, fileId: result.fileId })
      await loadContacts(); setUploadProgress('Profile picture saved.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Profile picture could not be saved.'); setUploadProgress('') }
    finally { setBusy(false); if (photoPicker.current) photoPicker.current.value = '' }
  }
  return <main className="impressions-page impressions-dark impressions-whatsapp">
    <div className="impressions-intro"><Link to="/explore"><ArrowLeft size={16} /> Our world</Link><span>Impressions · Mock conversations</span>{session ? <button onClick={() => cloud?.auth.signOut()}><LogOut size={14} /> Sign out</button> : <Link to="/login?next=%2Fimpressions">Sign in to edit</Link>}</div>
    {error && <div className="impressions-alert" role="alert">{error}<button onClick={() => { setError(''); setRetry(value => value + 1) }}>Retry</button></div>}
    <section className={`impressions-app ${mobileChat ? 'mobile-chat-open' : ''} ${details ? 'details-open' : ''}`} aria-label="Impressions messenger">
      <aside className="impressions-sidebar"><div className="impressions-brand"><span className="impressions-brand-mark"><MessageCircle size={21} /></span><div><h1>Impressions<span>.</span></h1><p>Our own little corner of the internet</p></div></div><div className="impressions-list-heading"><h2>Chats <span>{contacts.length}</span></h2>{session && <button disabled={busy} aria-label="Add contact" onClick={() => setContactForm({ name: '', label: '' })}><Plus size={18} /></button>}</div><label className="impressions-search"><Search size={15} /><span className="sr-only">Search conversations</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search or start a chat" /></label><nav aria-label="Mock conversations">{filtered.map(item => <button key={item.id} className={activeId === item.id ? 'active' : ''} onClick={() => { if (!busy) { setActiveId(item.id); setMobileChat(true); setDetails(false) } }} aria-current={activeId === item.id ? 'true' : undefined}><Avatar contact={item} /><span className="impressions-contact-copy"><strong>{item.name}</strong><small>{item.label || 'A little appreciation'}</small></span></button>)}</nav>{loading && <p className="impressions-no-results" role="status">Loading contacts…</p>}{!loading && !filtered.length && <p className="impressions-no-results">No contacts yet.{session && ' Use + to add one.'}</p>}<div className="impressions-sidebar-footer"><Heart size={16} /><span>Made-up chats. Real affection.</span></div></aside>
      <section className="impressions-chat" aria-label={active ? `Conversation with ${active.name}` : 'Choose a contact'}>{active ? <><header className="impressions-chat-header"><button className="impressions-mobile-back" onClick={() => setMobileChat(false)} aria-label="Back to conversations"><ArrowLeft size={19} /></button><Avatar contact={active} /><div><h2>{active.name}</h2><p>{active.label || 'Mock conversation'}</p></div><button className="impressions-info-button" aria-label="Search this conversation" aria-expanded={showThreadSearch} onClick={() => { setShowThreadSearch(value => !value); setThreadQuery('') }}><Search size={19} /></button><button className="impressions-info-button" onClick={() => setDetails(value => !value)} aria-label="Show contact details" aria-expanded={details}><MoreVertical size={21} /></button></header>{showThreadSearch && <label className="impressions-thread-search"><Search size={16} /><span className="sr-only">Search messages in this conversation</span><input autoFocus value={threadQuery} onChange={event => setThreadQuery(event.target.value)} placeholder="Search in this conversation" /><button aria-label="Close message search" onClick={() => { setShowThreadSearch(false); setThreadQuery('') }}><X size={17} /></button></label>}<div className="impressions-chat-banner">The unofficial Jaysha appreciation chat · Fictional</div><div className="impressions-feed" ref={feed} role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions"><div className="impressions-day-label">ALL THE LITTLE IMPRESSIONS</div>{threadLoading && <p role="status">Loading messages…</p>}{!threadLoading && !messages.length && <p className="impressions-empty-thread">A new conversation starts here.</p>}{messages.filter(message => message.body.toLowerCase().includes(threadQuery.toLowerCase())).map(message => {
        const sender = contacts.find(contact => contact.id === message.sender_id)
        return <div className={`impressions-message ${!message.sender_id ? 'mine' : ''}`} key={message.id}>{message.sender_id && <Avatar contact={sender} />}<div><div className="impressions-bubble"><strong className="impression-sender-name">{message.sender_id ? sender?.name || 'Deleted contact' : 'You'}</strong>{message.photo_url && <img src={message.photo_url} alt="A memory of Jaysha" />}<p>{message.body}</p><span className="impressions-message-time">{message.updated_at && 'edited · '}{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{!message.sender_id && <CheckCheck size={12} />}</span></div>{session && <div className="impression-message-actions"><button disabled={busy} aria-label={`Edit message from ${message.sender_id ? sender?.name || 'Deleted contact' : 'You'}`} onClick={() => { setEditing(message); setDraft(message.body); setSenderId(message.sender_id || 'me') }}><Pencil size={12} /> Edit</button><button disabled={busy} aria-label={`Delete message from ${message.sender_id ? sender?.name || 'Deleted contact' : 'You'}`} onClick={() => setConfirmation({ kind: 'message', id: message.id })}><Trash2 size={12} /> Delete</button></div>}</div></div>
      })}{threadQuery && !threadLoading && !messages.some(message => message.body.toLowerCase().includes(threadQuery.toLowerCase())) && <p className="impressions-empty-thread">No matching messages.</p>}</div>{session ? <div className="impressions-compose-area">{editing && <div className="impressions-editing">Editing message <button disabled={busy} onClick={() => { setEditing(null); setDraft('') }} aria-label="Cancel message edit"><X size={14} /></button></div>}<label className="impressions-sender-select">{editing ? 'Author' : 'Send as'}<select value={senderId} onChange={event => setSenderId(event.target.value)} disabled={busy}><option value="me">You</option>{contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></label><form className="impressions-composer" onSubmit={send}><button type="button" className="impressions-emoji-toggle" disabled={busy} aria-label="Choose an emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen(value => !value)}><Smile size={23} /></button>{emojiOpen && <div className="impressions-emoji-picker" role="group" aria-label="Choose an emoji">{['??', '??', '??', '??', '?', '??', '??', '??', '??', '??', '??', '??'].map(emoji => <button key={emoji} type="button" aria-label={`Insert ${emoji}`} onClick={() => { setDraft(value => (value + emoji).slice(0, 5000)); setEmojiOpen(false) }}>{emoji}</button>)}</div>}<label className="sr-only" htmlFor="impression-draft">Mock message</label><input id="impression-draft" value={draft} maxLength={5000} disabled={busy} onChange={event => setDraft(event.target.value)} placeholder={editing ? 'Update this message…' : 'Write a little thought…'} autoComplete="off" /><button type="submit" disabled={busy || !draft.trim() || threadLoading} aria-label={editing ? 'Save message changes' : 'Send mock message'}>{editing ? <CheckCheck size={18} /> : <Send size={18} />}</button></form><p className="impressions-disclaimer">Mock conversation · Changes are saved to the archive.</p></div> : <div className="impressions-read-only"><Link to="/login?next=%2Fimpressions">Sign in to send or edit mock messages</Link></div>}</> : <div className="impressions-empty-thread"><MessageCircle size={38} /><h2>Your impressions archive</h2><p>Choose a contact to read their conversation.</p></div>}</section>
      <aside className="impressions-details" aria-label="Contact details"><header><h2>Contact details</h2><button onClick={() => setDetails(false)} aria-label="Close details"><X size={17} /></button></header>{active && <><div className="impressions-profile"><Avatar contact={active} /><h3>{active.name}</h3><p>{active.label}</p><span className="impressions-mock-badge">Fictional appreciation chat</span></div>{session && <div className="impressions-contact-controls"><button disabled={busy} onClick={() => setContactForm({ id: active.id, name: active.name, label: active.label })}><Pencil size={15} /> Edit contact</button><button disabled={busy} onClick={() => photoPicker.current?.click()}><Camera size={15} /> {active.avatar_url ? 'Change' : 'Upload'} profile picture</button><input type="file" accept="image/*" hidden ref={photoPicker} onChange={event => uploadPhoto(event.target.files?.[0])} />{active.avatar_url && <button disabled={busy} onClick={() => setConfirmation({ kind: 'photo', id: active.id })}><X size={15} /> Remove profile picture</button>}<button className="impressions-danger" disabled={busy} onClick={() => setConfirmation({ kind: 'contact', id: active.id })}><Trash2 size={15} /> Delete contact & chat</button>{uploadProgress && <p role="status">{uploadProgress}</p>}</div>}<div className="impressions-detail-section"><h3>About this archive</h3><blockquote>Playful conversations about our favorite person. Every voice here is part of a fictional chat.</blockquote></div><div className="impressions-detail-section"><Link className="impressions-world-link" to="/dictionary">Jaysha-to-English translator →</Link><Link className="impressions-world-link" to="/calendar">Our memories →</Link></div></>}</aside>
    </section>
    {contactForm && session && <div className="impressions-modal-backdrop"><form className="impressions-modal" role="dialog" aria-modal="true" aria-labelledby="contact-form-title" onSubmit={saveContact}><h2 id="contact-form-title">{contactForm.id ? 'Edit contact' : 'New contact'}</h2><label>Name<input autoFocus required maxLength={80} value={contactForm.name} onChange={event => setContactForm({ ...contactForm, name: event.target.value })} /></label><label>About / subtitle<input maxLength={200} value={contactForm.label} onChange={event => setContactForm({ ...contactForm, label: event.target.value })} /></label><p>Add or change their profile picture from Contact details after saving.</p><div><button type="button" disabled={busy} onClick={() => setContactForm(null)}>Cancel</button><button disabled={busy || !contactForm.name.trim()} type="submit">{busy ? 'Saving…' : 'Save contact'}</button></div></form></div>}
    {confirmation && session && <div className="impressions-modal-backdrop"><section className="impressions-modal" role="alertdialog" aria-modal="true" aria-labelledby="impression-delete-title"><h2 id="impression-delete-title">Delete {confirmation.kind === 'contact' ? 'contact and conversation' : confirmation.kind === 'photo' ? 'profile picture' : 'message'}?</h2><p>{confirmation.kind === 'contact' ? 'All messages in this conversation will also be removed.' : 'This will be removed from the shared archive.'} This cannot be undone.</p><div><button autoFocus disabled={busy} onClick={() => setConfirmation(null)}>Cancel</button><button className="impressions-danger" disabled={busy} onClick={removeConfirmed}>{busy ? 'Deleting…' : 'Delete permanently'}</button></div></section></div>}
  </main>
}
