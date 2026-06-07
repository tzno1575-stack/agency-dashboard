"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { GripVertical, MoreHorizontal, Plus, X } from "lucide-react";
import type { Task } from "@/lib/data";

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  clients: { id: string; name: string }[];
  selectedClientId?: string;
}

const columns = [
  { id: "planning", title: "Planning", color: "bg-gray-600" },
  { id: "ready", title: "Ready", color: "bg-yellow-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

export default function KanbanBoard({ tasks, onTasksChange, clients, selectedClientId }: KanbanBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState(selectedClientId || clients[0]?.id || "");
  const [newNotes, setNewNotes] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (
      result.source.droppableId === result.destination.droppableId &&
      result.source.index === result.destination.index
    ) return;

    const updated = tasks.map((t) => {
      if (t.id === result.draggableId) {
        return { ...t, status: result.destination!.droppableId as Task["status"] };
      }
      return t;
    });
    onTasksChange(updated);
  };

  const handleAddTask = () => {
    if (!newTitle.trim() || !newClient) return;
    const task: Task = {
      id: `task-${Date.now()}`,
      clientId: newClient,
      title: newTitle.trim(),
      status: "planning",
      agentNotes: newNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    onTasksChange([task, ...tasks]);
    setNewTitle("");
    setNewNotes("");
    setShowAddForm(false);
  };

  const getColumnTasks = (status: string) =>
    tasks.filter((t) => t.status === status);

  const activeClient = clients.find((c) => c.id === (selectedClientId || newClient));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-3 md:px-4 py-2 border-b border-[#1a1a1a] shrink-0">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            showAddForm
              ? "bg-[#1a1a1a] text-gray-800"
              : "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
          }`}
        >
          <Plus size={14} />
          Add Task
        </button>
        <span className="text-xs text-gray-500">{tasks.length} tasks</span>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="px-3 md:px-4 py-3 border-b border-[#1a1a1a] bg-white shrink-0">
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-4 space-y-3 max-w-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">New Task</span>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-900">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="What needs to be done?"
                autoFocus
                className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6] placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Client</label>
              <select
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Notes (optional)</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Anything the agent should know?"
                className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 h-16 resize-none focus:outline-none focus:border-[#3b82f6] placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowAddForm(false); setNewTitle(""); setNewNotes(""); }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 bg-[#1a1a1a] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTitle.trim() || !newClient}
                className="px-4 py-2 text-sm bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Planning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-3 md:p-4 overflow-x-auto flex-1 kanban-mobile">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 min-w-[220px] max-w-[320px] flex flex-col">
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">{col.title}</h3>
                <span className="text-[10px] text-gray-500 ml-auto">{getColumnTasks(col.id).length}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg p-2 min-h-[200px] flex-1 transition-colors ${
                      snapshot.isDraggingOver ? "bg-white" : "bg-white"
                    }`}
                  >
                    {getColumnTasks(col.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border border-[#1a1a1a] rounded-lg p-3 mb-2 transition-shadow ${
                              snapshot.isDragging ? "shadow-lg shadow-blue-500/20" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span {...provided.dragHandleProps} className="mt-1 cursor-grab">
                                <GripVertical size={14} className="text-gray-500" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 leading-snug">{task.title}</p>
                                {task.agentNotes && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">{task.agentNotes}</p>
                                )}
                                <p className="text-[10px] text-gray-500 mt-2">{task.createdAt?.slice(0, 10)}</p>
                              </div>
                              <button className="mt-1">
                                <MoreHorizontal size={14} className="text-gray-500" />
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
    </div>
  );
}
