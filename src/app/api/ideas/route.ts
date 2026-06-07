import { NextResponse } from "next/server";
import { sampleIdeas } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json({ ideas: sampleIdeas });
  } catch {
    return NextResponse.json({ ideas: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { skills, budget, location } = await request.json();

    // In future: call local LLM with user params to generate custom ideas
    // For now: return sample ideas, shuffled for variety
    const shuffled = [...sampleIdeas].sort(() => Math.random() - 0.5);
    const filtered = shuffled.filter((idea) => {
      const budgetNum = parseInt(budget || "0");
      const costNum = parseInt(idea.startupCost.replace(/[^0-9]/g, ""));
      return costNum <= budgetNum;
    });

    const result = filtered.length >= 2 ? filtered.slice(0, 4) : shuffled.slice(0, 4);

    return NextResponse.json({ ideas: result, params: { skills, budget, location } });
  } catch {
    return NextResponse.json({ ideas: sampleIdeas.slice(0, 4) });
  }
}
