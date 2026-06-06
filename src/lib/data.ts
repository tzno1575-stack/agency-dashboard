// Data models for Agency OS Dashboard

export interface BillingLineItem {
  description: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  website: string;
  socials: { platform: string; url: string }[];
  email: string;
  billing: { lineItems: BillingLineItem[]; status: "paid" | "pending" | "overdue" };
  notes: string;
}

/** Ensure client has all required fields — fixes old localStorage data without billing */
export function normalizeClient(c: Partial<Client> & { id: string }): Client {
  return {
    id: c.id,
    name: c.name || "Untitled Client",
    website: c.website || "",
    socials: c.socials || [],
    email: c.email || "",
    billing: c.billing || { lineItems: [], status: "pending" },
    notes: c.notes || "",
  };
}

export function normalizeClients(clients: (Partial<Client> & { id: string })[]): Client[] {
  return clients.map(normalizeClient);
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

// --- Social Media Management ---

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "x";

export interface SocialAccount {
  id: string;
  clientId: string;
  platform: SocialPlatform;
  pageName: string;
  pageUrl: string;
  status: "connected" | "pending" | "disconnected";
  accessToken?: string; // stored in Bitwarden, ref only
}

export interface ScheduledPost {
  id: string;
  clientId: string;
  platform: SocialPlatform;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  scheduledAt: string;
  status: "draft" | "scheduled" | "posted" | "failed";
  aiPrompt?: string; // original prompt used to generate
  postedAt?: string;
  errorMessage?: string;
}

export const socialPlatforms: { id: SocialPlatform; label: string; color: string; icon: string }[] = [
  { id: "facebook", label: "Facebook", color: "bg-blue-600", icon: "📘" },
  { id: "instagram", label: "Instagram", color: "bg-pink-500", icon: "📷" },
  { id: "tiktok", label: "TikTok", color: "bg-gray-900", icon: "🎵" },
  { id: "x", label: "X (Twitter)", color: "bg-gray-700", icon: "🐦" },
];

export const hashtagGroups: { name: string; tags: string[] }[] = [
  {
    name: "Tesla Rides — Sensory",
    tags: ["#SENtransport", "#AutismFriendly", "#SensoryFriendly", "#Tipton", "#WestMidlands", "#SpecialNeedsTravel"],
  },
  {
    name: "Law Firm — Criminal",
    tags: ["#CriminalDefence", "#Solicitor", "#Birmingham", "#LegalAid", "#JusticeForAll"],
  },
  {
    name: "Small Business",
    tags: ["#SmallBusiness", "#SupportLocal", "#UKBusiness", "#Entrepreneur"],
  },
];

// Sample social accounts for Tesla Rides
export const sampleSocialAccounts: SocialAccount[] = [
  {
    id: "sa-1",
    clientId: "2",
    platform: "facebook",
    pageName: "Tesla Rides",
    pageUrl: "https://www.facebook.com/profile.php?id=61581496414531",
    status: "connected",
  },
  {
    id: "sa-2",
    clientId: "2",
    platform: "instagram",
    pageName: "@teslaridesuk",
    pageUrl: "https://instagram.com/teslaridesuk",
    status: "disconnected",
  },
  {
    id: "sa-3",
    clientId: "2",
    platform: "tiktok",
    pageName: "@teslarides",
    pageUrl: "https://tiktok.com/@teslarides",
    status: "disconnected",
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

// Idea Generator types
export interface Idea {
  id: number;
  businessName: string;
  description: string;
  estimatedRevenue: string;
  startupCost: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
}

export const sampleIdeas: Idea[] = [
  { id: 1, businessName: "LocalBiz Web Studio", description: "Build affordable websites for small businesses. Every shop, café and tradesperson needs an online presence.", estimatedRevenue: "£2K–£5K/month", startupCost: "£300", difficulty: "Easy" },
  { id: 2, businessName: "Social Spark", description: "Social media management for local restaurants and retailers. Content calendars, engagement, basic Meta ad campaigns.", estimatedRevenue: "£1.5K–£3K/month", startupCost: "£100", difficulty: "Easy" },
  { id: 3, businessName: "CodeCraft Academy", description: "Weekend coding workshops for career-switchers. Partner with local co-working spaces. High margins, low overhead.", estimatedRevenue: "£3K–£8K/month", startupCost: "£500", difficulty: "Medium" },
  { id: 4, businessName: "MarketReach AI", description: "AI-powered market research reports for small businesses. Automate competitor analysis and customer personas.", estimatedRevenue: "£4K–£10K/month", startupCost: "£1,000", difficulty: "Hard" },
  { id: 5, businessName: "ContentFlow", description: "Subscription blog and newsletter service for B2B companies. Ghostwriting, SEO, distribution included.", estimatedRevenue: "£3K–£6K/month", startupCost: "£200", difficulty: "Medium" },
  { id: 6, businessName: "PrintOnDemand Hub", description: "Custom merch via Shopify + Printful. Niche into local pride or professional in-jokes. Zero inventory.", estimatedRevenue: "£1K–£4K/month", startupCost: "£100", difficulty: "Easy" },
  { id: 7, businessName: "SaaS Starter Kit", description: "Micro-SaaS for a narrow audience. e.g. appointment scheduling for dog groomers at £19–49/month.", estimatedRevenue: "£5K–£15K/month", startupCost: "£5,000", difficulty: "Expert" },
  { id: 8, businessName: "Virtual PA Service", description: "Remote admin support for busy professionals. Email, calendar, data entry, travel booking.", estimatedRevenue: "£2K–£4K/month", startupCost: "£200", difficulty: "Medium" },
];
