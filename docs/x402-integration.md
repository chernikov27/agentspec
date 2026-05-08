# x402 Production Integration

This repo currently includes a dependency-free AgentSpec service so the inspection logic can be run and tested locally.

For production, protect paid routes with the official x402 middleware and publish Bazaar discovery metadata.

## Verified Integration Requirements

Based on the official x402/CDP documentation:

- x402 sellers expose paid HTTP resources that return `402 Payment Required` until a valid payment is supplied.
- A facilitator verifies and settles the payment.
- Bazaar discovery metadata should include enough schema and endpoint information for agents to discover and call the resource.
- Coinbase CDP Bazaar discovery indexes resources after paid resources are successfully settled through the CDP Facilitator.

Official docs:

- https://docs.x402.org/
- https://docs.x402.org/getting-started/quickstart-for-sellers
- https://docs.cdp.coinbase.com/x402/bazaar

## Environment

```bash
AGENTSPEC_PAYMENT_MODE=x402
AGENTSPEC_PAY_TO=0xYourWalletAddress
AGENTSPEC_X402_NETWORK=base-sepolia
AGENTSPEC_X402_FACILITATOR_URL=https://x402.org/facilitator
```

Use testnet first. Do not point production traffic at mainnet until the paid resource has been tested end to end.

## Route Pricing

See `src/x402-config.js`.

Initial pricing:

- `/inspect/openapi`: `0.03 USDC`
- `/inspect/mcp`: `0.03 USDC`
- `/generate/bazaar-metadata`: `0.05 USDC`
- `/score/agent-readiness`: `0.02 USDC`

## Production Adapter Shape

Keep the current pure functions:

- `inspectOpenApi`
- `inspectMcp`
- `generateBazaarMetadata`

Then mount them behind the official x402 middleware in the runtime framework you deploy with.

Pseudo-shape:

```js
import express from "express";
import { paymentMiddleware } from "x402-express";
import { inspectOpenApi, inspectMcp, generateBazaarMetadata } from "./src/inspect.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use(paymentMiddleware(
  process.env.AGENTSPEC_PAY_TO,
  {
    "POST /inspect/openapi": "$0.03",
    "POST /inspect/mcp": "$0.03",
    "POST /generate/bazaar-metadata": "$0.05",
    "POST /score/agent-readiness": "$0.02"
  },
  {
    url: process.env.AGENTSPEC_X402_FACILITATOR_URL,
    network: process.env.AGENTSPEC_X402_NETWORK
  }
));

app.post("/inspect/openapi", (req, res) => res.json(inspectOpenApi(req.body)));
app.post("/inspect/mcp", (req, res) => res.json(inspectMcp(req.body)));
app.post("/generate/bazaar-metadata", (req, res) => res.json(generateBazaarMetadata(req.body)));
```

Before implementing this adapter, re-check the exact package name and middleware signature against the current official docs. The dependency-free service avoids locking the repo to a stale SDK surface.
