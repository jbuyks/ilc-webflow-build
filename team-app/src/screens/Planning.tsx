import { useState } from 'react';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { daysUntil, flagsFor, relativeDay, shortDate } from '../data/flags';
import { FlagChips, Layout, MeetingRow, ViboBar, textLink } from '../components/ui';
import { useApp, useMyGigs, useMyMeetings } from '../store';

export function Planning() {
  const { me, today } = useApp();
  const calls = useMyMeetings();
  const soon = useMyGigs().filter((g) => daysUntil(g.date, today) <= 45);
  const link = config.planningLink && me ? config.planningLink.replace('{name}', me.name.toLowerCase()) : '';
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Layout>
      <h1 className="title">Planning.</h1>

      <section className="card dark">
        <span className="eyebrow">Your planning call link</span>
        {link ? (
          <>
            <span style={{ fontSize: 15, fontWeight: 600, wordBreak: 'break-all' }}>{link}</span>
            <button type="button" className="btn pink" style={{ alignSelf: 'flex-start' }} onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
          </>
        ) : (
          <span className="sub">The office hasn’t set up booking links yet.</span>
        )}
      </section>

      <section className="stack">
        <h2 className="eyebrow">Your calls</h2>
        {calls.length === 0 && <p className="empty">No calls on your calendar.</p>}
        {calls.map((m) => <MeetingRow key={m.id} meeting={m} />)}
      </section>

      <section className="stack">
        <h2 className="eyebrow">Next 45 days</h2>
        {soon.length === 0 && <p className="empty">No gigs in the next 45 days.</p>}
        {soon.map((g) => {
          const sms = textLink(g, me?.name ?? 'Your DJ');
          const flags = flagsFor(g, today);
          return (
            <div key={g.id} className="card">
              <div className="between">
                <Link to={`/gigs/${g.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}><b style={{ fontSize: 15 }}>{g.couple}</b></Link>
                <span className="sub">{shortDate(g.date)} · {relativeDay(g.date, today)}</span>
              </div>
              {g.vibo ? <ViboBar progress={g.vibo.progress} /> : <span className="chip neutral" style={{ alignSelf: 'flex-start' }}>Not in Vibo</span>}
              {flags.length > 0 && <div className="row" style={{ gap: 5 }}><FlagChips flags={flags} /></div>}
              {g.vibo && g.vibo.openSections.length > 0 && (
                <span style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--muted)' }}>Still open in Vibo: {g.vibo.openSections.join(', ')}</span>
              )}
              <div className="row">
                {sms ? <a className="btn solid" href={sms}>Text them</a> : <span className="sub">No phone on file</span>}
                <a className="btn" href="https://app.vibodj.com" target="_blank" rel="noreferrer">Open Vibo</a>
              </div>
            </div>
          );
        })}
      </section>
    </Layout>
  );
}
