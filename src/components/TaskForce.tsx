"use client";

import { useState } from "react";
import { Play, Clock, CheckCircle2, XCircle, Loader2, Send, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { agentTypes } from "@/lib/data";
import type { Agent, AgentType } from "@/lib/data";
interface SpecStep {
  id: string;
  label: string;
  done: boolean;
  content: string;
}


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
  const [specMode, setSpecMode] = useState(false);
  const [specSteps, setSpecSteps] = useState<SpecStep[]>([
    { id: "scope", label: "What are we building?", done: false, content: "" },
    { id: "visuals", label: "Mockups or references?", done: false, content: "" },
    { id: "refs", label: "Similar code in codebase?", done: false, content: "" },
    { id: "standards", label: "Which standards apply?", done: false, content: "" },
    { id: "plan", label: "Implementation plan", done: false, content: "" },
  ]);
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);

  const handleDeploy = () => {
    if (!task.trim() || !selectedClient) return;
    const specPassed = !specMode || specSteps.every(s => s.done);
    if (!specPassed) return;
    const specSummary = specMode
      ? "\n\n[Shape Spec]\n" + specSteps.map(s => `  ${s.done ? "✅" : "⬜"} ${s.label}: ${s.content || "(empty)"}`).join("\n")
      : "";
    onDeploy({
      type: selectedType,
      name: agentTypes.find((a) => a.id === selectedType)?.label || "Agent",
      task: task.trim() + specSummary,
      clientId: selectedClient,
    });
    setTask("");
    setSpecSteps([
      { id: "scope", label: "What are we building?", done: false, content: "" },
      { id: "visuals", label: "Mockups or references?", done: false, content: "" },
      { id: "refs", label: "Similar code in codebase?", done: false, content: "" },
      { id: "standards", label: "Which standards apply?", done: false, content: "" },
      { id: "plan", label: "Implementation plan", done: false, content: "" },
    ]);
    setSpecMode(false);
    setShowDeploy(false);
  };

  const toggleSpecStep = (id: string) => setExpandedSpec(expandedSpec === id ? null : id);
  const toggleSpecDone = (id: string) => setSpecSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const updateSpecContent = (id: string, content: string) => setSpecSteps(prev => prev.map(s => s.id === id ? { ...s, content } : s));

  const activeAgents = agents.filter((a) => a.status === "queued" || a.status === "running");
  const completedAgents = agents.filter((a) => a.status === "done" || a.status === "failed");

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main — Agent list */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
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
                    className="bg-white border border-[#1a1a1a] rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
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
                        <p className="text-sm text-gray-500 mt-1">{agent.task}</p>
                        <p className="text-xs text-gray-500 mt-1">{agent.createdAt}</p>
                      </div>
                    </div>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-500 border border-[#1a1a1a]">
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
                    className={`bg-white border rounded-lg p-3 ${
                      agent.status === "done"
                        ? "border-green-500/20"
                        : "border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
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
                        <p className="text-xs text-gray-500 mt-1">
                          {agent.completedAt || agent.createdAt}
                        </p>
                      </div>
                    </div>
                    {agent.output && (
                      <div className="mt-2 p-2 bg-white rounded text-xs text-gray-500 border border-[#1a1a1a]">
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
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">No agents deployed yet</p>
            <p className="text-sm">Deploy your first agent to see it here</p>
          </div>
        )}
      </div>

      {/* Deploy panel */}
      {showDeploy && (
        <div className="w-80 border-l border-[#1a1a1a] bg-white p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Deploy Agent</h3>

          {/* Shape Spec toggle */}
          <div className="mb-4">
            <button
              onClick={() => setSpecMode(!specMode)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors ${
                specMode ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300" : "bg-white border border-[#1a1a1a] text-gray-500 hover:text-gray-800"
              }`}>
              <FileText size={14} />
              Shape Spec (pre-build checklist)
              <span className="ml-auto text-[10px]">{specSteps.filter(s => s.done).length}/5</span>
            </button>

            {specMode && (
              <div className="mt-2 space-y-1">
                {specSteps.map(step => (
                  <div key={step.id} className="bg-[#FDFBF7] rounded-lg overflow-hidden">
                    <button onClick={() => toggleSpecStep(step.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-white/50 transition-colors">
                      <button onClick={(e) => { e.stopPropagation(); toggleSpecDone(step.id); }}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          step.done ? "bg-green-500 border-green-500" : "border-gray-600"
                        }`}>
                        {step.done && <CheckCircle2 size={10} className="text-black" />}
                      </button>
                      <span className={`text-[11px] flex-1 ${step.done ? "text-gray-500 line-through" : "text-gray-500"}`}>
                        {step.label}
                      </span>
                      {expandedSpec === step.id ? <ChevronDown size={10} className="text-gray-500" /> : <ChevronRight size={10} className="text-gray-500" />}
                    </button>
                    {expandedSpec === step.id && (
                      <div className="px-3 pb-2">
                        <textarea
                          value={step.content}
                          onChange={(e) => updateSpecContent(step.id, e.target.value)}
                          placeholder={step.id === "scope" ? "2-3 sentences describing the feature..."
                            : step.id === "visuals" ? "Links to mockups or screenshots..."
                            : step.id === "refs" ? "e.g., src/components/KanbanBoard.tsx"
                            : step.id === "standards" ? "e.g., api-format, styling, naming"
                            : "Numbered task breakdown..."}
                          className="w-full bg-white border border-[#1a1a1a] rounded-lg p-2 text-[11px] text-gray-800 placeholder-gray-600 resize-none h-14 focus:outline-none focus:border-[#3b82f6]/50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Team Templates */}
          <div className="mb-4 bg-white border border-[#1a1a1a] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Team Templates</span>
            </div>
            <div className="space-y-1">
              {[
                { name: "YouTube Team", agents: "Scout + Forge + Pulse + Bridge", desc: "Research → Script → SEO → Community" },
                { name: "Marketing Team", agents: "Analyst + Creator + Publisher", desc: "Research → Create → Distribute" },
                { name: "Solo Agent", agents: "Custom role", desc: "Single specialist agent" },
              ].map(t => (
                <button key={t.name}
                  onClick={() => {
                    setSelectedType("content");
                    setTask(`Team: ${t.name} — ${t.desc}`);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] text-gray-500 hover:text-gray-900 hover:bg-white transition-colors">
                  <span className="font-medium text-gray-800">{t.name}</span>
                  <span className="text-gray-500 ml-2">{t.agents}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Agent type */}
          <label className="text-xs text-gray-500 mb-1 block">Agent Type</label>
          <div className="space-y-1 mb-4">
            {agentTypes.map((at) => (
              <button
                key={at.id}
                onClick={() => setSelectedType(at.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === at.id
                    ? "bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-black"
                    : "bg-white border border-[#1a1a1a] text-gray-500 hover:text-gray-800"
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
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 mb-4 focus:outline-none focus:border-[#3b82f6]"
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
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 h-24 resize-none mb-4 focus:outline-none focus:border-[#3b82f6]"
            placeholder="What should the agent do?"
          />

          {/* Deploy button */}
          <button
            onClick={handleDeploy}
            disabled={!task.trim() || !selectedClient || (specMode && !specSteps.every(s => s.done))}
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
