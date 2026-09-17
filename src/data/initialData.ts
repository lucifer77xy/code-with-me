import { Profile, CodingSession, Weakpoint, CoupleNote } from "@/types";

const EMPTY_PROFILE_IDS = {
  current: "00000000-0000-0000-0000-000000000001",
  partner: "00000000-0000-0000-0000-000000000002",
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: EMPTY_PROFILE_IDS.current,
    email: "",
    name: "You",
    partner_label: "You",
    avatar_url: "/boy-profile.jpg",
    motto: "Start coding together, one session at a time.",
    theme_color: "violet",
    current_streak: 0,
    total_hours: 0,
    problems_solved: 0,
    is_coding_now: false,
    active_session_topic: null,
    active_session_started_at: null,
  },
  {
    id: EMPTY_PROFILE_IDS.partner,
    email: "",
    name: "Partner",
    partner_label: "Partner",
    avatar_url: "/girl-profile.jpg",
    motto: "Invite your partner to start tracking together.",
    theme_color: "rose",
    current_streak: 0,
    total_hours: 0,
    problems_solved: 0,
    is_coding_now: false,
    active_session_topic: null,
    active_session_started_at: null,
  },
];

export const INITIAL_SESSIONS: CodingSession[] = [];
export const INITIAL_WEAKPOINTS: Weakpoint[] = [];
export const INITIAL_NOTES: CoupleNote[] = [];

export const LEGACY_PROFILE_IDS = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
];

export const hasLegacySeedData = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;

  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return LEGACY_PROFILE_IDS.some((id) => serialized.includes(id)) || /Alex|Sam|codetogether\.love/i.test(serialized);
};
