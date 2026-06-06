# Demo Script

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. Demo Objective

The demo should show that a focused AI Sales Assistant can help sales users reuse internal company materials, explain technical concepts in business language, and generate proposal drafts from old proposal patterns and client input.

The demo must remain source-aware. If information is not available in the knowledge base or user input, the assistant should mark it as `NEEDS_INPUT`.

## 2. Demo Setup

Before the live demo:

1. Confirm source files are present under `data/source-pdfs/`.
2. Run ingestion for PDF/XLSX files.
3. Confirm the admin page shows ingestion status.
4. Confirm model API key is configured, or use local fallback mode if available.
5. Prepare one sample client scenario.
6. Prepare backup screenshots or sample outputs if network/API access is unavailable.

## 3. Demo Narrative

Suggested opening:

"This project demonstrates a local-first AI Sales Assistant for 3D Archtech. It helps sales users search internal materials, explain technical services in business-friendly language, and generate proposal drafts from previous proposal patterns and client requirements. The system uses retrieval-augmented generation rather than model training, so outputs are tied to source documents and missing facts are marked for review."

## 4. Scenario 1: Knowledge-Base Q&A

Goal:

Show that the assistant can answer questions using internal source materials.

Steps:

1. Open the Chatbox page.
2. Ask a source-backed question, for example:

```text
What internal materials are relevant when preparing a proposal for a client interested in Digital Twin or visualization services?
```

3. Show the assistant response.
4. Point out source references in the source panel.
5. Ask a follow-up:

```text
Explain Digital Twin in business-friendly language for a manufacturing client.
```

6. Show how the answer avoids overly technical language.
7. Highlight any `NEEDS_INPUT` markers if specific claims are not supported by the current sources.

Expected outcome:

- The assistant provides a concise business-friendly explanation.
- The answer includes source references or clearly marks unsupported details.

## 5. Scenario 2: Proposal Generation

Goal:

Show that the assistant can generate a structured proposal draft from client input, old proposal patterns, and source materials.

Sample client input:

| Field | Example |
|---|---|
| Client name | NEEDS_INPUT Demo Client |
| Industry | Real estate, manufacturing, education, or another selected demo industry |
| Pain points | Client needs a clearer way to present complex project or operational information. |
| Business goals | Improve stakeholder communication and support faster sales or operational decisions. |
| Proposed services | Visualization, Digital Twin, AR/VR, or another service supported by source materials. |
| Timeline | NEEDS_INPUT |
| Budget | NEEDS_INPUT |
| Preferred proposal style | Existing old proposal template selected from available source files. |

Steps:

1. Open the Proposal Generator page.
2. Fill in the sample client fields.
3. Select relevant service interests and old proposal reference if available.
4. Click Generate Proposal.
5. Show the generated proposal sections:
   - Cover Page
   - Company and Team Overview
   - Project Overview
   - Challenge vs. Solution Table
   - Detailed Features
   - Implementation Process
   - Scope of Application
   - Expected Results
6. Show source references for proposal sections.
7. Show `NEEDS_INPUT` items for missing timeline, budget, or unsupported facts.
8. Open proposal preview.
9. Export to DOCX.
10. Use the print-friendly view for PDF export.

Expected outcome:

- The assistant generates a structured draft, not a final approved proposal.
- Unsupported details remain clearly marked.
- Export actions work for demonstration.

## 6. Scenario 3: Admin Data Sources

Goal:

Show maintainability and future data expansion.

Steps:

1. Open the Admin Data Sources page.
2. Show the list of files discovered under `data/source-pdfs/`.
3. Show ingestion status, extracted text status, chunk count, and embedding status.
4. Trigger re-ingestion for one source file.
5. Show a warning example if a document needs manual review.

Expected outcome:

- The audience sees that source materials can be refreshed without changing application code.

## 7. Suggested Sample Prompts

Knowledge-base prompts:

```text
Which source documents should I use for a client asking about AR/VR?
```

```text
Summarize the available internal materials related to visualization services.
```

Technical explanation prompts:

```text
Explain Digital Twin for a non-technical business manager.
```

```text
Translate this feature into business benefits: interactive 3D visualization.
```

Proposal prompts:

```text
Generate a proposal draft for a client in [INDUSTRY] with these pain points: [PAIN POINTS].
```

```text
Create a challenge vs. solution table for a client interested in [SERVICE].
```

## 8. Demo Success Criteria

- Both core use cases are demonstrated end to end.
- Answers and proposals display sources or `NEEDS_INPUT`.
- Proposal export is shown.
- The admin page shows data-source maintainability.
- The presenter can explain why RAG is enough and fine-tuning is not required for this MVP.

## 9. Backup Plan

If model API access is unavailable:

- Show local source discovery and ingestion output.
- Use pre-generated sample proposal output labeled as demo sample.
- Explain where live model response would be called.
- Do not present sample output as verified live generation.

If PDF extraction is incomplete:

- Show ingestion warnings.
- Explain that OCR/manual validation can be added later if required.
- Use prompt-library and text-readable files for the live demo path.
