import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
// @ts-expect-error JS plugin alongside the TS vite config
import { grokPwaPlugin } from "./scripts/grok-pwa-plugin.mjs";
// @ts-expect-error JS plugin alongside the TS vite config
import { appEnvPlugin } from "./scripts/app-env-plugin.mjs";
import { isMigrationFile } from "./scripts/migration-plan.mjs";

/**
 * TanStack serializes route ids with raw NUL bytes inside the HTML document.
 * iOS and the preview proxy treat that byte as the end of the file, so the
 * page never finishes opening. Rewrite each NUL to the JS escape `\u0000`
 * (same string value, valid HTML) and fix Content-Length.
 */
function nullSafeHtmlPlugin(): Plugin {
  return {
    name: "app-builder:null-safe-html",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?", 1)[0];
        if ((req.method ?? "GET") !== "GET" || path !== "/") return next();
        const chunks: Buffer[] = [];
        let mode: "wait" | "html" | "pass" = "wait";
        const origWrite = res.write.bind(res);
        const origEnd = res.end.bind(res);
        const origWriteHead = res.writeHead.bind(res);
        let delayedHead: unknown[] | null = null;

        const asBuf = (chunk: unknown, enc?: BufferEncoding) => {
          if (chunk == null || typeof chunk === "function") return Buffer.alloc(0);
          if (Buffer.isBuffer(chunk)) return chunk;
          if (chunk instanceof Uint8Array) return Buffer.from(chunk);
          if (typeof chunk === "string") return Buffer.from(chunk, enc);
          return Buffer.alloc(0);
        };

        const classify = (buf: Buffer) => {
          const head = buf.subarray(0, 240).toString("utf8").trimStart().toLowerCase();
          if (head.startsWith("<!doctype html") || head.startsWith("<html")) return "html" as const;
          if (buf.length < 80) return "wait" as const;
          return "pass" as const;
        };

        const callbackOf = (enc: unknown, cb: unknown) =>
          typeof enc === "function" ? (enc as () => void) : typeof cb === "function" ? (cb as () => void) : undefined;

        const flushPass = (cb?: () => void) => {
          if (delayedHead) origWriteHead(...(delayedHead as Parameters<typeof origWriteHead>));
          for (const chunk of chunks) origWrite(chunk);
          return origEnd(cb);
        };

        const flushHtml = (cb?: () => void) => {
          let body = Buffer.concat(chunks);
          if (body.includes(0)) {
            body = Buffer.from(body.toString("latin1").replaceAll("\u0000", "\\u0000"), "latin1");
          }
          res.removeHeader("content-length");
          res.setHeader("content-length", body.length);
          if (delayedHead) {
            const args = delayedHead.slice();
            const headers = args.length > 1 && typeof args[args.length - 1] === "object" ? args[args.length - 1] as Record<string, unknown> : null;
            if (headers) {
              for (const key of Object.keys(headers)) {
                if (key.toLowerCase() === "content-length") delete headers[key];
              }
              headers["content-length"] = body.length;
            }
            origWriteHead(...(args as Parameters<typeof origWriteHead>));
          }
          return origEnd(body, cb);
        };

        res.writeHead = ((...args: unknown[]) => {
          delayedHead = args;
          return res;
        }) as typeof res.writeHead;

        res.write = ((chunk: unknown, enc?: unknown, cb?: unknown) => {
          const buf = asBuf(chunk, typeof enc === "string" ? (enc as BufferEncoding) : undefined);
          const done = callbackOf(enc, cb);
          if (mode === "wait") mode = classify(Buffer.concat([...chunks, buf]));
          if (mode === "pass") {
            if (chunks.length || delayedHead) {
              chunks.push(buf);
              return flushPass(done);
            }
            return origWrite(chunk as never, enc as never, cb as never);
          }
          chunks.push(buf);
          if (done) done();
          return true;
        }) as typeof res.write;

        res.end = ((chunk?: unknown, enc?: unknown, cb?: unknown) => {
          const done = callbackOf(enc, cb);
          if (chunk != null && typeof chunk !== "function") {
            const buf = asBuf(chunk, typeof enc === "string" ? (enc as BufferEncoding) : undefined);
            if (mode === "wait") mode = classify(Buffer.concat([...chunks, buf]));
            if (mode === "pass" && chunks.length === 0 && !delayedHead) {
              return origEnd(chunk as never, enc as never, cb as never);
            }
            chunks.push(buf);
          }
          if (mode !== "html") return chunks.length || delayedHead ? flushPass(done) : origEnd(done);
          return flushHtml(done);
        }) as typeof res.end;

        next();
      });
    },
  };
}
function hasGlobbedMigrations(root: string): boolean {
  try {
    return readdirSync(join(root, "migrations")).some(isMigrationFile);
  } catch {
    return false;
  }
}

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 *
 * Vite awaiting the hook puts this on time-to-first-render, so an app with no
 * migrations — no schema to apply — skips it entirely rather than paying for a
 * PGLite instance it never queries.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      if (!hasGlobbedMigrations(server.config.root)) return;
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/**
 * Live-preview OAuth popup — handled HERE so the agent never has to create a
 * `/auth/popup` route (and cannot break it by scaffolding a React page that
 * paints the full app shell in the popup).
 *
 * `signIn` (client.ts) opens `/auth/popup?providerId=…` in a top-level window.
 * This middleware runs before TanStack Start, calls `handleAuthPopupRequest`,
 * and returns the 302 / completion HTML. Deployed apps do not use the popup
 * (full-page OAuth redirect), so `apply: "serve"` is enough.
 */
function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      // Register immediately (not in a returned post-hook) so we run BEFORE
      // TanStack Start / the SPA HTML fallback. A model-authored
      // `src/routes/auth/popup.tsx` React page must never win this path.
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted ? "https" : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          // Ensure Host is the public preview host so Better Auth's dynamic
          // baseURL / redirect_uri match the popup origin.
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule("/src/lib/auth/popup.server.ts")) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          // Preserve multiple Set-Cookie headers (OAuth state + session).
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

// `0.0.0.0:8080` is the live-preview contract — don't change host/port.
// The dev server starts once `src/router.tsx` and `src/routes/` exist — see
// AGENTS.md § "First scaffold".
export default defineConfig(({ command, isPreview }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8081,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    nullSafeHtmlPlugin(),
    pgliteBootstrapPlugin(),
    // Before tanstackStart so /auth/popup never falls through to the SPA.
    authPopupPlugin(),
    // Dev-only /__app-env, read by scripts/check-auth-invariant.mjs.
    appEnvPlugin(),
    // PWA head + ?install=1 tutorial page; runs before Start/Nitro.
    grokPwaPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build" || isPreview
      ? [
          nitro({
            preset: "vercel",
            // Auto-registers server/middleware/* (the PWA install page +
            // manifest + head-tag middleware). Nitro v3 defaults serverDir to
            // false, so removing this silently unwires /?install=1 on deploys.
            serverDir: "./server",
          }),
        ]
      : []),
    viteReact(),
  ],
}));
