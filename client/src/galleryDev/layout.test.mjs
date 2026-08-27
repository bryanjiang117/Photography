import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addBlankColumn,
  applyDrop,
  collectNames,
  deletePhoto,
  deleteRow,
  moveRow,
  moveRowTo,
  parseEntry,
  removeAt,
  replaceItemsExport,
  serializeItems,
  setColumnFlex,
  setPhotoField,
  setRowField,
  slugify,
  uniqueSlug,
} from "./layout.mjs";

const photo = (name) => [name];

describe("slugify", () => {
  it("turns a filename into a gallery name", () => {
    assert.equal(slugify("Fall in Love.HEIC"), "fall-in-love");
    assert.equal(slugify("DSC_0123.JPG"), "dsc-0123");
    assert.equal(slugify("a-moment.jpeg"), "a-moment");
  });

  it("avoids names that already exist", () => {
    assert.equal(uniqueSlug("orca", ["orca", "orca-2"]), "orca-3");
    assert.equal(uniqueSlug("new-shot", ["orca"]), "new-shot");
  });
});

describe("parseEntry / collectNames", () => {
  it("reads nested columns, groups, and objects", () => {
    const items = [
      {
        columns: [
          [["flower-lamppost"], []],
          [{ name: "nootka-court", size: "lg" }],
          [[], "totem-pole"],
        ],
      },
      { columns: [["orca"], []] },
    ];
    assert.deepEqual(collectNames(items), [
      "flower-lamppost",
      "nootka-court",
      "totem-pole",
      "orca",
    ]);
    assert.equal(parseEntry("orca")?.name, "orca");
    assert.equal(parseEntry({ name: "x", size: "sm" })?.size, "sm");
    assert.equal(parseEntry([]), null);
  });
});

describe("applyDrop", () => {
  const base = () => [
    { columns: [photo("a"), photo("b")] },
    { columns: [photo("c")] },
  ];

  it("fills a blank column", () => {
    const items = [{ columns: [photo("a"), [], photo("c")] }];
    const next = applyDrop(items, {
      source: { kind: "tray", name: "b" },
      dest: { kind: "fill-blank", row: 0, col: 1 },
    });
    assert.deepEqual(next[0].columns, [photo("a"), photo("b"), photo("c")]);
  });

  it("inserts a column to the left of a photo", () => {
    const next = applyDrop(base(), {
      source: { kind: "tray", name: "x" },
      dest: { kind: "insert-col", row: 0, col: 0 },
    });
    assert.deepEqual(next[0].columns, [photo("x"), photo("a"), photo("b")]);
  });

  it("stacks a photo under another in the same column", () => {
    const next = applyDrop(base(), {
      source: { kind: "tray", name: "x" },
      dest: { kind: "stack-below", row: 0, col: 0, entry: 0 },
    });
    assert.deepEqual(next[0].columns[0], ["a", "x"]);
  });

  it("adds into a nested side-by-side group", () => {
    const items = [{ columns: [[["a"], []], photo("b")] }];
    const next = applyDrop(items, {
      source: { kind: "tray", name: "x" },
      dest: { kind: "into-group", row: 0, col: 0, entry: 0 },
    });
    assert.deepEqual(next[0].columns[0][0], ["a", "x"]);
  });

  it("fills a spacer inside a column", () => {
    const items = [{ columns: [[["a"], []]] }];
    const next = applyDrop(items, {
      source: { kind: "tray", name: "x" },
      dest: { kind: "fill-blank", row: 0, col: 0, entry: 1 },
    });
    assert.deepEqual(next[0].columns[0], [["a"], ["x"]]);
  });

  it("appends a new full-width row", () => {
    const next = applyDrop(base(), {
      source: { kind: "tray", name: "x" },
      dest: { kind: "new-row", row: 2 },
    });
    assert.equal(next.length, 3);
    assert.deepEqual(next[2].columns, [photo("x")]);
  });

  it("moves a photo between rows and leaves a blank if the column empties", () => {
    const next = applyDrop(base(), {
      source: { kind: "photo", row: 1, col: 0, entry: 0 },
      dest: { kind: "insert-col", row: 0, col: 2 },
    });
    assert.deepEqual(next[0].columns, [photo("a"), photo("b"), photo("c")]);
    assert.deepEqual(next[1].columns, [[]]);
  });

  it("unplaces a photo onto the tray without deleting it", () => {
    const next = applyDrop(base(), {
      source: { kind: "photo", row: 0, col: 0, entry: 0 },
      dest: { kind: "tray" },
    });
    assert.deepEqual(next[0].columns, [[], photo("b")]);
    assert.deepEqual(collectNames(next), ["b", "c"]);
  });

  it("splices flex when inserting a column", () => {
    const items = [{ columns: [photo("a"), photo("b")], flex: [1, 3] }];
    const next = applyDrop(items, {
      source: { kind: "tray", name: "x" },
      dest: { kind: "insert-col", row: 0, col: 1 },
    });
    assert.deepEqual(next[0].flex, [1, 1, 3]);
  });
});

