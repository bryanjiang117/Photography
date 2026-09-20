import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rankRatedItems } from "./tmdb.js";

function item(title, rating) {
  return { title, rating };
}

describe("rankRatedItems", () => {
  it("keeps a higher rating above a custom-order title", () => {
    const ranked = rankRatedItems([
      item("Parasite", 9),
      item("The Shawshank Redemption", 10),
    ]);

    assert.equal(ranked[0].title, "The Shawshank Redemption");
    assert.equal(ranked[1].title, "Parasite");
  });

  it("uses custom order only among the same rating", () => {
    const ranked = rankRatedItems([
      item("Arcane", 10),
      item("Parasite", 10),
      item("Game of Thrones", 10),
    ]);

    assert.deepEqual(
      ranked.map((entry) => entry.title),
      ["Game of Thrones", "Parasite", "Arcane"],
    );
  });

  it("lets a higher-rated title into the top 10 over custom-order titles", () => {
    const nines = [
      "Game of Thrones",
      "Reply 1988",
      "My Mister",
      "A Love So Beautiful",
      "River Flows to You",
      "Harry Potter and the Philosopher's Stone",
      "Parasite",
      "Rick and Morty",
      "A Knight of the Seven Kingdoms",
      "Arcane",
    ].map((title) => item(title, 9));

    const ranked = rankRatedItems([...nines, item("The Shawshank Redemption", 10)]);

    assert.equal(ranked[0].title, "The Shawshank Redemption");
    assert.equal(ranked.length, 10);
    assert.equal(
      ranked.some((entry) => entry.title === "Arcane"),
      false,
    );
  });
});
