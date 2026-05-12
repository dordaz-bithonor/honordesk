import { TaskDetailView } from "@/components/task-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TaskDetailView taskId={id} />;
}
