"use client";

import { useState } from "react";
import type { ProjectTask, ProjectTaskStatus } from "@/lib/project/project-types";
import { PROJECT_TASK_STATUS_LABELS } from "@/lib/project/project-types";
import { loadProjectTasks, createProjectTask, setProjectTaskStatus } from "@/lib/project/project-store";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectTasksPanelProps = {
  projectId: string;
};

const STATUS_ORDER: readonly ProjectTaskStatus[] = ["todo", "in_progress", "done"];

function nextStatus(current: ProjectTaskStatus): ProjectTaskStatus | null {
  const index = STATUS_ORDER.indexOf(current);
  return index < STATUS_ORDER.length - 1 ? STATUS_ORDER[index + 1] : null;
}

/** Simple, real project task list — Todo / In Progress / Done. No fake assignments — every task is created by the user, never auto-generated. */
export default function ProjectTasksPanel({ projectId }: ProjectTasksPanelProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>(() => loadProjectTasks(projectId));
  const [title, setTitle] = useState("");

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const task = createProjectTask(projectId, trimmed);
    setTasks((current) => [task, ...current]);
    setTitle("");
  }

  function handleAdvance(taskId: string, current: ProjectTaskStatus) {
    const next = nextStatus(current);
    if (!next) return;
    const updated = setProjectTaskStatus(taskId, next);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
    }
  }

  return (
    <section id="project-tasks" aria-labelledby="project-tasks-heading" className={`${cbaiGlassCard} space-y-3 p-4`}>
      <p className={cbaiSectionEyebrow} id="project-tasks-heading">
        Tasks
      </p>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task…"
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/30"
        />
        <button
          type="submit"
          className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300 hover:border-cyan-500/50"
        >
          Add task
        </button>
      </form>

      {tasks.length > 0 ? (
        <ul className="space-y-1.5">
          {tasks.map((task) => (
            <li key={task.taskId} className="flex items-center justify-between gap-2 text-xs">
              <span className={task.status === "done" ? "text-zinc-500 line-through" : "text-zinc-300"}>{task.title}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md border border-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                  {PROJECT_TASK_STATUS_LABELS[task.status]}
                </span>
                {task.status !== "done" ? (
                  <button
                    type="button"
                    onClick={() => handleAdvance(task.taskId, task.status)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Mark {PROJECT_TASK_STATUS_LABELS[nextStatus(task.status)!]}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">No tasks yet.</p>
      )}
    </section>
  );
}
