// Bundles the agent (agent/handler.ts + shared src/lib code + npm deps) into one ESM file
// that the Supabase Edge Function (Deno) imports. Deno supports Node built-ins via node:,
// so we bundle for Node and give CommonJS dependencies a real require().
import { build } from "esbuild";

await build({
  entryPoints: ["agent/handler.ts"],
  outfile: "supabase/functions/agent/handler.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "es2022",
  minify: true,
  legalComments: "none",
  logLevel: "info",
  banner: {
    js: 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);',
  },
});
