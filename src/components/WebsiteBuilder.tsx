"use client";

import { useState } from "react";
import { Globe, Server, ShoppingCart, TrendingUp, Copy, ExternalLink, Check, Zap, Star, PlusCircle, DollarSign } from "lucide-react";

type Tab = "builder" | "hosting" | "domains" | "commissions";

// ── HOSTING AFFILIATE PARTNERS ──
const HOSTING_PARTNERS = [
  {
    name: "SiteGround",
    logo: "🟠",
    affiliateUrl: "https://www.siteground.com/recommended?referrer_id=YOUR_ID",
    commission: "£50-100 per signup",
    recurring: true,
    price: "From £2.99/mo",
    features: ["Free SSL", "Daily backups", "24/7 support", "WordPress optimized"],
    bestFor: "Client websites, WordPress",
  },
  {
    name: "Hostinger",
    logo: "🟣",
    affiliateUrl: "https://www.hostinger.com/referral/YOUR_ID",
    commission: "£40-80 per signup",
    recurring: true,
    price: "From £2.49/mo",
    features: ["Free domain", "Free SSL", "hPanel", "LiteSpeed cache"],
    bestFor: "Budget hosting, beginners",
  },
  {
    name: "Vercel",
    logo: "⬛",
    affiliateUrl: "https://vercel.com",
    commission: "Free tier available",
    recurring: false,
    price: "Free — $20/mo Pro",
    features: ["Auto-deploy from Git", "Edge network", "Serverless", "Analytics"],
    bestFor: "Next.js sites, dashboards",
  },
  {
    name: "Cloudflare Pages",
    logo: "🟡",
    affiliateUrl: "https://pages.cloudflare.com",
    commission: "Free tier available",
    recurring: false,
    price: "Free — unlimited sites",
    features: ["Global CDN", "Free SSL", "Git integration", "Workers"],
    bestFor: "Static sites, JAMstack",
  },
];

const DOMAIN_PARTNERS = [
  {
    name: "Namecheap",
    logo: "🟠",
    affiliateUrl: "https://www.namecheap.com/?aff=YOUR_ID",
    commission: "15-30% per sale",
    price: ".com from £5.98/yr",
    features: ["Free WHOIS privacy", "DNS management", "Email forwarding"],
  },
  {
    name: "Cloudflare Registrar",
    logo: "🟡",
    affiliateUrl: "https://www.cloudflare.com/products/registrar/",
    commission: "At-cost (no affiliate)",
    price: ".com £8.03/yr (at cost)",
    features: ["Free WHOIS privacy", "DDoS protection", "Fast DNS"],
  },
];

const TEMPLATES = [
  { id: "solicitor", name: "Law Firm", icon: "⚖️", desc: "Professional solicitor site. Pages: Home, About, Services, Contact, Blog." },
  { id: "restaurant", name: "Restaurant / Takeaway", icon: "🍽️", desc: "Menu, online ordering, location, reviews. Halal badge included." },
  { id: "barber", name: "Barber / Salon", icon: "💈", desc: "Gallery, services, booking link, location. Clean, modern." },
  { id: "plumber", name: "Trade / Service Business", icon: "🔧", desc: "Services list, area coverage, reviews, contact form, emergency callout." },
  { id: "landing", name: "Landing Page / Lead Gen", icon: "📋", desc: "Single page. Hero, features, testimonials, CTA. Capture leads." },
  { id: "ecommerce", name: "Simple Shop", icon: "🛍️", desc: "Product grid, cart, checkout. For small halal businesses." },
];

const CASE_STUDIES = [
  {
    client: "Maurice Andrews Solicitors",
    type: "Law Firm",
    url: "https://maurice-original-navy-2ak.pages.dev",
    result: "Pixel-perfect clone. 100% match. Deployed on Cloudflare.",
    testimony: "Professional, fast, exactly what we needed.",
  },
  {
    client: "Tesla Glow Rides",
    type: "Private Hire",
    url: "https://facebook.com/TeslaRides",
    result: "AutoPilot managed. Facebook posts + Messenger auto-replies live.",
    testimony: "Built + automated in under 2 hours.",
  },
];

