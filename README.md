# AgentSpec

**Turn any API into an agent-ready x402 service.**

AgentSpec inspects OpenAPI specs, MCP tools, and API docs, then generates readiness scores, risk notes, recommendations, and x402 Bazaar metadata drafts.

## Run Locally

```bash
npm run dev
```

The API listens on:

```text
http://localhost:4020
```

No external dependencies are required for the current MVP.

Recommended workflow:

1. Open Terminal 1 and start the server.
2. Leave Terminal 1 open.
3. Open Terminal 2 and run checks with `curl` or the smoke test.

Using the portable Node runtime directly:

```bash
"/Users/sergejcernikov/Desktop/тест клод/.codex-runtime/node-v24.15.0-darwin-arm64/bin/node" src/server.js
```

Then in a second terminal:

```bash
"/Users/sergejcernikov/Desktop/тест клод/.codex-runtime/node-v24.15.0-darwin-arm64/bin/node" scripts/smoke.js
```

## Test

```bash
npm test
```

Using portable Node directly:

```bash
"/Users/sergejcernikov/Desktop/тест клод/.codex-runtime/node-v24.15.0-darwin-arm64/bin/node" --test
```

## Example Calls

Inspect OpenAPI:

```bash
curl -s http://localhost:4020/inspect/openapi \
  -H 'content-type: application/json' \
  --data @examples/openapi-weather.json
```

Inspect MCP tools:

```bash
curl -s http://localhost:4020/inspect/mcp \
  -H 'content-type: application/json' \
  --data @examples/mcp-tools.json
```

Generate Bazaar metadata from an existing report:

```bash
curl -s http://localhost:4020/generate/bazaar-metadata \
  -H 'content-type: application/json' \
  --data '{"service":{"name":"Weather Utility","path":"/forecast","method":"GET","description":"Read-only forecast lookup for agents."}}'
```

## Local 402 Simulation

Run:

```bash
npm run dev:402
```

Then paid endpoints return `402` unless you pass:

```http
x-agentspec-dev-payment: paid
```

This is only a local development simulation. Production settlement should use the official x402 middleware and facilitator.

## Troubleshooting

If server startup says:

```text
address already in use 127.0.0.1:4020
```

another AgentSpec server is already running. Use that server, stop the old server with `Ctrl+C`, or start a new one on another port:

```bash
PORT=4021 "/Users/sergejcernikov/Desktop/тест клод/.codex-runtime/node-v24.15.0-darwin-arm64/bin/node" src/server.js
```

Then test that port:

```bash
AGENTSPEC_BASE_URL=http://127.0.0.1:4021 "/Users/sergejcernikov/Desktop/тест клод/.codex-runtime/node-v24.15.0-darwin-arm64/bin/node" scripts/smoke.js
```

## Project Docs

- `docs/service-plan.md`
- `docs/x402-integration.md`
- `Brand/brand-brief.md`
