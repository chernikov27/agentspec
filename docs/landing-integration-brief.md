# AgentSpec Landing Integration Brief

## Decision

Do not hand off the whole landing page blindly. The current `public/` demo is already wired to the working AgentSpec API, so the safest path is to integrate the best mockup direction into the existing functional page.

Use another agent only for narrow visual polish after the functional merge is complete.

## Source Files

- Functional demo: `public/index.html`, `public/styles.css`, `public/app.js`
- Landing concepts: `landing-mockups/index.html`, `landing-mockups/styles.css`
- Brand assets: `Brand/`

## Recommended Direction

Use **Variant 03 / Report-first SaaS** as the main landing direction.

Reason:

- It matches what AgentSpec actually sells: inspection reports and readiness output.
- It naturally leads into the live demo.
- It is less abstract than the radar/protocol variants.
- It avoids over-indexing on marketplace visuals before payment integration is live.

Borrow from **Variant 04 / Bazaar launchpad** for the Bazaar metadata/listing section.

## Product Flow

Landing page should follow this order:

1. Hero: AgentSpec + slogan + short value proposition
2. Report preview: score, risks, candidates, pricing
3. Live demo: OpenAPI/MCP tabs wired to real endpoints
4. Bazaar metadata draft: route, method, price, category, tags, schema preview, copy JSON
5. Pricing/routes: `/inspect/openapi`, `/inspect/mcp`, `/generate/bazaar-metadata`, `/score/agent-readiness`
6. x402 readiness note: paid routes will be enabled with production x402 middleware

## Copy

Hero:

AgentSpec

Turn any API into an agent-ready x402 service.

Inspect OpenAPI specs, MCP tools, and API docs. Generate readiness scores, risk notes, launchable Bazaar candidates, and x402 metadata drafts in one call.

Primary CTA:

Inspect an API

Secondary CTA:

View example report

## Constraints

- Keep the live demo working.
- Do not replace `public/app.js` with static mockup-only UI.
- Do not show destructive tools as Bazaar candidates.
- Keep card radius at 8px or less.
- Avoid a generic landing page with no working product surface.
- Use the selected AgentSpec logo from `Brand/agentspec-logo-source.png` or `public/assets/agentspec-logo.png`.
