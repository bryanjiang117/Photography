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
// size — max AVIF tier for the row: "sm" | "md" | "lg" | "full"
//   Omitted → "lg" for a lone full-width image, "sm" for 4+ columns, else "md"
//   Files: name-sm.avif (800px), name-md.avif (1400px), name-lg.avif (2400px), name.avif (uncapped master)
//   After adding/replacing name.avif:  cd client && npm run photos:variants
//
// location — optional place label for the whole row. Inherited by every photo in the
//   row unless a photo entry sets its own `location`. China / Japan use bilingual
//   form: "English · Local". Mexico only when English ≠ Spanish ("English / Spanish");
//   same-name places stay single (e.g. "Roma Norte"). Canada is English-only.
//
// flex — optional number[]; flex-grow per column (e.g. flex: [1, 2, 5])
// fit — optional "contain"; keep aspect ratio, matched row heights (see chongqing row)
// gap — optional number (Tailwind spacing scale) for the space ABOVE the row;
//   default is 20 (the grid's gap-20 / 5rem). Smaller = tighter (gap: 8 → 2rem).
//
// Mobile galleries use the same lists; display caps at "sm". Lightbox uses "lg".
// Flattened photo lists (*_GALLERY_PHOTOS) include resolved `location` per photo.
//
// Examples:
//   { columns: [["orange-wall"]], size: "lg", location: "La Condesa" }
//   { columns: [["green-wall"], ["blue-door"]], size: "md", location: "Roma Norte" }
//   { columns: [[{ name: "windmill", size: "lg", location: "Holbox" }]] }
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
    location: "Bond Lake, Richmond Hill, Ontario",
  },
  {
    columns: [["ferry-lookout"]],
    location: "Tsawwassen–Swartz Bay Ferry, British Columbia",
  },
  {
    columns: [["container-ship"], ["port-cranes"], ["cargo-cranes"]],
    location: "Vancouver, British Columbia",
  },
  {
    columns: [["fish-vendor"], [], ["boat-cabin"]],
    location: "Steveston Village, Richmond, British Columbia",
  },
  {
    columns: [
      [],
      [[{ name: "hotdog-stand", size: "sm" }], []],
      [{ name: "pacific-railway", size: "lg" }],
    ],
    flex: [1, 1, 3],
    location: "Vancouver, British Columbia",
  },
  {
    columns: [[], ["totem-top"], ["parliament-flowers"], ["war-memorial"]],
    location: "Victoria, British Columbia",
  },
  {
    columns: [["orca"], []],
    flex: [4, 5],
    location: "Victoria, British Columbia",
    size: "lg",
  },
  {
    columns: [
      [["flower-lamppost"], []],
      [{ name: "nootka-court", size: "lg" }],
      [[], "totem-pole"],
    ],
    size: "sm",
    flex: [1, 2, 1],
    location: "Victoria, British Columbia",
  },
  {
    columns: [
      [{ name: "sunset-seagull", location: "HTO Park, Toronto, Ontario" }],
      [
        {
          name: "pink-jellyfish",
          location: "Ripley's Aquarium, Toronto, Ontario",
        },
      ],
    ],
  },
  // { columns: [["shop-window"], ["bakery-kitchen"], ["bookstore"]] },
  {
    columns: [["walking-dog"], [], ["street-protester"]],
    size: "sm",
    location: "Toronto, Ontario",
  },
  {
    columns: [
      [{ name: "towering-cloud", location: "Somewhere in Ontario" }],
      [{ name: "golden-spires", location: "Victoria, British Columbia" }],
    ],
    size: "lg",
  },
  {
    columns: [
      [{ name: "scrap-sculpture", location: "Toronto, Ontario" }],
      [],
      ["gated-alley"],
      [],
      ["graffiti-alley"],
    ],
    location: "Graffiti Alley, Toronto, Ontario",
  },
  {
    columns: [
      ["chongqing-restaurant"],
      ["chinatown-market"],
      [{ name: "fruit-worker", size: "md" }],
    ],
    fit: "contain",
    size: "sm",
    location: "Chinatown, Toronto, Ontario",
  },
  {
    columns: [
      ["wet-leaves"],
      ["rainy-roses"],
      [{ name: "blurred-rain", location: "Newmarket, Ontario" }],
    ],
    size: "sm",
    location: "Scarborough, Ontario",
  },
  {
    columns: [
      ["sun-rays", "empty-goalpost", "golden-grass"],
      [{ name: "brick-tower", size: "lg" }],
    ],
    flex: [1, 3],
    size: "sm",
    location: "Scarborough, Ontario",
  },
  {
    columns: [
      [{ name: "cans", location: "Somewhere in Ontario" }],
      [{ name: "peach-roses", location: "Scarborough, Ontario" }],
    ],
  },
  {
    columns: [["farm-ca"], ["windows-xp-grass"], ["wheat"]],
    location: "Somewhere in Ontario",
  },
  { columns: [["moon"], ["firework"]], location: "Somewhere in Ontario" },
];

