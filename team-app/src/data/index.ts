import { sampleSource } from './sampleSource';
import type { DataSource, Gig, Meeting, TeamMember } from './types';

export * from './types';

interface Snapshot {
  generatedAt: string;
  team: TeamMember[];
  gigs: Gig[];
  meetings?: Meeting[];
}

// A real export from BeatPilot, HoneyBook, Vibo and Google Calendar can be dropped at
// src/data/local/snapshot.json (git-ignored) to run the app on real data before the live sync exists.
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
    async meetings() {
      return s.meetings ?? [];
    },
  };
}

export const source: DataSource = snapshot ? snapshotSource(snapshot) : sampleSource;
