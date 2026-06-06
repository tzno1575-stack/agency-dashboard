"use client";

import { useState } from "react";
import { 
  Palette, Globe, Shield, Brain, 
  GitBranch, Cloud, ChevronDown, ChevronRight, CheckCircle2, 
  XCircle, Clock, RefreshCw, ExternalLink, Terminal, Bot
} from "lucide-react";

interface IntegrationStatus {
  id: string;
  name: string;
  icon: typeof Brain;
  color: string;
  status: "connected" | "pending" | "disconnected";
  details: string;
  fields?: { label: string; key: string; type: string; placeholder: string }[];
}

const integrations: IntegrationStatus[] = [
  {
    id: "llm",
    name: "LLM Providers",
    icon: Brain,
    color: "text-purple-400",
    status: "connected",
    details: "OpenRouter (DeepSeek, Llama 3.1) · Ollama local (llama3.1:8b)",
    fields: [
      { label: "OpenRouter API Key", key: "openrouter", type: "password", placeholder: "sk-or-v1-..." },
      { label: "DeepSeek API Key", key: "deepseek", type: "password", placeholder: "sk-..." },
      { label: "Ollama Host", key: "ollama", type: "text", placeholder: "http://localhost:11434" },
    ],
  },
  {
    id: "apify",
    name: "Apify — Web Scraping",
    icon: Globe,
    color: "text-orange-400",
    status: "disconnected",
    details: "Not configured. Add API key to enable web scraping, competitor monitoring, lead gen.",
    fields: [
      { label: "Apify API Token", key: "apify", type: "password", placeholder: "apify_api_..." },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: GitBranch,
    color: "text-gray-300",
    status: "connected",
    details: "tzno1575-stack · agency-dashboard repo · 40+ commits",
    fields: [
      { label: "GitHub Token", key: "github", type: "password", placeholder: "ghp_..." },
      { label: "Default Repo", key: "github_repo", type: "text", placeholder: "tzno1575-stack/agency-dashboard" },
    ],
  },
  {
    id: "vercel",
    name: "Vercel",
    icon: Cloud,
    color: "text-gray-100",
    status: "connected",
    details: "agency-dashboard-seven-psi · Last deploy: 2 min ago · Auto-deploys on push",
    fields: [
      { label: "Vercel Token", key: "vercel", type: "password", placeholder: "..." },
      { label: "Project ID", key: "vercel_project", type: "text", placeholder: "agency-dashboard" },
    ],
  },
];

const statusConfig = {
  connected: { icon: CheckCircle2, color: "text-green-400", dot: "bg-green-400" },
  pending: { icon: Clock, color: "text-yellow-400", dot: "bg-yellow-400" },
  disconnected: { icon: XCircle, color: "text-gray-500", dot: "bg-gray-500" },
};

export default function SettingsPanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration: id, action: "test", params: {} }),
      });
      const data = await res.json();
      // Poll for result
      const jobId = data.job?.id;
      if (jobId) {
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const poll = await fetch(`/api/integrations?after=${jobId.split("-")[1]}`);
          const pollData = await poll.json();
          const match = pollData.results?.find((r: any) => r.id === jobId);
          if (match) {
            setResults((prev) => ({ ...prev, [id]: match }));
            break;
          }
        }
      }
    } catch (e) {
      const failResult = { status: "failed", result: { error: "Network error" } };
      setResults((prev) => ({ ...prev, [id]: failResult }));
    }
    setTesting(null);
  };

  const handleSave = async (id: string) => {
    setSaving(id);
    // POST save action — keys get stored via Hermes → Bitwarden
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integration: id, action: "save_key", params: {} }),
    });
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(null);
    setExpanded(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
        Settings & Integrations
      </h2>

      <div className="space-y-3 max-w-xl">
        {/* LLM Section */}
        {integrations.map((integration) => {
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;
          const isExpanded = expanded === integration.id;
          const Icon = integration.icon;

          return (
            <div
              key={integration.id}
              className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg overflow-hidden"
            >
              {/* Status line with live result */}
              <button
                onClick={() => setExpanded(isExpanded ? null : integration.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1a1f2e]/80 transition-colors"
              >
                <Icon size={18} className={integration.color} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-200">{integration.name}</h3>
                    {results[integration.id] ? (
                      results[integration.id].status === "done" ? (
                        <CheckCircle2 size={12} className="text-green-400" />
                      ) : (
                        <XCircle size={12} className="text-red-400" />
                      )
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <StatusIcon size={12} className={status.color} />
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {results[integration.id]
                      ? results[integration.id].result?.error || results[integration.id].result?.message || "Done"
                      : integration.details}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>

              {/* Expanded config */}
              {isExpanded && integration.fields && (
                <div className="px-4 pb-4 border-t border-[#1e293b] pt-3 space-y-3">
                  {integration.fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full bg-[#0f1320] border border-[#1e293b] rounded px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#3b82f6]"
                      />
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testing === integration.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#0f1320] border border-[#1e293b] text-gray-300 hover:border-[#3b82f6] disabled:opacity-50 transition-colors"
                    >
                      {testing === integration.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Terminal size={12} />
                      )}
                      {testing === integration.id ? "Testing..." : "Test Connection"}
                    </button>
                    <button
                      onClick={() => handleSave(integration.id)}
                      disabled={saving === integration.id}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
                    >
                      {saving === integration.id ? "Saving..." : "Save to Vault"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Quick Actions */}
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={16} className="text-yellow-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Quick Actions</h3>
              <p className="text-xs text-gray-500">One-tap operations</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-1.5 justify-center px-3 py-2 bg-[#0f1320] border border-[#1e293b] rounded-lg text-xs text-gray-400 hover:text-white hover:border-[#3b82f6] transition-colors">
              <RefreshCw size={12} />
              Redeploy Dashboard
            </button>
            <button className="flex items-center gap-1.5 justify-center px-3 py-2 bg-[#0f1320] border border-[#1e293b] rounded-lg text-xs text-gray-400 hover:text-white hover:border-[#3b82f6] transition-colors">
              <GitBranch size={12} />
              View on GitHub
            </button>
            <button className="flex items-center gap-1.5 justify-center px-3 py-2 bg-[#0f1320] border border-[#1e293b] rounded-lg text-xs text-gray-400 hover:text-white hover:border-[#3b82f6] transition-colors">
              <Bot size={12} />
              Restart Hermes
            </button>
            <button className="flex items-center gap-1.5 justify-center px-3 py-2 bg-[#0f1320] border border-[#1e293b] rounded-lg text-xs text-gray-400 hover:text-white hover:border-[#3b82f6] transition-colors">
              <ExternalLink size={12} />
              Open Dashboard
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Palette size={16} className="text-purple-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Theme</h3>
              <p className="text-xs text-gray-500">Dashboard appearance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#3b82f6] text-white text-xs rounded-lg">Dark</button>
            <button className="px-3 py-1.5 bg-[#1a1f2e] border border-[#1e293b] text-gray-400 text-xs rounded-lg">
              🕌 Al-Aql (Green/Gold)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
