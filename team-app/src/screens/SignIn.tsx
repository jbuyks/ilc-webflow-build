import { useApp } from '../store';

// Placeholder until real logins exist: anyone opening the app picks who they are.
// Replace with the auth provider before real client data goes in.
export function SignIn() {
  const { team, signIn } = useApp();
  return (
    <div className="shell">
      <main className="page" style={{ paddingTop: 48 }}>
        <div className="stack" style={{ gap: 4 }}>
          <b style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '0.04em' }}>IFE LUXE</b>
          <span className="eyebrow" style={{ color: 'var(--rose)' }}>Team</span>
        </div>
        <h1 className="title">Who's <em>signing in?</em></h1>
        <div className="stack">
          {team.map((m) => (
            <button key={m.id} type="button" className="btn" style={{ justifyContent: 'space-between' }} onClick={() => signIn(m.id)}>
              <span>{m.name}</span>
              <span className="sub">{m.role === 'owner' ? 'Owner' : 'DJ'}</span>
            </button>
          ))}
        </div>
        <p className="sub">Real sign-in comes before launch. For now this just picks whose view you see.</p>
      </main>
    </div>
  );
}
