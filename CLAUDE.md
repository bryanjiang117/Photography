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
TEXT='姜昊周你好，我叫。我是个喜欢美术的软件工程师。这是我的一些作品。欢迎来到我的网站。墨西哥城摄影加拿大中国日本作品电脑设计软件最爱的影视动漫最近播放。我在多伦多写代码，也喜欢拍照、看片和画画。下面是一点关于我的事。爱好仓库提交贡献即将推出。嗨，我在多伦多做网站和移动应用开发。我喜欢各种各样的艺术，尤其是美术。所以我的特长是做出漂亮的东西。欢迎联系我。'
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
# only create missing sm/md/lg (skip existing; good for new photos):
npm run photos:variants -- --missing
npm run photos:variants -- --missing --region=china
```

When adding gallery photos, add them to the region’s `*_ITEMS` grid in `client/src/constants/data.js` (and optionally `*_ALL_PHOTOS` for extras not in the grid). Regenerate aspect ratios for skeleton placeholders:

```bash
cd client && npm run photos:ratios
```

### Gallery photo metadata (EXIF)

Local masters for EXIF live in `client/originals/{region}/` (gitignored; basename must match the gallery name, e.g. `hotpot.jpeg`). After adding or replacing originals:

```bash
cd client && npm run photos:meta
```

This writes `client/src/constants/galleryPhotoMeta.js` for hover + lightbox captions.

### Local gallery editor (dev only)

In `npm run dev`, open a desktop gallery and click **Edit** (above the back arrow). You can drag photos, drop blanks, stack, nest groups, and set location / size / fit / widths / gap in the side panel.

- **Import** drops one or more originals (JPEG, TIFF, HEIC, PNG, WebP) into `client/originals/{region}/` and puts them in the unused tray as soon as the original is saved, so you can place them while sm/md/lg AVIFs generate in the background.
- **Save** writes that region’s `*_ITEMS` in `data.js`. **×** on an unused tray photo deletes the original and AVIFs immediately. Deleting a photo from the grid removes it from the layout; those files are deleted when you save.
- **Done** hides the editor chrome and keeps unsaved changes. **Discard** restores the last saved layout. Production builds do not include the editor button.
