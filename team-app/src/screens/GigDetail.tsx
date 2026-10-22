import { Link, useParams } from 'react-router-dom';
import { checklistTemplate } from '../config';
import { daysUntil, flagsFor, longDate, money, relativeDay, shortDate } from '../data/flags';
import { FlagChips, Layout, ViboBar, paymentLabel, textLink } from '../components/ui';
import { useApp } from '../store';

export function GigDetail() {
  const { id } = useParams();
  const { gigs, team, today, me, checklist, toggleStep } = useApp();
  const gig = gigs.find((g) => g.id === id && (me?.role === 'owner' || g.djId === me?.id));

  if (!gig) {
    return (
      <Layout>
        <p className="empty">That gig isn't in your list.</p>
        <Link to="/gigs" className="btn">Back to gigs</Link>
      </Layout>
    );
  }

  const dj = team.find((m) => m.id === gig.djId);
  const flags = flagsFor(gig, today);
  const done = checklist(gig.id);
  const doneCount = checklistTemplate.filter((s) => done[s.id]).length;
  const sms = textLink(gig, me?.name ?? 'Your DJ');
  const mapUrl = `https://maps.apple.com/?q=${encodeURIComponent([gig.venue, gig.address].filter(Boolean).join(', '))}`;

  return (
    <Layout>
      <Link to="/gigs" style={{ fontWeight: 700, textDecoration: 'none' }}>← Gigs</Link>
      <div className="stack" style={{ gap: 6 }}>
        <span className="eyebrow" style={{ color: 'var(--rose)' }}>{gig.type} · {relativeDay(gig.date, today)}</span>
        <h1 className="title">{gig.couple}</h1>
        <span className="lede">{longDate(gig.date)}</span>
        {flags.length > 0 && <div className="row" style={{ gap: 5 }}><FlagChips flags={flags} /></div>}
      </div>

      <dl className="card" style={{ paddingBlock: 4, margin: 0, gap: 0 }}>
        <div className="kv"><dt>Times</dt><dd>{gig.start ? `${gig.start}${gig.end ? ` to ${gig.end}` : ''}` : <span className="chip warn">Not set in HoneyBook</span>}</dd></div>
        <div className="kv"><dt>Venue</dt><dd>{gig.venue}{gig.address && <><br />{gig.address}</>}<br /><a href={mapUrl} target="_blank" rel="noreferrer"><b>Open in Maps</b></a></dd></div>
        <div className="kv"><dt>Couple</dt><dd>{gig.couplePhone ? <a href={`tel:${gig.couplePhone}`}>{gig.couplePhone}</a> : <span className="sub">No phone on file</span>}</dd></div>
        <div className="kv"><dt>DJ</dt><dd>{dj ? dj.name : <span className="chip warn">No DJ assigned</span>}</dd></div>
      </dl>

      <section className="card">
        <h2 className="eyebrow">What they booked</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{gig.booked.map((b) => <b key={b} style={{ display: 'block' }}>{b}</b>)}</p>
        {gig.billing && (
          <span className={`chip ${gig.billing.paymentStatus === 'paid' ? 'ok' : 'warn'}`} style={{ alignSelf: 'flex-start' }}>
            {paymentLabel(gig.billing)} · {money(gig.billing.clientTotalCents)}
          </span>
        )}
      </section>

      <section className="card dark">
        <span className="eyebrow">Your pay</span>
        <span className="big" style={{ fontSize: 34 }}>{gig.djPayCents != null ? money(gig.djPayCents) : 'Not set yet'}</span>
        <span className="sub">{gig.djPayCents != null ? 'Paid after the event' : 'The office hasn’t entered pay rules yet'}</span>
      </section>

      <section className="card">
        <h2 className="eyebrow">Vibo planning</h2>
        {gig.vibo ? (
          <>
            <ViboBar progress={gig.vibo.progress} />
            <span className="sub">{gig.vibo.questionsAnswered} of {gig.vibo.questionsTotal} questions answered · last change {shortDate(gig.vibo.lastUpdated.slice(0, 10))}</span>
            {gig.vibo.openSections.length > 0 && <span style={{ fontSize: 13 }}>Still open: {gig.vibo.openSections.join(', ')}</span>}
          </>
        ) : (
          <span className="sub">No Vibo event linked.</span>
        )}
        <div className="row">
          <a className="btn solid" href="https://app.vibodj.com" target="_blank" rel="noreferrer">Open Vibo</a>
          {sms && <a className="btn" href={sms}>Text them</a>}
        </div>
      </section>

      <section className="stack">
        <div className="between">
          <h2 className="eyebrow">Prep checklist</h2>
          <b style={{ fontSize: 12, color: 'var(--rose)' }}>{doneCount} of {checklistTemplate.length} done</b>
        </div>
        {checklistTemplate.map((s) => {
          const isDone = !!done[s.id];
          const due = new Date(gig.date + 'T12:00:00');
          due.setDate(due.getDate() - s.daysBefore);
          const dueIso = due.toISOString().slice(0, 10);
          const late = !isDone && daysUntil(dueIso, today) < 0;
          return (
            <div key={s.id} className="check">
              <button type="button" aria-pressed={isDone} aria-label={`${isDone ? 'Mark not done' : 'Mark done'}: ${s.text}`} onClick={() => toggleStep(gig.id, s.id)}>
                {isDone && (
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFEFE6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                )}
              </button>
              <span className="stack" style={{ gap: 3 }}>
                <span className={isDone ? 'done' : ''} style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{s.text}</span>
                <span className="sub" style={{ fontSize: 11, fontWeight: 600, color: late ? 'var(--warn)' : undefined }}>
                  {s.daysBefore > 0 ? `${s.daysBefore} days out` : 'Day after'} · {late ? 'overdue, was due ' : ''}{shortDate(dueIso)}
                </span>
              </span>
            </div>
          );
        })}
      </section>
    </Layout>
  );
}
