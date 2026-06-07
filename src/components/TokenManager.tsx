"use client";

import { useState, useEffect } from "react";
import { Key, AlertTriangle, RefreshCw, ExternalLink, Check, Clock, Shield, Copy } from "lucide-react";

interface TokenEntry {
  id: string;
  platform: string;
  icon: string;
  key: string;
  envVar: string;
  status: "active" | "expiring" | "expired" | "not_set";
  expiresAt?: string;
  refreshUrl: string;
  notes: string;
}

const DEFAULT_TOKENS: TokenEntry[] = [
  {
    id: "facebook",
    platform: "Facebook Page",
    icon: "📘",
    key: "••••••••",
    envVar: "SOCIAL_TOKEN_2_FACEBOOK",
    status: "expired",
    expiresAt: "2026-06-06",
    refreshUrl: "https://developers.facebook.com/tools/explorer/",
    notes: "Expires every 60 days. Refresh via Graph API Explorer.",
  },
  {
    id: "deepseek",
    platform: "DeepSeek AI",
    icon: "🤖",
    key: "••••••••",
    envVar: "DEEPSEEK_API_KEY",
    status: "active",
    refreshUrl: "https://platform.deepseek.com/api_keys",
    notes: "Does not expire. Rotate manually for security.",
  },
  {
    id: "openrouter",
    platform: "OpenRouter",
    icon: "🔗",
    key: "••••••••",
    envVar: "OPENROUTER_API_KEY",
    status: "active",
    refreshUrl: "https://openrouter.ai/keys",
    notes: "Create new keys in OpenRouter dashboard.",
  },
  {
    id: "upstash",
    platform: "Upstash Redis",
    icon: "🗄️",
    key: "••••••••",
    envVar: "UPSTASH_REDIS_TOKEN",
    status: "active",
    refreshUrl: "https://console.upstash.com/redis",
    notes: "Does not expire. Free tier: 10K commands/day.",
  },
  {
    id: "telegram",
    platform: "Telegram Bot",
    icon: "📱",
    key: "••••••••",
    envVar: "TELEGRAM_BOT_TOKEN",
    status: "active",
    refreshUrl: "https://t.me/BotFather",
    notes: "Token from @BotFather. Does not expire unless revoked.",
  },
  {
    id: "instagram",
    platform: "Instagram",
    icon: "📷",
    key: "not_set",
    envVar: "SOCIAL_TOKEN_INSTAGRAM",
    status: "not_set",
    refreshUrl: "https://developers.facebook.com/tools/explorer/",
    notes: "Uses Facebook Graph API. Same refresh process as Facebook.",
  },
];

export default function TokenManager() {
  const [tokens, setTokens] = useState<TokenEntry[]>(DEFAULT_TOKENS);
  const [copied, setCopied] = useState<string | null>(null);

  // Check for expiring tokens on mount
  useEffect(() => {
    const today = new Date();
    setTokens(prev =>
      prev.map(token => {
        if (token.expiresAt) {
          const expDate = new Date(token.expiresAt);
          const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 0) return { ...token, status: "expired" as const };
          if (daysLeft <= 7) return { ...token, status: "expiring" as const };
        }
        return token;
      })
    );
  }, []);

  const statusBadge = (status: TokenEntry["status"]) => {
    switch (status) {
      case "active":
        return <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} /> Active</span>;
      case "expiring":
        return <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10} /> Expiring soon</span>;
      case "expired":
        return <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10} /> Expired</span>;
      case "not_set":
        return <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full">Not set</span>;
    }
  };

  const refreshToken = (token: TokenEntry) => {
    window.open(token.refreshUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Key size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-gray-800">API Token Manager</h3>
        <span className="text-[10px] text-gray-500 ml-auto">{tokens.filter(t => t.status === "expired" || t.status === "expiring").length} need attention</span>
      </div>

      {/* Expiring alert */}
      {tokens.some(t => t.status === "expired") && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-red-400">Tokens expired</div>
            <div className="text-[11px] text-red-400/70 mt-0.5">
              Facebook token has expired. Auto-posting and Messenger auto-replies are paused. Click &quot;Refresh&quot; to get a new token.
            </div>
          </div>
        </div>
      )}

      {/* Token list */}
      <div className="space-y-2">
        {tokens.map((token) => (
          <div
            key={token.id}
            className={`bg-white border rounded-lg p-3 transition-all ${
              token.status === "expired"
                ? "border-red-500/30"
                : token.status === "expiring"
                ? "border-amber-500/30"
                : "border-[#1a1a1a]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{token.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-800">{token.platform}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-[10px] text-gray-500 bg-[#FDFBF7] px-1.5 py-0.5 rounded">{token.envVar}</code>
                    {token.expiresAt && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {token.status === "expired" ? "Expired " : "Expires "}
                        {token.expiresAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {statusBadge(token.status)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1a1a1a]">
              <button
                onClick={() => refreshToken(token)}
                className="flex-1 py-1.5 text-xs bg-[#1a1a1a] text-gray-800 rounded hover:bg-[#2a3446] flex items-center justify-center gap-1"
              >
                <RefreshCw size={11} />
                {token.status === "expired" || token.status === "expiring"
                  ? "Refresh Now"
                  : token.status === "not_set"
                  ? "Set Up"
                  : "Manage"}
              </button>
              <button
                onClick={() => {
                  window.open(token.refreshUrl, "_blank");
                }}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                title="Open platform"
              >
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="text-[10px] text-gray-500 mt-1.5">{token.notes}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="p-3 bg-[#E8F5E9] border border-[#3b82f6]/20 rounded-lg">
        <div className="flex gap-2">
          <Shield size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-gray-800">How token refresh works</div>
            <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              Click &quot;Refresh Now&quot; → platform opens in new tab → generate new token → paste it back. The dashboard stores tokens in <code className="bg-[#FDFBF7] px-1 rounded text-[10px]">~/.hermes/.env</code> and Vercel environment variables. Facebook tokens expire every 60 days.
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              <strong className="text-gray-500">n8n alternative:</strong> n8n can auto-refresh Facebook tokens using OAuth flows. Once set up, tokens never expire — n8n handles the refresh silently.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
