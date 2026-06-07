"use client";

import { useHelpTips } from "@/lib/HelpTipsContext";
import { Lightbulb, X } from "lucide-react";
import { useState } from "react";

export type NavBoard =
  | "briefing" | "dashboard" | "setup" | "sitebuilder" | "videostudio" | "taskforce"
  | "autopilot" | "ideagen" | "standards" | "review" | "social"
  | "content" | "affiliates" | "kdp" | "clients" | "billing"
  | "notifications" | "messages" | "settings";

interface Tip {
  text: string;
  action?: string;
}

// ── TIP REGISTRY ── every tip is crafted from real Hermes/dashboard knowledge
const TIPS: Record<NavBoard, Tip[]> = {
  briefing: [
    {
      text: "Your daily briefing shows prayer times (Tipton, UK UoIS method), top 3 tasks, agent status, and upcoming deadlines — all in one glance.",
    },
    {
      text: "Tasks marked 'overdue' appear at the top in red. Complete them first to clear the board.",
      action: "Drag a task card to 'Done' to mark it complete.",
    },
    {
      text: "The briefing refreshes every morning at Fajr. You can also refresh manually with the button in the top-right.",
    },
  ],

  dashboard: [
    {
      text: "This is a Kanban board — drag tasks between columns to update their status. Columns: Backlog → Todo → In Progress → Review → Done.",
    },
    {
      text: "Each task card shows the client name, assignee, and priority. Click a card to expand details and add notes.",
      action: "Try dragging the first 'Todo' card to 'In Progress'.",
    },
    {
      text: "Tasks are saved to localStorage automatically — they survive page refresh and browser restarts.",
    },
  ],

  setup: [
    {
      text: "Start with 'Local Computer' — it's free and takes 2 minutes. You can move to VPS later by copying your config files.",
    },
    {
      text: "The config files generated in Step 3 are pre-filled with your API keys. Download them and place in ~/.hermes/ on your machine.",
    },
    {
      text: "After setup, download the Troubleshooting Guide from Step 5 — it covers every known issue with exact prompts to give your Hermes agent for auto-fixes.",
    },
  ],

  sitebuilder: [
    {
      text: "Pick a template → generate the site → deploy to hosting. You earn affiliate commission on every hosting and domain signup.",
      action: "Try the 'Law Firm' template — it's preset for solicitor sites like Maurice Andrews.",
    },
    {
      text: "Hosting partners like SiteGround pay £50-100 per signup. Domains via Namecheap pay 15-30%. Both are halal (samsarah/brokerage).",
    },
    {
      text: "The Commissions tab tracks your earnings. Case studies show what's possible — Tesla Glow Rides and Maurice Andrews are live examples.",
    },
  ],

  videostudio: [
    {
      text: "The Script Generator creates video scripts using AI. Enter a topic and select a style (tutorial, review, story) to get started.",
    },
    {
      text: "Voice Cloning uses VoxCPM (local, free) to clone your voice for narration. You need a 30-second voice sample to begin.",
      action: "Record a clean voice sample and upload it in the Voice Cloning tab.",
    },
    {
      text: "Schedule your videos in the Schedule tab. Hermes can auto-publish to YouTube when connected via cron jobs.",
    },
  ],

  taskforce: [
    {
      text: "TaskForce deploys AI agents to do work for you. Each agent goes through a 5-step Shape Spec checklist before deploying — this prevents bad code from reaching production.",
    },
    {
      text: "The 'Gated Deploy' toggle ensures agents only deploy after passing all spec checks. Keep this ON for production work.",
      action: "Create a test agent first with 'Deploy Test Agent' to see how it works.",
    },
    {
      text: "Agents use your local LLM (Ollama) by default to save credits. Switch to cloud models (DeepSeek/OpenRouter) for complex tasks.",
    },
  ],

  autopilot: [
    {
      text: "AutoPilot shows everything running in the background: Hermes gateway, cron jobs, monitor scripts, and bridge connections.",
    },
    {
      text: "Green = healthy, Yellow = warning, Red = down, Gray = not running. Click any item to see logs.",
    },
    {
      text: "The watchdog script automatically restarts any crashed service. You don't need to manually intervene unless something stays red for more than 5 minutes.",
    },
  ],

  ideagen: [
    {
      text: "IdeaGen validates business ideas against multiple criteria: market demand, competition, Shariah compliance, and startup cost.",
    },
    {
      text: "Each idea gets scored. Focus on ideas scoring 80+ — they have the best chance of success.",
      action: "Click 'Generate Idea' to see how the scoring works.",
    },
    {
      text: "All generated ideas are saved to the business plan automatically. You can review them later in the KDP or Affiliate boards for monetization.",
    },
  ],

  standards: [
    {
      text: "Standards & Specs is your quality gate. Define coding standards, review checklists, and Shape Specs before deploying agents.",
    },
    {
      text: "A Shape Spec is a 5-section template: Purpose, Inputs, Outputs, Constraints, and Test Cases. Fill all 5 before deploying.",
      action: "Click 'New Spec' to create your first Shape Spec.",
    },
    {
      text: "Specs are linked to TaskForce — agents won't deploy unless their spec is complete when Gated Deploy is ON.",
    },
  ],

  review: [
    {
      text: "Review Queue shows all content and code that needs your approval before going live. Check this daily.",
    },
    {
      text: "Approve, reject, or edit items. Rejected items go back to the agent with your feedback for revision.",
    },
    {
      text: "Set review to 'auto-approve' for social posts and 'manual' for client-facing code and billing.",
      action: "Review pending items now — they stack up and block deployments.",
    },
  ],

  social: [
    {
      text: "Connect your social accounts here: Facebook Pages, Twitter, LinkedIn, and Instagram (via Facebook). Each account needs its own access token.",
    },
    {
      text: "Facebook tokens expire every 60 days. Set a reminder to refresh them, or Hermes can auto-renew if you grant long-lived token access.",
      action: "Link your first social account to start auto-posting.",
    },
    {
      text: "Posts are created in Content Studio, then scheduled here per account. Each platform has different optimal posting times.",
    },
  ],

  content: [
    {
      text: "Content Studio has two modes: Composer (write posts manually with AI assist) and Higgsfield (batch-generate UGC video at scale).",
    },
    {
      text: "The Composer generates posts for all connected platforms simultaneously — one prompt creates Facebook, Twitter, and LinkedIn versions.",
      action: "Try typing a topic in the Composer and hit 'Generate All'.",
    },
    {
      text: "Higgsfield mode is for video content. Upload a product image and it generates multiple UGC-style videos with different angles and hooks.",
    },
  ],

  affiliates: [
    {
      text: "Affiliate marketing (samsarah) is halal when: you disclose the relationship, the product is halal, and you've verified the product quality.",
    },
    {
      text: "The Research tab finds products in your niche. The Content tab generates review content. The Tracking tab monitors clicks and conversions.",
      action: "Start with Research — find 3 halal products in your niche first.",
    },
    {
      text: "Avoid dropshipping (selling what you don't possess). Affiliate is different — you're a marketer earning commission, not a seller.",
    },
  ],

  kdp: [
    {
      text: "KDP (Kindle Direct Publishing) lets you publish books on Amazon. The Book Tracker monitors your catalogue, the Niche Researcher finds profitable topics.",
    },
    {
      text: "Low-content books (journals, planners) are quick to create but low margin. Medium-content (guides, how-tos) take longer but earn more.",
      action: "Use the Niche Researcher to find a topic with high demand and low competition.",
    },
    {
      text: "Royalties are 70% for books priced $2.99-$9.99 in most markets. Track earnings in the Royalties dashboard tab.",
    },
  ],

  clients: [
    {
      text: "Each client has a profile with website, social links, billing status, and notes. Click a client in the sidebar to view their dashboard.",
    },
    {
      text: "Client tasks are filtered automatically — you only see tasks for the selected client. Switch clients from the sidebar.",
      action: "Add your first client with the '+ Add Client' button in the sidebar.",
    },
    {
      text: "Billing status (paid/pending/overdue) shows as a colored dot next to each client name. Overdue clients appear with a red dot.",
    },
  ],

  billing: [
    {
      text: "Add line items to each client: service name, hours, rate. The total calculates automatically. Export as PDF for invoicing.",
    },
    {
      text: "Track payments by marking items as 'paid'. Overdue items appear in red and feed into the Daily Briefing.",
      action: "Create your first invoice by selecting a client and adding a line item.",
    },
    {
      text: "For Islamic compliance: charge for completed work (not time), be transparent about rates, and avoid interest-based late fees.",
    },
  ],

  notifications: [
    {
      text: "Notifications include: agent completions, cron job results, prayer reminders, review queue items, and billing alerts.",
    },
    {
      text: "Prayer reminders fire 10 minutes before each salat (UK UoIS method, Tipton DY4 8SL). They also ping Telegram if configured.",
    },
    {
      text: "Click any notification to jump to the relevant board. Unread notifications show a badge on the sidebar bell icon.",
    },
  ],

  messages: [
    {
      text: "This is the live chat with your Hermes AI. It connects via Upstash Redis — messages sync between dashboard, Telegram, and Discord.",
    },
    {
      text: "Hermes can: answer questions, execute terminal commands, deploy code, manage files, and control your entire system.",
      action: "Try asking: 'What's on my briefing today?'",
    },
    {
      text: "Voice messages work too — Hermes transcribes them with faster-whisper (local, free) and responds in text or voice.",
    },
  ],

  settings: [
    {
      text: "System Health shows live status of all components: Hermes gateway, Upstash Redis, cron jobs, API endpoints, and LLM provider.",
    },
    {
      text: "All settings are saved to localStorage. API keys and secrets are stored in your Hermes .env file, never in the dashboard.",
    },
    {
      text: "The dashboard works offline — service worker caches the shell. Data syncs when back online via Upstash Redis.",
    },
    {
      text: "Download the Troubleshooting Guide (troubleshooting.md) for all known issues and exact prompts to give Hermes for auto-fixes.",
      action: "Open Hermes Setup → Step 5 to download the guide.",
    },
  ],
};

