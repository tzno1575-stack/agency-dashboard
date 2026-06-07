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
  accessToken?: string;
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
  aiPrompt?: string;
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

// --- SAMPLE CLIENTS (7 clients, diverse industries) ---
export const sampleClients: Client[] = [
  {
    id: "1", name: "Maurice Andrews", website: "mauriceandrewssolicitors.co.uk",
    socials: [{ platform: "facebook", url: "#" }], email: "monzaur@mauriceandrews.co.uk",
    billing: { lineItems: [{ description: "Website clone + SEO", amount: 500 }, { description: "Ongoing maintenance", amount: 150 }], status: "paid" },
    notes: "Criminal law firm, Birmingham. Cloudflare Pages deployed. Awaiting domain DNS switch.",
  },
  {
    id: "2", name: "Tesla Rides", website: "teslarides.co.uk",
    socials: [{ platform: "facebook", url: "https://facebook.com/profile.php?id=61581496414531" }],
    email: "bookings@teslarides.co.uk",
    billing: { lineItems: [], status: "pending" },
    notes: "Premium taxi. Sensory-friendly for autistic children. Facebook ad campaign needed.",
  },
  {
    id: "3", name: "Birmingham Halal Eats", website: "bhamhalal.co.uk",
    socials: [{ platform: "instagram", url: "#" }, { platform: "tiktok", url: "#" }],
    email: "info@bhamhalal.co.uk",
    billing: { lineItems: [{ description: "Social media management", amount: 350 }, { description: "Food photography", amount: 200 }], status: "pending" },
    notes: "Restaurant directory app. Needs Instagram + TikTok content calendar.",
  },
  {
    id: "4", name: "West Midlands Plumbing", website: "wmplumbing.co.uk",
    socials: [], email: "dave@wmplumbing.co.uk",
    billing: { lineItems: [{ description: "Website redesign", amount: 450 }], status: "overdue" },
    notes: "Emergency call-out plumbing. Needs quick-loading site with WhatsApp booking button.",
  },
  {
    id: "5", name: "TechEdu Academy", website: "techeduacademy.co.uk",
    socials: [{ platform: "x", url: "#" }], email: "hello@techeduacademy.co.uk",
    billing: { lineItems: [{ description: "LMS setup + branding", amount: 1200 }], status: "paid" },
    notes: "Coding bootcamp for career-switchers. Landing page + course portal build in progress.",
  },
  {
    id: "6", name: "Aesthetic Dental", website: "aestheticdental.co.uk",
    socials: [{ platform: "instagram", url: "#" }], email: "smile@aestheticdental.co.uk",
    billing: { lineItems: [{ description: "SEO audit + content plan", amount: 600 }], status: "paid" },
    notes: "Private cosmetic dentist. Ranking for 'Birmingham veneers' — SEO sprint active.",
  },
  {
    id: "7", name: "GreenVans Logistics", website: "greenvans.co.uk",
    socials: [{ platform: "facebook", url: "#" }, { platform: "x", url: "#" }],
    email: "ops@greenvans.co.uk",
    billing: { lineItems: [{ description: "Brand identity + site", amount: 850 }], status: "pending" },
    notes: "Eco-friendly courier service. Brand new startup — full build from scratch.",
  },
];

// --- SAMPLE TASKS (14 tasks across all statuses and clients) ---
export const sampleTasks: Task[] = [
  // Maurice Andrews (client-1)
  { id: "t1", clientId: "1", title: "Fix mobile nav submenus", status: "done", agentNotes: "Dropdown z-index fixed, touch targets increased.", createdAt: "2026-06-04" },
  { id: "t2", clientId: "1", title: "Point domain DNS to Cloudflare", status: "in_progress", agentNotes: "Waiting on client to update nameservers.", createdAt: "2026-06-05" },
  { id: "t3", clientId: "1", title: "Add Google Analytics + Search Console", status: "ready", createdAt: "2026-06-06" },
  { id: "t4", clientId: "1", title: "Draft 3 blog posts on criminal law FAQs", status: "planning", createdAt: "2026-06-07" },

  // Tesla Rides (client-2)
  { id: "t5", clientId: "2", title: "Create Facebook business page banner", status: "done", agentNotes: "Uploaded sensory-themed design.", createdAt: "2026-06-03" },
  { id: "t6", clientId: "2", title: "Design sensory transport ad creatives", status: "in_progress", agentNotes: "2 of 4 creatives done.", createdAt: "2026-06-05" },
  { id: "t7", clientId: "2", title: "Set up Facebook Ad account + pixel", status: "ready", createdAt: "2026-06-06" },

  // Birmingham Halal Eats (client-3)
  { id: "t8", clientId: "3", title: "Build Instagram content calendar", status: "in_progress", agentNotes: "May grid complete. June in draft.", createdAt: "2026-06-04" },
  { id: "t9", clientId: "3", title: "Photoshoot: 5 restaurant locations", status: "planning", createdAt: "2026-06-07" },

  // TechEdu Academy (client-5)
  { id: "t10", clientId: "5", title: "Deploy course landing page", status: "ready", createdAt: "2026-06-06" },
  { id: "t11", clientId: "5", title: "Integrate Stripe payments", status: "planning", agentNotes: "Need client to provide Stripe API keys.", createdAt: "2026-06-07" },

  // Aesthetic Dental (client-6)
  { id: "t12", clientId: "6", title: "Complete SEO audit report", status: "done", agentNotes: "Top 10 keywords identified. Backlink profile analysed.", createdAt: "2026-06-02" },
  { id: "t13", clientId: "6", title: "Optimise meta titles + descriptions", status: "in_progress", createdAt: "2026-06-05" },
  { id: "t14", clientId: "6", title: "Build backlink outreach list", status: "planning", createdAt: "2026-06-07" },
];

