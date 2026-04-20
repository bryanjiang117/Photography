// Strings = landscape (full width). Arrays = multi-column row (side by side).
export const CANADA_ITEMS = [
  ["leaves-glow", "golden-maples", "fallen-leaves", "autumn-pond"],
  ["ferry-lookout"],
  ["fish-vendor", "boat-cabin", "", ""],
  ["container-ship", "port-cranes", "cargo-cranes"],
  ['', "pacific-railway"],
  ["totem-top", "parliament-flowers", "war-memorial"],
  ["nootka-court", "flower-lamppost", "totem-pole"],
  ["sunset-seagull", "pink-jellyfish"],
  // ["city-canyon", "subway-riders", "dusk-clouds", "night-towers"],
  ["walking-dog", "", "street-protester"],
  // ["", "distillery-lights"],
  ["glass-atrium", "cn-skyline", "cn-tower"],
  ["towering-cloud", "golden-spires"],
  ["wet-leaves", "rainy-roses", "blurred-rain"],
  "brick-tower",
  // ["distant-plane", "pink-sky-plane"],
  ["scrap-sculpture", "gated-alley", "graffiti-alley"],
  ["moon", "firework"],
  ["train-station", "subway-map", "subway-wait"], // fix make sure that the 3 none-vertical ones are still horizontal. (both vertical and horizontal just take max height)
  ["", "hotdog-stand"],
  ["empty-goalpost", "golden-grass", ""],
  // ["windows-xp-grass", "wheat"],
  ["bookstore-browse", ""],
];

export const CANADA_PHOTOS = CANADA_ITEMS.flatMap((item) =>
  Array.isArray(item) ? item : [item],
).filter(Boolean);

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
