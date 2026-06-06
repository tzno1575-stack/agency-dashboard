"use client";

import { Check, X, Pencil, Clock, AlertCircle } from "lucide-react";

interface ReviewItem {
  id: string;
  title: string;
  description: string;
  agent: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

interface ReviewQueueProps {
  items: ReviewItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
}

const sampleReviewItems: ReviewItem[] = [
  {
    id: "1",
    title: "Tesla Rides Facebook ad copy",
    description: "Premium, sensory-friendly transport for autistic children — book now.",
    agent: "Content Agent",
    timestamp: "2026-06-06 16:30",
    status: "pending",
  },
  {
    id: "2",
    title: "Maurice Andrews SEO meta tags",
    description: "Updated meta description: Expert criminal defence solicitors in Birmingham...",
    agent: "SEO Agent",
    timestamp: "2026-06-06 15:45",
    status: "pending",
  },
];

export default function ReviewQueue() {
  const [items, setItems] = React.useState<ReviewItem[]>(sampleReviewItems);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: action } : item
      )
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={16} className="text-yellow-500" />
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Review Queue
        </h2>
        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full ml-auto">
          {items.filter((i) => i.status === "pending").length} pending
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-[#1a1f2e] border rounded-lg p-3 transition-colors ${
              item.status === "approved"
                ? "border-green-500/30 opacity-60"
                : item.status === "rejected"
                ? "border-red-500/30 opacity-60"
                : "border-[#1e293b]"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {item.title}
                  </span>
                  {item.status !== "pending" && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        item.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span>{item.agent}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {item.timestamp}
                  </span>
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleAction(item.id, "approved")}
                    className="p-1.5 rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    title="Approve"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "rejected")}
                    className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Need React for useState
import React from "react";
