"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, X, MessageCircle, Activity } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ChatWidget from "@/components/ChatWidget";
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

type NavBoard = "dashboard" | "taskforce" | "autopilot" | "clients" | "messages" | "settings";
type View = "kanban" | "review" | "crm" | "agents" | "social" | "content" | "monitor";

export default function Dashboard() {
  const [clientsRaw, setClientsRaw, clientsLoaded] = useLocalStorage<Client[]>("aqd_clients", sampleClients);
  const clients = clientsRaw.map(c => {
    try { return normalizeClient(c); }
    catch { return normalizeClient({ id: c.id || "unknown" }); }
  });
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
  const [activeBoard, setActiveBoard] = useState<NavBoard>("dashboard");
  const [view, setView] = useState<View>("kanban");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const agentCount = agents.filter((a) => a.status === "running" || a.status === "queued").length;

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setFatalError(e.message || "Unknown error");
      e.preventDefault();
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  // Navigation from sidebar
  const handleNavigate = (board: NavBoard) => {
    setActiveBoard(board);
    setMobileSidebarOpen(false);
    if (board === "dashboard") setView("kanban");
    if (board === "clients") setView("crm");
    if (board === "messages") setChatOpen(true);
  };

  // Bottom nav for mobile
  const handleBottomNav = (id: string) => {
    if (id === "chat") { setChatOpen(true); return; }
    if (id === "monitor") { setActiveBoard("autopilot"); return; }
    if (id === "kanban") { setActiveBoard("dashboard"); setView("kanban"); return; }
    if (id === "crm") { setActiveBoard("clients"); setView("crm"); return; }
    setActiveBoard(id as NavBoard);
  };

  const clientTasks = tasks.filter((t) => t.clientId === selectedClientId);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;
  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  // Poll for agent updates
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      if (data.agents?.length > 0) setAgents(data.agents);
    } catch {}
  }, [setAgents]);

  useEffect(() => {
    const interval = setInterval(fetchAgents, 10000);
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
      name: "New Client", website: "", socials: [], email: "",
      billing: { lineItems: [], status: "pending" }, notes: "",
    };
    setClients([...clients, newClient]);
    setSelectedClientId(newClient.id);
    setActiveBoard("clients"); setView("crm");
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
    if (selectedClientId === id) setSelectedClientId(clients[0]?.id !== id ? clients[0]?.id : null);
  };

  const handleDeployAgent = async (deployData: Omit<Agent, "id" | "status" | "createdAt">) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      ...deployData,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    setAgents([...agents, newAgent]);
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deployData),
      });
    } catch {}
  };

  const loaded = clientsLoaded && tasksLoaded && agentsLoaded && socialLoaded && postsLoaded;

  if (fatalError) {
    return (
      <div className="flex h-screen bg-[#0a0e17] items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">{fatalError}</p>
          <button onClick={() => { setFatalError(null); window.location.reload(); }}
            className="px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg">Try Again</button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <div className="flex h-screen bg-[#0a0e17] items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#0a0e17] text-gray-200 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={(e) => { if (e.target === e.currentTarget) setMobileSidebarOpen(false); }}>
          <Sidebar
            clients={clients} selectedClientId={selectedClientId}
            onSelectClient={(id) => { setSelectedClientId(id); setActiveBoard("clients"); setView("crm"); setMobileSidebarOpen(false); }}
            onAddClient={() => { handleAddClient(); setMobileSidebarOpen(false); }}
            onNavigate={handleNavigate} activeBoard={activeBoard}
            agentCount={agentCount} reviewCount={reviewCount}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="sidebar-desktop">
        <Sidebar
          clients={clients} selectedClientId={selectedClientId}
          onSelectClient={(id) => { setSelectedClientId(id); setActiveBoard("clients"); setView("crm"); }}
          onAddClient={handleAddClient} onNavigate={handleNavigate} activeBoard={activeBoard}
          agentCount={agentCount} reviewCount={reviewCount}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-3 border-b border-[#1e293b] bg-[#0f1320] shrink-0">
          <button className="hamburger text-gray-400 hover:text-white" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          {/* Board title */}
          <span className="text-sm font-semibold text-gray-300 hidden sm:block">
            {activeBoard === "dashboard" && "📋 Dashboard"}
            {activeBoard === "taskforce" && "📎 TaskForce"}
            {activeBoard === "autopilot" && "🤖 AutoPilot"}
            {activeBoard === "clients" && "💼 Clients"}
            {activeBoard === "settings" && "⚙️ Settings"}
          </span>

          {/* Sub-tabs for Dashboard */}
          {activeBoard === "dashboard" && (
            <div className="flex gap-1 ml-4 tabs-scroll">
              {(["kanban", "review"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-2 md:px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                    view === v ? "bg-[#1a1f2e] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}>
                  {v === "kanban" ? "Tasks" : "Review"}
                  {v === "review" && reviewCount > 0 && (
                    <span className="ml-1 bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full">{reviewCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1 ml-auto tabs-scroll">
            {activeBoard === "dashboard" && (
              <>
                <button onClick={() => { setActiveBoard("clients"); setView("crm"); }}
                  className="px-3 py-1.5 text-xs rounded-md text-gray-500 hover:text-gray-300">CRM</button>
                <button onClick={() => setChatOpen(!chatOpen)}
                  className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${chatOpen ? "bg-[#3b82f6] text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  <MessageCircle size={14} />Chat
                </button>
              </>
            )}
            {activeBoard !== "dashboard" && (
              <button onClick={() => { setActiveBoard("dashboard"); setView("kanban"); }}
                className="px-3 py-1.5 text-xs rounded-md text-gray-500 hover:text-gray-300">← Dashboard</button>
            )}
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex">
          {/* === DASHBOARD BOARD === */}
          {activeBoard === "dashboard" && view === "kanban" && (
            <div className="kanban-mobile flex gap-4 h-full p-4">
              <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
            </div>
          )}
          {activeBoard === "dashboard" && view === "review" && <ReviewQueue />}

          {/* === TASKFORCE BOARD === */}
          {activeBoard === "taskforce" && (
            <TaskForce agents={agents} clients={clientOptions} onDeploy={handleDeployAgent} />
          )}

          {/* === AUTOPILOT BOARD === */}
          {activeBoard === "autopilot" && <LiveMonitor />}

          {/* === CLIENTS BOARD === */}
          {activeBoard === "clients" && !selectedClient && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a client from the sidebar
            </div>
          )}
          {activeBoard === "clients" && selectedClient && (
            <div className="flex flex-1 overflow-hidden crm-stack">
              <div className="w-80 border-r border-[#1e293b] overflow-y-auto flex flex-col">
                <ClientDetail client={selectedClient} onSave={handleSaveClient} onDelete={handleDeleteClient}
                  onClose={() => setActiveBoard("dashboard")} />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-[#1e293b]">
                  Tasks for {selectedClient?.name || "client"} ({clientTasks.length})
                </div>
                <KanbanBoard tasks={clientTasks} onTasksChange={(updated) => {
                  const others = tasks.filter((t) => t.clientId !== selectedClientId);
                  setTasks([...others, ...updated]);
                }} />
              </div>
            </div>
          )}

          {/* === SETTINGS BOARD === */}
          {activeBoard === "settings" && <SettingsPanel />}

          {/* === SOCIAL (shown inside CRM when clicked) === */}
          {view === "social" && selectedClient && (
            <SocialAccountsPanel accounts={socialAccounts} clientId={selectedClientId!}
              clientName={selectedClient?.name || ""} onUpdate={setSocialAccounts} />
          )}
          {view === "content" && selectedClient && (
            <>
              <div className="md:hidden fixed inset-0 z-50 bg-[#0a0e17]">
                <ContentStudio posts={posts} accounts={socialAccounts} clientId={selectedClientId!}
                  onSave={(post) => setPosts([...posts, post])} onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))}
                  onBack={() => setView("kanban")} />
              </div>
              <div className="hidden md:block flex-1 overflow-hidden">
                <ContentStudio posts={posts} accounts={socialAccounts} clientId={selectedClientId!}
                  onSave={(post) => setPosts([...posts, post])} onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))} />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation (mobile) */}
      <BottomNav activeView={chatOpen ? "chat" : activeBoard === "taskforce" ? "agents" : activeBoard === "autopilot" ? "monitor" : activeBoard === "clients" ? "crm" : view}
        agentCount={agentCount} onNavigate={handleBottomNav} />

      {/* Chat panel */}
      {chatOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setChatOpen(false)} />
          <div className="fixed md:relative inset-y-0 right-0 w-80 max-w-[85vw] z-40 md:z-auto animate-slide-in md:animate-none">
            <ChatWidget />
            <button onClick={() => setChatOpen(false)}
              className="absolute top-2 right-2 md:hidden bg-[#1a1f2e] p-1 rounded text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
