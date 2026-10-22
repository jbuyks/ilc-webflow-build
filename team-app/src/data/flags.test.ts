import { describe, expect, it } from 'vitest';
import { daysUntil, flagsFor } from './flags';
import type { Gig } from './types';

const base: Gig = {
  id: 'x', couple: 'A & B', type: 'Wedding', date: '2026-10-31', start: '5:00 pm', end: '10:00 pm',
  venue: 'Hall', djId: 'dj1', crew: [{ memberId: 'dj1', role: 'DJ' }], booked: ['Luxe Experience'], djPayCents: null,
  billing: { clientTotalCents: 300000, balanceDueCents: 0, paymentStatus: 'paid' },
  vibo: { progress: 0.9, status: 'active', questionsAnswered: 90, questionsTotal: 100, lastUpdated: '2026-10-20T00:00:00Z', openSections: [], timeline: [] },
};
const today = '2026-10-22';
const labels = (g: Partial<Gig>) => flagsFor({ ...base, ...g }, today).map((f) => `${f.severity}:${f.label}`);

describe('daysUntil', () => {
  it('counts calendar days', () => {
    expect(daysUntil('2026-10-23', today)).toBe(1);
    expect(daysUntil('2026-11-01', '2026-10-31')).toBe(1);
  });
});

describe('flagsFor', () => {
  it('passes a healthy gig', () => {
    expect(labels({})).toEqual([]);
  });

  it('flags missing times, urgent when close', () => {
    expect(labels({ date: '2026-10-23', start: null, end: null })).toEqual(['urgent:Times missing']);
    expect(labels({ start: null })).toEqual(['warn:Times missing']);
  });

  it('flags an unassigned booking', () => {
    expect(labels({ djId: null, crew: [] })).toEqual(['warn:No DJ assigned']);
  });

  it('flags live music booked with no musician on the team', () => {
    const booked = ['Celebration Experience', 'Hybrid Fusion (DJ + Musician)'];
    expect(labels({ booked, date: '2026-11-14' })).toEqual(['warn:No musician assigned']);
    expect(labels({ booked, date: '2026-10-30' })).toEqual(['urgent:No musician assigned']);
    expect(labels({ booked, crew: [{ memberId: 'dj1', role: 'DJ' }, { memberId: 'm1', role: 'Drummer' }] })).toEqual([]);
  });

  it('flags low Vibo progress inside 30 days, urgent inside a week', () => {
    const vibo = { ...base.vibo!, progress: 0.3, questionsAnswered: 25, questionsTotal: 82 };
    expect(labels({ vibo })).toEqual(['warn:Vibo 30%']);
    expect(labels({ vibo, date: '2026-10-24' })).toEqual(['urgent:Vibo 30%']);
    expect(labels({ vibo, date: '2026-12-31' })).toEqual([]);
  });

  it('flags couples who have gone quiet', () => {
    const vibo = { ...base.vibo!, progress: 0.5, lastUpdated: '2026-09-07T04:51:24Z' };
    expect(labels({ vibo })).toEqual(['warn:Quiet 45 days']);
  });

  it('catches an end-of-night moment set to AM', () => {
    const vibo = { ...base.vibo!, timeline: [{ name: '❗️Grand Exit', time: '10:00 am' }, { name: 'Reception', time: '06:00 pm' }] };
    expect(labels({ vibo })).toEqual(['warn:Grand Exit at 10:00 AM']);
  });

  it('flags a pending Vibo invite and a balance due', () => {
    const vibo = { ...base.vibo!, status: 'pending' as const };
    expect(labels({ vibo, billing: { clientTotalCents: 300000, balanceDueCents: 50000, paymentStatus: 'partial' } })).toEqual(['urgent:Balance due', 'warn:Vibo invite pending']);
  });

  it('never flags money on a gig without billing (a DJ\'s view)', () => {
    expect(labels({ billing: undefined })).toEqual([]);
  });

  it('ignores past gigs', () => {
    expect(labels({ date: '2026-10-01', start: null })).toEqual([]);
  });
});
