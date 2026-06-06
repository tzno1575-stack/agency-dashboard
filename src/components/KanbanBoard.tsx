"use client";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { GripVertical, MoreHorizontal } from "lucide-react";
import type { Task } from "@/lib/data";

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const columns = [
  { id: "planning", title: "Planning", color: "bg-gray-600" },
  { id: "ready", title: "Ready", color: "bg-yellow-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

export default function KanbanBoard({ tasks, onTasksChange }: KanbanBoardProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // No-op: dropped in the exact same spot
    if (
      result.source.droppableId === result.destination.droppableId &&
      result.source.index === result.destination.index
    ) return;

    const destStatus = result.destination.droppableId;
    const validStatuses = columns.map((c) => c.id);
    if (!validStatuses.includes(destStatus)) return;

    const wasAlreadyReady = tasks.find((t) => t.id === result.draggableId)?.status === "ready";

    // Splice: remove from source, insert at destination with new status
    const updated = Array.from(tasks);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, {
      ...moved,
      status: destStatus as Task["status"],
    });

    onTasksChange(updated);

    // Notify Hermes only when a task ENTERS the Ready column for the first time
    if (!wasAlreadyReady && destStatus === "ready") {
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: { ...moved, status: "ready" }, action: "start" }),
      }).catch(console.error);
    }
  };

  const getColumnTasks = (columnId: string) =>
    tasks.filter((t) => t.status === columnId);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto p-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[240px] max-w-[320px]">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {col.title}
              </h3>
              <span className="text-xs text-gray-600 ml-auto">
                {getColumnTasks(col.id).length}
              </span>
            </div>

            {/* Droppable zone */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-lg p-2 min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver ? "bg-[#1a1f2e]" : "bg-[#0f1320]"
                  }`}
                >
                  {getColumnTasks(col.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3 mb-2 transition-shadow ${
                            snapshot.isDragging ? "shadow-lg shadow-blue-500/20" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span {...provided.dragHandleProps} className="mt-1 cursor-grab">
                              <GripVertical size={14} className="text-gray-600" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-200 leading-snug">{task.title}</p>
                              {task.agentNotes && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {task.agentNotes}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 mt-2">{task.createdAt}</p>
                            </div>
                            <button className="mt-1">
                              <MoreHorizontal size={14} className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
