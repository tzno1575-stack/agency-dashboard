"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Globe, Mail, PoundSterling, StickyNote } from "lucide-react";
import type { Client, BillingLineItem } from "@/lib/data";

interface ClientDetailProps {
  client: Client | null;
  onSave: (client: Client) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const emptyClient: Client = {
  id: "",
  name: "",
  website: "",
  socials: [],
  email: "",
  billing: { lineItems: [], status: "pending" },
  notes: "",
};

export default function ClientDetail({ client, onSave, onDelete, onClose }: ClientDetailProps) {
  const [editing, setEditing] = useState<Client>(client || emptyClient);
  const [saved, setSaved] = useState(false);

  // Reset form only when a different client is selected
  const [lastClientId, setLastClientId] = useState<string | null>(null);
  useEffect(() => {
    if (client?.id !== lastClientId) {
      setEditing(client ? { ...client } : { ...emptyClient });
      setLastClientId(client?.id || null);
      setSaved(false);
    }
  }, [client, lastClientId]);

  const handleSave = () => {
    const savedClient = {
      ...editing,
      id: editing.id || `client-${Date.now()}`,
    };
    onSave(savedClient);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Select a client or add a new one
      </div>
    );
  }

  const handleAddSocial = () => {
    setEditing({
      ...editing,
      socials: [...editing.socials, { platform: "", url: "" }],
    });
  };

  const handleSocialChange = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...editing.socials];
    updated[index] = { ...updated[index], [field]: value };
    setEditing({ ...editing, socials: updated });
  };

  const handleRemoveSocial = (index: number) => {
    setEditing({
      ...editing,
      socials: editing.socials.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
          Client Details
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Company Name</label>
          <input
            type="text"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
            placeholder="Client name"
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Globe size={12} /> Website
          </label>
          <input
            type="text"
            value={editing.website}
            onChange={(e) => setEditing({ ...editing, website: e.target.value })}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
            placeholder="example.com"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Mail size={12} /> Email
          </label>
          <input
            type="email"
            value={editing.email}
            onChange={(e) => setEditing({ ...editing, email: e.target.value })}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
            placeholder="client@example.com"
          />
        </div>

        {/* Billing */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <PoundSterling size={12} /> Billing
            </label>
            <button
              onClick={() =>
                setEditing({
                  ...editing,
                  billing: {
                    ...editing.billing,
                    lineItems: [...editing.billing.lineItems, { description: "", amount: 0 }],
                  },
                })
              }
              className="text-[#3b82f6] text-xs hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>

          {/* Line items */}
          {editing.billing.lineItems.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">No billing items yet</p>
          ) : (
            <div className="space-y-1.5 mb-2">
              {editing.billing.lineItems.map((item, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const items = [...editing.billing.lineItems];
                      items[i] = { ...items[i], description: e.target.value };
                      setEditing({
                        ...editing,
                        billing: { ...editing.billing, lineItems: items },
                      });
                    }}
                    className="flex-1 bg-white border border-[#1a1a1a] rounded px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                    placeholder="Website design"
                  />
                  <input
                    type="number"
                    value={item.amount || ""}
                    onChange={(e) => {
                      const items = [...editing.billing.lineItems];
                      items[i] = { ...items[i], amount: Number(e.target.value) };
                      setEditing({
                        ...editing,
                        billing: { ...editing.billing, lineItems: items },
                      });
                    }}
                    className="w-20 bg-white border border-[#1a1a1a] rounded px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                    placeholder="0"
                  />
                  <button
                    onClick={() => {
                      const items = editing.billing.lineItems.filter((_, j) => j !== i);
                      setEditing({
                        ...editing,
                        billing: { ...editing.billing, lineItems: items },
                      });
                    }}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Total + Status */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-bold text-black">
                £
                {editing.billing.lineItems
                  .reduce((sum, item) => sum + (item.amount || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
            <select
              value={editing.billing.status}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  billing: { ...editing.billing, status: e.target.value as Client["billing"]["status"] },
                })
              }
              className="w-28 bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Socials */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500">Social Media</label>
            <button
              onClick={handleAddSocial}
              className="text-[#3b82f6] text-xs hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          {editing.socials.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={s.platform}
                onChange={(e) => handleSocialChange(i, "platform", e.target.value)}
                className="w-24 bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                placeholder="facebook"
              />
              <input
                type="text"
                value={s.url}
                onChange={(e) => handleSocialChange(i, "url", e.target.value)}
                className="flex-1 bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6]"
                placeholder="https://..."
              />
              <button
                onClick={() => handleRemoveSocial(i)}
                className="text-gray-500 hover:text-red-400 p-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <StickyNote size={12} /> Notes
          </label>
          <textarea
            value={editing.notes}
            onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3b82f6] h-24 resize-none"
            placeholder="Project notes, preferences, key contacts..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className={`flex-1 text-sm py-2 rounded-lg transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
            }`}
          >
            {saved ? "✓ Saved!" : "Save Client"}
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete client"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
