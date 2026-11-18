# Murtaza Zaidi: portfolio and agent

Static Next.js site on **GitHub Pages** (https://zaidimurtaza.github.io) plus a **Supabase Edge
Function** that runs the Gemini chat agent, so no API key ever ships to the browser.

```
GitHub Pages (static: hero, work, Cal.com booking)  ──POST /chat, /book──▶  Supabase Edge Function "agent" (Gemini key)
```

If the function is not configured or unreachable, the chat answers in offline mode in the browser.

## Develop

```bash
npm install
npm run dev                 # http://localhost:3000 (chat runs offline unless NEXT_PUBLIC_AGENT_URL is set)
```

## Deploy

**Agent** (logic in `agent/handler.ts`, bundled into `supabase/functions/agent/handler.js`):
```bash
npx supabase link --project-ref <ref>
npx supabase secrets set --env-file supabase/.env.secrets   # GEMINI_API_KEY=...
npm run deploy:agent        # builds the bundle and deploys with --no-verify-jwt
```
URL: `https://<ref>.supabase.co/functions/v1/agent`. Allowed site origins are set by `ALLOWED_ORIGINS`
(default: https://zaidimurtaza.github.io and http://localhost:3000).

**Site:** push to `main` of the `zaidimurtaza.github.io` repo. `.github/workflows/deploy-pages.yml`
builds the static export and publishes it. Set the repo variable `AGENT_URL` to the function URL,
and Settings → Pages → Source to "GitHub Actions".

## Where things live

| What | File |
|---|---|
| All content | `src/content/profile.ts`, `src/content/showcase.ts` |
| Agent instructions and tools | `src/lib/agent.ts` |
| Agent (chat + message form) | `agent/handler.ts`, `supabase/functions/agent/` |
| Offline answers | `src/lib/offline-agent.ts` |
| 3D hero | `src/components/hero/` |
| Chat UI and Cal.com booking | `src/components/chat/` |
