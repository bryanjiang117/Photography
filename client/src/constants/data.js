import { flattenGalleryItems, galleryPrefetchUrl } from "../galleryImages";

// ── Gallery grid (MEXICO_ITEMS, CANADA_ITEMS, JAPAN_ITEMS) ─────────────────
//
// Row shape: { columns, size?, flex?, fit? }
//
// columns — array of columns. Each column is a vertical stack:
//   "photo-name"           one image (string basename, no .avif)
//   { name, size? }        per-image max tier; size overrides the row's size
//   []                     empty spacer column
//   ["a", "b"]             horizontal sub-row (images side by side)
//   [[], ["x"]]            mix spacers and images within a column
//
// One column with one image → rendered full-width across the scroll area.
//
// size — max AVIF tier for the row: "sm" | "md" | "full"
//   Omitted → "full" for a lone full-width image, "sm" for 3+ columns, else "md"
//   Files: name-sm.avif (800px longest side), name-md.avif (1400px longest side), name.avif (full)
//   After adding/replacing name.avif:  cd client && npm run photos:variants
//
// flex — optional number[]; flex-grow per column (e.g. flex: [1, 2, 5])
// fit — optional "contain"; keep aspect ratio, matched row heights (see chongqing row)
//
// Mobile galleries use the same lists; display caps at "sm". Lightbox uses "full".
//
// Examples:
//   { columns: [["orange-wall"]], size: "full" }
//   { columns: [["green-wall"], ["blue-door"]], size: "md" }
//   { columns: [[{ name: "windmill", size: "full" }]] }   // override one cell
//   { columns: [[], ["palm-trees"], ["tree-reflection"]], flex: [1, 2, 5], size: "md" }
//
export const CANADA_ITEMS = [
  {
    columns: [
      ["leaves-glow"],
      ["golden-maples"],
      ["fallen-leaves"],
      ["autumn-pond"],
    ],
  },
  { columns: [["ferry-lookout"]] }, // default size full
  {
    columns: [["container-ship"], ["port-cranes"], ["cargo-cranes"]],
  },
  { columns: [["fish-vendor"], [], ["boat-cabin"]] },
  {
    columns: [
      [],
      [[{ name: "hotdog-stand", size: "sm" }], []],
      [{ name: "pacific-railway", size: "full" }],
    ],
    flex: [1, 1, 3],
  },
  {
    columns: [[], ["totem-top"], ["parliament-flowers"], ["war-memorial"]],
  },
  {
    columns: [["orca"], [[], []]],
    flex: [4, 5],
    size: "full",
  },
  {
    columns: [
      [["flower-lamppost"], []],
      [{ name: "nootka-court", size: "md" }],
      [[], "totem-pole"],
    ],
    flex: [1, 2, 1],
  },
  { columns: [["sunset-seagull"], ["pink-jellyfish"]] },
  // { columns: [["shop-window"], ["bakery-kitchen"], ["bookstore"]] },
  { columns: [["walking-dog"], [], ["street-protester"]] },
  { columns: [["towering-cloud"], ["golden-spires"]], size: "full" },
  {
    columns: [["scrap-sculpture"], [], ["gated-alley"], [], ["graffiti-alley"]],
  },
  {
    columns: [
      ["chongqing-restaurant"],
      ["chinatown-market"],
      [{ name: "fruit-worker", size: "full" }],
    ],
    fit: "contain",
  },
  { columns: [["wet-leaves"], ["rainy-roses"], ["blurred-rain"]] },
  {
    columns: [
      ["sun-rays", "empty-goalpost", "golden-grass"],
      [{ name: "brick-tower", size: "full" }],
    ],
    flex: [1, 3],
  },
  { columns: [["cans"], ["peach-roses"]] },
  {
    columns: [["farm-ca"], ["windows-xp-grass"], ["wheat"]],
  },
  { columns: [["moon"], ["firework"]] },
];

export const CANADA_GALLERY_PHOTOS = flattenGalleryItems(CANADA_ITEMS);
export const CANADA_PHOTOS = CANADA_GALLERY_PHOTOS.map((p) => p.name);

