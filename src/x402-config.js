export const X402_ROUTES = [
  {
    method: "POST",
    path: "/inspect/openapi",
    price: "0.03",
    currency: "USDC",
    category: "developer-tools",
    description: "Inspect an OpenAPI spec and return agent-readiness score, risks, recommendations, and x402 Bazaar candidates."
  },
  {
    method: "POST",
    path: "/inspect/mcp",
    price: "0.03",
    currency: "USDC",
    category: "developer-tools",
    description: "Inspect MCP tools and return agent-readiness score, risky tools, missing schemas, and marketplace candidates."
  },
  {
    method: "POST",
    path: "/generate/bazaar-metadata",
    price: "0.05",
    currency: "USDC",
    category: "developer-tools",
    description: "Generate x402 Bazaar metadata draft from an AgentSpec report or service description."
  },
  {
    method: "POST",
    path: "/score/agent-readiness",
    price: "0.02",
    currency: "USDC",
    category: "developer-tools",
    description: "Return a compact agent-readiness score for OpenAPI or MCP input."
  }
];

export function findPaidRoute(method, pathname) {
  return X402_ROUTES.find(route => route.method === method.toUpperCase() && route.path === pathname) ?? null;
}

export function paymentMode(env = process.env) {
  return env.AGENTSPEC_PAYMENT_MODE ?? "off";
}

export function paymentConfig(env = process.env) {
  return {
    mode: paymentMode(env),
    payTo: env.AGENTSPEC_PAY_TO ?? "",
    network: env.AGENTSPEC_X402_NETWORK ?? "base-sepolia",
    facilitatorUrl: env.AGENTSPEC_X402_FACILITATOR_URL ?? "https://x402.org/facilitator",
    asset: env.AGENTSPEC_X402_ASSET ?? "USDC"
  };
}

export function maybeRequirePayment(request, route, env = process.env) {
  const mode = paymentMode(env);

  if (!route || mode === "off") {
    return { ok: true };
  }

  if (mode === "dev-402") {
    const paid = request.headers["x-agentspec-dev-payment"] === "paid";
    if (paid) return { ok: true };

    return {
      ok: false,
      status: 402,
      body: buildDevPaymentRequired(route, env)
    };
  }

  return {
    ok: false,
    status: 501,
    body: {
      error: "x402_sdk_not_enabled",
      message: "This no-dependency dev server does not settle x402 payments. Use the production adapter in docs/x402-integration.md with the official x402 SDK.",
      route,
      payment: paymentConfig(env)
    }
  };
}

function buildDevPaymentRequired(route, env) {
  return {
    error: "payment_required",
    mode: "dev-402",
    message: "Local development payment gate. Retry with header `x-agentspec-dev-payment: paid` to bypass. This is not a real x402 settlement.",
    accepts: [
      {
        scheme: "exact",
        network: paymentConfig(env).network,
        maxAmountRequired: route.price,
        asset: route.currency,
        payTo: paymentConfig(env).payTo || "set AGENTSPEC_PAY_TO",
        resource: route.path,
        description: route.description
      }
    ]
  };
}
