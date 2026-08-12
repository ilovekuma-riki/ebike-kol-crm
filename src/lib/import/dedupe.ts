import { canonicalizeName, normalizeHandle } from "@/lib/utils";
export type MatchCandidate = { id: string; canonicalName: string; email?: string | null; handles: string[]; profileUrls: string[] };
export function findPartnerMatch(input: { name: string; email?: string; handle?: string; profileUrl?: string }, candidates: MatchCandidate[]) {
  if (input.profileUrl) { const hit = candidates.find((c) => c.profileUrls.includes(input.profileUrl!)); if (hit) return { candidate: hit, reason: "profile_url", automatic: true }; }
  if (input.email) { const hit = candidates.find((c) => c.email?.toLowerCase() === input.email!.toLowerCase()); if (hit) return { candidate: hit, reason: "email", automatic: true }; }
  if (input.handle) { const normalized = normalizeHandle(input.handle); const hit = candidates.find((c) => c.handles.some((h) => normalizeHandle(h) === normalized)); if (hit) return { candidate: hit, reason: "handle", automatic: true }; }
  const canonical = canonicalizeName(input.name); const hit = candidates.find((c) => c.canonicalName === canonical);
  return hit ? { candidate: hit, reason: "canonical_name", automatic: true } : null;
}
