# License & Source Audit

Scope: `hangwin/mcp-chrome` monorepo (this fork) plus the distribution
artifacts we exercised locally (`mcp-chrome-bridge` npm package and
`chrome-mcp-server` Chrome extension zip).

## First-party (this repo)

| Component | Path | License |
|---|---|---|
| Monorepo / extension / native-server | `app/`, `packages/` | MIT (`LICENSE`, Copyright hangye) |
| Shared package | `packages/shared` | MIT (same monorepo) |

You may fork, modify, and redistribute under MIT, provided the copyright
notice is preserved.

## Third-party open source (selected)

| Dependency | License | Notes |
|---|---|---|
| `@modelcontextprotocol/sdk` | MIT | MCP protocol |
| Fastify / Hono | MIT | HTTP |
| `chrome-devtools-frontend` | BSD-style + mixed third_party | Chromium DevTools frontend |
| ONNX Runtime Web (`ort*.js/wasm`) | MIT (Microsoft) | Bundled in extension |
| better-sqlite3 | MIT | Native addon (prebuilds) |
| Vue / Vite / WXT | MIT | Extension UI toolchain |

Full per-package licenses live under each `node_modules/**/LICENSE` after
install; use `license-checker` or `pnpm licenses` for a complete bill.

## Restricted / not pure OSS — treat carefully before redistributing

### 1. `@anthropic-ai/claude-agent-sdk`

- Declared: `SEE LICENSE IN README.md`
- Governs under **Anthropic Commercial Terms of Service**, not a standard
  OSI license.
- Used by the native-server agent chat features (optional at runtime for
  core MCP browser tools).
- **Do not** assume you can re-publish this package as if it were MIT.
- If you publish a public fork that `npm install`s it, keep it as a
  normal dependency and respect Anthropic ToS; consider making agent
  features optional/extra so the browser MCP core stays MIT-clean.

### 2. `chrome-mcp-shared` (published package)

- `package.json` in the npm artifact we inspected **has no `license` field**.
- In this monorepo it is a workspace package covered by the root MIT `LICENSE`.
- Prefer depending on `packages/shared` (workspace) rather than the npm
  artifact with unclear metadata.

### 3. Extension / bridge **builds without full source history**

- The shipped `chrome-mcp-server-*.zip` and `mcp-chrome-bridge` npm tarball
  ship **compiled/minified** `background.js`, chunks, and `dist/` only.
- This fork includes the **TypeScript/Vue sources** under `app/` and
  `packages/`, which is the preferred base for modification and redistribution.
- The extension `manifest.json` embeds a `key` (public key) to keep a stable
  extension ID — not a secret, but do not strip it if you need the same ID
  for Native Messaging `allowed_origins`.

### 4. Chrome / Chromium itself

- Not redistributed here. Google Chrome is proprietary freeware;
  Chromium is mostly BSD-licensed. This project talks to Chrome via
  Native Messaging / extension APIs and does not embed Chrome.

## Closed-source / proprietary scan result

| Finding | Severity | Detail |
|---|---|---|
| No obfuscated “license server” / time-bomb in extension UI sources | OK | Popup rewrite is plain Vue/TS |
| ONNX Runtime “All rights reserved” headers | Low | Standard Microsoft MIT notice inside MIT-licensed bundle |
| `@anthropic-ai/claude-agent-sdk` | **Medium** | Commercial terms; not MIT |
| Missing `license` field on npm `chrome-mcp-shared@1.0.2` | Medium | Unclear redistribution terms for that artifact |
| Minified-only release zips without source | Medium | Mitigated by this monorepo fork |
| Extension `key` field | Info | Public key for stable ID only |

## Our patches in this fork

1. **Popup** — simplified to 运行状态 + 连接/断开 toggle  
   (`app/chrome-extension/entrypoints/popup/*`)
2. **MCP multi-session** — one `Server` per transport instead of a singleton  
   (`app/native-server/src/mcp/mcp-server.ts`, `app/native-server/src/server/index.ts`)

## Recommendation

- Keep browser MCP core MIT; isolate Claude Agent SDK behind an optional
  dependency if you plan a fully redistributable public binary.
- Rebuild extension/native-server from this source tree rather than
  republishing third-party minified zips.
