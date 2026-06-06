# MVP Demo Cases

Project: AI Sales Assistant for 3D Archtech  
Last updated: 2026-06-06

Use this file as a short demo-day script for the MVP pages: `/chat`, `/prompts`, and `/proposal`.

## Quick Setup

1. Run `npm run dev`.
2. Open `http://localhost:3000`.
3. Keep `.env.local` hidden during the demo.

## Case 1 - Chat: Business-Friendly Explanation

Route: `/chat`

Prompt:

```text
Explain Digital Twin for a manufacturing client in business-friendly language.
Focus on production-line visibility, operational decision-making, and stakeholder communication.
```

Steps:

1. Open `/chat`.
2. Paste the prompt.
3. Send the message.
4. Expand cited source chunks.

Expected result:

- The response is clear, business-friendly, and source-aware.
- The response shows provider/intent badges and cited chunks.

## Case 2 - Chat: Client Proposal Draft

Route: `/chat`

Prompt:

```text
Client: Alpha Factory
Pain Points: Need real-time monitoring and scenario simulation for production lines.
Goal: Create a proposal for a digital twin solution.

Please draft a client-ready proposal. Make it detailed, professional, and focused on the manufacturing use case.
```

Steps:

1. Open `/chat`.
2. Paste the prompt.
3. Send the message.
4. If export buttons appear, click `DOCX` or `Print`.

Expected result:

- The response is a complete professional proposal draft.
- The content focuses on Digital Twin, manufacturing, monitoring, and scenario simulation.
- Proposal export actions are available when the response is detected as proposal content.

## Case 3 - Prompts Hub: Customize and Use in Chat

Route: `/prompts`

Prompt to select:

```text
Develop a new proposal by leveraging the existing proposal templates
```

Suggested variable values:

```text
Business Goals:
Create a Digital Twin pilot proposal for a manufacturing client.

Industry:
Manufacturing

Pain Points:
Need production-line visibility, scenario simulation, and clearer issue communication.

Services:
3D visualization, Digital Twin pilot, dashboard experience, scenario simulation support.
```

Steps:

1. Open `/prompts`.
2. Select the proposal prompt.
3. Fill the context variable fields.
4. Review the Live Preview.
5. Click `Copy for Chat` or `Use in Chat`.
6. If using `Use in Chat`, review the loaded prompt in `/chat`, then send.

Expected result:

- Prompt list is scrollable.
- Live Preview updates with the entered variables.
- The compiled prompt can be copied or moved into Chat.

## Case 4 - Proposal Page: Generate and Export

Route: `/proposal`

Steps:

1. Open `/proposal`.
2. Click `Load Demo Scenario`.
3. Click `Generate Draft`.
4. Review generated proposal sections.
5. Click `Preview`.
6. Use print-friendly output or return and click `DOCX`.

Expected result:

- The proposal draft has structured sales sections.
- Source references are visible.
- Preview and DOCX export work for demo purposes.

