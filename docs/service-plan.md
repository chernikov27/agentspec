# AgentSpec Service Plan

## Goal

Build AgentSpec as a paid x402 service that helps developers convert APIs, OpenAPI specs, and MCP tools into agent-ready service listings.

## Product Promise

**Turn any API into an agent-ready x402 service.**

AgentSpec returns structured inspection reports that an AI agent or API developer can use immediately:

- agent-readiness score
- endpoint/tool inventory
- missing schema and description findings
- side-effect/risk signals
- recommended fixes
- x402 Bazaar metadata draft

## MVP Endpoints

| Endpoint | Price | Purpose |
| --- | ---: | --- |
| `POST /inspect/openapi` | `0.03 USDC` | Inspect an OpenAPI spec and generate endpoint-level readiness report. |
| `POST /inspect/mcp` | `0.03 USDC` | Inspect MCP tools and detect schema, clarity, and risk gaps. |
| `POST /generate/bazaar-metadata` | `0.05 USDC` | Generate a Bazaar listing draft from a report or service description. |
| `POST /score/agent-readiness` | `0.02 USDC` | Return a compact score for cheaper high-volume usage. |

## First Customer

The first buyer is a developer building or listing x402 endpoints. They pay because AgentSpec saves time and improves the chance that agents can discover, understand, and safely call their service.

## Non-Goals

- Full security audit
- Legal/compliance scoring
- KYC, sanctions, or regulated-finance validation
- Guaranteed correctness of third-party API behavior
- Replacing x402 facilitator/payment infrastructure

## Build Strategy

1. Keep inspection logic dependency-free and testable.
2. Run local service without wallet/payment for development.
3. Add dev-only `402` simulation for UX testing.
4. Use official x402 SDK middleware for production settlement.
5. Register discoverable resources through Bazaar metadata after settlement works.

## Payment Modes

`AGENTSPEC_PAYMENT_MODE=off`

No payment gate. Used for local development and tests.

`AGENTSPEC_PAYMENT_MODE=dev-402`

Returns a local `402` challenge unless the request includes:

```http
x-agentspec-dev-payment: paid
```

This does not settle real x402 payments.

`AGENTSPEC_PAYMENT_MODE=x402`

Reserved for production adapter. The no-dependency dev server intentionally returns `501` in this mode so we do not pretend to settle payments.
