import { flattenGalleryItems, galleryPrefetchUrl } from "../galleryImages";

// ── Gallery grid (MEXICO_ITEMS, CANADA_ITEMS, CHINA_ITEMS, JAPAN_ITEMS) ────
//
// Row shape: { columns, size?, flex?, fit?, gap?, location? }
//
// columns — array of columns. Each column is a vertical stack:
//   "photo-name"           one image (string basename, no .avif)
//   { name, size?, location? }  per-image overrides; size/location override the row's
//   []                     empty spacer column
//   ["a", "b"]             horizontal sub-row (images side by side)
//   [[], ["x"]]            mix spacers and images within a column
//
// One column with one image → rendered full-width across the scroll area.
//
// size — max AVIF tier for the row: "sm" | "md" | "full"
//   Omitted → "full" for a lone full-width image, "sm" for 4+ columns, else "md"
//   Files: name-sm.avif (800px longest side), name-md.avif (1400px longest side), name.avif (full)
//   After adding/replacing name.avif:  cd client && npm run photos:variants
//
// location — optional place label for the whole row (e.g. "Kyoto"). Inherited by every
//   photo in the row unless a photo entry sets its own `location`.
//
// flex — optional number[]; flex-grow per column (e.g. flex: [1, 2, 5])
// fit — optional "contain"; keep aspect ratio, matched row heights (see chongqing row)
// gap — optional number (Tailwind spacing scale) for the space ABOVE the row;
//   default is 20 (the grid's gap-20 / 5rem). Smaller = tighter (gap: 8 → 2rem).
//
// Mobile galleries use the same lists; display caps at "sm". Lightbox uses "full".
// Flattened photo lists (*_GALLERY_PHOTOS) include resolved `location` per photo.
//
// Examples:
//   { columns: [["orange-wall"]], size: "full", location: "Coyoacán" }
//   { columns: [["green-wall"], ["blue-door"]], size: "md", location: "Roma Norte" }
//   { columns: [[{ name: "windmill", size: "full", location: "Holbox" }]] }
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
  { columns: [["ferry-lookout"]] },
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

export const CHINA_ITEMS = [
  {
    columns: [["mountain-scene"]],
  },
  {
    columns: [
      [{ name: "fire", location: "Yangshuo Guangxi" }],
      ["farmlands"],
      ["poles-in-farm"],
    ],
    location: "Guangxi",
    size: "sm",
  },
  {
    columns: [
      ["grungy-apartment"],
      [{ name: "goldfish", location: "Baixiangju, Chongqing" }],
      ["building-steps"],
    ],
    flex: [1, 2, 2],
    location: "Chongqing",
  },
  {
    columns: [
      [{ name: "chess-table", size: "full" }],
      ["stick-gramps"],
      ["park-gramps"],
    ],
    flex: [4, 1, 1],
    location: "People's Park Chongqing",
    size: "sm",
  },
  { columns: [["sleeping-cat"], ["cat"]] },
  {
    columns: [
      ["zhangjiajie"],
      ["winding-roads"],
      ["mountain-range"],
      ["winding-bus"],
    ],
  },
  { columns: [["rafts"]] },
  {
    columns: [
      [{ name: "building-ac", size: "full" }],
      [
        "window-gramps",
        { name: "mahjong", location: "Baixiangju, Chongqing" },
        "messy-balcony",
        "hole-in-the-wall",
        "window",
      ],
    ],
    flex: [20, 11],
    size: "sm",
    location: "Chongqing",
  },
  { columns: [["chongqing-flipped"]], location: "Hongyadong, Chongqing" },
  {
    columns: [
      [{ name: "furong-town", size: "full" }],
      ["furong-bridge-view", []],
      [],
    ],
    flex: [12, 6, 3],
  },
  { columns: [["china-flags"]] },
  { columns: [["everyday-1"], ["everyday-2"], ["everyday-3"]] },
  { columns: [["meituan-trio"]], location: "Chongqing" },
  {
    columns: [[{ name: "auntie-cooking", size: "full" }], [], ["happy-woman"]],
    flex: [16, 2, 8],
    location: "Chongqing",
  },
  { columns: [["roof-worker"], ["red-green"]], size: "full" },
  {
    columns: [
      [{ name: "auntie-cleaning", location: "Chongqing" }],
      [{ name: "baozi", size: "full", location: "Haochi Street, Chongqing" }],
    ],
    flex: [1, 2],
  },
  { columns: [["rainy-chongqing"]], location: "Raffles City, Chongqing" },
  {
    columns: [
      [{ name: "hotpot", location: "Chongqing" }],
      [{ name: "lanterns-alley", location: "Shancheng Alley, Chongqing" }],
    ],
    flex: [2, 1],
  },
  {
    columns: [
      [
        ["thinking-cards"],
        [
          {
            name: "auntie-dance",
            location: "Baixiang Street Historical Scene, Chongqing",
          },
        ],
        ["smoking"],
        ["robot-dog"],
      ],
      [{ name: "card-uncs", size: "full" }],
    ],
    flex: [112, 200],
    size: "sm",
    location: "Baixiangju, Chongqing",
  },
  {
    columns: [["two-dudes"]],
    location: "Shancheng, Chongqing",
  },
  {
    columns: [["bright-farmer"], ["rafting"]],
    location: "Yangshuo, Guangxi",
  },
];

