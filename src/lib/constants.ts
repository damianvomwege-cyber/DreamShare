import type {
  AdminAction,
  DreamMood,
  DreamVisibility,
  ReactionType,
  Role,
} from "@/generated/prisma/client";

export const APP_NAME = "DreamShare";

export const ROLE_WEIGHT: Record<Role, number> = {
  USER: 0,
  MODERATOR: 10,
  ADMIN: 20,
  OWNER: 30,
};

export const DREAM_CATEGORIES = [
  {
    name: "Nightmare",
    slug: "nightmare",
    description: "Dark dreams, fears, and high-tension sleep stories.",
    color: "#ef4444",
    icon: "Moon",
  },
  {
    name: "Lucid Dream",
    slug: "lucid-dream",
    description: "Dreams where the sleeper knew they were dreaming.",
    color: "#06b6d4",
    icon: "Sparkles",
  },
  {
    name: "Adventure",
    slug: "adventure",
    description: "Journeys, quests, escapes, and discoveries.",
    color: "#22c55e",
    icon: "Compass",
  },
  {
    name: "Fantasy",
    slug: "fantasy",
    description: "Magic, impossible places, and mythic worlds.",
    color: "#a855f7",
    icon: "Wand",
  },
  {
    name: "Funny",
    slug: "funny",
    description: "Absurd dreams that landed like a joke.",
    color: "#f97316",
    icon: "Smile",
  },
  {
    name: "Weird",
    slug: "weird",
    description: "Dream logic at its strangest.",
    color: "#84cc16",
    icon: "Orbit",
  },
  {
    name: "Emotional",
    slug: "emotional",
    description: "Dreams centered on memory, grief, joy, or longing.",
    color: "#ec4899",
    icon: "Heart",
  },
  {
    name: "Mystery",
    slug: "mystery",
    description: "Puzzles, hidden meanings, and unresolved symbols.",
    color: "#64748b",
    icon: "Search",
  },
  {
    name: "Sci-Fi",
    slug: "sci-fi",
    description: "Futures, space, machines, and speculative worlds.",
    color: "#3b82f6",
    icon: "Rocket",
  },
  {
    name: "Other",
    slug: "other",
    description: "Dreams that refuse a clean label.",
    color: "#14b8a6",
    icon: "Cloud",
  },
] as const;

export const MOOD_LABELS: Record<DreamMood, string> = {
  PEACEFUL: "Peaceful",
  JOYFUL: "Joyful",
  ANXIOUS: "Anxious",
  SCARY: "Scary",
  MELANCHOLY: "Melancholy",
  CONFUSING: "Confusing",
  EPIC: "Epic",
  ROMANTIC: "Romantic",
  SURREAL: "Surreal",
  OTHER: "Other",
};

export const DREAM_VISIBILITY_LABELS: Record<DreamVisibility, string> = {
  PUBLIC: "Public",
  FOLLOWERS: "Followers",
  PRIVATE: "Private",
};

export const DREAM_VISIBILITIES = (
  Object.keys(DREAM_VISIBILITY_LABELS) as DreamVisibility[]
).map((value) => ({
  value,
  label: DREAM_VISIBILITY_LABELS[value],
}));

export const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: "Like",
  INTERESTING: "Interesting",
  CREEPY: "Creepy",
  FUNNY: "Funny",
  AMAZING: "Amazing",
};

export const REACTION_STYLES: Record<ReactionType, string> = {
  LIKE: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  INTERESTING: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  CREEPY: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  FUNNY: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  AMAZING: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const AUDITED_ADMIN_ACTIONS: AdminAction[] = [
  "LOGIN",
  "LOGOUT",
  "USER_BAN",
  "USER_SUSPEND",
  "USER_DELETE",
  "DREAM_DELETE",
  "COMMENT_DELETE",
  "REPLY_DELETE",
  "ROLE_CHANGE",
  "REPORT_RESOLVE",
  "SETUP_COMPLETE",
];

export const BANNED_KEYWORDS = [
  "buy followers",
  "crypto giveaway",
  "free money",
  "discord nitro free",
];
