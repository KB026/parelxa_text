'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Agent } from '@/lib/types';
import { RequestDemoModal } from '@/components/parlexa/details/RequestDemoModal';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const agentsStr = searchParams.get('agents');
  const [data, setData] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoAgent, setDemoAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const agents = agentsStr ? agentsStr.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];
    
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('agents')
        .select('*')
        .in('id', agents);
      setData((data as unknown as Agent[]) || []);
      setLoading(false);
    };
    if (agents.length > 0) {
      fetch();
    } else {
      setLoading(false);
    }
  }, [agentsStr]);

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
                    <button 
                      onClick={() => setDemoAgent(agent)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                    >
                      Request Demo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {demoAgent && (
        <RequestDemoModal agent={demoAgent} onClose={() => setDemoAgent(null)} />
      )}
    </div>
  );
}
