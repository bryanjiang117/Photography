// Each row is { columns: [...] } where each column is an array of image names.
// Multiple images in a column = stacked vertically. Empty array [] = spacer.
// Column entries can be strings (images) or arrays ([] = vertical spacer, ["a","b"] = horizontal sub-row).
// A row with one column and one image renders full-width.
// Optional: fit: "contain" — preserves original aspect ratios (no cropping), matched heights.
// Optional: flex: [1, 3] — custom flex-grow per column (default: equal).
export const CANADA_ITEMS = [
  {
    columns: [
      ["leaves-glow"],
      ["golden-maples"],
      ["fallen-leaves"],
      ["autumn-pond"],
    ],
  },
  { columns: [["ferry-lookout"]] },
  // { columns: [["fish-vendor"], ["boat-cabin"], [], []] },
  { columns: [["container-ship"], ["port-cranes"], ["cargo-cranes"]] },
  {
    columns: [[], [["hotdog-stand"], [""]], ["pacific-railway"]],
    flex: [1, 1, 3],
  },
  { columns: [[], ["totem-top"], ["parliament-flowers"], ["war-memorial"]] },
  {
    columns: [["orca"], [[], []]],
    flex: [4, 5],
  },
  {
    columns: [
      [["flower-lamppost"], []],
      ["nootka-court"],
      [[], ["totem-pole"]],
    ],
    flex: [1, 2, 1],
  },
  { columns: [["sunset-seagull"], ["pink-jellyfish"]] },
  // { columns: [["shop-window"], ["bakery-kitchen"], ["bookstore"]] },
  { columns: [["walking-dog"], [], ["street-protester"]] },
  { columns: [["towering-cloud"], ["golden-spires"]] },
  {
    columns: [["scrap-sculpture"], [], ["gated-alley"], [], ["graffiti-alley"]],
  },
  {
    columns: [["chongqing-restaurant"], ["chinatown-market"], ["fruit-worker"]],
    fit: "contain",
  },
  { columns: [["wet-leaves"], ["rainy-roses"], ["blurred-rain"]] },
  {
    columns: [["sun-rays", "empty-goalpost", "golden-grass"], ["brick-tower"]],
    flex: [1, 3],
  },
  { columns: [["cans"], ["peach-roses"]] },
  {
    columns: [["farm-ca"], ["windows-xp-grass"], ["wheat"]],
  },
  { columns: [["moon"], ["firework"]] },
];

export const CANADA_PHOTOS = CANADA_ITEMS.flatMap((row) =>
  row.columns.flat(Infinity),
).filter((x) => typeof x === "string" && x);

// Empty strings in arrays are spacers for the desktop grid layout.
export const MEXICO_ITEMS = [
  { columns: [["orange-wall"]] },
  { columns: [["green-wall"], ["blue-door"], ["bike-leaves"]] },
  { columns: [["meat-vendor"], ["pastor-tacos"]] },
  { columns: [[], ["street-vendor"], [], ["coke-store"]] },
  { columns: [["taco-vendor"], ["bakery"]] },
  { columns: [["flowers"], ["fruit-store"], ["fruit-vendor"]] },
  { columns: [["old-man"], []] },
  { columns: [["bikes"], [], ["pool"], [], ["street-stalls"]] },
  { columns: [["windmill"]] },
  { columns: [["modern-balcony"], [], ["old-building"]] },
  { columns: [["line-squirrel"]] },
  { columns: [["playground"], []] },
  {
    columns: [
      ["museum-reflection"],
      ["museum-roof"],
      ["art-museum"],
      ["palace"],
      [],
    ],
  },
  { columns: [["plaza-garibaldi"]] },
];

export const MEXICO_FLAT_IMAGES = MEXICO_ITEMS.flatMap((row) =>
  row.columns.flat(Infinity),
).filter((x) => typeof x === "string" && x);

export const JAPAN_ITEMS = [];

export const JAPAN_PHOTOS = JAPAN_ITEMS.flatMap((row) =>
  row.columns.flat(Infinity),
).filter((x) => typeof x === "string" && x);

export const PROJECTS = [
  {
    name: "FOMO",
    description:
      "An Android location tracking social app made for friends to stay connected. Cool features are the on-my-way status and shared places.",
    link: "https://github.com/bryanjiang117/FOMO",
    image: "/assets/projects/fomo.png",
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
