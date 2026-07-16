# Photography

## TSM Font Subsetting

The TSM font (`TsukuhouShogoMin-OFL.ttf`) is 39MB. A subset woff2 is committed instead (`TsukuhouShogoMin-subset.woff2`, ~25KB) containing only the glyphs used on the site.

If you add new Chinese/Japanese characters anywhere with `font-tsm`, regenerate the subset:

```bash
# Requires: pipx install fonttools && pipx inject fonttools brotli
pyftsubset \
  client/public/assets/fonts/TsukuhouShogoMin-OFL.ttf \
  --text="姜昊周日本にほん墨西哥城摄影加拿大中国最爱动漫此刻最近播放作品电脑 !\"#\$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~‧←" \
  --flavor=woff2 \
  --output-file=client/public/assets/fonts/TsukuhouShogoMin-subset.woff2
```

Add any new CJK characters to the `--text` string before running.

## Source Han (font-sh) Subsetting

Full Source Han Serif OTF files are ~11MB each. Subset woff2 files are committed instead (`SourceHanSerifCN-Medium-subset.woff2`, `SourceHanSerifCN-Bold-subset.woff2`, ~27KB each).

If you add new Chinese characters anywhere with `font-sh`, regenerate both subsets:

```bash
# Requires: pipx install fonttools && pipx inject fonttools brotli
TEXT='姜昊周你好，我叫。我是一名热爱美术的软件工程师。这是我的一些作品。欢迎来到我的网站。墨西哥城摄影加拿大中国日本作品电脑设计软件最爱的影视动漫最近播放'
ASCII=' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~‧←'
for w in Medium Bold; do
  pyftsubset \
    client/public/assets/fonts/SourceHanSerifCN-${w}.otf \
    --text="${TEXT}${ASCII}" \
    --flavor=woff2 \
    --output-file=client/public/assets/fonts/SourceHanSerifCN-${w}-subset.woff2
done
```

Add any new CJK characters to `TEXT` before running.

### Gallery photos (responsive AVIF)

Each gallery photo has four files: `name-sm.avif` (800px longest side), `name-md.avif` (1400px), `name-lg.avif` (2400px), and `name.avif` (uncapped master). Set max variant per row in `MEXICO_ITEMS` / `CANADA_ITEMS` / `CHINA_ITEMS` / `JAPAN_ITEMS` with `size: "sm" | "md" | "lg" | "full"`, or per image with `{ name: "orange-wall", size: "lg" }`. Prefer `lg` for large display; leave `full` unused unless you explicitly want the master.

After adding or replacing a master `.avif`, regenerate variants:

```bash
cd client && npm run photos:variants
# or one region: node scripts/generate-gallery-variants.mjs --region=china
```

When adding gallery photos, add them to the region’s `*_ITEMS` grid in `client/src/constants/data.js` (and optionally `*_ALL_PHOTOS` for extras not in the grid). Regenerate aspect ratios for skeleton placeholders:

```bash
cd client && npm run photos:ratios
```
