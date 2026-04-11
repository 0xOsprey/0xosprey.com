# 0xosprey.com — Personal Website

Joe's personal site. Deployed at [0xosprey.com](https://0xosprey.com).

## Structure

- `index.html` — Shell page. Loads a design variant in a fullscreen iframe. Has a hidden dev nav (bottom center) for cycling variants.
- `v/` — 18 design variants (numbered HTML files). Each is a self-contained animated page.
- `gen-variants.js`, `gen-refined.js`, `gen-wild.js`, `generate-ascii.js` — Generation scripts used to produce variants.
- `CNAME` — Points to `0xosprey.com` for GitHub Pages.

## Design Language

Nature motif — ocean, atmosphere, cosmos, biology. Slow, flowing, cursor-reactive. No abstract/mathematical aesthetics. Current variants include: kelp forest, aurora, deep sea, etc.

## Deployment

GitHub Pages off `main` branch. Push to `origin main` to deploy. No build step — pure HTML/CSS/JS.

```bash
git add .
git commit -m "..."
git push
```

## GitHub

`0xOsprey/0xosprey.com` (private)

## Host path

`~/NanoClaw/projects/personal-site/` → `/workspace/extra/projects/personal-site/` in code agent
