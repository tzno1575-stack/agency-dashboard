"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Clock, XCircle, ExternalLink, RefreshCw, Trash2, Pencil, Check, X } from "lucide-react";
import { socialPlatforms } from "@/lib/data";
import type { SocialAccount, SocialPlatform } from "@/lib/data";

interface SocialAccountsPanelProps {
  accounts: SocialAccount[];
  clientId: string;
  clientName: string;
  onUpdate: (accounts: SocialAccount[]) => void;
}

const statusConfig = {
  connected: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Connected" },
  pending: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Pending Setup" },
  disconnected: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-500/10", label: "Not Connected" },
};

export default function SocialAccountsPanel({ accounts, clientId, clientName, onUpdate }: SocialAccountsPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("facebook");
  const [newPageName, setNewPageName] = useState("");
  const [newPageUrl, setNewPageUrl] = useState("");
  // Edit form state
  const [editPlatform, setEditPlatform] = useState<SocialPlatform>("facebook");
  const [editPageName, setEditPageName] = useState("");
  const [editPageUrl, setEditPageUrl] = useState("");

  const clientAccounts = accounts.filter((a) => a.clientId === clientId);
  const connectedPlatforms = clientAccounts.map((a) => a.platform);
  const availablePlatforms = socialPlatforms.filter((p) => !connectedPlatforms.includes(p.id));

  const handleAdd = () => {
    if (!newPageName.trim()) return;
    const account: SocialAccount = {
      id: `sa-${Date.now()}`,
      clientId,
      platform: newPlatform,
      pageName: newPageName.trim(),
      pageUrl: newPageUrl.trim() || "#",
      status: "pending",
    };
    onUpdate([...accounts, account]);
    setNewPageName("");
    setNewPageUrl("");
    setShowAdd(false);
  };

  const handleDelete = (accountId: string) => {
    onUpdate(accounts.filter((a) => a.id !== accountId));
  };

  const handleStatusToggle = (accountId: string) => {
    onUpdate(
      accounts.map((a) => {
        if (a.id !== accountId) return a;
        const next: Record<SocialAccount["status"], SocialAccount["status"]> = {
          disconnected: "pending",
          pending: "connected",
          connected: "disconnected",
        };
        return { ...a, status: next[a.status] };
      })
    );
  };

  const startEdit = (account: SocialAccount) => {
    setEditingId(account.id);
    setEditPlatform(account.platform);
    setEditPageName(account.pageName);
    setEditPageUrl(account.pageUrl);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editingId || !editPageName.trim()) return;
    onUpdate(
      accounts.map((a) =>
        a.id === editingId
          ? { ...a, platform: editPlatform, pageName: editPageName.trim(), pageUrl: editPageUrl.trim() || "#" }
          : a
      )
    );
    setEditingId(null);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
            Social Accounts — {clientName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {clientAccounts.filter((a) => a.status === "connected").length} connected ·{" "}
            {clientAccounts.length} total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-1.5 text-xs hover:underline ${
            availablePlatforms.length > 0 ? "text-[#3b82f6]" : "text-gray-500"
          }`}
        >
          <Plus size={14} />
          Add Account
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white border border-[#1a1a1a] rounded-lg p-3 mb-4 space-y-2">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
            className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800"
          >
            {socialPlatforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}{connectedPlatforms.includes(p.id) ? " (already added)" : ""}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Page name (e.g. Tesla Rides)"
            className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
          />
          <input
            type="text"
            value={newPageUrl}
            onChange={(e) => setNewPageUrl(e.target.value)}
            placeholder="Page URL (e.g. https://facebook.com/...)"
            className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-[#3b82f6] text-white text-sm py-2 rounded-lg hover:bg-[#2563eb]"
          >
            Add Account
          </button>
        </div>
      )}

      {/* Account list */}
      {clientAccounts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">No social accounts yet</p>
          <p className="text-xs mt-1">Add Facebook, Instagram, TikTok, or X</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientAccounts.map((account) => {
            const platform = socialPlatforms.find((p) => p.id === account.platform);
            const status = statusConfig[account.status];
            const StatusIcon = status.icon;
            const isEditing = editingId === account.id;

            if (isEditing) {
              return (
                <div key={account.id} className="bg-white border border-[#3b82f6] rounded-lg p-3 space-y-2">
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as SocialPlatform)}
                    className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800"
                  >
                    {socialPlatforms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editPageName}
                    onChange={(e) => setEditPageName(e.target.value)}
                    placeholder="Page name"
                    className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                  />
                  <input
                    type="text"
                    value={editPageUrl}
                    onChange={(e) => setEditPageUrl(e.target.value)}
                    placeholder="Page URL"
                    className="w-full bg-white border border-[#1a1a1a] rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-[#3b82f6] text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 hover:bg-[#2563eb]"
                    >
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-700 text-gray-800 text-xs py-1.5 rounded flex items-center justify-center gap-1 hover:bg-gray-600"
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={account.id}
                className="bg-white border border-[#1a1a1a] rounded-lg p-3 flex items-center gap-3"
              >
                <span className="text-xl shrink-0">{platform?.icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {account.pageName}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${status.bg} ${status.color}`}
                    >
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{platform?.label}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(account)}
                    className="p-1.5 text-gray-500 hover:text-[#3b82f6] rounded"
                    title="Edit account"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleStatusToggle(account.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                    title="Toggle status"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded"
                    title="Remove account"
                  >
                    <Trash2 size={14} />
                  </button>
                  {account.pageUrl && account.pageUrl !== "#" && (
                    <a
                      href={account.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-[#3b82f6] rounded"
                      title="Open page"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
