import { Link } from 'react-router-dom';
import { config } from '../config';
import { money, shortDate } from '../data/flags';
import { Layout } from '../components/ui';
import { useMyGigs } from '../store';

export function Pay() {
  const mine = useMyGigs();
  const priced = mine.filter((g) => g.djPayCents != null);
  const total = priced.reduce((s, g) => s + (g.djPayCents ?? 0), 0);

  return (
    <Layout>
      <h1 className="title">Your <em>pay.</em></h1>
      <section className="card dark">
        <span className="eyebrow">Upcoming</span>
        <span className="big">{priced.length ? money(total) : 'Not set yet'}</span>
        <span className="sub">{mine.length} upcoming gigs{priced.length < mine.length ? ` · ${mine.length - priced.length} without pay set` : ''}</span>
      </section>

      <section className="card list" style={{ paddingBlock: 6 }}>
        <h2 className="eyebrow" style={{ paddingTop: 8 }}>By gig</h2>
        {mine.length === 0 && <p className="empty">No upcoming gigs.</p>}
        {mine.map((g) => (
          <Link key={g.id} to={`/gigs/${g.id}`}>
            <span><b>{g.couple}</b><br /><span className="sub">{shortDate(g.date)} · {g.booked[0]}</span></span>
            <b>{g.djPayCents != null ? money(g.djPayCents) : '—'}</b>
          </Link>
        ))}
      </section>

      <section className="card" style={{ border: '1px dashed var(--rose)' }}>
        <b>How pay works</b>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{config.payRules || 'The office hasn’t written up pay rules yet.'}</p>
      </section>
    </Layout>
  );
}
