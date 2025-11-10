# Vishnu Soudha

Interactive VR tour (Babylon.js + Vite), ready for Netlify deploy.

## Dev
- `npm install`
- `npm run dev` -> http://localhost:5173

## Build
- `npm run build` (outputs to `dist/` — Netlify builds this automatically)
- `npm run preview` to locally preview the production build

## Netlify
- Connect this repo on Netlify
- Build command: `npm run build`
- Publish directory: `dist`

## Viewer/Guide
- Guide: `/?role=guide` ? press Play
- Viewer: `/?role=viewer&room=demo&followYaw=1`
- iPhone: prefer `?mobile=1&q=low&skipIntro=1` and tap to start

## Assets
- Add experiences under `public/experiences/<id>/`
- For iOS reliability, run `npm run make:mobile` to generate `panos-mobile/` variants