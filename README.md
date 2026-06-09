# 0xosprey.com

Joe's personal site. Live at [0xosprey.com](https://0xosprey.com).

## Structure

- `index.html` is the shell. Loads a design variant in a fullscreen iframe and exposes a hidden dev nav (bottom center) for cycling variants.
- `v/` holds the numbered design variants (the `V` array in `index.html` is the live set). Each is a self-contained animated page.
- `gen-variants.js`, `gen-refined.js`, `gen-wild.js`, `generate-ascii.js` are the generation scripts used to produce variants.
- `CNAME` points the GitHub Pages deploy at `0xosprey.com`.

## Design language

Nature motif: ocean, atmosphere, cosmos, biology. Slow, flowing, cursor-reactive. No abstract or mathematical aesthetics. Current variants include kelp forest, aurora, deep sea, and more.

## Deploy

GitHub Pages off `main`. No build step, pure HTML/CSS/JS. Push to deploy:

```bash
git add .
git commit -m "..."
git push
```

Always push immediately after committing.

## Repo

`0xOsprey/0xosprey.com` (private).
