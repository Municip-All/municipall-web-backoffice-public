import Link from "next/link";
import { notFound } from "next/navigation";
import LegalDocumentRenderer from "@/components/profile/LegalDocumentRenderer";
import { getLegalDocument, type LegalDocId } from "@/lib/legalContent";

const VALID_DOCS: LegalDocId[] = [
  "cgu",
  "staff-privacy",
  "mentions",
  "cookies",
  "citizen-privacy",
];

export function generateStaticParams() {
  return VALID_DOCS.map((doc) => ({ doc }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  if (!VALID_DOCS.includes(doc as LegalDocId)) {
    notFound();
  }

  const document = getLegalDocument(doc as LegalDocId);

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-bold text-[var(--accent)] hover:underline"
        >
          ← Retour au Panel
        </Link>
        <div className="card-premium p-10">
          <LegalDocumentRenderer document={document} />
        </div>
      </div>
    </div>
  );
}
