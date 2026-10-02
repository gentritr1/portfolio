# Gentrit Rashiti, portfolio

Portfolio with a home page and five case pages (React Router). Vite 8, React 19, TypeScript, Tailwind 4, `motion`, Phosphor icons.

```sh
source ~/.nvm/nvm.sh
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck and production build into dist/
npm run preview   # serve dist/
```

Visual system: `DESIGN.md`. Redesign brief: `REDESIGN.md`. Content model: `src/content/projects.ts`.

## Static hosting

The app is a single-page application with client routes (`/work/:slug`). The host must answer every path with `index.html`. `vercel.json` holds that rewrite for Vercel:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

On other hosts, add the same fallback (for example `_redirects` with `/* /index.html 200` on Netlify). `npm run dev` and `npm run preview` already serve this fallback.
