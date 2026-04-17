# Photography

## TSM Font Subsetting

The TSM font (`TsukuhouShogoMin-OFL.ttf`) is 39MB. A subset woff2 is committed instead (`TsukuhouShogoMin-subset.woff2`, ~25KB) containing only the glyphs used on the site.

If you add new Chinese/Japanese characters anywhere with `font-tsm`, regenerate the subset:

```bash
# Requires: pipx install fonttools && pipx inject fonttools brotli
pyftsubset \
  client/public/assets/fonts/TsukuhouShogoMin-OFL.ttf \
  --text="姜昊周日本にほん墨西哥城摄影加拿大最爱动漫此刻播放作品 !\"#\$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_\`abcdefghijklmnopqrstuvwxyz{|}~‧←" \
  --flavor=woff2 \
  --output-file=client/public/assets/fonts/TsukuhouShogoMin-subset.woff2
```

Add any new CJK characters to the `--text` string before running.
