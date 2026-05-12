import { ClientDetailView } from "@/components/client-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ClientDetailView id={id} />;
}
