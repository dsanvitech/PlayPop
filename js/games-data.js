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
    slug: "mountainbike",
    title: "Mountain Bike",
    tagline: "Climb the mountain. Don't crash.",
    category: "arcade",
    status: "live",
    tab: "01"
  },
  {
    slug: "car_racing",
    title: "Car Racing",
    tagline: "Race fast. Beat the clock.",
    category: "arcade",
    status: "live",
    tab: "02"
  }
];

const CATEGORY_META = {
  popular: { label: "Popular", glyph: "\u25B2", color: "#FF3EA5" },
  new:     { label: "New",     glyph: "\u2726", color: "#3EFFC0" },
  brain:   { label: "Brain Games", glyph: "\u25C8", color: "#7B5EFF" },
  arcade:  { label: "Arcade",  glyph: "\u25A0", color: "#3EC6FF" }
};
