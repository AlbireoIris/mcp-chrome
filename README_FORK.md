# mcp-chrome (AlbireoIris fork)

Fork of [hangwin/mcp-chrome](https://github.com/hangwin/mcp-chrome) (MIT).

## Changes in this fork

1. **Minimal popup UI** — only running status + connect/disconnect toggle
   - `app/chrome-extension/entrypoints/popup/App.vue`
   - `app/chrome-extension/entrypoints/popup/style.css`
   - `app/chrome-extension/entrypoints/popup/main.ts`
2. **MCP multi-session fix** — one `Server` per transport (previously a
   singleton rejected additional `initialize` with
   “Already connected to a transport”)
   - `app/native-server/src/mcp/mcp-server.ts` (`createMcpServer`)
   - `app/native-server/src/server/index.ts`
3. **License audit** — `docs/LICENSE_AUDIT.md`
4. **Dead UI removal** — drop unused popup pages/components
   (`LocalModelPage`, model cache, element-marker manager, dialogs, icons).
   Workflow builder under `popup/components/builder` stays (used by
   `entrypoints/builder`).

## Upstream

See `README.md` / `README_zh.md` for full product documentation.

## License

MIT (see `LICENSE`). Third-party notes in `docs/LICENSE_AUDIT.md`.