export const CANADA_GALLERY_PHOTOS = flattenGalleryItems(CANADA_ITEMS);
export const CANADA_PHOTOS = CANADA_GALLERY_PHOTOS.map((p) => p.name);

// Empty strings in arrays are spacers for the desktop grid layout.
export const MEXICO_ITEMS = [
  { columns: [["orange-wall"]], location: "La Condesa" },
  {
    columns: [
      ["green-wall"],
      ["blue-door"],
      [{ name: "bike-leaves", location: "Roma Norte" }],
    ],
    location:
      "Francisco Sosa Avenue, Coyoacán / Avenida Francisco Sosa, Coyoacán",
  },
  {
    columns: [
      [
        {
          name: "meat-vendor",
          location: "Medellín Market, Roma / Mercado Medellín, Roma",
        },
      ],
      [{ name: "pastor-tacos", location: "Roma Norte" }],
    ],
    size: "lg",
  },
  {
    columns: [[], ["street-vendor"], [], ["coke-store"]],
    size: "sm",
    location: "Roma Norte",
  },
  {
    columns: [
      [{ name: "taco-vendor", location: "La Condesa" }],
      [{ name: "bakery", location: "Roma Sur" }],
    ],
  },
  {
    columns: [
      [{ name: "fruit-store", location: "Roma Sur" }],
      ["flowers"],
      ["fruit-vendor"],
    ],
    location: "Medellín Market, Roma Sur / Mercado Medellín, Roma Sur",
  },
  {
    columns: [["old-man"], []],
    size: "lg",
    location: "Historic Center / Centro Histórico",
  },
  {
    columns: [["bikes"], [], ["pool"], [], ["street-stalls"]],
    location: "Roma Norte",
  },
  { columns: [["windmill"]], location: "Roma Sur" },
  {
    columns: [
      [],
      [
        {
          name: "palm-trees",
          location: "Garibaldi Plaza / Plaza Garibaldi",
        },
      ],
      [{ name: "tree-reflection", size: "lg", location: "Roma Norte" }],
    ],
    flex: [1, 2, 5],
  },
  { columns: [["playground"], []], size: "lg", location: "Roma Norte" },
  {
    columns: [
      ["museum-reflection"],
      ["museum-roof"],
      ["art-museum"],
      ["palace"],
      [],
    ],
    location:
      "National Art Museum, Historic Center / Museo Nacional de Arte, Centro Histórico",
  },
  {
    columns: [["plaza-garibaldi"]],
    location:
      "Garibaldi Plaza, Historic Center / Plaza Garibaldi, Centro Histórico",
  },
  { columns: [["sunset-dark"]], size: "full", location: "Roma Norte" },
];

export const MEXICO_GALLERY_PHOTOS = flattenGalleryItems(MEXICO_ITEMS);
export const MEXICO_FLAT_IMAGES = MEXICO_GALLERY_PHOTOS.map((p) => p.name);

