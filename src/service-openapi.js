import { X402_ROUTES } from "./x402-config.js";

export function serviceOpenApi(baseUrl = "http://localhost:4020") {
  return {
    openapi: "3.1.0",
    info: {
      title: "AgentSpec API",
      version: "0.1.0",
      description: "Inspect OpenAPI specs, MCP tools, and API docs, then generate agent-ready x402 Bazaar metadata."
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/health": {
        get: {
          operationId: "getHealth",
          summary: "Return service health.",
          responses: {
            "200": {
              description: "Service is healthy.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      service: { type: "string" }
                    },
                    required: ["ok", "service"]
                  },
                  example: { ok: true, service: "AgentSpec" }
                }
              }
            }
          }
        }
      },
      ...Object.fromEntries(X402_ROUTES.map(route => [
        route.path,
        {
          [route.method.toLowerCase()]: {
            operationId: route.path.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_"),
            summary: route.description,
            description: `${route.description} Price suggestion: ${route.price} ${route.currency} per call.`,
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true
                  },
                  example: route.path.includes("openapi")
                    ? { spec: { openapi: "3.1.0", info: { title: "Example", version: "1.0.0" }, paths: {} } }
                    : { name: "Example service" }
                }
              }
            },
            responses: {
              "200": {
                description: "Inspection result.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: true
                    },
                    example: { score: 86, grade: "B", recommendations: [] }
                  }
                }
              },
              "402": {
                description: "Payment required when x402 payment mode is enabled."
              }
            }
          }
        }
      ]))
    }
  };
}
