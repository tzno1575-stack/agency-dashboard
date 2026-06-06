"use client";

import { useState, useEffect } from "react";
import { Check, X, Pencil, Clock, AlertCircle, Loader2 } from "lucide-react";

interface ReviewItem {
  id: string;
  title: string;
  description: string;
  agent: string;
  type: string;
  clientId: string | null;
  status: "pending" | "approved" | "rejected";
  output?: string;
  timestamp: string;
  reviewedAt?: string;
}

export default function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/review");
      const data = await res.json();
      setItems(data.items || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActing(id);
    try {
      await fetch("/api/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      await fetchItems();
    } catch {}
    setActing(null);
  };

  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status !== "pending");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={16} className="text-yellow-500" />
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Review Queue
        </h2>
        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full ml-auto">
          {pending.length} pending
        </span>
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-600 mt-20">
          <p className="text-lg mb-2">Nothing to review</p>
          <p className="text-sm">Agent outputs, AI content, and ideas land here for your approval</p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2 mb-6">
          {pending.map((item) => (
            <div
              key={item.id}
              className="bg-[#1a1f2e] border border-yellow-500/20 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {item.title}
                    </span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  {item.output && (
                    <div className="mt-2 p-2 bg-[#0f1320] rounded text-xs text-gray-400 border border-[#1e293b] line-clamp-3">
                      {item.output}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span>{item.agent}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleAction(item.id, "approve")}
                    disabled={acting === item.id}
                    className="p-1.5 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                    title="Approve"
                  >
                    {acting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button
                    className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "reject")}
                    disabled={acting === item.id}
                    className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviewed */}
      {done.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Reviewed</h3>
          {done.map((item) => (
            <div
              key={item.id}
              className={`bg-[#1a1f2e] border rounded-lg p-3 opacity-60 ${
                item.status === "approved" ? "border-green-500/20" : "border-red-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 truncate">{item.title}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      item.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {item.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                </div>
                <span className="text-xs text-gray-600">{item.agent}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