export const CHINA_GALLERY_PHOTOS = flattenGalleryItems(CHINA_ITEMS);
export const CHINA_PHOTOS = CHINA_GALLERY_PHOTOS.map((p) => p.name);

export const JAPAN_ITEMS = [
  {
    columns: [[{ name: "jugs", size: "full" }], ["festival-object"]],
    flex: [9, 4],
    location: "Fukuoka",
  },
  {
    columns: [
      [{ name: "train", location: "Shingu, Fukuoka" }],
      [{ name: "pigeons", location: "Shichirigahama Beach, Kamakura" }],
    ],
  },
  {
    columns: [["tree-shadows"], ["tori-gates"], ["path"]],
    flex: [4, 9, 4],
    location: "Fukuoka",
  },
  { columns: [["sakura"], ["nest"]], location: "Maizuru Park, Fukuoka" },
  { columns: [["venusaur"]], location: "Fukuoka" },
  {
    columns: [["iceberg"], ["ocean-kid"]],
    location: "Ainoshima (Cat Island), Fukuoka",
  },
  { columns: [["cats"]], location: "Ainoshima (Cat Island), Fukuoka" },
  // {
  //   columns: [["gap"], ["fishing-village-2"]],
  //   size: "full",
  //   flex: [4, 9],
  // },
  {
    columns: [
      [{ name: "old-man", location: "Peace Memorial Park, Hiroshima" }],
      [],
      [{ name: "river-students", location: "Hiroshima" }],
    ],
    flex: [5, 2, 5],
  },
  {
    columns: [[], ["hiroshima"], []],
    flex: [3, 5, 3],
    gap: 12,
    size: "md",
    location: "Atomic Bomb Dome, Hiroshima",
  },
  { columns: [["business-man"]], location: "Shibuya, Tokyo" },
  // { columns: [["modes-of-transport"]] },
  {
    columns: [[{ name: "asakusa", size: "full" }], ["banners"]],
    flex: [9, 4],
    location: "Asakusa, Tokyo",
  },
  {
    columns: [["taxi"], [], ["running-kid"], []],
    flex: [2, 1, 2, 1],
    location: "Chinatown, Yokohama",
  },
  {
    columns: [["deer"], ["door-deer"]],
    location: "Miyajima Island, Hiroshima",
  },
  { columns: [["ocean-roads"]], location: "Yokohama" },
  {
    columns: [[], ["sunset"], []],
    flex: [3, 3, 3],
    gap: 30,
    location: "Yokohama (view of Mt. Fuji)",
  },
  { columns: [["beach"]], gap: 30, location: "Shichirigahama Beach, Kamakura" },
  {
    columns: [[{ name: "purple-bar", size: "full" }], ["green-bar"]],
    flex: [9, 4],
    location: "Shinjuku Golden Gai, Tokyo",
  },
  { columns: [["takoyaki"]], location: "Fukuoka" },
  {
    columns: [["night-signs"], [{ name: "night-restaurant", size: "full" }]],
    flex: [4, 9],
    location: "Shinjuku Golden Gai, Tokyo",
  },
  { columns: [["lanterns"]], location: "Zenkoji Temple, Nagano" },
  {
    columns: [[{ name: "monks", size: "full" }], ["snow-temple"]],
    flex: [9, 4],
    location: "Zenkoji Temple, Nagano",
  },
  { columns: [["river-mountains"]], location: "Nagano" },
  {
    columns: [
      ["mini-shrine"],
      [{ name: "colorful-shrine", location: "Takayama, Gifu" }],
      ["buddha-shrine"],
    ],
    location: "Nagano",
  },
  {
    columns: [["long-stick"], ["frozen-castle", []], []],
    flex: [10, 4, 6],
    location: "Kanazawa Castle, Kanazawa, Ishikawa",
  },
  {
    columns: [["trees"], ["shrine"], ["snow-roots"]],
    flex: [9, 9, 4],
    location: "Yunishigawa, Nikko, Tochigi",
  },
  { columns: [["tori"]], location: "Yunishigawa, Nikko, Tochigi" },
];

export const JAPAN_GALLERY_PHOTOS = flattenGalleryItems(JAPAN_ITEMS);
export const JAPAN_PHOTOS = JAPAN_GALLERY_PHOTOS.map((p) => p.name);

/** Prefetch URLs for idle warming (matches GalleryImage `src` — no srcSet). */
export function getGalleryPrefetchUrls(layout = "grid") {
  const urls = (region, photos) =>
    photos.map((p) => galleryPrefetchUrl(region, p.name, p.size, layout));
  return [
    ...urls("mexico", MEXICO_GALLERY_PHOTOS),
    ...urls("canada", CANADA_GALLERY_PHOTOS),
    ...urls("china", CHINA_GALLERY_PHOTOS),
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
