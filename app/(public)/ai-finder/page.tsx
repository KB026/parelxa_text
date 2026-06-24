import { getAgents, getCategories } from "@/lib/api";
import { Agent, Category } from "@/lib/types";
import { AIFinder } from "@/components/parlexa/search/AIFinder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tool Finder | Parlexa â€” The Global AI Agent Marketplace",
  description: "Find the perfect AI solutions for your business using our intelligent matching engine.",
};

export default async function AIFinderPage() {
  // Fetch dynamic data
  let agents: Agent[] = [];
  let categories: Category[] = [];
  
  try {
    const [a, c] = await Promise.all([
      getAgents(),
      getCategories()
    ]);
    agents = a;
    categories = c;
  } catch (err) {
    console.error('Finder: DB fetch failed:', err);
  }

  return (
    <div style={{ padding: '120px 20px 80px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <AIFinder agents={agents} categories={categories} />
      </div>
    </div>
  );
}