// --- SAMPLE AGENTS (9 agents across all types and statuses) ---
export const sampleAgents: Agent[] = [
  { id: "a1", type: "seo", name: "SEO Scout", task: "Audit mauriceandrewssolicitors.co.uk meta tags", clientId: "1", status: "done", output: "Found 12 missing meta descriptions, 4 duplicate titles. Report saved.", createdAt: "2026-06-05T09:00:00Z", completedAt: "2026-06-05T09:12:00Z" },
  { id: "a2", type: "content", name: "ContentForge", task: "Write 3 blog posts for criminal defence FAQ", clientId: "1", status: "running", createdAt: "2026-06-07T08:30:00Z" },
  { id: "a3", type: "dev", name: "DevPilot", task: "Clone mauriceandrewssolicitors.co.uk to Next.js", clientId: "1", status: "done", output: "Pixel-matched clone deployed to Cloudflare Pages. 3 variants live.", createdAt: "2026-06-03T14:00:00Z", completedAt: "2026-06-04T10:00:00Z" },
  { id: "a4", type: "research", name: "MarketIntel", task: "Competitor analysis: 5 Birmingham law firm websites", clientId: "1", status: "queued", createdAt: "2026-06-07T09:00:00Z" },
  { id: "a5", type: "content", name: "AdWriter", task: "Write 4 Facebook ad variants for Tesla Rides sensory service", clientId: "2", status: "done", output: "Headlines: 'Calm rides for bright minds', 'Sensory-safe transport'. CTR estimated 2.1%.", createdAt: "2026-06-05T11:00:00Z", completedAt: "2026-06-05T11:08:00Z" },
  { id: "a6", type: "seo", name: "RankTracker", task: "Track 'Birmingham veneers' keyword ranking", clientId: "6", status: "running", createdAt: "2026-06-07T08:00:00Z" },
  { id: "a7", type: "qa", name: "BugHunter", task: "Cross-browser test: TechEdu landing page", clientId: "5", status: "failed", output: "Safari flexbox gap bug on course cards. Mobile menu overlap on iOS. 3 issues logged.", createdAt: "2026-06-06T16:00:00Z", completedAt: "2026-06-06T16:05:00Z" },
  { id: "a8", type: "dev", name: "SiteBuilder", task: "Build GreenVans 5-page brand site", clientId: "7", status: "queued", createdAt: "2026-06-07T09:15:00Z" },
  { id: "a9", type: "research", name: "TrendScope", task: "Find top 10 viral food TikTok trends for Halal Eats", clientId: "3", status: "queued", createdAt: "2026-06-07T09:30:00Z" },
];

// --- SAMPLE REVIEW ITEMS ---
export const sampleReviews = [
  { id: "r1", agentId: "a1", type: "seo", output: "SEO audit complete. 12 missing meta descriptions found.", status: "pending", submittedAt: "2026-06-05T09:12:00Z" },
  { id: "r2", agentId: "a3", type: "dev", output: "Website clone deployed. 3 variants on Cloudflare Pages.", status: "pending", submittedAt: "2026-06-04T10:00:00Z" },
  { id: "r3", agentId: "a5", type: "content", output: "4 Facebook ad variants written for Tesla Rides.", status: "pending", submittedAt: "2026-06-05T11:08:00Z" },
  { id: "r4", agentId: "a7", type: "qa", output: "Bug report: 3 issues found on TechEdu landing page.", status: "pending", submittedAt: "2026-06-06T16:05:00Z" },
];

