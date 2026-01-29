"use client";
import ResourceTable from "../ResourceTable";
import { Task } from "@/types/resources";

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCreateClick: () => void;
}

export default function TasksTable({
  tasks,
  loading,
  error,
  onCreateClick,
}: TasksTableProps) {
  return (
    <ResourceTable
      data={tasks}
      columns={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        {
          key: "status",
          label: "Status",
          render: (task) => task.status || "todo"
        },
        {
          key: "priority",
          label: "Priority",
          render: (task) => task.priority || "medium"
        },
        {
          key: "dueDate",
          label: "Due Date",
          render: (task) => task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"
        },
      ]}
      loading={loading}
      error={error}
      onCreateClick={onCreateClick}
      createButtonLabel="Create Task"
      emptyMessage="No tasks found."
      title="Tasks"
    />
  );
}
