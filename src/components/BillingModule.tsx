"use client";

import { useState, useMemo } from "react";
import { DollarSign, ChevronDown, Plus, Check, X, Clock } from "lucide-react";
import type { Client } from "@/lib/data";

interface BillingModuleProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
}

export default function BillingModule({ clients, onUpdate }: BillingModuleProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const totals = useMemo(() => {
    let billed = 0, paid = 0;
    clients.forEach((c) => {
      const total = (c.billing?.lineItems || []).reduce((s, i) => s + (i.amount || 0), 0);
      billed += total;
      if (c.billing?.status === "paid") paid += total;
    });
    return { billed, paid, outstanding: billed - paid };
  }, [clients]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-500/10 text-green-400 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[status] || map.pending;
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

  const handleAddItem = (clientId: string) => {
    const desc = newDesc.trim();
    const amt = parseFloat(newAmount);
    if (!desc || isNaN(amt) || amt <= 0) return;
    onUpdate(
      clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          billing: {
            ...c.billing,
            lineItems: [...(c.billing?.lineItems || []), { description: desc, amount: amt }],
          },
        };
      })
    );
    setNewDesc("");
    setNewAmount("");
    setShowAddForm(null);
  };

  const handleStatusChange = (clientId: string, status: "paid" | "pending" | "overdue") => {
    onUpdate(
      clients.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, billing: { ...c.billing, status } };
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17]">
      <div className="px-4 py-4 border-b border-[#1e293b] bg-[#0f1320] shrink-0 flex items-center gap-2">
        <DollarSign size={18} className="text-green-400" />
        <div>
          <h2 className="text-sm font-semibold text-gray-300">Billing</h2>
          <p className="text-[10px] text-gray-500">{clients.length} clients</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
          {/* Revenue summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Billed", value: totals.billed, color: "border-t-blue-500" },
              { label: "Total Paid", value: totals.paid, color: "border-t-green-500" },
              { label: "Outstanding", value: totals.outstanding, color: "border-t-yellow-500" },
            ].map((stat) => (
              <div key={stat.label} className={`bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-3 ${stat.color} border-t-2`}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-white mt-1">{fmt(stat.value)}</p>
              </div>
            ))}
          </div>

          {/* Client list */}
          {clients.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <DollarSign size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No clients yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => {
                const items = client.billing?.lineItems || [];
                const total = items.reduce((s, i) => s + (i.amount || 0), 0);
                const isExpanded = expandedId === client.id;
                const isAdding = showAddForm === client.id;

                return (
                  <div key={client.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl overflow-hidden">
                    {/* Row header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : client.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#0f1320]/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{client.name}</p>
                      </div>
                      <span className="text-sm text-gray-300 font-medium">{fmt(total)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBadge(client.billing?.status || "pending")}`}>
                        {client.billing?.status || "pending"}
                      </span>
                      <ChevronDown size={14} className={`text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-[#1e293b] px-4 py-3 space-y-2">
                        {items.length > 0 ? (
                          <div className="space-y-1">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs text-gray-400 py-1">
                                <span>{item.description}</span>
                                <span className="text-gray-300 font-medium">{fmt(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">No line items</p>
                        )}

                        {/* Add item form */}
                        {isAdding ? (
                          <div className="flex gap-2 items-end bg-[#0f1320] rounded-lg p-2">
                            <div className="flex-1">
                              <input
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                placeholder="Description"
                                className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-gray-200"
                              />
                            </div>
                            <div className="w-24">
                              <input
                                type="number"
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="£"
                                className="w-full bg-[#1a1f2e] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-gray-200"
                              />
                            </div>
                            <button onClick={() => handleAddItem(client.id)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setShowAddForm(null)} className="p-1.5 text-gray-500 hover:text-white rounded">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAddForm(client.id)}
                            className="flex items-center gap-1.5 text-xs text-[#3b82f6] hover:underline"
                          >
                            <Plus size={12} /> Add Line Item
                          </button>
                        )}

                        {/* Status buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleStatusChange(client.id, "paid")}
                            disabled={client.billing?.status === "paid"}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => handleStatusChange(client.id, "overdue")}
                            disabled={client.billing?.status === "overdue"}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Mark as Overdue
                          </button>
                          <button
                            onClick={() => handleStatusChange(client.id, "pending")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <Clock size={12} className="inline mr-1" />Pending
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
