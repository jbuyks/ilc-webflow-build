import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { daysUntil, flagsFor, money, shortDate } from '../data/flags';
import { Layout, ViboBar, paymentLabel } from '../components/ui';
import { useApp } from '../store';

export function Owner() {
  const { me, gigs, team, today, timeOff, decideTimeOff } = useApp();
  const [dj, setDj] = useState<string>('all');
  if (me?.role !== 'owner') return <Navigate to="/" replace />;

  const window30 = gigs.filter((g) => {
    const d = daysUntil(g.date, today);
    return d >= 0 && d <= 30;
  });
  const name = (id: string | null) => team.find((m) => m.id === id)?.name ?? 'Unassigned';
  const collected = window30.reduce((s, g) => s + g.clientTotalCents - g.balanceDueCents, 0);
  const due = window30.reduce((s, g) => s + g.balanceDueCents, 0);
  const behind = window30.filter((g) => g.vibo && g.vibo.progress < 0.4).length;
  const issues = window30
    .flatMap((g) => flagsFor(g, today).map((f) => ({ gig: g, flag: f })))
    .sort((a, b) => (a.flag.severity === b.flag.severity ? a.gig.date.localeCompare(b.gig.date) : a.flag.severity === 'urgent' ? -1 : 1));
  const counts = new Map<string, number>();
  for (const g of window30) counts.set(g.djId ?? 'none', (counts.get(g.djId ?? 'none') ?? 0) + 1);
  const max = Math.max(1, ...counts.values());
  const djIds = [...counts.keys()];
  const rows = dj === 'all' ? window30 : window30.filter((g) => (g.djId ?? 'none') === dj);
  const pending = timeOff.filter((r) => r.status === 'pending');

  return (
    <Layout wide>
      <div className="stack" style={{ gap: 6 }}>
        <h1 className="title" style={{ fontSize: 40 }}>The next <em>30 days.</em></h1>
        <p className="lede">{shortDate(today)} through {shortDate(addDays(today, 30))}</p>
      </div>

      <section className="kpis" aria-label="Summary">
        <div className="card dark"><span className="eyebrow">Booked gigs</span><span className="big">{window30.length}</span><span className="sub">{djIds.filter((id) => id !== 'none').length} DJs{counts.has('none') ? ` · ${counts.get('none')} unassigned` : ''}</span></div>
        <div className="card"><span className="eyebrow">Collected</span><span className="big" style={{ color: 'var(--ink)' }}>{money(collected)}</span><span className="sub" style={{ color: due ? 'var(--warn)' : 'var(--ok)', fontWeight: 700 }}>{due ? `${money(due)} still due` : 'Everything paid'}</span></div>
        <div className="card"><span className="eyebrow">Behind in Vibo</span><span className="big" style={{ color: behind ? 'var(--warn)' : 'var(--ink)' }}>{behind}</span><span className="sub">Under 40% done</span></div>
        <div className="card"><span className="eyebrow">Time off to review</span><span className="big" style={{ color: 'var(--ink)' }}>{pending.length}</span><span className="sub">Pending requests</span></div>
      </section>

      <div className="split">
        <section className="main stack">
          <h2 className="eyebrow">Fix this first</h2>
          {issues.length === 0 && <p className="empty">Nothing flagged. Every gig is on track.</p>}
          {issues.map(({ gig, flag }) => (
            <Link key={gig.id + flag.label} to={`/gigs/${gig.id}`} className="alert">
              <span className={`dot ${flag.severity === 'warn' ? 'warn' : ''}`} />
              <span className="stack" style={{ gap: 3, flex: 1 }}>
                <span className="between"><b style={{ fontSize: 15 }}>{gig.couple}</b><span className="sub" style={{ fontWeight: 700 }}>{shortDate(gig.date)} · {name(gig.djId)}</span></span>
                <span>{flag.detail}</span>
              </span>
            </Link>
          ))}
        </section>

        <aside className="side stack" style={{ gap: 20 }}>
          <section className="card">
            <h2 className="eyebrow">Gigs per DJ</h2>
            {djIds.map((id) => (
              <div key={id} style={{ display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 24px', gap: 10, alignItems: 'center', fontSize: 13 }}>
                <b>{id === 'none' ? 'Unassigned' : name(id)}</b>
                <span className="bar"><span style={{ width: `${((counts.get(id) ?? 0) / max) * 100}%`, background: 'var(--rose)' }} /></span>
                <b style={{ textAlign: 'right' }}>{counts.get(id)}</b>
              </div>
            ))}
          </section>
          <section className="card">
            <h2 className="eyebrow">Time-off requests</h2>
            {pending.length === 0 && <p className="sub">None waiting.</p>}
            {pending.map((r) => (
              <div key={r.id} className="stack" style={{ gap: 6, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                <span><b>{name(r.djId)}</b> · {r.from === r.to ? shortDate(r.from) : `${shortDate(r.from)} to ${shortDate(r.to)}`}</span>
                {r.note && <span className="sub">{r.note}</span>}
                <div className="row">
                  <button type="button" className="btn solid" onClick={() => decideTimeOff(r.id, 'approved')}>Approve</button>
                  <button type="button" className="btn" onClick={() => decideTimeOff(r.id, 'declined')}>Decline</button>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <section className="stack">
        <div className="between" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <h2 className="eyebrow">Every gig</h2>
          <div className="row" role="group" aria-label="Filter by DJ">
            <button type="button" className="btn" aria-pressed={dj === 'all'} onClick={() => setDj('all')}>All · {window30.length}</button>
            {djIds.map((id) => (
              <button key={id} type="button" className="btn" aria-pressed={dj === id} onClick={() => setDj(id)}>
                {id === 'none' ? 'Unassigned' : name(id)} · {counts.get(id)}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th scope="col">DATE</th><th scope="col">COUPLE</th><th scope="col">VENUE</th><th scope="col">DJ</th><th scope="col">BOOKED</th><th scope="col">PAID</th><th scope="col" style={{ width: 160 }}>VIBO</th></tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id}>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{shortDate(g.date)}</td>
                  <td><Link to={`/gigs/${g.id}`} style={{ fontWeight: 700 }}>{g.couple}</Link></td>
                  <td>{g.venue}</td>
                  <td><span className={`chip ${g.djId ? 'neutral' : 'warn'}`}>{name(g.djId)}</span></td>
                  <td>{g.booked.join(', ')}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{money(g.clientTotalCents)}<br /><span className="sub">{paymentLabel(g)}</span></td>
                  <td>{g.vibo ? <ViboBar progress={g.vibo.progress} /> : <span className="sub">Not in Vibo</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
