# UI/UX Specification

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. UX Goal

The interface should help a sales user move quickly from question or client brief to usable sales output. It should feel like a focused business tool: clear navigation, readable content, restrained styling, and visible source grounding.

## 2. Information Architecture

Primary pages:

1. Chatbox
2. Proposal Generator
3. Admin Data Sources
4. Proposal Preview and Export

Recommended navigation:

- Sidebar or top navigation with clear page labels.
- Persistent project/app title.
- Status indicators for local mode, API key status, and ingestion readiness where useful.

## 3. Page Specifications

### 3.1 Chatbox Page

Purpose:

- Ask knowledge-base questions.
- Explain technical terms in business-friendly language.
- Use prompt-library workflows for sales support.

Core components:

- Message list.
- User input box.
- Intent or mode selector:
  - Ask Knowledge Base
  - Explain Technical Term
  - Recommend Service
  - Draft Sales Response
- Source panel for retrieved documents.
- Empty state with sample prompts.
- Loading and error states.

Expected behavior:

- User enters a question.
- Assistant answers with concise business language.
- Source panel displays document names and chunk/page references if available.
- If no source supports the answer, the assistant returns `NEEDS_INPUT`.

Sample prompts:

- "Explain Digital Twin for a factory client in business language."
- "Which materials are relevant for an AR/VR proposal?"
- "Turn this technical feature into client-facing business benefits."

### 3.2 Proposal Generator Page

Purpose:

- Collect client input and generate a structured proposal draft.

Core components:

- Client information form.
- Business context fields.
- Service interest selector.
- Old proposal style selector.
- Generate button.
- Retrieval summary before or after generation.
- Validation messages for missing required inputs.

Required fields:

- Client name
- Industry
- Pain points
- Business goals
- Proposed services

Optional fields:

- Project size
- Timeline
- Budget
- Preferred old proposal reference
- Additional meeting notes

Expected behavior:

- The form validates required fields.
- The system retrieves relevant proposal patterns and portfolio materials.
- The generated draft uses the standard proposal structure.
- Unsupported details are marked as `NEEDS_INPUT`.

### 3.3 Proposal Preview and Export Page

Purpose:

- Review generated proposal content and export it.

Core components:

- Proposal title and client summary.
- Section navigation.
- Proposal content preview.
- Source references per section.
- `NEEDS_INPUT` list.
- Export DOCX button.
- Print button for PDF workflow.

Expected behavior:

- User can inspect proposal sections before export.
- Sections show source references where applicable.
- Print-friendly layout removes app chrome and preserves proposal formatting.

### 3.4 Admin Data Sources Page

Purpose:

- Manage ingestion status for source PDFs/XLSX.

Core components:

- Data source table.
- File status badges.
- Ingestion action button.
- Re-ingestion action button.
- Extraction warnings.
- Chunk and embedding counts.
- Last ingested timestamp.

Expected behavior:

- Admin can see files under `data/source-pdfs/`.
- Admin can trigger ingestion.
- Documents with failed or weak extraction are clearly marked for review.

## 4. Visual Design Direction

The UI should be professional, quiet, and practical:

- Use a neutral business-oriented palette with one clear accent color.
- Avoid decorative landing-page hero sections.
- Prioritize dense but readable information layouts.
- Use cards only for repeated items, message blocks, modals, or framed tools.
- Keep controls stable and predictable across screen sizes.
- Use icons in tool buttons when available through the chosen icon library.
- Ensure source references and `NEEDS_INPUT` warnings are visually distinct.

## 5. Component Inventory

Recommended shadcn/ui components:

- Button
- Input
- Textarea
- Select
- Tabs
- Badge
- Card for message/source/result items only
- Table
- Dialog
- Alert
- Separator
- ScrollArea
- Tooltip

Recommended icon usage:

- Send for chat submit.
- FileText for documents.
- Database for data sources.
- Download for DOCX export.
- Printer for print-friendly export.
- RefreshCw for re-ingestion.
- AlertCircle for warnings.

## 6. Interaction States

Required states:

- Empty chat state.
- Loading response state.
- Retrieval in progress state.
- No source found state.
- Missing input state.
- Ingestion running state.
- Ingestion failed state.
- Export generating state.
- Export failed state.

## 7. Responsive Behavior

Desktop:

- Sidebar navigation and two-column layouts are acceptable.
- Chat can show sources in a right panel.
- Proposal preview can show section navigation beside content.

Mobile:

- Navigation should collapse.
- Source panel should become a drawer or stacked section.
- Proposal form should become a single-column layout.
- Buttons and inputs must remain readable without text overlap.

## 8. Accessibility and Usability

- Use semantic headings and labels.
- Provide keyboard-accessible forms and buttons.
- Keep color contrast sufficient.
- Avoid relying on color alone for warnings or statuses.
- Keep generated content selectable for copying.

## 9. Content Rules

- Do not present AI-generated proposals as final approved proposals.
- Label generated content as draft content.
- Show `NEEDS_INPUT` prominently when source-backed detail is missing.
- Keep answer language business-friendly and direct.
- Do not use unsupported company claims in UI sample data.

## 10. MVP UI Acceptance Criteria

- Chatbox works with messages, loading state, response, and source display.
- Proposal generator collects required input and shows validation errors.
- Proposal preview displays sectioned content, sources, and missing inputs.
- Admin page lists source documents and ingestion status.
- Export actions are visible and have clear feedback.
- Layout remains usable on desktop and mobile.
