// Data models for Agency OS Dashboard

export interface Client {
  id: string;
  name: string;
  website: string;
  socials: { platform: string; url: string }[];
  email: string;
  billing: { amount: number; status: "paid" | "pending" | "overdue" };
  notes: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  status: "planning" | "ready" | "in_progress" | "done";
  agentNotes?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  type: "content" | "seo" | "dev" | "research" | "qa";
  name: string;
  task: string;
  clientId: string;
  status: "queued" | "running" | "done" | "failed";
  output?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Agent type catalog
export const agentTypes = [
  { id: "content", label: "Content Agent", desc: "Writes copy, posts, emails", icon: "📝" },
  { id: "seo", label: "SEO Agent", desc: "Meta tags, keywords, audits", icon: "🔍" },
  { id: "dev", label: "Dev Agent", desc: "Code, fixes, deployments", icon: "⚡" },
  { id: "research", label: "Research Agent", desc: "Market intel, competitor analysis", icon: "🧠" },
  { id: "qa", label: "QA Agent", desc: "Tests, reviews, checks", icon: "✅" },
] as const;

export type AgentType = (typeof agentTypes)[number]["id"];

// Sample data for development
export const sampleClients: Client[] = [
  {
    id: "1",
    name: "Maurice Andrews",
    website: "mauriceandrewssolicitors.co.uk",
    socials: [],
    email: "monzaur@mauriceandrews.co.uk",
    billing: { amount: 500, status: "paid" },
    notes: "Criminal law firm, Birmingham. Website clone + SEO.",
  },
  {
    id: "2",
    name: "Tesla Rides",
    website: "teslarides.co.uk",
    socials: [{ platform: "facebook", url: "#" }],
    email: "bookings@teslarides.co.uk",
    billing: { amount: 0, status: "pending" },
    notes: "Premium taxi service. Sensory-friendly. Needs Facebook presence.",
  },
];

export const sampleTasks: Task[] = [
  {
    id: "1",
    clientId: "1",
    title: "Fix mobile nav submenus",
    status: "done",
    createdAt: "2026-06-05",
  },
  {
    id: "2",
    clientId: "1",
    title: "Point domain to Cloudflare",
    status: "in_progress",
    createdAt: "2026-06-06",
  },
  {
    id: "3",
    clientId: "2",
    title: "Create Facebook business page",
    status: "ready",
    createdAt: "2026-06-06",
  },
  {
    id: "4",
    clientId: "2",
    title: "Design sensory transport ads",
    status: "planning",
    createdAt: "2026-06-06",
  },
];
