import { sampleSource } from './sampleSource';
import type { DataSource, Gig, TeamMember } from './types';

export * from './types';

interface Snapshot {
  generatedAt: string;
  team: TeamMember[];
  gigs: Gig[];
}

// A real export from HoneyBook + Vibo can be dropped at src/data/local/snapshot.json
// (git-ignored) to run the app on real data before the live sync exists.
const local = import.meta.glob<Snapshot>('./local/snapshot.json', { eager: true, import: 'default' });
const snapshot = Object.values(local)[0];

function snapshotSource(s: Snapshot): DataSource {
  return {
    ...sampleSource,
    label: `Snapshot from ${new Date(s.generatedAt).toLocaleString()}`,
    async team() {
      return s.team;
    },
    async gigs() {
      return s.gigs;
    },
  };
}

export const source: DataSource = snapshot ? snapshotSource(snapshot) : sampleSource;
