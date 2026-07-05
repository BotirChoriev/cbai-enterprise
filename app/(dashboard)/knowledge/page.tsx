import PageHeader from "@/components/layout/PageHeader";
import KnowledgeStats from "@/components/knowledge/KnowledgeStats";
import DocumentCard from "@/components/knowledge/DocumentCard";
import SourceHealth from "@/components/knowledge/SourceHealth";
import KnowledgeActivity from "@/components/knowledge/KnowledgeActivity";
import {
  knowledgeCollections,
  knowledgeActivity,
  sourceHealth,
} from "@/lib/knowledge";

export default function KnowledgePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Knowledge"
        description="Manage document collections and knowledge bases for RAG."
        action={
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400"
          >
            Upload Documents
          </button>
        }
      />

      <KnowledgeStats />

      <div>
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">
          Document Collections
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {knowledgeCollections.map((collection) => (
            <DocumentCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceHealth sources={sourceHealth} />
        <KnowledgeActivity items={knowledgeActivity} />
      </div>
    </div>
  );
}
