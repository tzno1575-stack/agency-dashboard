"use client";

import { Palette, Key, Server, Globe, Shield } from "lucide-react";

export default function SettingsPanel() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
        Settings
      </h2>

      <div className="space-y-3 max-w-lg">
        {/* Integrations */}
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Server size={16} className="text-[#3b82f6]" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Integrations</h3>
              <p className="text-xs text-gray-500">Connect platforms and services</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#1e293b]">
              <span className="text-gray-400">📘 Facebook</span>
              <span className="text-yellow-400">Needs Page Token</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1e293b]">
              <span className="text-gray-400">📷 Instagram</span>
              <span className="text-yellow-400">Coming soon</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1e293b]">
              <span className="text-gray-400">❤️ Telegram Bot</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#1e293b]">
              <span className="text-gray-400">💬 Discord</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400">🔤 OpenRouter (LLM)</span>
              <span className="text-green-400">Connected</span>
            </div>
          </div>
        </div>

        {/* Credential Vault */}
        <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Key size={16} className="text-yellow-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-200">Credential Vault</h3>
              <p className="text-xs text-gray-500">Bitwarden integration — secure credential access</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔐 Stored in Bitwarden vault</p>
            <p>🔑 Master password never shared</p>
            <p>🔄 Auto-refresh on expiry</p>
          </div>
          <button className="mt-3 text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-3 py-1.5 rounded-lg hover:bg-[#3b82f6]/30 transition-colors">
            + Add Credential
          </button>
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
            <button className="px-3 py-1.5 bg-[#1a1f2e] border border-[#1e293b] text-gray-400 text-xs rounded-lg">Al-Aql (Green/Gold)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
