"use client";

import { HelpTipsProvider } from "@/lib/HelpTipsContext";
import type { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <HelpTipsProvider>{children}</HelpTipsProvider>;
}
