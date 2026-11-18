// Supabase Edge Function entry (Deno). The agent logic lives in agent/handler.ts and is
// bundled into ./handler.js by `npm run build:agent`.
// deno-lint-ignore-file
import handler from "./handler.js";

Deno.serve((req: Request) => handler.fetch(req, Deno.env.toObject()));
