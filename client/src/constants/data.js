// Strings = landscape (full width). Arrays = multi-column row (side by side).
export const CANADA_ITEMS = [
  "sunset-barn",
  ["rolling-hills", "wheat"],
  "windows-xp-grass",
  ["blurred-rain", "moon", "firework"],
  "pink-sky-plane",
  ["cargo-cranes", "summer-drink-days"],
];

export const CANADA_PHOTOS = CANADA_ITEMS.flatMap((item) =>
  Array.isArray(item) ? item : [item],
);

// Strings = landscape (full width). Arrays = portrait group (side by side).
// Empty strings in arrays are spacers for the desktop grid layout.
export const MEXICO_ITEMS = [
  "orange-wall",
  ["green-wall", "blue-door", "bike-leaves"],
  ["meat-vendor", "pastor-tacos"],
  ["", "street-vendor", "", "coke-store"],
  ["taco-vendor", "bakery"],
  ["flowers", "fruit-store", "fruit-vendor"],
  ["old-man", ""],
  ["bikes", "", "pool", "", "street-stalls"],
  "windmill",
  ["modern-balcony", "", "old-building"],
  "line-squirrel",
  ["playground", ""],
  ["museum-reflection", "museum-roof", "art-museum", "palace", ""],
  ["plaza-garibaldi"],
];

export const MEXICO_FLAT_IMAGES = MEXICO_ITEMS.flatMap((item) =>
  Array.isArray(item) ? item.filter(Boolean) : [item],
).filter(Boolean);

export const PROJECTS = [
  {
    name: "FOMO",
    description:
      "An Android location tracking social app made for friends to stay connected. Cool features are the on-my-way status and shared places.",
    link: "https://github.com/bryanjiang117/FOMO",
    image: "/assets/images/projects/fomo.png",
    isDesign: false,
  },
  {
    name: "Unclutter",
    description:
      "A mobile app that provides a new take on note organization. Notes are sorted into semantically-grouped visual bubbles.",
    link: "https://www.figma.com/community/file/1578143880936148685/unclutter?q_id=686bfa3e-ba29-4173-9ace-550c973c9522",
    isDesign: true,
  },
];

export const SOCIALS = [
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/bryanjiang117",
  },
  {
    name: "GitHub",
    link: "https://github.com/bryanjiang117",
  },
  {
    name: "Other Site",
    link: "https://www.bryan-jiang.com/",
  },
];
