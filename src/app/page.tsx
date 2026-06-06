"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, MessageCircle, Activity } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ChatWidget from "@/components/ChatWidget";
import ModeSwitcher from "@/components/ModeSwitcher";
import ReviewQueue from "@/components/ReviewQueue";
import ClientDetail from "@/components/ClientDetail";
import TaskForce from "@/components/TaskForce";
import SocialAccountsPanel from "@/components/SocialAccountsPanel";
import ContentStudio from "@/components/ContentStudio";
import SettingsPanel from "@/components/SettingsPanel";
import LiveMonitor from "@/components/LiveMonitor";
import BottomNav from "@/components/BottomNav";
import { sampleClients, sampleTasks, sampleSocialAccounts, normalizeClient, normalizeClients } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Client, Task, Agent, SocialAccount, ScheduledPost } from "@/lib/data";

type Mode = "taskforce" | "hybrid" | "autopilot";
type View = "kanban" | "review" | "crm" | "agents" | "social" | "content" | "settings" | "monitor";

export default function Dashboard() {
  const [clientsRaw, setClientsRaw, clientsLoaded] = useLocalStorage<Client[]>("aqd_clients", sampleClients);
  const clients = clientsRaw.map(c => normalizeClient(c));
  const setClients = (value: Client[] | ((prev: Client[]) => Client[])) => {
    if (value instanceof Function) {
      setClientsRaw((prev) => normalizeClients(value(prev.map(normalizeClient))));
    } else {
      setClientsRaw(normalizeClients(value));
    }
  };
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<Task[]>("aqd_tasks", sampleTasks);
  const [agents, setAgents, agentsLoaded] = useLocalStorage<Agent[]>("aqd_agents", []);
  const [socialAccounts, setSocialAccounts, socialLoaded] = useLocalStorage<SocialAccount[]>("aqd_social", sampleSocialAccounts);
  const [posts, setPosts, postsLoaded] = useLocalStorage<ScheduledPost[]>("aqd_posts", []);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(sampleClients[0]?.id ?? null);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [view, setView] = useState<View>("kanban");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string>("dashboard");

  const handleNavigate = (module: "dashboard" | "clients" | "messages" | "settings") => {
    setActiveModule(module);
    setMobileSidebarOpen(false);
    if (module === "dashboard") setView("kanban");
    if (module === "clients") setView("crm");
    if (module === "messages") setChatOpen(true);
    if (module === "settings") setView("settings");
  };

  const handleBottomNav = (id: string) => {
    if (id === "chat") { setChatOpen(true); return; }
    if (id === "monitor") { setView("monitor"); setActiveModule("monitor"); return; }
    setView(id as View);
    setActiveModule(id === "kanban" ? "dashboard" : id === "crm" ? "clients" : "agents");
  };

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

  // Poll review count
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch("/api/review");
        const data = await res.json();
        setReviewCount(data.items?.filter((i: any) => i.status === "pending").length || 0);
      } catch {}
    };
    fetchReview();
    const interval = setInterval(fetchReview, 15000);
    return () => clearInterval(interval);
  }, []);

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

  const loaded = clientsLoaded && tasksLoaded && agentsLoaded && socialLoaded && postsLoaded;
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
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileSidebarOpen(false);
          }}
        >
          <Sidebar
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setView("crm");
              setMobileSidebarOpen(false);
            }}
            onAddClient={() => {
              handleAddClient();
              setMobileSidebarOpen(false);
            }}
            onNavigate={handleNavigate}
            activeModule={activeModule}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={(id) => {
            setSelectedClientId(id);
            setView("crm");
          }}
          onAddClient={handleAddClient}
          onNavigate={handleNavigate}
          activeModule={activeModule}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-3 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
          {/* Hamburger */}
          <button
            className="hamburger text-gray-400 hover:text-white"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <ModeSwitcher mode={mode} onChange={setMode} />
          <div className="flex gap-1 ml-auto tabs-scroll">
            <button
              onClick={() => setView("kanban")}
              className={`px-2 md:px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
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
              onClick={() => setView("social")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "social"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Social
            </button>
            <button
              onClick={() => setView("content")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                view === "content"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Content
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
              {reviewCount > 0 && (
                <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full">
                  {reviewCount}
                </span>
              )}
            </button>
            {/* Monitor */}
            <button
              onClick={() => setView("monitor")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                view === "monitor"
                  ? "bg-[#1a1f2e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Activity size={13} />
              Live
            </button>
            {/* Chat toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                chatOpen
                  ? "bg-[#3b82f6] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <MessageCircle size={14} />
              Chat
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {view === "kanban" && (
            <div className="kanban-mobile flex gap-4 h-full p-4">
              <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
            </div>
          )}
          {view === "agents" && (
            <TaskForce
              agents={agents}
              clients={clientOptions}
              onDeploy={handleDeployAgent}
            />
          )}
          {view === "crm" && !selectedClient && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a client from the sidebar to view details
            </div>
          )}
          {view === "crm" && selectedClient && (
            <div className="flex flex-1 overflow-hidden crm-stack">
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
          {view === "social" && selectedClient && (
            <SocialAccountsPanel
              accounts={socialAccounts}
              clientId={selectedClientId!}
              clientName={selectedClient?.name || ""}
              onUpdate={setSocialAccounts}
            />
          )}
          {view === "content" && selectedClient && (
            <>
              {/* Mobile: full-screen with back button */}
              <div className="md:hidden fixed inset-0 z-50 bg-[#0a0e17]">
                <ContentStudio
                  posts={posts}
                  accounts={socialAccounts}
                  clientId={selectedClientId!}
                  onSave={(post) => setPosts([...posts, post])}
                  onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))}
                  onBack={() => setView("kanban")}
                />
              </div>
              {/* Desktop: inline */}
              <div className="hidden md:block flex-1 overflow-hidden">
                <ContentStudio
                  posts={posts}
                  accounts={socialAccounts}
                  clientId={selectedClientId!}
                  onSave={(post) => setPosts([...posts, post])}
                  onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))}
                />
              </div>
            </>
          )}
          {view === "settings" && <SettingsPanel />}
          {view === "monitor" && <LiveMonitor />}
        </div>

        {/* Status bar */}
        <footer className="px-4 py-1.5 border-t border-[#1e293b] bg-[#0f1320] text-xs text-gray-600 flex items-center gap-4 shrink-0">
          <span>
            Mode: {mode === "hybrid" ? "Hybrid (10-80-10)" : mode === "taskforce" ? "TaskForce" : "AutoPilot"}
          </span>
          <span className="ml-auto">Aql Digital Agency OS v0.4</span>
        </footer>
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav
        activeView={chatOpen ? "chat" : view}
        agentCount={agents.filter((a) => a.status === "running" || a.status === "queued").length}
        onNavigate={handleBottomNav}
      />

      {/* Chat panel — slides in/out */}
      {chatOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setChatOpen(false)}
          />
          {/* Panel */}
          <div className="fixed md:relative inset-y-0 right-0 w-80 max-w-[85vw] z-40 md:z-auto animate-slide-in md:animate-none">
            <ChatWidget />
            {/* Close button on mobile */}
            <button
              onClick={() => setChatOpen(false)}
              className="absolute top-2 right-2 md:hidden bg-[#1a1f2e] p-1 rounded text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
