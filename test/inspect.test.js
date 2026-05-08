import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { generateBazaarMetadata, inspectMcp, inspectOpenApi } from "../src/inspect.js";

test("inspectOpenApi returns score, endpoints, and Bazaar candidates", async () => {
  const input = JSON.parse(await readFile(new URL("../examples/openapi-weather.json", import.meta.url), "utf8"));
  const report = inspectOpenApi(input);

  assert.equal(report.type, "openapi");
  assert.equal(report.endpointCount, 1);
  assert.equal(report.endpoints[0].operationId, "getForecast");
  assert.ok(report.score >= 80);
  assert.ok(report.bazaarCandidates.length >= 1);
});

test("inspectMcp detects risky tools and preserves launchable tools", async () => {
  const input = JSON.parse(await readFile(new URL("../examples/mcp-tools.json", import.meta.url), "utf8"));
  const report = inspectMcp(input);

  assert.equal(report.type, "mcp");
  assert.equal(report.toolCount, 2);
  assert.ok(report.risks.some(risk => risk.tool === "delete_branch"));
  assert.ok(report.bazaarCandidates.some(candidate => candidate.name === "inspect_repository"));
  assert.ok(!report.bazaarCandidates.some(candidate => candidate.name === "delete_branch"));
});

test("generateBazaarMetadata creates a compact paid-route draft", async () => {
  const input = JSON.parse(await readFile(new URL("../examples/openapi-weather.json", import.meta.url), "utf8"));
  const report = inspectOpenApi(input);
  const metadata = generateBazaarMetadata({ report });

  assert.equal(metadata.currency, undefined);
  assert.equal(metadata.bazaarDraft.discoverable, true);
  assert.equal(metadata.priceSuggestion.currency, "USDC");
  assert.ok(metadata.tags.includes("x402"));
});
