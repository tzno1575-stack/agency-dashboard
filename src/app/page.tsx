"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ChatWidget from "@/components/ChatWidget";
import ModeSwitcher from "@/components/ModeSwitcher";
import ReviewQueue from "@/components/ReviewQueue";
import ClientDetail from "@/components/ClientDetail";
import TaskForce from "@/components/TaskForce";
import { sampleClients, sampleTasks } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Client, Task, Agent } from "@/lib/data";

type Mode = "taskforce" | "hybrid" | "autopilot";
type View = "kanban" | "review" | "crm" | "agents";

export default function Dashboard() {
  const [clients, setClients, clientsLoaded] = useLocalStorage<Client[]>("aqd_clients", sampleClients);
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<Task[]>("aqd_tasks", sampleTasks);
  const [agents, setAgents, agentsLoaded] = useLocalStorage<Agent[]>("aqd_agents", []);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(sampleClients[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [view, setView] = useState<View>("kanban");

  // Filter tasks for the selected client
  const clientTasks = tasks.filter((t) => t.clientId === selectedClientId);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // Poll for agent updates from server
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents?.length > 0) {
        setAgents(data.agents);
      }
    } catch {}
  }, [setAgents]);

  useEffect(() => {
    const interval = setInterval(fetchAgents, 10000); // poll every 10s
    fetchAgents();
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const handleAddClient = () => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: "New Client",
      website: "",
      socials: [],
      email: "",
      billing: { lineItems: [], status: "pending" },
      notes: "",
    };
    setClients([...clients, newClient]);
    setSelectedClientId(newClient.id);
    setView("crm");
  };

  const handleSaveClient = (updated: Client) => {
    const exists = clients.find((c) => c.id === updated.id);
    if (exists) {
      setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      setClients([...clients, updated]);
      setSelectedClientId(updated.id);
    }
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    setTasks(tasks.filter((t) => t.clientId !== id));
    if (selectedClientId === id) {
      setSelectedClientId(clients[0]?.id !== id ? clients[0]?.id : null);
    }
  };

  const handleDeployAgent = async (deployData: Omit<Agent, "id" | "status" | "createdAt">) => {
    // Add locally immediately (optimistic)
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      ...deployData,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    setAgents([...agents, newAgent]);

    // Send to API
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deployData),
      });
    } catch {}
  };

  const loaded = clientsLoaded && tasksLoaded && agentsLoaded;
  if (!loaded) {
    return (
      <div className="flex h-screen bg-[#0a0e17] items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex h-screen bg-[#0a0e17] text-gray-200 overflow-hidden">
      <Sidebar
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={(id) => {
          setSelectedClientId(id);
          setView("crm");
        }}
        onAddClient={handleAddClient}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="flex gap-1 ml-auto">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "kanban"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setView("agents")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                view === "agents"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Agents
              {agents.filter((a) => a.status === "running" || a.status === "queued").length > 0 && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">
                  {agents.filter((a) => a.status === "running" || a.status === "queued").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView("crm")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "crm"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              CRM
            </button>
            <button
              onClick={() => setView("review")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                view === "review"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Review
              <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full">
                2
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {view === "kanban" && (
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
          )}
          {view === "agents" && (
            <TaskForce
              agents={agents}
              clients={clientOptions}
              onDeploy={handleDeployAgent}
            />
          )}
          {view === "crm" && (
            <div className="flex flex-1 overflow-hidden">
              <div className="w-80 border-r border-[#1e293b] overflow-y-auto flex flex-col">
                <ClientDetail
                  client={selectedClient}
                  onSave={handleSaveClient}
                  onDelete={handleDeleteClient}
                  onClose={() => setView("kanban")}
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-[#1e293b]">
                  Tasks for {selectedClient?.name || "client"} ({clientTasks.length})
                </div>
                <KanbanBoard
                  tasks={clientTasks}
                  onTasksChange={(updated) => {
                    const others = tasks.filter((t) => t.clientId !== selectedClientId);
                    setTasks([...others, ...updated]);
                  }}
                />
              </div>
            </div>
          )}
          {view === "review" && <ReviewQueue />}
        </div>

        {/* Status bar */}
        <footer className="px-4 py-1.5 border-t border-[#1e293b] bg-[#0f1320] text-xs text-gray-600 flex items-center gap-4 shrink-0">
          <span>
            Mode: {mode === "hybrid" ? "Hybrid (10-80-10)" : mode === "taskforce" ? "TaskForce" : "AutoPilot"}
          </span>
          <span className="ml-auto">Aql Digital Agency OS v0.3</span>
        </footer>
      </main>
      <ChatWidget />
    </div>
  );
}
