const examples = {
  openapi: {
  spec: {
    openapi: "3.1.0",
    info: {
      title: "Weather Utility API",
      version: "1.0.0",
      description: "Read-only weather lookup API for autonomous agents."
    },
    servers: [{ url: "https://api.example.com" }],
    paths: {
      "/forecast": {
        get: {
          operationId: "getForecast",
          summary: "Get a weather forecast by city.",
          description: "Read-only endpoint that returns a concise forecast for a city and date range.",
          tags: ["weather", "lookup"],
          parameters: [
            {
              name: "city",
              in: "query",
              required: true,
              description: "City name, for example Paris or San Francisco.",
              schema: { type: "string" }
            },
            {
              name: "days",
              in: "query",
              required: false,
              description: "Number of forecast days from 1 to 7.",
              schema: { type: "integer", minimum: 1, maximum: 7 }
            }
          ],
          responses: {
            "200": {
              description: "Forecast result.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      city: { type: "string" },
                      days: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            date: { type: "string" },
                            summary: { type: "string" },
                            temperatureC: { type: "number" }
                          },
                          required: ["date", "summary", "temperatureC"]
                        }
                      }
                    },
                    required: ["city", "days"]
                  },
                  example: {
                    city: "Paris",
                    days: [{ date: "2026-05-07", summary: "Cloudy", temperatureC: 17 }]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  },
  mcp: {
    name: "Repo Assistant MCP",
    tools: [
      {
        name: "inspect_repository",
        description: "Analyze a public GitHub repository and return detected stack, install command, test command, and risk notes.",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "Public GitHub repository URL."
            }
          },
          required: ["repoUrl"],
          additionalProperties: false
        }
      },
      {
        name: "delete_branch",
        description: "Delete a branch from a connected repository after explicit user confirmation.",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "Repository URL."
            },
            branch: {
              type: "string",
              description: "Branch name to delete."
            },
            confirmed: {
              type: "boolean",
              description: "Must be true only after explicit user confirmation."
            }
          },
          required: ["repoUrl", "branch", "confirmed"],
          additionalProperties: false
        }
      }
    ]
  }
};

const input = document.querySelector("#specInput");
const output = document.querySelector("#resultOutput");
const loadExample = document.querySelector("#loadExample");
const inspectButton = document.querySelector("#inspectButton");
const metadataButton = document.querySelector("#metadataButton");
const tabs = [...document.querySelectorAll(".tab")];

let mode = "openapi";
let currentReport = null;
let latestMetadata = null;

function setExample() {
  input.value = JSON.stringify(examples[mode], null, 2);
  currentReport = null;
  latestMetadata = null;
  metadataButton.disabled = true;
  output.innerHTML = `<p class="empty-state">Example loaded. Run inspection to generate the report.</p>`;
}

function renderReport(report) {
  currentReport = report;
  metadataButton.disabled = false;

  const itemLabel = report.type === "mcp" ? "Tools" : "Endpoints";
  const itemCount = report.toolCount ?? report.endpointCount ?? 0;
  const risks = report.risks ?? [];
  const recommendations = report.recommendations ?? [];
  const candidates = report.bazaarCandidates ?? [];

  output.innerHTML = `
    <div class="score-card">
      <div class="mini-score"><strong>${escapeHtml(report.score)}</strong><span>grade ${escapeHtml(report.grade)}</span></div>
      <div>
        <h3 class="report-title">${escapeHtml(report.name || "AgentSpec report")}</h3>
        <p class="report-summary">${escapeHtml(report.summary)}</p>
        <div class="metric-grid">
          <div class="metric"><strong>${escapeHtml(itemCount)}</strong><span>${itemLabel}</span></div>
          <div class="metric"><strong>${escapeHtml(risks.length)}</strong><span>Risk signals</span></div>
          <div class="metric"><strong>${escapeHtml(candidates.length)}</strong><span>Bazaar candidates</span></div>
        </div>
      </div>
    </div>
    ${renderList("Recommendations", recommendations.length ? recommendations : ["No recommendations. This input is ready for a metadata draft."])}
    ${renderRisks(risks)}
    ${renderCandidates(candidates)}
  `;
}

async function inspect() {
  inspectButton.disabled = true;
  inspectButton.textContent = "Inspecting";
  metadataButton.disabled = true;
  output.innerHTML = `<p class="empty-state">Running AgentSpec inspection...</p>`;

  try {
    const body = JSON.parse(input.value);
    const response = await fetch(apiPath(mode === "mcp" ? "/inspect/mcp" : "/inspect/openapi"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
    }

    renderReport(payload);
  } catch (error) {
    output.innerHTML = `<p class="empty-state">Error: ${escapeHtml(error.message)}</p>`;
  } finally {
    inspectButton.disabled = false;
    inspectButton.textContent = "Inspect";
  }
}

async function generateMetadata() {
  if (!currentReport) return;

  metadataButton.disabled = true;
  metadataButton.textContent = "Generating";

  try {
    const response = await fetch(apiPath("/generate/bazaar-metadata"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ report: currentReport })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
    }

    latestMetadata = payload;
    document.querySelector("#metadataDraft")?.remove();
    output.insertAdjacentHTML("beforeend", renderMetadataDraft(payload));
  } catch (error) {
    output.insertAdjacentHTML("beforeend", `
      <section class="report-section">
        <h4>Bazaar metadata draft</h4>
        <div class="pill">Error: ${escapeHtml(error.message)}</div>
      </section>
    `);
  } finally {
    metadataButton.disabled = false;
    metadataButton.textContent = "Generate Bazaar Metadata";
  }
}

