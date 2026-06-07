"use client";

import { useState } from "react";
import { FileText, Lightbulb, Image, Link, BookOpen, CheckCircle, ChevronDown, ChevronRight, Save } from "lucide-react";

interface SpecStep {
  id: string;
  label: string;
  done: boolean;
  content: string;
}

interface SavedSpec {
  id: string;
  name: string;
  date: string;
  steps: SpecStep[];
}

export default function StandardsPanel() {
  const [specs, setSpecs] = useState<SavedSpec[]>([]);
  const [activeSpec, setActiveSpec] = useState<SpecStep[]>([
    { id: "scope", label: "What are we building?", done: false, content: "" },
    { id: "visuals", label: "Mockups or references?", done: false, content: "" },
    { id: "references", label: "Similar code in codebase?", done: false, content: "" },
    { id: "standards", label: "Which standards apply?", done: false, content: "" },
    { id: "plan", label: "Implementation plan", done: false, content: "" },
  ]);
  const [specName, setSpecName] = useState("");
  const [expandedStep, setExpandedStep] = useState<string | null>("scope");
  const [showSaved, setShowSaved] = useState(false);

  const activeStandards = [
    { id: "api-format", name: "API Response Format", desc: "All responses use { success, data, error } envelope" },
    { id: "naming", name: "Component Naming", desc: "PascalCase for components, camelCase for functions" },
    { id: "errors", name: "Error Handling", desc: "Use custom error codes: AUTH_001, DB_002, VAL_003" },
    { id: "styling", name: "Styling Convention", desc: "Tailwind only — bg-[#0a0e17], text-gray-200, border-[#1e293b]" },
  ];

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  const updateStep = (id: string, content: string) => {
    setActiveSpec(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  const toggleDone = (id: string) => {
    setActiveSpec(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const handleSaveSpec = () => {
    if (!specName.trim()) return;
    const spec: SavedSpec = {
      id: `spec-${Date.now()}`,
      name: specName,
      date: new Date().toISOString().split("T")[0],
      steps: [...activeSpec],
    };
    setSpecs([spec, ...specs]);
    setActiveSpec([
      { id: "scope", label: "What are we building?", done: false, content: "" },
      { id: "visuals", label: "Mockups or references?", done: false, content: "" },
      { id: "references", label: "Similar code in codebase?", done: false, content: "" },
      { id: "standards", label: "Which standards apply?", done: false, content: "" },
      { id: "plan", label: "Implementation plan", done: false, content: "" },
    ]);
    setSpecName("");
  };

  const doneCount = activeSpec.filter(s => s.done).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <FileText size={18} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Standards & Specs</h2>
          <p className="text-xs text-gray-500">Agent OS — spec-driven development</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#0f1320] rounded-lg p-1 border border-[#1e293b]">
        <button onClick={() => setShowSaved(false)}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${!showSaved ? "bg-[#1a1f2e] text-white" : "text-gray-500 hover:text-gray-300"}`}>
          ✍️ Shape Spec
        </button>
        <button onClick={() => setShowSaved(true)}
          className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${showSaved ? "bg-[#1a1f2e] text-white" : "text-gray-500 hover:text-gray-300"}`}>
          📚 Standards ({activeStandards.length})
        </button>
      </div>

      {!showSaved ? (
        <>
          {/* Shape Spec Builder */}
          <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2440] border border-[#2a3050] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-indigo-400" />
              <span className="text-xs font-semibold text-gray-300">SHAPE SPEC</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full ml-auto">{doneCount}/5 done</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={specName}
                onChange={(e) => setSpecName(e.target.value)}
                placeholder="Feature name (e.g., 'user-auth-system')"
                className="flex-1 bg-[#0f1320] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50"
              />
              <button onClick={handleSaveSpec} disabled={!specName.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs rounded-lg transition-colors shrink-0">
                <Save size={12} /> Save
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-1.5">
              {activeSpec.map(step => (
                <div key={step.id} className="bg-[#0f1320] rounded-lg overflow-hidden">
                  <button onClick={() => toggleStep(step.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#1a1f2e]/50 transition-colors">
                    <button onClick={(e) => { e.stopPropagation(); toggleDone(step.id); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${step.done ? "bg-green-500 border-green-500" : "border-gray-600"}`}>
                      {step.done && <CheckCircle size={12} className="text-white" />}
                    </button>
                    <span className={`text-xs flex-1 ${step.done ? "text-gray-500 line-through" : "text-gray-300"}`}>
                      {step.label}
                    </span>
                    {expandedStep === step.id ? <ChevronDown size={12} className="text-gray-600" /> : <ChevronRight size={12} className="text-gray-600" />}
                  </button>
                  {expandedStep === step.id && (
                    <div className="px-3 pb-3">
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                        placeholder={
                          step.id === "scope" ? "Describe what you're building in 2-3 sentences..."
                          : step.id === "visuals" ? "Paste links to mockups, screenshots, or design files..."
                          : step.id === "references" ? "Which existing files/features are similar? e.g., 'src/components/KanbanBoard.tsx'"
                          : step.id === "standards" ? "Which standards from the Standards tab apply? e.g., 'api-format, styling'"
                          : "Break it into numbered tasks. Task 1: Save spec documentation first."
                        }
                        className="w-full bg-[#0a0e17] border border-[#1e293b] rounded-lg p-2.5 text-xs text-gray-200 placeholder-gray-600 resize-none h-20 focus:outline-none focus:border-[#3b82f6]/50"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reference — Inject Standards */}
          <div className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold text-gray-300">INJECT STANDARDS</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Auto-load relevant standards based on what you're building. Agents read these before executing.</p>
            <div className="flex flex-wrap gap-1.5">
              {activeStandards.map(s => (
                <button key={s.id}
                  className="text-[10px] bg-[#0f1320] border border-[#1e293b] hover:border-indigo-500/50 text-gray-400 hover:text-white px-2.5 py-1 rounded-full transition-colors">
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Standards Reference */}
          <div className="space-y-3">
            {activeStandards.map(s => (
              <div key={s.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-1">{s.name}</h4>
                <p className="text-xs text-gray-400">{s.desc}</p>
                <code className="text-[10px] text-gray-600 mt-2 block">agent-os/standards/{s.id}.md</code>
              </div>
            ))}
          </div>

          {/* Saved Specs */}
          {specs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Saved Specs ({specs.length})</h3>
              <div className="space-y-2">
                {specs.map(spec => (
                  <div key={spec.id} className="bg-[#1a1f2e] border border-[#1e293b] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-white">{spec.name}</p>
                        <p className="text-[10px] text-gray-600">{spec.date} · {spec.steps.filter(s => s.done).length}/5 steps</p>
                      </div>
                      <button
                        onClick={() => { setActiveSpec(spec.steps); setSpecName(spec.name); setShowSaved(false); }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                        Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
