import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { source, type Gig, type TeamMember, type TimeOffRequest } from './data';
import { isoToday } from './data/flags';

interface AppState {
  loading: boolean;
  error: string | null;
  sourceLabel: string;
  today: string;
  team: TeamMember[];
  gigs: Gig[];
  timeOff: TimeOffRequest[];
  me: TeamMember | null;
  signIn(id: string): void;
  signOut(): void;
  requestTimeOff(from: string, to: string, note: string): Promise<void>;
  decideTimeOff(id: string, status: 'approved' | 'declined'): Promise<void>;
  checklist(gigId: string): Record<string, boolean>;
  toggleStep(gigId: string, stepId: string): void;
}

const Ctx = createContext<AppState | null>(null);

const ME_KEY = 'ilc.me';
const CHECK_KEY = 'ilc.checklists';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked: state lasts until reload.
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOffRequest[]>([]);
  const [meId, setMeId] = useState<string | null>(() => read<string | null>(ME_KEY, null));
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>(() => read(CHECK_KEY, {}));

  useEffect(() => {
    Promise.all([source.team(), source.gigs(), source.timeOff()])
      .then(([t, g, o]) => {
        setTeam(t);
        setGigs([...g].sort((a, b) => a.date.localeCompare(b.date)));
        setTimeOff(o);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load data'))
      .finally(() => setLoading(false));
  }, []);

  const me = team.find((m) => m.id === meId) ?? null;
  // DJs never get what the client pays. The live backend must strip this server-side too.
  const visibleGigs = useMemo(
    () => (me?.role === 'owner' ? gigs : gigs.map(({ billing: _billing, ...g }) => g)),
    [gigs, me],
  );

  const signIn = useCallback((id: string) => {
    setMeId(id);
    write(ME_KEY, id);
  }, []);
  const signOut = useCallback(() => {
    setMeId(null);
    write(ME_KEY, null);
  }, []);

  const requestTimeOff = useCallback(
    async (from: string, to: string, note: string) => {
      if (!meId) return;
      await source.requestTimeOff({ djId: meId, from, to, note });
      setTimeOff([...(await source.timeOff())]);
    },
    [meId],
  );

  const decideTimeOff = useCallback(async (id: string, status: 'approved' | 'declined') => {
    await source.decideTimeOff(id, status);
    setTimeOff([...(await source.timeOff())]);
  }, []);

  const checklist = useCallback((gigId: string) => checks[gigId] ?? {}, [checks]);
  const toggleStep = useCallback((gigId: string, stepId: string) => {
    setChecks((prev) => {
      const next = { ...prev, [gigId]: { ...prev[gigId], [stepId]: !prev[gigId]?.[stepId] } };
      write(CHECK_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      loading, error, sourceLabel: source.label, today: isoToday(), team, gigs: visibleGigs, timeOff, me,
      signIn, signOut, requestTimeOff, decideTimeOff, checklist, toggleStep,
    }),
    [loading, error, team, visibleGigs, timeOff, me, signIn, signOut, requestTimeOff, decideTimeOff, checklist, toggleStep],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

/** Gigs the signed-in person should see in the DJ tabs: their own, upcoming. */
export function useMyGigs(): Gig[] {
  const { gigs, me, today } = useApp();
  return useMemo(() => gigs.filter((g) => g.date >= today && g.djId === me?.id), [gigs, me, today]);
}
