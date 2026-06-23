import tasks from "@/data/tasks.json";
import { TasksKanbanClient } from "@/components/tasks/TasksKanbanClient";
import type { Task } from "@/types";

export default function TasksPage() {
  return (
    <TasksKanbanClient
      seedRows={tasks as Task[]}
      storageKey="darden-os-tasks-sprint-1-3"
    />
  );
}
