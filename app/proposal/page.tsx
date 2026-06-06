import { PageHeader } from "@/components/page-header";
import { ProposalDemo } from "@/components/proposal-demo";

export default function ProposalPage() {
  return (
    <>
      <PageHeader
        title="Proposal Generator"
        description="Collect client context, retrieve source context, and preview a structured client-ready proposal draft."
        status="Draft workspace"
      />
      <ProposalDemo />
    </>
  );
}