export const CHINA_ITEMS = [
  {
    columns: [["mountain-scene"]],
    location: "Yangshuo, Guilin, Guangxi · 阳朔，桂林，广西",
  },
  {
    columns: [
      [
        {
          name: "fire",
          location: "Yangshuo, Guilin, Guangxi · 阳朔，桂林，广西",
        },
      ],
      ["farmlands"],
      ["poles-in-farm"],
    ],
    location: "Somewhere in Guangxi/Hunan · 广西/湖南某处",
    size: "sm",
  },
  {
    columns: [
      ["grungy-apartment"],
      [{ name: "goldfish", location: "Baixiangju, Chongqing · 百象居，重庆" }],
      ["building-steps"],
    ],
    flex: [1, 2, 2],
    size: "sm",
    location: "Chongqing · 重庆",
  },
  {
    columns: [
      [{ name: "chess-table", size: "md" }],
      ["stick-gramps"],
      ["park-gramps"],
    ],
    flex: [4, 1, 1],
    size: "sm",
    location: "People's Park, Chongqing · 人民公园，重庆",
  },
  {
    columns: [
      [
        {
          name: "sleeping-cat",
          location: "Xiaohaoli, Chongqing · 小浩里，重庆",
        },
      ],
      [{ name: "cat", location: "Shibati, Chongqing · 十八梯，重庆" }],
    ],
  },
  {
    columns: [
      [
        {
          name: "zhangjiajie",
          location:
            "Zhangjiajie Forest National Park, Zhangjiajie, Hunan · 张家界国家森林公园，张家界，湖南",
        },
      ],
      ["winding-roads"],
      ["mountain-range"],
      ["winding-bus"],
    ],
    location:
      "Tianmen Mountain National Park, Zhangjiajie, Hunan · 天门山国家森林公园，张家界，湖南",
  },
  {
    columns: [["rafts"]],
    location: "Yangshuo, Guilin, Guangxi · 阳朔，桂林，广西",
  },
  {
    columns: [
      [{ name: "building-ac", size: "full" }],
      [
        "window-gramps",
        { name: "mahjong", location: "Baixiangju, Chongqing · 百象居，重庆" },
        "messy-balcony",
        "hole-in-the-wall",
        "window",
      ],
    ],
    flex: [20, 11],
    size: "sm",
    location: "Chongqing · 重庆",
  },
  {
    columns: [["chongqing-flipped"]],
    location: "Hongyadong, Chongqing · 洪崖洞，重庆",
  },
  {
    columns: [
      [{ name: "furong-town", size: "lg" }],
      [{ name: "furong-bridge-view", size: "sm" }, []],
      [],
    ],
    flex: [12, 6, 3],
    location:
      "Furong Town, Yongshun, Xiangxi, Hunan · 芙蓉镇，永顺，湘西，湖南",
  },
  {
    columns: [["china-flags"]],
    location: "Zhangjiajie, Hunan · 张家界，湖南",
  },
  {
    columns: [["everyday-1"], ["everyday-2"], ["everyday-3"]],
    location: "Zhangjiajie, Hunan · 张家界，湖南",
  },
  { columns: [["meituan-trio"]], location: "Chongqing · 重庆" },
  {
    columns: [[{ name: "auntie-cooking", size: "md" }], [], ["happy-woman"]],
    flex: [16, 2, 8],
    location: "Chongqing · 重庆",
  },
  {
    columns: [["roof-worker"], ["red-green"]],
    size: "lg",
    location: "People's Park, Chongqing · 人民公园，重庆",
  },
  {
    columns: [
      [{ name: "auntie-cleaning", location: "Chongqing · 重庆" }],
      [
        {
          name: "baozi",
          location: "Haochi Street, Chongqing · 好吃街，重庆",
        },
      ],
    ],
    flex: [1, 2],
  },
  {
    columns: [["rainy-chongqing"]],
    location: "Raffles City, Chongqing · 来福士，重庆",
  },
  {
    columns: [
      [{ name: "hotpot", location: "Chongqing · 重庆" }],
      [
        {
          name: "lanterns-alley",
          location: "Shancheng Alley, Chongqing · 山城巷，重庆",
        },
      ],
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
            location:
              "Baixiangju Historical District, Chongqing · 百象居历史风貌区，重庆",
          },
        ],
        ["smoking"],
        ["robot-dog"],
      ],
      [{ name: "card-uncs", size: "lg" }],
    ],
    flex: [112, 200],
    size: "sm",
    location: "Baixiangju, Chongqing · 百象居，重庆",
  },
  {
    columns: [["two-dudes"]],
    location: "Shancheng Alley, Chongqing · 山城巷，重庆",
  },
  {
    columns: [["bright-farmer"], ["rafting"]],
    location: "Yangshuo, Guilin, Guangxi · 阳朔，桂林，广西",
  },
];

export const CHINA_GALLERY_PHOTOS = flattenGalleryItems(CHINA_ITEMS);
export const CHINA_PHOTOS = CHINA_GALLERY_PHOTOS.map((p) => p.name);

