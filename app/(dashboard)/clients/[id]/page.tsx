type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Detalle de cliente</h1>
      <p className="text-muted-foreground font-mono text-sm">ID: {id}</p>
      <p className="text-muted-foreground text-sm">Próximo paso: perfil, métricas y backlog del cliente.</p>
    </div>
  );
}