function renderMetadataDraft(metadata) {
  const draft = metadata.bazaarDraft ?? {};
  const price = metadata.priceSuggestion ?? {};
  const tags = metadata.tags ?? [];
  const description = metadata.description ?? draft.description ?? "";
  const schema = draft.inputSchema ?? metadata.inputSchema ?? {};
  const outputExample = draft.outputExample ?? metadata.outputExample ?? {};

  return `
    <section class="report-section metadata-draft" id="metadataDraft">
      <div class="section-head">
        <div>
          <h4>Bazaar metadata draft</h4>
          <p>Agent-ready listing payload for the strongest launch candidate.</p>
        </div>
        <button class="button secondary compact" type="button" data-copy-metadata>Copy JSON</button>
      </div>

      <div class="metadata-card">
        <div class="metadata-main">
          <span class="metadata-kicker">${escapeHtml(metadata.category || "developer-tools")}</span>
          <h3>${escapeHtml(metadata.name || "AgentSpec Service")}</h3>
          <p>${escapeHtml(description)}</p>
          <div class="tag-row">
            ${tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>

        <div class="metadata-side">
          <div><span>Method</span><strong>${escapeHtml(draft.method || metadata.method || "POST")}</strong></div>
          <div><span>Path</span><strong>${escapeHtml(draft.resource || metadata.path || "/")}</strong></div>
          <div><span>Price</span><strong>${escapeHtml(price.amount || "0.03")} ${escapeHtml(price.currency || "USDC")}</strong></div>
        </div>
      </div>

      <div class="schema-grid">
        <div>
          <h5>Input schema</h5>
          <pre class="json-block small">${escapeHtml(JSON.stringify(schema, null, 2))}</pre>
        </div>
        <div>
          <h5>Output example</h5>
          <pre class="json-block small">${escapeHtml(JSON.stringify(outputExample, null, 2))}</pre>
        </div>
      </div>

      <details class="raw-details">
        <summary>Full metadata JSON</summary>
        <pre class="json-block">${escapeHtml(JSON.stringify(metadata, null, 2))}</pre>
      </details>
    </section>
  `;
}

function renderList(title, items) {
  return `
    <section class="report-section">
      <h4>${title}</h4>
      <div class="pill-list">
        ${items.map(item => `<div class="pill">${escapeHtml(item)}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderRisks(risks) {
  if (!risks.length) {
    return renderList("Risks", ["No risk signals detected."]);
  }

  return `
    <section class="report-section">
      <h4>Risks</h4>
      <div class="pill-list">
        ${risks.map(risk => `<div class="pill"><strong>${escapeHtml(risk.severity || "risk")}</strong> ${escapeHtml(risk.message || risk.code)}</div>`).join("")}
      </div>
    </section>
  `;
}

function renderCandidates(candidates) {
  if (!candidates.length) {
    return renderList("Bazaar candidates", ["No launch-ready candidates yet. Improve the recommendations and inspect again."]);
  }

  return `
    <section class="report-section">
      <h4>Bazaar candidates</h4>
      <div class="candidate-list">
        ${candidates.map(candidate => `
          <div class="candidate">
            <div class="candidate-head">
              <strong>${escapeHtml(candidate.name)}</strong>
              <span class="price">${escapeHtml(candidate.priceSuggestion?.amount || "0.03")} ${escapeHtml(candidate.priceSuggestion?.currency || "USDC")}</span>
            </div>
            <div class="candidate-code">${escapeHtml(candidate.method)} ${escapeHtml(candidate.path)}</div>
            <p class="report-summary">${escapeHtml(candidate.description)}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function setMode(nextMode) {
  mode = nextMode;
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  setExample();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function apiPath(path) {
  return window.location.protocol === "file:" ? `http://127.0.0.1:4020${path}` : path;
}

async function copyLatestMetadata(button) {
  if (!latestMetadata) return;

  const text = JSON.stringify(latestMetadata, null, 2);

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    button.textContent = "Copied";
  }

  window.setTimeout(() => {
    button.textContent = "Copy JSON";
  }, 1400);
}

loadExample.addEventListener("click", setExample);
inspectButton.addEventListener("click", inspect);
metadataButton.addEventListener("click", generateMetadata);
tabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
output.addEventListener("click", event => {
  const button = event.target.closest("[data-copy-metadata]");
  if (button) copyLatestMetadata(button);
});

setExample();