// Empty strings in arrays are spacers for the desktop grid layout.
export const MEXICO_ITEMS = [
  { columns: [["orange-wall"]], size: "full" },
  { columns: [["green-wall"], ["blue-door"], ["bike-leaves"]], size: "md" },
  { columns: [["meat-vendor"], ["pastor-tacos"]], size: "full" },
  { columns: [[], ["street-vendor"], [], ["coke-store"]] },
  { columns: [["taco-vendor"], ["bakery"]] },
  { columns: [["fruit-store"], ["flowers"], ["fruit-vendor"]], size: "md" },
  { columns: [["old-man"], []], size: "full" },
  { columns: [["bikes"], [], ["pool"], [], ["street-stalls"]], size: "md" },
  { columns: [["windmill"]], size: "full" },
  // { columns: [["modern-balcony"], ["ferris"], ["old-building"]], size: "md" },
  {
    columns: [[], ["palm-trees"], [{ name: "tree-reflection", size: "full" }]],
    flex: [1, 2, 5],
  },
  { columns: [["playground"], []], size: "full" },
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
  { columns: [["sunset-dark"]], size: "full" },
];

export const MEXICO_GALLERY_PHOTOS = flattenGalleryItems(MEXICO_ITEMS);
export const MEXICO_FLAT_IMAGES = MEXICO_GALLERY_PHOTOS.map((p) => p.name);

export const JAPAN_ITEMS = [];

export const JAPAN_GALLERY_PHOTOS = flattenGalleryItems(JAPAN_ITEMS);
export const JAPAN_PHOTOS = JAPAN_GALLERY_PHOTOS.map((p) => p.name);

// Every .avif in each gallery folder (grid + extras), for idle prefetch.
export const MEXICO_ALL_PHOTOS = [
  "art-museum",
  "bakery",
  "bike-leaves",
  "bikes",
  "blue-door",
  "bus",
  "coke-store",
  "ferris",
  "flowers",
  "fruit-store",
  "fruit-vendor",
  "green-wall",
  "line-squirrel",
  "meat-vendor",
  "mercado",
  "modern-balcony",
  "museum-reflection",
  "museum-roof",
  "old-building",
  "old-man",
  "orange-wall",
  "palace",
  "palm-trees",
  "pastor-tacos",
  "playground",
  "plaza-garibaldi",
  "pole-squirrel",
  "pool",
  "skeleton-dinner",
  "skeletons",
  "street-stalls",
  "street-vendor",
  "sunset",
  "sunset-clouds",
  "sunset-dark",
  "taco-vendor",
  "tower",
  "tree-reflection",
  "unicycle",
  "windmill",
];

export const CANADA_ALL_PHOTOS = [
  "aquarium-sharks",
  "autumn-pond",
  "autumn-trail",
  "bakery-kitchen",
  "basketball-shot",
  "blurred-rain",
  "boat-cabin",
  "bookstore",
  "brick-tower",
  "cans",
  "cargo-cranes",
  "chinatown-market",
  "chongqing-restaurant",
  "city-bokeh",
  "cn-skyline",
  "cn-tower",
  "container-ship",
  "distillery-lights",
  "docked-ferry",
  "empty-goalpost",
  "fallen-leaves",
  "farm-ca",
  "ferry-lookout",
  "firework",
  "fish-vendor",
  "flower-lamppost",
  "fruit-worker",
  "gaming-cafe",
  "garden-kid",
  "gated-alley",
  "glass-atrium",
  "golden-grass",
  "golden-maples",
  "golden-pine",
  "golden-spires",
  "graffiti-alley",
  "hotdog-stand",
  "leaves-glow",
  "moon",
  "nootka-court",
  "orca",
  "pacific-railway",
  "parliament-flowers",
  "peach-roses",
  "pink-jellyfish",
  "port-cranes",
  "rainy-roses",
  "scrap-sculpture",
  "seaplane-landing",
  "shop-window",
  "street-protester",
  "summer-drink-days",
  "sun-rays",
  "sunset-seagull",
  "sunset-walkers",
  "totem-pole",
  "totem-top",
  "towering-cloud",
  "walking-dog",
  "war-memorial",
  "wet-leaves",
  "wheat",
  "windows-xp-grass",
];

export const JAPAN_ALL_PHOTOS = ["flowers"];

/** Prefetch URLs for idle warming (one variant per photo, matches GalleryImage `src`). */
export function getGalleryPrefetchUrls(layout = "grid") {
  const urls = (region, photos) =>
    photos.map((p) => galleryPrefetchUrl(region, p.name, p.size, layout));
  return [
    ...urls("mexico", MEXICO_GALLERY_PHOTOS),
    ...urls("canada", CANADA_GALLERY_PHOTOS),
    ...urls("japan", JAPAN_GALLERY_PHOTOS),
  ];
}

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
