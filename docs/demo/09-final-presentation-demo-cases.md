# Final Presentation Demo Cases

Project: AI Sales Assistant for 3D Archtech  
Audience: University final demo panel  
Presenter role: Sales representative at 3D Archtech  
Public demo URL: `https://ai-sales-assistant-3d-archtech.vercel.app`

## Demo Goal

Show how a 3D Archtech sales user can use internal company materials to explain services, answer client questions, and draft a proposal for a practical client opportunity.

Keep the demo short, source-aware, and sales-focused. The assistant output is a draft for sales review, not a final legal or commercial commitment.

## Pre-Demo Setup

1. Open the public app.
2. Keep `.env.local`, Supabase keys, and Google API keys hidden.
3. Prepare one client brief file from `docs/demo/client-briefs/`.
4. Open these tabs:
   - `/prompts`
   - `/chat`
   - `/proposal` only as a backup page

## MVP Case 1 - Prompt Hub to AI Chat

Purpose: Show that Sales can reuse source-grounded internal prompt templates and turn them into client-ready communication.

Route: `/prompts`

Recommended Prompt Hub filter: `Client`

Recommended prompt:

```text
Explain industry-specific technical terms in a clear and easy-to-understand manner
```

Practical sales scenario:

3D Archtech has just finished a discovery call with a manufacturing prospect. The operations manager is interested in Digital Twin but thinks it is only a 3D model. The sales user needs a simple explanation that connects Digital Twin to production visibility and management decisions.

Fill the Prompt Hub fields:

```text
AUDIENCE:
Operations Manager and Plant Director

CONTEXT:
The client runs a mid-sized electronics assembly factory. They want to understand whether a Digital Twin can help managers see production-line status, compare improvement scenarios, and communicate issues more clearly between operations, engineering, and management teams.

GOAL:
Explain Digital Twin in business language that Sales can reuse in a follow-up meeting. Keep it practical and avoid unsupported ROI, timeline, or pricing claims.

INDUSTRY:
Manufacturing

TERM:
Digital Twin
```

Demo steps:

1. Open `/prompts`.
2. Select filter `Client`.
3. Select the recommended prompt.
4. Paste the values above into the detected variables.
5. Click `Use in Chat`.
6. Review the compiled prompt in `/chat`.
7. Send the message.
8. Point out the answer structure and source citations.

Expected outcome:

- The assistant explains Digital Twin in business-friendly language.
- The response connects technical meaning to production visibility, scenario discussion, and stakeholder communication.
- The answer avoids unsupported pricing, timeline, ROI, and implementation commitments.

Optional alternate prompt:

```text
Translate technical product/service features into clear business benefits for customers
```

Alternate field values:

```text
AUDIENCE:
Factory Operations Director and Business Development Manager

FEATURES:
Interactive 3D visualization, Digital Twin pilot, dashboard experience, and scenario simulation support.

GOAL:
Translate these features into customer-facing business benefits for a manufacturing sales conversation.

INDUSTRY:
Manufacturing

SERVICE:
Digital Twin and 3D Visualization
```

## MVP Case 2 - AI Chatbot Q&A

Purpose: Show that Sales can ask practical questions about 3D Archtech services and technical terms using internal source context.

Route: `/chat`

Use these questions one by one.

### Question 1 - Service Explanation

```text
As a 3D Archtech sales representative, explain Digital Twin to a manufacturing client in business-friendly language. Focus on production-line visibility, operational decision-making, and stakeholder communication. Use internal sources where available.
```

Expected talking point:

The assistant should explain Digital Twin as a practical business tool, not only a visual 3D model.

### Question 2 - Business Benefits

```text
Translate 3D visualization and Digital Twin services into business benefits for a client who manages factory operations. Keep the answer practical and suitable for a sales follow-up email.
```

Expected talking point:

The assistant should turn features into benefits such as clearer communication, better understanding of operations, and easier stakeholder alignment.

### Question 3 - Service Recommendation

```text
A manufacturing prospect says they need better production-line visibility and a clearer way to explain operational issues to senior management. Which 3D Archtech services should Sales position first, and why?
```

Expected talking point:

The assistant should recommend relevant services such as Digital Twin and visualization, with source-aware reasoning.

### Question 4 - Sales Follow-Up Angle

```text
What should I ask the client before proposing a Digital Twin pilot for a factory? List practical discovery questions that Sales should confirm before preparing the proposal.
```

Expected talking point:

The assistant should ask about production-line scope, available data, stakeholders, timeline, budget, integrations, and success criteria.

## MVP Case 3 - Upload Client Brief and Draft Proposal in Chat

Purpose: Show that Sales can attach a client brief and ask the assistant to generate a source-grounded proposal draft using both client input and internal 3D Archtech materials.

Route: `/chat`

Recommended client brief:

```text
docs/demo/client-briefs/alpha-factory-client-brief.md
```

Backup briefs:

```text
docs/demo/client-briefs/mekong-logistics-client-brief.md
docs/demo/client-briefs/orion-property-client-brief.md
```

Demo steps:

1. Open `/chat`.
2. Attach `alpha-factory-client-brief.md`.
3. Paste this instruction:

```text
Act as a 3D Archtech sales assistant. Use the attached client brief as the client context and use available internal source materials for 3D Archtech service framing.

Draft a client-ready proposal for this manufacturing client. Focus on Digital Twin and 3D visualization as a practical pilot for production-line visibility, scenario discussion, and stakeholder communication.

Do not invent pricing, fixed timeline, ROI, guaranteed results, or unsupported technical integrations. Put those items under assumptions and items to confirm.
```

4. Send the message.
5. Show that the uploaded brief appears as a source.
6. Point out source citations from internal materials.
7. Use `DOCX` or print-friendly preview if time allows.

Expected outcome:

- The assistant drafts a structured proposal.
- The response uses the attached client brief as primary client context.
- The proposal stays realistic and flags timeline, budget, data availability, and measurable success criteria as items to confirm.

## Presenter Closing Line

This MVP shows how a sales representative can reuse internal 3D Archtech knowledge in three practical ways: explain technical services, answer sales questions with source context, and draft a proposal from a client brief. The system does not train a custom model; it uses RAG and server-side Gemini calls so the demo remains practical, maintainable, and low-cost for a classroom presentation.

## Backup Plan

If the model is slow or quota-limited:

1. Use the already generated Prompt Hub compiled prompt as the visible demo artifact.
2. Show that Supabase contains the processed RAG chunks.
3. Use a shorter chat question from Case 2.
4. Explain that source-grounded retrieval and proposal export are the MVP value, while model response speed depends on free-tier quota.
