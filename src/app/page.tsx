"use client";

import { useState, useEffect, useCallback } from "react";
import { X, MessageCircle } from "lucide-react";
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
import IdeaGen from "@/components/IdeaGen";
import AIChat from "@/components/AIChat";
import NotificationCenter from "@/components/NotificationCenter";
import BillingModule from "@/components/BillingModule";
import DailyBriefing from "@/components/DailyBriefing";
import VideoStudio from "@/components/VideoStudio";
import AffiliateHub from "@/components/AffiliateHub";
import KdpHub from "@/components/KdpHub";
import StandardsPanel from "@/components/StandardsPanel";
import SetupBoard from "@/components/SetupBoard";
import WebsiteBuilder from "@/components/WebsiteBuilder";
import HelpTips, { HelpToggle } from "@/components/HelpTips";
import BottomNav from "@/components/BottomNav";
import { sampleClients, sampleTasks, sampleSocialAccounts, sampleAgents, samplePosts, normalizeClient, normalizeClients } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Client, Task, Agent, SocialAccount, ScheduledPost } from "@/lib/data";

type NavBoard = "briefing" | "dashboard" | "aichat" | "setup" | "sitebuilder" | "videostudio" | "taskforce" | "autopilot" | "ideagen" | "standards" | "review" | "social" | "content" | "affiliates" | "kdp" | "clients" | "billing" | "notifications" | "messages" | "settings";

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
  const [agents, setAgents, agentsLoaded] = useLocalStorage<Agent[]>("aqd_agents", sampleAgents);
  const [socialAccounts, setSocialAccounts, socialLoaded] = useLocalStorage<SocialAccount[]>("aqd_social", sampleSocialAccounts);
  const [posts, setPosts, postsLoaded] = useLocalStorage<ScheduledPost[]>("aqd_posts", samplePosts);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(sampleClients[0]?.id ?? null);
  const [activeBoard, setActiveBoard] = useState<NavBoard>("briefing");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarExpandedMobile, setSidebarExpandedMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const agentCount = agents.filter((a) => a.status === "running" || a.status === "queued").length;

  // Catch rendering errors — self-healing
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      console.error("Dashboard error:", e.message);
      setFatalError(e.message || "Unknown error");
      e.preventDefault();
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleNavigate = (board: NavBoard) => {
    setActiveBoard(board);
    setSidebarExpandedMobile(false);
    if (board === "messages") setChatOpen(true);
  };

  const handleBottomNav = (id: string) => {
    if (id === "messages") { setChatOpen(true); return; }
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
  }, []);

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
    setActiveBoard("clients");
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

  // Derive sidebar CSS classes
  const sidebarClasses = [
    "app-sidebar",
    sidebarCollapsed ? "collapsed" : "",
    sidebarExpandedMobile ? "expanded-mobile" : "",
  ].filter(Boolean).join(" ");

  const mainClasses = [
    "app-main",
    sidebarCollapsed ? "sidebar-collapsed" : "",
  ].filter(Boolean).join(" ");

  const loaded = clientsLoaded && tasksLoaded && agentsLoaded && socialLoaded && postsLoaded;

  if (fatalError) {
    return (
      <div className="flex h-screen bg-[#FDFBF7] items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-4">{fatalError}</p>
          <button onClick={() => { setFatalError(null); window.location.reload(); }}
            className="px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb]">
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <div className="flex h-screen bg-[#FDFBF7] items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-gray-800 overflow-hidden">
      {/* === FIXED SIDEBAR FRAME === */}
      <div className={sidebarClasses}>
        <Sidebar
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={(id) => {
            setSelectedClientId(id);
            setActiveBoard("clients");
            setSidebarExpandedMobile(false);
          }}
          onAddClient={() => { handleAddClient(); setSidebarExpandedMobile(false); }}
          onNavigate={handleNavigate}
          activeBoard={activeBoard}
          agentCount={agentCount}
          reviewCount={reviewCount}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          onMobileExpand={() => setSidebarExpandedMobile(prev => !prev)}
          mobileExpanded={sidebarExpandedMobile}
        />
      </div>

      {/* Mobile backdrop when sidebar expanded */}
      {sidebarExpandedMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarExpandedMobile(false)}
        />
      )}

      {/* === MAIN CONTENT === */}
      <main className={mainClasses}>
        {/* Header */}
        <header className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-3 border-b border-[#1a1a1a] bg-white shrink-0">
          <span className="text-sm font-semibold text-gray-800 hidden sm:block">
            {activeBoard === "briefing" && "☀️ Daily Briefing"}
            {activeBoard === "dashboard" && "📋 Dashboard"}
            {activeBoard === "aichat" && "🤖 AI Chat"}
            {activeBoard === "setup" && "⚡ Hermes Setup"}
            {activeBoard === "sitebuilder" && "🌐 Site Builder"}
            {activeBoard === "videostudio" && "🎬 Video Studio"}
            {activeBoard === "taskforce" && "📎 TaskForce"}
            {activeBoard === "autopilot" && "🤖 AutoPilot"}
            {activeBoard === "ideagen" && "💡 IdeaGen"}
            {activeBoard === "standards" && "📐 Standards & Specs"}
            {activeBoard === "review" && "✅ Review Queue"}
            {activeBoard === "social" && "📱 Social Accounts"}
            {activeBoard === "content" && "✍️ Content Studio"}
            {activeBoard === "clients" && "💼 Clients"}
            {activeBoard === "billing" && "💰 Billing"}
            {activeBoard === "affiliates" && "🔗 Affiliate Hub"}
            {activeBoard === "kdp" && "📚 KDP Books"}
            {activeBoard === "notifications" && "🔔 Notifications"}
            {activeBoard === "messages" && "💬 Messages"}
            {activeBoard === "settings" && "⚙️ Settings"}
          </span>

          <div className="flex gap-1 ml-auto tabs-scroll">
            <HelpToggle />
            <button onClick={() => setChatOpen(!chatOpen)}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1 ${chatOpen ? "bg-[#3b82f6] text-white" : "text-gray-500 hover:text-gray-800"}`}>
              <MessageCircle size={14} />Chat
            </button>
          </div>
        </header>

        {/* Content area */}
        <HelpTips board={activeBoard} />
        <div className="flex-1 min-h-0 flex flex-col">
          {activeBoard === "briefing" && <DailyBriefing />}

          {activeBoard === "setup" && <SetupBoard />}

          {activeBoard === "sitebuilder" && <WebsiteBuilder />}

          {activeBoard === "dashboard" && (
            <KanbanBoard tasks={tasks} onTasksChange={setTasks} clients={clientOptions} />
          )}

          {activeBoard === "videostudio" && <VideoStudio />}

          {activeBoard === "taskforce" && (
            <TaskForce agents={agents} clients={clientOptions} onDeploy={handleDeployAgent} />
          )}

          {activeBoard === "autopilot" && <LiveMonitor />}

          {activeBoard === "ideagen" && <IdeaGen />}

          {activeBoard === "standards" && <StandardsPanel />}

          {activeBoard === "review" && <ReviewQueue />}

          {activeBoard === "social" && selectedClient && (
            <SocialAccountsPanel accounts={socialAccounts} clientId={selectedClientId!}
              clientName={selectedClient?.name || ""} onUpdate={setSocialAccounts} />
          )}
          {activeBoard === "social" && !selectedClient && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a client from the sidebar first
            </div>
          )}

          {activeBoard === "content" && (
            <ContentStudio posts={posts} accounts={socialAccounts} clientId={selectedClientId || ""}
              onSave={(post) => setPosts([...posts, post])}
              onDelete={(id) => setPosts(posts.filter((p) => p.id !== id))}
              onBack={() => setActiveBoard("dashboard")} />
          )}

          {activeBoard === "clients" && !selectedClient && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              Select a client from the sidebar
            </div>
          )}

          {activeBoard === "notifications" && <NotificationCenter />}

          {activeBoard === "billing" && (
            <BillingModule clients={clients} onUpdate={setClients} />
          )}

          {activeBoard === "clients" && selectedClient && (
            <div className="flex flex-1 min-h-0 crm-stack">
              <div className="w-80 border-r border-[#1a1a1a] overflow-y-auto flex flex-col bg-white">
                <ClientDetail client={selectedClient} onSave={handleSaveClient} onDelete={handleDeleteClient}
                  onClose={() => setActiveBoard("dashboard")} />
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <KanbanBoard tasks={clientTasks} onTasksChange={(updated) => {
                  const others = tasks.filter((t) => t.clientId !== selectedClientId);
                  setTasks([...others, ...updated]);
                }} clients={clientOptions} selectedClientId={selectedClientId || undefined} />
              </div>
            </div>
          )}

          {activeBoard === "messages" && (
            <div className="flex-1 flex">
              <ChatWidget />
            </div>
          )}

          {activeBoard === "settings" && <SettingsPanel />}

          {activeBoard === "aichat" && <AIChat />}

          {activeBoard === "affiliates" && <AffiliateHub />}

          {activeBoard === "kdp" && <KdpHub />}
        </div>
      </main>

      {/* Bottom Navigation (mobile) */}
      <BottomNav activeView={chatOpen ? "messages" : activeBoard}
        agentCount={agentCount} reviewCount={reviewCount} onNavigate={handleBottomNav} />

      {/* Chat panel — only show slide-out when NOT already on Messages board */}
      {chatOpen && activeBoard !== "messages" && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setChatOpen(false)} />
          <div className="fixed md:relative md:h-full inset-y-0 right-0 w-80 max-w-[85vw] z-50 md:z-auto animate-slide-in md:animate-none">
            <ChatWidget />
            <button onClick={() => setChatOpen(false)}
              className="absolute top-2 right-2 md:hidden bg-white p-1 rounded text-gray-500 hover:text-gray-900">
              <X size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
