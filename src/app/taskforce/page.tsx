"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { agentTypes } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Agent, Client } from "@/lib/data";

export default function TaskForcePage() {
  const [agents, setAgents] = useLocalStorage<Agent[]>("aqd_agents", []);
  const [clients] = useLocalStorage<Client[]>("aqd_clients", []);
  const [showDeploy, setShowDeploy] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("content");
  const [task, setTask] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);

  const handleDeploy = async () => {
    if (!task.trim() || !selectedClient) return;
    const agentType = agentTypes.find((a) => a.id === selectedType);
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      type: selectedType as any,
      name: agentType?.label || "Agent",
      task: task.trim(),
      clientId: selectedClient,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    setAgents([...agents, newAgent]);
    setTask("");
    setShowDeploy(false);

    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, task: task.trim(), clientId: selectedClient }),
      });
    } catch {}
  };

  const activeAgents = agents.filter((a) => a.status === "queued" || a.status === "running");
  const completedAgents = agents.filter((a) => a.status === "done" || a.status === "failed");

  const statusBadges: Record<string, { color: string; label: string }> = {
    queued: { color: "text-yellow-400 bg-yellow-500/10", label: "Queued" },
    running: { color: "text-blue-400 bg-blue-500/10", label: "Running" },
    done: { color: "text-green-400 bg-green-500/10", label: "Done" },
    failed: { color: "text-red-400 bg-red-500/10", label: "Failed" },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a] bg-white sticky top-0 z-10">
        <a
          href="/"
          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </a>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">📎 TaskForce — Agent Desk</h1>
          <p className="text-xs text-gray-500">{activeAgents.length} active · {completedAgents.length} completed</p>
        </div>
        <button
          onClick={() => setShowDeploy(!showDeploy)}
          className="ml-auto flex items-center gap-2 bg-[#3b82f6] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2563eb] transition-colors"
        >
          Deploy Agent
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Deploy form */}
        {showDeploy && (
          <div className="bg-white border border-[#1a1a1a] rounded-lg p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Deploy New Agent</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {agentTypes.map((at) => (
                <button
                  key={at.id}
                  onClick={() => setSelectedType(at.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedType === at.id
                      ? "bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-black"
                      : "bg-white border border-[#1a1a1a] text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <span className="block text-base mb-0.5">{at.icon}</span>
                  <span className="font-medium">{at.label}</span>
                </button>
              ))}
            </div>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 h-24 resize-none"
              placeholder="What should the agent do? e.g. 'Write 3 Facebook posts about sensory-friendly rides'"
            />
            <button
              onClick={handleDeploy}
              disabled={!task.trim() || !selectedClient}
              className="w-full bg-[#3b82f6] text-white text-sm py-2.5 rounded-lg hover:bg-[#2563eb] disabled:opacity-50"
            >
              Deploy Agent
            </button>
          </div>
        )}

        {/* Active agents */}
        {activeAgents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Active</h3>
            <div className="space-y-2">
              {activeAgents.map((agent) => {
                const badge = statusBadges[agent.status];
                return (
                  <div key={agent.id} className="bg-white border border-[#1a1a1a] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{agent.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{agent.task}</p>
                    <p className="text-xs text-gray-500 mt-1">{agent.createdAt}</p>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-500">{agent.output}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed agents */}
        {completedAgents.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Completed</h3>
            <div className="space-y-2">
              {completedAgents.map((agent) => {
                const badge = statusBadges[agent.status];
                return (
                  <div key={agent.id} className={`bg-white border rounded-lg p-3 ${agent.status === "done" ? "border-green-500/20" : "border-red-500/20"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{agent.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{agent.task}</p>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-500">{agent.output}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {agents.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-3">📎</p>
            <p className="text-lg mb-1">No agents yet</p>
            <p className="text-sm">Deploy an agent — hire a Content Writer, SEO Auditor, or Dev Agent</p>
          </div>
        )}
      </div>
    </div>
  );
}
