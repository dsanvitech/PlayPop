/**
 * GAME REGISTRY
 * -----------------------------------------------------------
 * To add a new game later, just add one object to this array.
 * The homepage renders itself from this list — nothing else
 * needs to change.
 *
 * category must be one of:
 *   "popular" | "new" | "brain" | "arcade"
 *
 * status: "live"  -> card links to /games/<slug>/
 *         "soon"  -> card shows a locked "coming soon" state
 * -----------------------------------------------------------
 */

const GAMES = [
  {
    slug: "2048",
    title: "2048",
    tagline: "Merge tiles. Chase the number.",
    category: "popular",
    status: "live",
    tab: "01"
  },
  {
    slug: "reaction-test",
    title: "Reaction Test",
    tagline: "How fast are your reflexes, really?",
    category: "popular",
    status: "soon",
    tab: "02"
  },
  {
    slug: "flag-quiz",
    title: "Guess the Flag",
    tagline: "195 countries. How many do you know?",
    category: "popular",
    status: "soon",
    tab: "03"
  },
  {
    slug: "typing-test",
    title: "Typing Speed Test",
    tagline: "Words per minute, under pressure.",
    category: "popular",
    status: "soon",
    tab: "04"
  },
  {
    slug: "emoji-quiz",
    title: "Emoji Quiz",
    tagline: "Decode the picture puzzle.",
    category: "new",
    status: "soon",
    tab: "05"
  },
  {
    slug: "memory-test",
    title: "Memory Test",
    tagline: "Remember the pattern. Repeat it back.",
    category: "brain",
    status: "soon",
    tab: "06"
  },
  {
    slug: "math-challenge",
    title: "Math Challenge",
    tagline: "Mental arithmetic, against the clock.",
    category: "brain",
    status: "soon",
    tab: "07"
  },
  {
    slug: "number-guessing",
    title: "Number Guessing",
    tagline: "Narrow it down before you run out of tries.",
    category: "brain",
    status: "soon",
    tab: "08"
  },
  {
    slug: "flappy",
    title: "Flappy-style Game",
    tagline: "One button. Zero mercy.",
    category: "arcade",
    status: "soon",
    tab: "09"
  },
  {
    slug: "click-speed",
    title: "Click Speed Test",
    tagline: "Clicks per second, measured.",
    category: "arcade",
    status: "soon",
    tab: "10"
  }
];

const CATEGORY_META = {
  popular: { label: "Popular", glyph: "\u25B2", color: "#FF3EA5" },
  new:     { label: "New",     glyph: "\u2726", color: "#3EFFC0" },
  brain:   { label: "Brain Games", glyph: "\u25C8", color: "#7B5EFF" },
  arcade:  { label: "Arcade",  glyph: "\u25A0", color: "#3EC6FF" }
};
