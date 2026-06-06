import {
  Bot,
  Database,
  FileText,
  LibraryBig,
  MessageSquareText,
  Presentation,
  RefreshCw
} from "lucide-react";

export const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: Presentation
  },
  {
    href: "/chat",
    label: "AI Chat Helper",
    icon: MessageSquareText
  },
  {
    href: "/prompts",
    label: "Prompt Hub",
    icon: LibraryBig
  },
  {
    href: "/proposal",
    label: "Proposal Generator",
    icon: FileText
  },
  {
    href: "/admin/data-sources",
    label: "Data Sources",
    icon: Database
  }
];

export const readinessItems = [
  {
    label: "MVP scaffold",
    value: "Ready",
    description: "App shell, navigation, and core sales workflow pages are available.",
    icon: Bot
  },
  {
    label: "RAG ingestion",
    value: "Ready",
    description: "Local extraction, chunking, and lexical retrieval are available for the demo.",
    icon: RefreshCw
  },
  {
    label: "Prompt Hub",
    value: "New",
    description: "Prompt library workspace is available from the source XLSX workbook.",
    icon: MessageSquareText
  }
];

export const sampleSources = [
  {
    name: "Company profile 3D Archtech.pdf",
    type: "Company profile",
    status: "Pending ingestion",
    chunks: "NEEDS_INPUT",
    lastIngested: "Not ingested"
  },
  {
    name: "FarmDiaries_Proposal_3DArchtech.pdf",
    type: "Proposal",
    status: "Pending ingestion",
    chunks: "NEEDS_INPUT",
    lastIngested: "Not ingested"
  },
  {
    name: "Portfolio Digital Twin.pdf",
    type: "Portfolio",
    status: "Pending ingestion",
    chunks: "NEEDS_INPUT",
    lastIngested: "Not ingested"
  },
  {
    name: "[3D Archtech] Prompts for AI sales assistant.xlsx",
    type: "Prompt library",
    status: "Planning reviewed",
    chunks: "NEEDS_INPUT",
    lastIngested: "Not ingested"
  }
];

export const proposalSections = [
  "Cover Page",
  "Company and Team Overview",
  "Project Overview",
  "Challenge vs. Solution Table",
  "Detailed Features",
  "Implementation Process",
  "Scope of Application",
  "Expected Results",
  "Risks, Assumptions, and NEEDS_INPUT"
];
