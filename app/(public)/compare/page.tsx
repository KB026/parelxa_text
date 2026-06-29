'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Agent } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/button';

export default function ComparePage() {
  const { selectedIds } = useCompare();
  const [data, setData] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      if (selectedIds.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('agents')
        .select('*')
        .in('id', selectedIds);
      
      setData((data as unknown as Agent[]) || []);
      setLoading(false);
    };
    
    fetchAgents();
  }, [selectedIds]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 pt-32 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Compare Tools</h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4">Tool</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(agent => (
                <tr key={agent.id} className="border-b border-gray-700">
                  <td className="p-4 font-semibold">{agent.name}</td>
                  <td className="p-4">{agent.category}</td>
                  <td className="p-4">{agent.rating ? agent.rating.toFixed(1) : 'N/A'} ⭐</td>
                  <td className="p-4">{agent.pricing}</td>
                  <td className="p-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        const url = agent.website ? (agent.website.startsWith('http') ? agent.website : `https://${agent.website}`) : '#';
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Visit Website
                    </Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No tools selected for comparison. Add tools from the marketplace!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