export const JAPAN_ITEMS = [
  {
    columns: [
      [{ name: "jugs", size: "lg" }],
      [{ name: "festival-object", size: "sm" }],
    ],
    flex: [9, 4],
    location: "Fukuoka · 福岡",
  },
  {
    columns: [
      [{ name: "train", location: "Shingu, Fukuoka · 新宮，福岡" }],
      [
        {
          name: "pigeons",
          location:
            "Shichirigahama Beach, Kamakura, Kanagawa · 七里ヶ浜，鎌倉，神奈川",
        },
      ],
    ],
  },
  {
    columns: [["tree-shadows"], [{ name: "tori-gates", size: "md" }], ["path"]],
    flex: [4, 9, 4],
    size: "sm",
    location: "Fukuoka · 福岡",
  },
  {
    columns: [["sakura"], ["nest"]],
    location: "Maizuru Park, Fukuoka · 舞鶴公園，福岡",
  },
  { columns: [["venusaur"]], location: "Fukuoka · 福岡" },
  {
    columns: [["boats"], ["ocean-kid"]],
    location: "Ainoshima Cat Island, Fukuoka · 相島，福岡",
  },
  {
    columns: [["cats"]],
    location: "Ainoshima Cat Island, Fukuoka · 相島，福岡",
  },
  {
    columns: [
      [
        {
          name: "old-man",
          location: "Peace Memorial Park, Hiroshima · 平和記念公園，広島",
        },
      ],
      [],
      [{ name: "river-students", location: "Hiroshima · 広島" }],
    ],
    flex: [5, 2, 5],
  },
  {
    columns: [[], ["hiroshima"], []],
    flex: [3, 5, 3],
    gap: 12,
    size: "md",
    location: "Atomic Bomb Dome, Hiroshima · 原爆ドーム，広島",
  },
  { columns: [["business-man"]], location: "Shibuya, Tokyo · 渋谷，東京" },
  // { columns: [["modes-of-transport"]] },
  {
    columns: [[{ name: "asakusa", size: "lg" }], ["banners"]],
    flex: [9, 4],
    location: "Asakusa, Tokyo · 浅草，東京",
  },
  {
    columns: [["taxi"], [], ["running-kid"], []],
    flex: [2, 1, 2, 1],
    size: 'md',
    location: "Chinatown, Yokohama · 中華街，横浜",
  },
  {
    columns: [["deer"], ["door-deer"]],
    location: "Miyajima Island, Hiroshima · 宮島，広島",
  },
  { columns: [["ocean-roads"]], location: "Yokohama · 横浜" },
  // a bit too similar to the sunset photo in mexico city
  // {
  //   columns: [[], ["sunset"], []],
  //   flex: [3, 3, 3],
  //   gap: 30,
  //   location: "Yokohama, view of Mt. Fuji · 横浜（富士山展望）",
  // },
  {
    columns: [["beach"]],
    gap: 30,
    location:
      "Shichirigahama Beach, Kamakura, Kanagawa · 七里ヶ浜，鎌倉，神奈川",
  },
  {
    columns: [[{ name: "purple-bar", size: "lg" }], ["green-bar"]],
    flex: [9, 4],
    location: "Shinjuku Golden Gai, Tokyo · 新宿ゴールデン街，東京",
  },
  { columns: [["takoyaki"]], location: "Fukuoka · 福岡" },
  {
    columns: [["night-signs"], [{ name: "night-restaurant", size: "lg" }]],
    flex: [4, 9],
    location: "Shinjuku Golden Gai, Tokyo · 新宿ゴールデン街，東京",
  },
  {
    columns: [["lanterns"]],
    location: "Zenkoji Temple, Nagano · 善光寺，長野",
  },
  {
    columns: [[{ name: "monks", size: "lg" }], ["snow-temple"]],
    flex: [9, 4],
    location: "Zenkoji Temple, Nagano · 善光寺，長野",
  },
  { columns: [["river-mountains"]], location: "Nagano · 長野" },
  {
    columns: [
      ["mini-shrine"],
      [{ name: "colorful-shrine", location: "Takayama, Gifu · 高山，岐阜" }],
      ["buddha-shrine"],
    ],
    location: "Nagano · 長野",
  },
  {
    columns: [["long-stick"], [{name: "frozen-castle", size: 'sm'}, []], []],
    flex: [10, 4, 6],
    location: "Kanazawa Castle, Kanazawa, Ishikawa · 金沢城，金沢，石川",
  },
  {
    columns: [["trees"], ["shrine"], [{name: "snow-roots", size: 'sm'}]],
    flex: [9, 9, 4],
    location: "Yunishigawa, Nikko, Tochigi · 湯西川，日光，栃木",
  },
  {
    columns: [["tori"]],
    location: "Yunishigawa, Nikko, Tochigi · 湯西川，日光，栃木",
  },
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
