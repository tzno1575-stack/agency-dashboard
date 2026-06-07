"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface HelpTipsContextType {
  showTips: boolean;
  toggleTips: () => void;
}

const HelpTipsContext = createContext<HelpTipsContextType>({
  showTips: true,
  toggleTips: () => {},
});

export function HelpTipsProvider({ children }: { children: ReactNode }) {
  const [showTips, setShowTips] = useState(true);

  // Read saved preference on mount (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("aqd_help_tips");
      if (stored === "false") setShowTips(false);
    } catch {}
  }, []);

  const toggleTips = () => {
    setShowTips(prev => {
      const next = !prev;
      try { localStorage.setItem("aqd_help_tips", String(next)); } catch {}
      return next;
    });
  };

  return (
    <HelpTipsContext.Provider value={{ showTips, toggleTips }}>
      {children}
    </HelpTipsContext.Provider>
  );
}

export function useHelpTips() {
  return useContext(HelpTipsContext);
}