// Sample social accounts — expanded
export const sampleSocialAccounts: SocialAccount[] = [
  { id: "sa-1", clientId: "2", platform: "facebook", pageName: "Tesla Rides", pageUrl: "https://www.facebook.com/profile.php?id=61581496414531", status: "connected" },
  { id: "sa-2", clientId: "2", platform: "instagram", pageName: "@teslaridesuk", pageUrl: "https://instagram.com/teslaridesuk", status: "disconnected" },
  { id: "sa-3", clientId: "2", platform: "tiktok", pageName: "@teslarides", pageUrl: "https://tiktok.com/@teslarides", status: "disconnected" },
  { id: "sa-4", clientId: "3", platform: "instagram", pageName: "@bhamhalaleats", pageUrl: "https://instagram.com/bhamhalaleats", status: "connected" },
  { id: "sa-5", clientId: "3", platform: "tiktok", pageName: "@bhamhalaleats", pageUrl: "https://tiktok.com/@bhamhalaleats", status: "connected" },
  { id: "sa-6", clientId: "1", platform: "facebook", pageName: "Maurice Andrews Solicitors", pageUrl: "https://facebook.com/mauriceandrews", status: "pending" },
  { id: "sa-7", clientId: "6", platform: "instagram", pageName: "@aestheticdentalbham", pageUrl: "https://instagram.com/aestheticdentalbham", status: "connected" },
  { id: "sa-8", clientId: "5", platform: "x", pageName: "@TechEduAcademy", pageUrl: "https://x.com/TechEduAcademy", status: "pending" },
];

// Sample scheduled posts — across platforms and statuses
export const samplePosts: ScheduledPost[] = [
  { id: "p1", clientId: "2", platform: "facebook", content: "Sensory-safe journeys for your little ones 🚗✨ Our Tesla is fitted with calming lights, sensory toys, and trained drivers who understand autism.", hashtags: ["#SENtransport", "#AutismFriendly", "#SensoryFriendly"], scheduledAt: "2026-06-08T08:00:00Z", status: "scheduled", aiPrompt: "Create a warm, informative post about sensory transport service" },
  { id: "p2", clientId: "2", platform: "facebook", content: "Airport transfer? 🛫 Skip the stress. Door-to-door in a luxury Tesla. Free WiFi, bottled water, and zero hassle.", hashtags: ["#AirportTransfer", "#Birmingham", "#LuxuryTravel"], scheduledAt: "2026-06-09T10:00:00Z", status: "scheduled" },
  { id: "p3", clientId: "3", platform: "instagram", content: "Birmingham's best biryani? We've got the list. 🍛 Swipe to see our top 5 picks for authentic halal biryani in Bham.", hashtags: ["#BirminghamFood", "#HalalEats", "#BiryaniLove"], scheduledAt: "2026-06-08T18:00:00Z", status: "scheduled", imageUrl: "/placeholder-food.jpg" },
  { id: "p4", clientId: "3", platform: "tiktok", content: "POV: You're on a halal food crawl in Birmingham 🎥🔥", hashtags: ["#HalalFoodCrawl", "#BirminghamEats", "#FoodTok"], scheduledAt: "2026-06-10T12:00:00Z", status: "draft" },
  { id: "p5", clientId: "6", platform: "instagram", content: "Your smile journey starts here. ✨ Book a free consultation and see what cosmetic dentistry can do for your confidence.", hashtags: ["#CosmeticDentistry", "#BirminghamSmiles", "#VeneersUK"], scheduledAt: "2026-06-07T14:00:00Z", status: "posted", postedAt: "2026-06-07T14:05:00Z" },
  { id: "p6", clientId: "5", platform: "x", content: "New cohort starts July 5th! 🚀 Learn coding in 12 weeks and switch to a tech career. Scholarships available.", hashtags: ["#CodingBootcamp", "#TechCareers", "#Upskill"], scheduledAt: "2026-06-08T09:00:00Z", status: "scheduled" },
  { id: "p7", clientId: "1", platform: "facebook", content: "Need legal advice? We offer free 30-minute consultations for criminal defence matters. No obligation.", hashtags: ["#CriminalDefence", "#LegalAdvice", "#BirminghamSolicitor"], scheduledAt: "2026-06-11T10:00:00Z", status: "draft", aiPrompt: "Create a reassuring post about free legal consultations" },
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
  { id: 9, businessName: "Halal Foodie Tours", description: "Guided food tours of Birmingham's best halal restaurants. Partner with eateries for commission deals.", estimatedRevenue: "£2K–£6K/month", startupCost: "£400", difficulty: "Easy" },
  { id: 10, businessName: "EcoCourier UK", description: "Green delivery service using electric vans. Target ethical brands and local businesses.", estimatedRevenue: "£6K–£15K/month", startupCost: "£15,000", difficulty: "Expert" },
  { id: 11, businessName: "DentalLeads AI", description: "AI-powered patient acquisition for private dentists. Automated Google Ads + retargeting.", estimatedRevenue: "£3K–£8K/month", startupCost: "£800", difficulty: "Medium" },
  { id: 12, businessName: "SensoryBox Subscription", description: "Monthly curated sensory toy boxes for autistic children. Partner with occupational therapists.", estimatedRevenue: "£2K–£5K/month", startupCost: "£500", difficulty: "Medium" },
];