describe("delete / row ops", () => {
  it("removes a photo and records its name", () => {
    const items = [{ columns: [photo("a"), photo("b")] }];
    const { items: next, name } = deletePhoto(items, {
      row: 0,
      col: 0,
      entry: 0,
    });
    assert.equal(name, "a");
    assert.deepEqual(next[0].columns, [[], photo("b")]);
  });

  it("deletes a whole row", () => {
    const items = [{ columns: [photo("a")] }, { columns: [photo("b")] }];
    assert.deepEqual(collectNames(deleteRow(items, 0)), ["b"]);
  });

  it("reorders rows", () => {
    const items = [
      { columns: [photo("a")] },
      { columns: [photo("b")] },
      { columns: [photo("c")] },
    ];
    assert.deepEqual(collectNames(moveRow(items, 2, 0)), ["c", "a", "b"]);
    assert.deepEqual(collectNames(moveRowTo(items, 0, 2)), ["b", "a", "c"]);
    assert.deepEqual(collectNames(moveRowTo(items, 0, 3)), ["b", "c", "a"]);
    assert.deepEqual(collectNames(moveRowTo(items, 2, 0)), ["c", "a", "b"]);
    assert.deepEqual(collectNames(moveRowTo(items, 0, 1)), ["a", "b", "c"]);
  });

  it("adds a blank column and extends flex", () => {
    const items = [{ columns: [photo("a")], flex: [2] }];
    const next = addBlankColumn(items, 0, 1);
    assert.deepEqual(next[0].columns, [photo("a"), []]);
    assert.deepEqual(next[0].flex, [2, 1]);
  });

  it("sets row and photo fields", () => {
    let items = [{ columns: [photo("a")] }];
    items = setRowField(items, 0, "location", "Toronto, Ontario");
    items = setRowField(items, 0, "size", "lg");
    items = setRowField(items, 0, "fit", "contain");
    items = setRowField(items, 0, "gap", 8);
    items = setPhotoField(items, { row: 0, col: 0, entry: 0 }, "location", "HTO Park");
    items = setColumnFlex(items, 0, [3]);
    assert.equal(items[0].location, "Toronto, Ontario");
    assert.equal(items[0].size, "lg");
    assert.equal(items[0].fit, "contain");
    assert.equal(items[0].gap, 8);
    assert.deepEqual(items[0].columns[0][0], {
      name: "a",
      location: "HTO Park",
    });
    assert.deepEqual(items[0].flex, [3]);
  });

  it("removeAt drops a nested photo from a group", () => {
    const items = [{ columns: [[["a", "b"]]] }];
    const { items: next } = removeAt(items, {
      row: 0,
      col: 0,
      entry: 0,
      sub: 1,
    });
    assert.deepEqual(next[0].columns[0], [["a"]]);
  });
});

describe("serializeItems / replaceItemsExport", () => {
  it("round-trips a nested row", () => {
    const items = [
      {
        columns: [
          [["flower-lamppost"], []],
          [{ name: "nootka-court", size: "lg" }],
        ],
        size: "sm",
        flex: [1, 2],
        location: "Victoria, British Columbia",
      },
    ];
    const src = serializeItems(items);
    const parsed = new Function(`return (${src})`)();
    assert.deepEqual(parsed, items);
    assert.match(src, /columns:/);
    assert.doesNotMatch(src, /"columns"/);
  });

  it("replaces only the named export array", () => {
    const file = `// header
export const CANADA_ITEMS = [
  { columns: [["old"]] },
];

export const CANADA_GALLERY_PHOTOS = flattenGalleryItems(CANADA_ITEMS);
`;
    const next = replaceItemsExport(file, "CANADA_ITEMS", [
      { columns: [["new"]] },
    ]);
    assert.match(next, /header/);
    assert.match(next, /\["new"\]/);
    assert.doesNotMatch(next, /\["old"\]/);
    assert.match(next, /CANADA_GALLERY_PHOTOS/);
  });
});
