# AURIQ Rebrand — Drop-in instructions

Copy every file from this folder into your existing **AMAVA-Frontend** repo,
overwriting the originals. Then:

```bash
npm install        # no new deps needed
npm run dev
```

## What changed
| Old | New |
|-----|-----|
| `src/context/ThemeContext.tsx` | `src/context/AppContext.tsx` — adds accent + density |
| `src/components/Header.tsx` | deleted — replaced by `src/layouts/AppShell.tsx` |
| `src/App.tsx` | new routing with AppShell layout wrapper |
| `src/index.css` | imports `src/styles/auriq.css` |
| All pages | inline-styled with AURIQ tokens, API calls unchanged |

## New pages
- `/connect` → ConnectAccounts (SP-API + Avasam, 888lots, Frontier)
- `/appearance` → Appearance (theme, RGB accent picker, density)
- `/` → Dashboard (KPIs + quick-action widgets to all endpoints)

## Backwards compat
`useTheme()` and `ThemeProvider` still exist as re-exports from `AppContext.tsx`
so any remaining code that imports them won't break.
