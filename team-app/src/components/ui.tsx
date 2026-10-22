import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { Billing, Gig } from '../data';
import { flagsFor, type Flag } from '../data/flags';
import { useApp } from '../store';

const icons: Record<string, ReactNode> = {
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  gigs: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  pay: <><rect x="3" y="6" width="18" height="13" rx="2" /><circle cx="12" cy="12.5" r="2.5" /></>,
  plan: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /></>,
  off: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
  team: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5a3 3 0 010 6M21 20c0-2.6-1.6-4.8-4-5.6" /></>,
};

export function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export function Layout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { me, signOut, sourceLabel } = useApp();
  const tabs: [string, string, keyof typeof icons][] = [
    ['/', 'Home', 'home'],
    ['/gigs', 'Gigs', 'gigs'],
    ['/pay', 'Pay', 'pay'],
    ['/planning', 'Planning', 'plan'],
    ['/time-off', 'Time off', 'off'],
  ];
  if (me?.role === 'owner') tabs.push(['/owner', 'Team', 'team']);
  return (
    <div className={wide ? 'shell wide' : 'shell'}>
      {sourceLabel === 'Sample data' && <div className="banner">Showing sample data</div>}
      <header className="topbar">
        <Link to="/" className="brand"><b>IFE LUXE</b><span>{me?.role === 'owner' && wide ? 'OWNER' : 'TEAM'}</span></Link>
        <button type="button" className="who" onClick={signOut} aria-label={`Signed in as ${me?.name}. Sign out`}>
          {me?.name}<br />Sign out
        </button>
      </header>
      <main className="page">{children}</main>
      <nav className="tabs" aria-label="Main">
        <div>
          {tabs.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function FlagChips({ flags }: { flags: Flag[] }) {
  return (
    <>
      {flags.map((f) => (
        <span key={f.label} className={`chip ${f.severity}`}>{f.label}</span>
      ))}
    </>
  );
}

export function StatusChips({ gig }: { gig: Gig }) {
  const { today } = useApp();
  const flags = flagsFor(gig, today);
  const v = gig.vibo;
  const viboFlagged = flags.some((f) => f.label.startsWith('Vibo '));
  return (
    <div className="row" style={{ gap: 5 }}>
      {v && !viboFlagged && (
        <span className="chip ok">Vibo {Math.round(v.progress * 100)}%{v.status === 'locked' ? ' · locked' : ''}</span>
      )}
      {gig.billing && <span className={`chip ${gig.billing.paymentStatus === 'paid' ? 'ok' : 'warn'}`}>{paymentLabel(gig.billing)}</span>}
      <FlagChips flags={flags} />
    </div>
  );
}

export function paymentLabel(billing: Billing): string {
  return { paid: 'Paid in full', partial: 'Partly paid', overdue: 'Payment overdue', unpaid: 'Unpaid' }[billing.paymentStatus];
}

export function GigRow({ gig, sub }: { gig: Gig; sub?: string }) {
  const d = new Date(gig.date + 'T12:00:00');
  return (
    <Link to={`/gigs/${gig.id}`} className="gig-row">
      <span className="date-badge" aria-hidden="true">
        <small>{d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</small>
        <b>{d.getDate()}</b>
        <span>{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
      </span>
      <span className="stack" style={{ gap: 4, minWidth: 0 }}>
        <b style={{ fontSize: 15 }}>{gig.couple}</b>
        <span className="sub">{gig.venue}{timeRange(gig)}</span>
        {sub && <span className="sub">{sub}</span>}
        <StatusChips gig={gig} />
      </span>
    </Link>
  );
}

export function timeRange(gig: Gig): string {
  if (!gig.start) return ' · times not set';
  return gig.end ? ` · ${gig.start} to ${gig.end}` : ` · starts ${gig.start}`;
}

export function ViboBar({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);
  const color = pct >= 60 ? 'var(--ok)' : pct >= 40 ? 'var(--rose)' : 'var(--alert)';
  return (
    <span className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
      <span className="bar" role="img" aria-label={`Vibo ${pct}% done`}><span style={{ width: `${pct}%`, background: color }} /></span>
      <b style={{ fontSize: 12, width: 36, textAlign: 'right' }}>{pct}%</b>
    </span>
  );
}

/** An sms: link with a drafted nudge, so "Text them" opens the DJ's own messages app. */
export function textLink(gig: Gig, djName: string): string | null {
  if (!gig.couplePhone) return null;
  const open = gig.vibo?.openSections.slice(0, 4) ?? [];
  const body = open.length
    ? `Hi ${gig.couple}! ${djName} from Ife Luxe here. When you have a few minutes, could you fill in ${listJoin(open)} in Vibo? Happy to hop on a quick call if that's easier.`
    : `Hi ${gig.couple}! ${djName} from Ife Luxe here, just checking in before your big day.`;
  return `sms:${gig.couplePhone.replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(body)}`;
}

function listJoin(items: string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
