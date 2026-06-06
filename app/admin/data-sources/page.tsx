import { PageHeader } from "@/components/page-header";
import { DataSourcesDemo } from "@/components/data-sources-demo";

export default function DataSourcesPage() {
  return (
    <>
      <PageHeader
        title="Admin Data Sources"
        description="Inspect expected source documents and simulated ingestion status. Real file discovery and extraction are scheduled for the RAG ingestion work package."
        status="Registry scaffold"
      />
      <DataSourcesDemo />
    </>
  );
}