export default function WebsiteBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>("builder");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedSite, setGeneratedSite] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyAffiliate = async (url: string, name: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const openAffiliate = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-800">Site Builder</h2>
          <span className="text-[10px] text-emerald-400/70 ml-auto">Build & Earn</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-[#FDFBF7] border-b border-[#1a1a1a] shrink-0 flex gap-1">
        {([
          { id: "builder" as Tab, label: "Build Site", icon: Zap },
          { id: "hosting" as Tab, label: "Hosting", icon: Server },
          { id: "domains" as Tab, label: "Domains", icon: Globe },
          { id: "commissions" as Tab, label: "Commissions", icon: DollarSign },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* === BUILD SITE TAB === */}
        {activeTab === "builder" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Quick start */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Zap size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Build a website in 2 minutes</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Pick a template → we generate the code → deploy to hosting (earn commission)
                  </p>
                  <div className="flex gap-2">
                    {["1. Choose template", "2. Generate site", "3. Deploy & earn"].map((step, i) => (
                      <span key={i} className="text-[10px] bg-[#FDFBF7] text-gray-500 px-2 py-1 rounded-full">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-3">Choose a template</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      selectedTemplate === tpl.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-[#1a1a1a] bg-white hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">{tpl.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{tpl.name}</div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">{tpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {selectedTemplate && (
              <button
                onClick={() => setGeneratedSite(true)}
                className="w-full py-2.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                Generate {TEMPLATES.find(t => t.id === selectedTemplate)?.name} Site
              </button>
            )}

            {/* Generated site preview */}
            {generatedSite && selectedTemplate && (
              <div className="bg-white border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-gray-800">Site generated!</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Ready to deploy</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>📁 Generated: pages, components, styles, config</div>
                  <div>🎨 Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</div>
                  <div>📱 Mobile-responsive, SEO-ready, PWA</div>
                </div>
                <div className="mt-3 p-3 bg-[#FDFBF7] rounded border border-[#1a1a1a] flex items-center justify-between">
                  <code className="text-[11px] text-gray-500">git clone & npm install & npm run dev</code>
                  <button
                    onClick={() => copyAffiliate("git clone ...", "site")}
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded"
                  >
                    {copiedLink === "site" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveTab("hosting")}
                    className="flex-1 py-1.5 text-xs bg-[#1e293b] text-gray-800 rounded hover:bg-[#2a3446] flex items-center justify-center gap-1"
                  >
                    <Server size={12} /> Deploy to Hosting →
                  </button>
                  <button
                    onClick={() => setActiveTab("domains")}
                    className="flex-1 py-1.5 text-xs bg-[#1e293b] text-gray-800 rounded hover:bg-[#2a3446] flex items-center justify-center gap-1"
                  >
                    <Globe size={12} /> Buy Domain →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === HOSTING TAB === */}
        {activeTab === "hosting" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Server size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-gray-800">Hosting Partners</h3>
              <span className="text-[10px] text-purple-400 ml-auto">You earn commission on every signup</span>
            </div>

            {HOSTING_PARTNERS.map((partner) => (
              <div key={partner.name} className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{partner.logo}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{partner.name}</div>
                      <div className="text-[11px] text-gray-500">{partner.price}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                    {partner.commission}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {partner.features.map((f) => (
                    <span key={f} className="text-[10px] bg-[#FDFBF7] text-gray-500 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>

                <div className="text-[10px] text-gray-500 mb-3">Best for: {partner.bestFor}</div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAffiliate(partner.affiliateUrl)}
                    className="flex-1 py-1.5 text-xs bg-purple-600 text-black rounded hover:bg-purple-700 flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} /> Sign Up & Earn
                  </button>
                  <button
                    onClick={() => copyAffiliate(partner.affiliateUrl, partner.name)}
                    className="p-1.5 text-gray-500 hover:text-gray-800"
                    title="Copy affiliate link"
                  >
                    {copiedLink === partner.name ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <div className="p-3 bg-[#E8F5E9] border border-[#3b82f6]/20 rounded-lg">
              <div className="flex gap-2 text-xs text-gray-500">
                <span>💡</span>
                <span>
                  <strong className="text-gray-800">Pro tip:</strong> For free hosting, use Cloudflare Pages or Vercel. For client sites with email/WordPress, recommend SiteGround — you earn £50-100 per signup.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === DOMAINS TAB === */}
        {activeTab === "domains" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-800">Domain Partners</h3>
              <span className="text-[10px] text-blue-400 ml-auto">Commission on every domain</span>
            </div>

            {DOMAIN_PARTNERS.map((partner) => (
              <div key={partner.name} className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{partner.logo}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{partner.name}</div>
                      <div className="text-[11px] text-gray-500">{partner.price}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                    {partner.commission}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {partner.features.map((f) => (
                    <span key={f} className="text-[10px] bg-[#FDFBF7] text-gray-500 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openAffiliate(partner.affiliateUrl)}
                    className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} /> Buy Domain
                  </button>
                  <button
                    onClick={() => copyAffiliate(partner.affiliateUrl, partner.name)}
                    className="p-1.5 text-gray-500 hover:text-gray-800"
                    title="Copy affiliate link"
                  >
                    {copiedLink === partner.name ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === COMMISSIONS TAB === */}
        {activeTab === "commissions" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="text-[10px] text-gray-500 mb-1">Total Commissions</div>
                <div className="text-lg font-semibold text-emerald-400">£0</div>
                <div className="text-[10px] text-gray-500 mt-1">No signups yet</div>
              </div>
              <div className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                <div className="text-[10px] text-gray-500 mb-1">Pending</div>
                <div className="text-lg font-semibold text-amber-400">£0</div>
                <div className="text-[10px] text-gray-500 mt-1">Awaiting confirmation</div>
              </div>
            </div>

            {/* Case studies */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Star size={12} className="text-amber-400" />
                Success Stories
              </h4>
              <div className="space-y-3">
                {CASE_STUDIES.map((cs) => (
                  <div key={cs.client} className="bg-white border border-[#1a1a1a] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{cs.client}</div>
                        <div className="text-[10px] text-gray-500">{cs.type}</div>
                      </div>
                      <button
                        onClick={() => window.open(cs.url, "_blank")}
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={10} /> View
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{cs.result}</div>
                    <div className="text-[11px] text-gray-500 italic">"{cs.testimony}"</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting started */}
            <div className="p-4 bg-[#FDFBF7] border border-[#1a1a1a] rounded-lg">
              <h4 className="text-xs font-medium text-gray-800 mb-2">How to start earning</h4>
              <div className="space-y-2 text-[11px] text-gray-500">
                <div className="flex gap-2">
                  <span className="text-emerald-400">1.</span>
                  <span>Sign up for SiteGround and Namecheap affiliate programs (free)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">2.</span>
                  <span>Replace "YOUR_ID" in the affiliate links with your affiliate IDs</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">3.</span>
                  <span>Build a client site → recommend hosting + domain → earn commission</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">4.</span>
                  <span>Recurring hosting commissions = passive income per client</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
