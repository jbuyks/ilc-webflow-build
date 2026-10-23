import { useState, type FormEvent } from 'react';
import { shortDate } from '../data/flags';
import { Layout } from '../components/ui';
import { useApp } from '../store';

export function TimeOff() {
  const { me, timeOff, requestTimeOff } = useApp();
  const mine = timeOff.filter((r) => r.djId === me?.id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!from) return;
    setSending(true);
    await requestTimeOff(from, to || from, note.trim());
    setFrom('');
    setTo('');
    setNote('');
    setSending(false);
  }

  return (
    <Layout>
      <h1 className="title">Time <em>off.</em></h1>
      <form className="card dark" onSubmit={submit}>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>Need a date off? Send a request. Once the office approves it, that date is blocked so no one books you.</p>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <label className="field" style={{ flex: 1 }}>From<input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field" style={{ flex: 1 }}>To<input type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
        <label className="field">Note for the office (optional)<input type="text" value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <button type="submit" className="btn pink" style={{ alignSelf: 'flex-start' }} disabled={sending || !from}>{sending ? 'Sending…' : 'Request time off'}</button>
      </form>
      <p className="sub" style={{ lineHeight: 1.5 }}>Already booked on a date you can't make? Call the office right away. A time-off request doesn't move a gig that's already booked.</p>
      <section className="stack">
        <h2 className="eyebrow">Your requests</h2>
        {mine.length === 0 && <p className="empty">No requests yet.</p>}
        {mine.map((r) => (
          <div key={r.id} className="card between" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <span><b>{r.from === r.to ? shortDate(r.from) : `${shortDate(r.from)} to ${shortDate(r.to)}`}</b>{r.note && <><br /><span className="sub">{r.note}</span></>}</span>
            <span className={`chip ${r.status === 'approved' ? 'ok' : r.status === 'declined' ? 'neutral' : 'warn'}`}>{r.status[0].toUpperCase() + r.status.slice(1)}</span>
          </div>
        ))}
      </section>
    </Layout>
  );
}
