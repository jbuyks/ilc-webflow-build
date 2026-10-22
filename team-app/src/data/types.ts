// Shapes the app works with. Each source (sample data, a local snapshot, or the
// live HoneyBook + Vibo sync) has to produce these.

export type Role = 'dj' | 'owner';

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  phone?: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'overdue' | 'unpaid';

/** Planning progress, read from Vibo. */
export interface ViboStatus {
  /** 0 to 1 */
  progress: number;
  /** 'pending' means the couple hasn't accepted the invite yet. */
  status: 'active' | 'locked' | 'pending';
  questionsAnswered: number;
  questionsTotal: number;
  /** ISO timestamp of the couple's last change. */
  lastUpdated: string;
  /** Couple-facing sections with unanswered questions, most important first. */
  openSections: string[];
  /** Timeline entries, as Vibo stores them ("05:00 pm"). */
  timeline: { name: string; time: string }[];
}

/** One booked event, joined from HoneyBook (booking, money) and Vibo (planning). */
export interface Gig {
  id: string;
  couple: string;
  type: string;
  /** YYYY-MM-DD */
  date: string;
  /** "4:30 pm", or null when HoneyBook has no time. */
  start: string | null;
  end: string | null;
  venue: string;
  address?: string;
  /** Best number to text the couple, from HoneyBook. */
  couplePhone?: string;
  /** Null when the booking has no DJ assigned. */
  djId: string | null;
  /** Packages and enhancements booked, from the HoneyBook line items. */
  booked: string[];
  clientTotalCents: number;
  balanceDueCents: number;
  paymentStatus: PaymentStatus;
  vibo: ViboStatus | null;
  /** What the DJ is paid for this gig, in cents. Null until pay rules are set. */
  djPayCents: number | null;
}

export interface TimeOffRequest {
  id: string;
  djId: string;
  from: string;
  to: string;
  note: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface DataSource {
  label: string;
  team(): Promise<TeamMember[]>;
  gigs(): Promise<Gig[]>;
  timeOff(): Promise<TimeOffRequest[]>;
  requestTimeOff(req: Omit<TimeOffRequest, 'id' | 'status' | 'createdAt'>): Promise<TimeOffRequest>;
  decideTimeOff(id: string, status: 'approved' | 'declined'): Promise<void>;
}
