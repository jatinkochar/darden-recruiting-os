import tasks from "@/data/tasks.json";
import { TasksKanbanClient } from "@/components/tasks/TasksKanbanClient";

export default function TasksPage() {
  return (
    <TasksKanbanClient
      seedRows={tasks}
      storageKey="darden-os-tasks-kanban-v2"
    />
  );
}
