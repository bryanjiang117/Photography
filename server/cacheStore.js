/** Persist JSON payloads in the existing `tokens` table (name + value). */

export function createJsonCache(supabase, name) {
  async function load() {
    const { data, error } = await supabase
      .from("tokens")
      .select("value")
      .eq("name", name)
      .single();

    if (error || data?.value == null) return null;

    const raw = data.value;
    if (typeof raw === "object") return raw;

    try {
      return JSON.parse(raw);
    } catch {
      console.error(`[cache] invalid JSON for "${name}"`);
      return null;
    }
  }

  async function save(payload) {
    const { error } = await supabase.from("tokens").upsert({
      name,
      value: JSON.stringify(payload),
      updated_at: new Date(),
    });
    if (error) {
      console.error(`[cache] save "${name}" failed:`, error.message);
    }
  }

  return { load, save };
}
