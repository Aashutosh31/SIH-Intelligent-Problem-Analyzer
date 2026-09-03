# SIH Intelligent Problem Analyzer — Frontend

React + Vite SPA for the SIH Intelligent Problem Analyzer.

See the **[root README](../README.md)** for the full project overview, local
setup, environment variables, and deployment instructions for Vercel and
Render.

## Environment

Create `frontend/.env` for local development:

```
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is required for production builds; if it is missing in a
production build the app fails loudly instead of calling `localhost`.

## Scripts

```bash
npm install
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm run lint     # ESLint
npm run preview  # preview the production build
```
