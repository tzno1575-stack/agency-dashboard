"use client";

import { useState } from "react";
import { BookOpen, Edit3, Search, BarChart3, DollarSign, Plus, Trash2, TrendingUp } from "lucide-react";

interface KdpBook {
  id: string;
  title: string;
  subtitle: string;
  niche: string;
  status: "drafting" | "editing" | "published" | "launching";
  royalties: number;
  reviews: number;
  rating: number;
  keywords: string[];
  publishedDate: string;
  notes: string;
}

export default function KdpHub() {
  const [books, setBooks] = useState<KdpBook[]>([
    {
      id: "book-1",
      title: "AI Side Hustles for Beginners",
      subtitle: "10 Ways to Make Money with Artificial Intelligence in 2026",
      niche: "AI & Technology",
      status: "drafting",
      royalties: 0,
      reviews: 0,
      rating: 0,
      keywords: ["AI for beginners", "make money with AI", "side hustle ideas", "passive income AI"],
      publishedDate: "",
      notes: "Target audience: complete beginners. Competitor research shows top 3 books have weak covers and under 50 reviews.",
    },
  ]);

  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", niche: "", notes: "" });
  const [nicheSearch, setNicheSearch] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const totalRoyalties = books.filter(b => b.status === "published" || b.status === "launching").reduce((s, b) => s + b.royalties, 0);
  const publishedCount = books.filter(b => b.status === "published" || b.status === "launching").length;
  const totalReviews = books.reduce((s, b) => s + b.reviews, 0);

  const statusColors: Record<KdpBook["status"], string> = {
    drafting: "text-yellow-400 bg-yellow-500/10",
    editing: "text-blue-400 bg-blue-500/10",
    published: "text-green-400 bg-green-500/10",
    launching: "text-purple-400 bg-purple-500/10",
  };

  const handleAddBook = () => {
    if (!newBook.title.trim()) return;
    const book: KdpBook = {
      id: `book-${Date.now()}`,
      ...newBook,
      subtitle: "",
      status: "drafting",
      royalties: 0,
      reviews: 0,
      rating: 0,
      keywords: [],
      publishedDate: "",
    };
    setBooks([book, ...books]);
    setNewBook({ title: "", niche: "", notes: "" });
    setShowAddBook(false);
  };

  const handleStatusChange = (id: string, status: KdpBook["status"]) => {
    setBooks(books.map(b => b.id === id ? { ...b, status, publishedDate: status === "published" ? new Date().toISOString() : b.publishedDate } : b));
  };

  const handleDelete = (id: string) => setBooks(books.filter(b => b.id !== id));

  // Niche research suggestions (mock data)
  const nicheIdeas = [
    { niche: "Keto Diet for Beginners", reviews: 45, rating: 4.2, competition: "Medium" },
    { niche: "ADHD Productivity", reviews: 28, rating: 3.9, competition: "Low" },
    { niche: "Minimalist Living", reviews: 62, rating: 4.4, competition: "Medium" },
    { niche: "Remote Work Success", reviews: 31, rating: 4.0, competition: "Low" },
    { niche: "Islamic Finance Basics", reviews: 12, rating: 4.7, competition: "Very Low" },
  ];

  const filteredNiches = nicheIdeas.filter(n =>
    !nicheSearch || n.niche.toLowerCase().includes(nicheSearch.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <BookOpen size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">KDP Hub</h2>
          <p className="text-xs text-gray-500">Kindle Direct Publishing — book tracker & research</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#1a1a1a] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Books</p>
          <p className="text-lg font-bold text-black">{books.length}</p>
          <p className="text-[10px] text-gray-500">{publishedCount} published</p>
        </div>
        <div className="bg-white border border-[#1a1a1a] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Reviews</p>
          <p className="text-lg font-bold text-black">{totalReviews}</p>
        </div>
        <div className="bg-white border border-[#1a1a1a] rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Royalties</p>
          <p className="text-lg font-bold text-green-400">£{totalRoyalties.toFixed(2)}</p>
        </div>
      </div>

      {/* Niche Research */}
      <div className="bg-white border border-[#1a1a1a] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-gray-800">NICHE RESEARCHER</span>
        </div>
        <input
          value={nicheSearch}
          onChange={(e) => setNicheSearch(e.target.value)}
          placeholder="Search niches... (e.g., 'ADHD', 'keto', 'Islam')"
          className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 mb-3"
        />
        <div className="space-y-2">
          {filteredNiches.map((n, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5">
              <div>
                <p className="text-xs font-medium text-gray-800">{n.niche}</p>
                <p className="text-[10px] text-gray-500">
                  Top book: {n.reviews} reviews · {n.rating}★ · Competition: {n.competition}
                </p>
              </div>
              <button
                onClick={() => { setNewBook({ title: n.niche, niche: n.niche, notes: `Top book has ${n.reviews} reviews — beatable with better cover and content.` }); setShowAddBook(true); }}
                className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors">
                Target
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Book */}
      <button onClick={() => setShowAddBook(!showAddBook)}
        className="flex items-center gap-2 w-full py-2.5 bg-white border border-dashed border-[#1a1a1a] rounded-xl text-xs text-gray-500 hover:text-gray-800 hover:border-[#3b82f6]/50 transition-all mb-4">
        <Plus size={14} /> Add Book
      </button>

      {showAddBook && (
        <div className="bg-white border border-[#1a1a1a] rounded-xl p-4 mb-4 space-y-3">
          <input placeholder="Book title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
          <input placeholder="Niche / category" value={newBook.niche} onChange={e => setNewBook({...newBook, niche: e.target.value})}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50" />
          <textarea placeholder="Research notes..." value={newBook.notes} onChange={e => setNewBook({...newBook, notes: e.target.value})}
            className="w-full bg-white border border-[#1a1a1a] rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 resize-none h-16" />
          <button onClick={handleAddBook}
            className="w-full py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-black text-xs rounded-lg transition-colors">
            Add Book
          </button>
        </div>
      )}

      {/* Books list */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Your Books</h3>
        {books.map(book => (
          <div key={book.id} className="bg-white border border-[#1a1a1a] rounded-xl overflow-hidden">
            <button onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1e2440]/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-black truncate">{book.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[book.status]}`}>{book.status}</span>
                    {book.niche && <span className="text-[10px] text-gray-500">{book.niche}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {book.status === "published" || book.status === "launching" ? (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">{book.reviews} reviews</p>
                    <p className="text-xs font-semibold text-green-400">£{book.royalties.toFixed(2)}</p>
                  </div>
                ) : null}
                <span className="text-gray-500 text-xs">{expandedBook === book.id ? "▲" : "▼"}</span>
              </div>
            </button>

            {expandedBook === book.id && (
              <div className="px-4 pb-4 border-t border-[#1a1a1a] space-y-3 mt-3">
                {/* Status changer */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["drafting", "editing", "published", "launching"] as KdpBook["status"][]).map(s => (
                      <button key={s} onClick={() => handleStatusChange(book.id, s)}
                        className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${book.status === s ? statusColors[s] + " font-semibold" : "bg-white text-gray-500 hover:text-gray-500"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                {book.keywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {book.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {book.notes && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-xs text-gray-500 bg-white rounded-lg p-2.5">{book.notes}</p>
                  </div>
                )}

                {/* Royalty input (for published books) */}
                {(book.status === "published" || book.status === "launching") && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Update Royalties</p>
                    <div className="flex gap-2">
                      <input type="number" placeholder="£0.00"
                        className="flex-1 bg-white border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#3b82f6]/50"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setBooks(books.map(b => b.id === book.id ? { ...b, royalties: val } : b));
                        }}
                      />
                      <input type="number" placeholder="Reviews"
                        className="w-20 bg-white border border-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#3b82f6]/50"
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setBooks(books.map(b => b.id === book.id ? { ...b, reviews: val } : b));
                        }}
                      />
                    </div>
                  </div>
                )}

                <button onClick={() => handleDelete(book.id)}
                  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={12} /> Remove book
                </button>
              </div>
            )}
          </div>
        ))}

        {books.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-8">No books yet. Add your first KDP book above.</p>
        )}
      </div>
    </div>
  );
}
