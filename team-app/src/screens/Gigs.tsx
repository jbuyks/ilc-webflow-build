import { useState } from 'react';
import { flagsFor } from '../data/flags';
import { GigRow, Layout } from '../components/ui';
import { useApp, useMyGigs } from '../store';

export function Gigs() {
  const { today } = useApp();
  const mine = useMyGigs();
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const flagged = mine.filter((g) => flagsFor(g, today).length > 0);
  const shown = flaggedOnly ? flagged : mine;

  return (
    <Layout>
      <h1 className="title">Your <em>gigs.</em></h1>
      <div className="row" role="group" aria-label="Filter gigs">
        <button type="button" className="btn" aria-pressed={!flaggedOnly} onClick={() => setFlaggedOnly(false)}>All upcoming · {mine.length}</button>
        <button type="button" className="btn" aria-pressed={flaggedOnly} onClick={() => setFlaggedOnly(true)}>Needs attention · {flagged.length}</button>
      </div>
      <div className="stack">
        {shown.length === 0 && <p className="empty">{flaggedOnly ? 'Nothing needs attention.' : 'No upcoming gigs.'}</p>}
        {shown.map((g) => <GigRow key={g.id} gig={g} sub={g.booked.join(' · ')} />)}
      </div>
    </Layout>
  );
}
