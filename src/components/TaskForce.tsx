"use client";

import { useState } from "react";
import { Play, Clock, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { agentTypes } from "@/lib/data";
import type { Agent, AgentType } from "@/lib/data";

interface TaskForceProps {
  agents: Agent[];
  clients: { id: string; name: string }[];
  onDeploy: (agent: Omit<Agent, "id" | "status" | "createdAt">) => void;
}

const statusBadges: Record<Agent["status"], { icon: typeof Clock; color: string; label: string }> = {
  queued: { icon: Clock, color: "text-yellow-400 bg-yellow-500/10", label: "Queued" },
  running: { icon: Loader2, color: "text-blue-400 bg-blue-500/10", label: "Running" },
  done: { icon: CheckCircle2, color: "text-green-400 bg-green-500/10", label: "Done" },
  failed: { icon: XCircle, color: "text-red-400 bg-red-500/10", label: "Failed" },
};

export default function TaskForce({ agents, clients, onDeploy }: TaskForceProps) {
  const [showDeploy, setShowDeploy] = useState(false);
  const [selectedType, setSelectedType] = useState<AgentType>("content");
  const [task, setTask] = useState("");
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || "");

  const handleDeploy = () => {
    if (!task.trim() || !selectedClient) return;
    onDeploy({
      type: selectedType,
      name: agentTypes.find((a) => a.id === selectedType)?.label || "Agent",
      task: task.trim(),
      clientId: selectedClient,
    });
    setTask("");
    setShowDeploy(false);
  };

  const activeAgents = agents.filter((a) => a.status === "queued" || a.status === "running");
  const completedAgents = agents.filter((a) => a.status === "done" || a.status === "failed");

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main — Agent list */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              TaskForce — Agent Desk
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {activeAgents.length} active · {completedAgents.length} completed
            </p>
          </div>
          <button
            onClick={() => setShowDeploy(!showDeploy)}
            className="flex items-center gap-2 bg-[#3b82f6] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            <Play size={14} />
            Deploy Agent
          </button>
        </div>

        {/* Active agents */}
        {activeAgents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Active</h3>
            <div className="space-y-2">
              {activeAgents.map((agent) => {
                const badge = statusBadges[agent.status];
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={agent.id}
                    className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200">
                            {agent.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}
                          >
                            <BadgeIcon
                              size={12}
                              className={agent.status === "running" ? "animate-spin" : ""}
                            />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{agent.task}</p>
                        <p className="text-xs text-gray-600 mt-1">{agent.createdAt}</p>
                      </div>
                    </div>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-[#0f1320] rounded text-xs text-gray-400 border border-[#1e293b]">
                        {agent.output}
                      </div>
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Completed</h3>
            <div className="space-y-2">
              {completedAgents.map((agent) => {
                const badge = statusBadges[agent.status];
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={agent.id}
                    className={`bg-[#1a1f2e] border rounded-lg p-3 ${
                      agent.status === "done"
                        ? "border-green-500/20"
                        : "border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300">
                            {agent.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}
                          >
                            <BadgeIcon size={12} />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{agent.task}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {agent.completedAt || agent.createdAt}
                        </p>
                      </div>
                    </div>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-[#0f1320] rounded text-xs text-gray-400 border border-[#1e293b]">
                        {agent.output}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {agents.length === 0 && (
          <div className="text-center text-gray-600 mt-20">
            <p className="text-lg mb-2">No agents deployed yet</p>
            <p className="text-sm">Deploy your first agent to see it here</p>
          </div>
        )}
      </div>

      {/* Deploy panel */}
      {showDeploy && (
        <div className="w-80 border-l border-[#1e293b] bg-[#0f1320] p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Deploy Agent</h3>

          {/* Agent type */}
          <label className="text-xs text-gray-500 mb-1 block">Agent Type</label>
          <div className="space-y-1 mb-4">
            {agentTypes.map((at) => (
              <button
                key={at.id}
                onClick={() => setSelectedType(at.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === at.id
                    ? "bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-white"
                    : "bg-[#1a1f2e] border border-[#1e293b] text-gray-400 hover:text-gray-200"
                }`}
              >
                <span className="mr-2">{at.icon}</span>
                <span className="font-medium">{at.label}</span>
                <span className="text-xs text-gray-500 ml-2">{at.desc}</span>
              </button>
            ))}
          </div>

          {/* Client */}
          <label className="text-xs text-gray-500 mb-1 block">For Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 mb-4 focus:outline-none focus:border-[#3b82f6]"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Task */}
          <label className="text-xs text-gray-500 mb-1 block">Task Description</label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 h-24 resize-none mb-4 focus:outline-none focus:border-[#3b82f6]"
            placeholder="What should the agent do?"
          />

          {/* Deploy button */}
          <button
            onClick={handleDeploy}
            disabled={!task.trim() || !selectedClient}
            className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white text-sm py-2.5 rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            Deploy Agent
          </button>
        </div>
      )}
    </div>
  );
}