// ── COMPONENT ──
export default function HelpTips({ board }: { board: NavBoard }) {
  const { showTips } = useHelpTips();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState(true); // collapsed on mobile by default

  if (!showTips) return null;

  const tips = TIPS[board];
  if (!tips || dismissed.length >= tips.length) return null;

  const visibleTips = tips.filter((_, i) => !dismissed.includes(i));

  return (
    <div className="border-b border-[#1e293b] bg-[#0f1a24] shrink-0">
      {/* Collapsed bar — tap to expand */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Lightbulb size={14} className="text-amber-400 shrink-0" />
          <span className="flex-1 text-left">
            {visibleTips.length} quick tip{visibleTips.length > 1 ? "s" : ""} — tap to show
          </span>
          <span className="text-gray-600">▶</span>
        </button>
      ) : (
        /* Expanded tips */
        <div className="px-4 py-2.5">
          <div className="flex items-start gap-2 max-w-3xl">
            <button
              onClick={() => setCollapsed(true)}
              className="text-amber-400 hover:text-amber-300 shrink-0 mt-px p-0.5"
              title="Collapse tips"
            >
              <Lightbulb size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs text-gray-400 font-medium">
                  Quick tip{visibleTips.length > 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="text-[10px] text-gray-600 hover:text-gray-400"
                >
                  ▲ hide
                </button>
              </div>
              {visibleTips.map((tip, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-300 leading-relaxed flex items-start gap-2 mb-1 last:mb-0 group"
                >
                  <span className="shrink-0 text-[10px] text-gray-600 mt-px">
                    {visibleTips.length > 1 ? `${dismissed.length + i + 1}.` : "💡"}
                  </span>
                  <span className="flex-1">
                    {tip.text}
                    {tip.action && (
                      <span className="block text-[11px] text-amber-400/70 mt-0.5 italic">
                        {tip.action}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setDismissed(prev => [...prev, tips.indexOf(tip)])}
                    className="shrink-0 p-0.5 text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The toggle button — goes in the header */
export function HelpToggle() {
  const { showTips, toggleTips } = useHelpTips();

  return (
    <button
      onClick={toggleTips}
      className={`px-2.5 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
        showTips
          ? "bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30"
          : "text-gray-500 hover:text-gray-300 hover:bg-[#1e293b]"
      }`}
      title={showTips ? "Hide help tips" : "Show help tips"}
    >
      <Lightbulb size={13} />
      <span className="hidden sm:inline">{showTips ? "Tips On" : "Tips"}</span>
    </button>
  );
}
