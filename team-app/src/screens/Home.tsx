import { Link } from 'react-router-dom';
import { config } from '../config';
import { flagsFor, relativeDay, shortDate } from '../data/flags';
import { Layout, timeRange } from '../components/ui';
import { useApp, useMyGigs } from '../store';
import { daysUntil } from '../data/flags';

export function Home() {
  const { me, today } = useApp();
  const mine = useMyGigs();
  const next = mine[0];
  const week = mine.filter((g) => daysUntil(g.date, today) <= 7);
  const alerts = mine
    .flatMap((g) => flagsFor(g, today).map((f) => ({ gig: g, flag: f })))
    .sort((a, b) => (a.flag.severity === b.flag.severity ? a.gig.date.localeCompare(b.gig.date) : a.flag.severity === 'urgent' ? -1 : 1))
    .slice(0, 4);

  return (
    <Layout>
      <p className="lede">Hey {me?.name}, here is your week.</p>

      {next ? (
        <section className="card dark" aria-label="Next gig">
          <span className="eyebrow">Next gig</span>
          <span className="big">{relativeDay(next.date, today)}</span>
          <b style={{ fontSize: 17 }}>{next.couple} · {shortDate(next.date)}</b>
          <span className="sub">{next.venue}{timeRange(next)}</span>
          <div className="row" style={{ gap: 6 }}>
            {next.booked.map((b) => <span key={b} className="chip dark">{b}</span>)}
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <Link to={`/gigs/${next.id}`} className="btn pink" style={{ flex: 1 }}>Open gig</Link>
          </div>
        </section>
      ) : (
        <section className="card"><p className="empty">No upcoming gigs assigned to you.</p></section>
      )}

      {alerts.length > 0 && (
        <section className="stack" aria-label="Needs attention">
          {alerts.map(({ gig, flag }) => (
            <Link key={gig.id + flag.label} to={`/gigs/${gig.id}`} className="alert">
              <span className={`dot ${flag.severity === 'warn' ? 'warn' : ''}`} />
              <span><b>{gig.couple}</b> ({shortDate(gig.date)}): {flag.detail}</span>
            </Link>
          ))}
        </section>
      )}

      <section className="stack">
        <h2 className="eyebrow">This week</h2>
        {week.length === 0 && <p className="empty">Nothing in the next 7 days.</p>}
        <div className="card list" style={{ paddingBlock: 4 }}>
          {week.map((g) => {
            const n = flagsFor(g, today).length;
            return (
              <Link key={g.id} to={`/gigs/${g.id}`}>
                <span className="stack" style={{ gap: 2 }}>
                  <b>{g.couple}</b>
                  <span className="sub">{shortDate(g.date)} · {g.venue}</span>
                </span>
                <span className={`chip ${n ? 'warn' : 'ok'}`}>{n ? `${n} to fix` : 'On track'}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2 className="eyebrow">Quick actions</h2>
        <div className="row">
          <Link to="/time-off" className="btn">Request time off</Link>
          <Link to="/planning" className="btn">My planning link</Link>
        </div>
      </section>

      <LinkList title="Your tools" items={config.tools} />
      <LinkList title="Send to couples" items={config.sendToCouples} />

      <section className="card">
        <h2 className="eyebrow">Team</h2>
        {config.officeContacts.map((c) => (
          <div key={c.label} className="between" style={{ fontSize: 14 }}>
            <span>{c.label}</span>
            {c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : <span className="sub">Not set</span>}
          </div>
        ))}
      </section>
    </Layout>
  );
}

function LinkList({ title, items }: { title: string; items: { name: string; note: string; url: string }[] }) {
  return (
    <section className="card list" style={{ paddingBlock: 6 }}>
      <h2 className="eyebrow" style={{ paddingTop: 8 }}>{title}</h2>
      {items.map((t) =>
        t.url ? (
          <a key={t.name} href={t.url} target="_blank" rel="noreferrer">
            <span><b>{t.name}</b><br /><span className="sub">{t.note}</span></span>
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <div key={t.name} className="item">
            <span><b>{t.name}</b><br /><span className="sub">{t.note}</span></span>
            <span className="sub">Link not set</span>
          </div>
        ),
      )}
    </section>
  );
}
