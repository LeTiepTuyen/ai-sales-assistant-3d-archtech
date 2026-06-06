const baseUrl = process.env.LOCAL_URL ?? "http://localhost:3000";

async function expectOk(label, request) {
  const response = await request();
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${label} failed: ${response.status} ${response.statusText}\n${text}`);
  }
  return response;
}

async function get(path) {
  return expectOk(`GET ${path}`, () => fetch(`${baseUrl}${path}`));
}

async function postJson(path, body) {
  return expectOk(`POST ${path}`, () =>
    fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
  );
}

async function main() {
  const results = [];

  for (const path of ["/", "/chat", "/prompts", "/proposal", "/admin/data-sources", "/proposal/preview"]) {
    await get(path);
    results.push(`${path}: ok`);
  }

  const dataSourcesResponse = await get("/api/data-sources");
  const dataSources = await dataSourcesResponse.json();
  if (!Array.isArray(dataSources.documents) || dataSources.documents.length === 0) {
    throw new Error("Data source API returned no documents.");
  }
  results.push(`/api/data-sources: ${dataSources.documents.length} documents`);

  const chatResponse = await postJson("/api/chat", {
    mode: "Explain Technical Term",
    message: "Explain Digital Twin for a manufacturing client in business language."
  });
  const chat = await chatResponse.json();
  if (!chat.answer || !Array.isArray(chat.sources) || chat.sources.length === 0) {
    throw new Error("Chat API did not return an answer with sources.");
  }
  results.push(`/api/chat: ${chat.intentLabel}, ${chat.sources.length} sources`);

  const proposalInput = {
    clientName: "Demo Manufacturing Client",
    industry: "Manufacturing",
    painPoints: "Need real-time visibility across factory operations.",
    businessGoals: "Improve operational decisions and stakeholder communication.",
    services: "Digital Twin and Visualization",
    timeline: "",
    budget: "",
    style: "Use best matching old proposal"
  };
  const proposalResponse = await postJson("/api/proposals/generate", proposalInput);
  const proposal = await proposalResponse.json();
  if (!Array.isArray(proposal.sections) || proposal.sections.length < 8) {
    throw new Error("Proposal API did not return the expected section structure.");
  }
  results.push(`/api/proposals/generate: ${proposal.sections.length} sections`);

  const exportResponse = await postJson("/api/proposals/export/docx", proposal);
  const contentType = exportResponse.headers.get("content-type") ?? "";
  const buffer = await exportResponse.arrayBuffer();
  if (!contentType.includes("wordprocessingml.document") || buffer.byteLength < 1000) {
    throw new Error("DOCX export did not return a valid document response.");
  }
  results.push(`/api/proposals/export/docx: ${buffer.byteLength} bytes`);

  console.log(`Local smoke test passed for ${baseUrl}`);
  for (const result of results) {
    console.log(`- ${result}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
