const BASE = "/__gallery-dev";

async function parse(input) {
  const res = await input;
  const text = await res.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text.slice(0, 200) };
    }
  }
  if (!res.ok) throw new Error(body.error || res.statusText || "Request failed");
  return body;
}

export function fetchPhotos(region) {
  return parse(fetch(`${BASE}/photos?region=${encodeURIComponent(region)}`));
}

export function importPhoto(region, file, name = "") {
  const headers = {
    "x-gallery-region": region,
    "x-gallery-filename": encodeURIComponent(file.name),
  };
  if (name) headers["x-gallery-name"] = encodeURIComponent(name);
  return parse(
    fetch(`${BASE}/import`, {
      method: "POST",
      headers,
      body: file,
    }),
  );
}

export function deleteUnusedPhoto(region, name) {
  return parse(
    fetch(`${BASE}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, name }),
    }),
  );
}

export function saveGallery(region, items, deleteNames = []) {
  return parse(
    fetch(`${BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, items, deleteNames }),
    }),
  );
}
