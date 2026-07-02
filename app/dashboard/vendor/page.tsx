/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, Users, Eye, Bookmark, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VendorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch vendor's listings
  const { data: vendorListings } = await supabase
    .from('agents')
    .select('id, name, approval_status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const agentIds = vendorListings?.map(a => a.id) || [];
  const listedToolsCount = agentIds.length;

  // 2. Compute stats across all owned listings
  let totalClicks = 0;
  let leadsThisMonth = 0;
  let leadsLastMonth = 0;
  let savedToolsCount = 0;
  const clicksPerAgent: Record<number, number> = {};

  if (agentIds.length > 0) {
    // Fetch all clicks for the vendor's agents
    const { data: allClicks } = await supabase
      .from('agent_interactions')
      .select('agent_id, created_at')
      .eq('action_type', 'cta_click')
      .in('agent_id', agentIds);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    if (allClicks) {
      totalClicks = allClicks.length;
      allClicks.forEach(click => {
        const clickDate = new Date(click.created_at);
        clicksPerAgent[click.agent_id] = (clicksPerAgent[click.agent_id] || 0) + 1;
        
        if (clickDate >= thirtyDaysAgo) {
          leadsThisMonth++;
        } else if (clickDate >= sixtyDaysAgo && clickDate < thirtyDaysAgo) {
          leadsLastMonth++;
        }
      });
    }

    // Fetch how many times these tools were saved by any user
    const { count: savedCount } = await supabase
      .from('saved_tools' as any)
      .select('*', { count: 'exact', head: true })
      .in('agent_id', agentIds);
    savedToolsCount = savedCount || 0;
  }

  let growthPercentage = 0;
  if (leadsLastMonth === 0 && leadsThisMonth > 0) {
    growthPercentage = 100;
  } else if (leadsLastMonth > 0) {
    growthPercentage = Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100);
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Vendor Dashboard</h1>
          <p className="text-gray-400">Manage your tools and track leads</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <BarChart3 className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{listedToolsCount}</div>
            <div className="text-sm text-gray-400">Listed Tools</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <Eye className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">{totalClicks}</div>
            <div className="text-sm text-gray-400">Total Clicks</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <Users className="w-6 h-6 text-purple-400 mb-2" />
              <div className="text-2xl font-bold text-white">{leadsThisMonth}</div>
              <div className="text-sm text-gray-400">Leads (30d)</div>
            </div>
            <div className="mt-3 text-sm font-medium flex items-center">
              {growthPercentage > 0 ? (
                <span className="text-green-500 flex items-center gap-1"><TrendingUp size={16} /> {growthPercentage}%</span>
              ) : growthPercentage < 0 ? (
                <span className="text-red-500 flex items-center gap-1"><TrendingDown size={16} /> {Math.abs(growthPercentage)}%</span>
              ) : (
                <span className="text-gray-500">No change</span>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <Bookmark className="w-6 h-6 text-sky-400 mb-2" />
            <div className="text-2xl font-bold text-white">{savedToolsCount}</div>
            <div className="text-sm text-gray-400">Saved Tools</div>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Listings</h2>
            <Link href="/dashboard/vendor/listings/new">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white">
                + Add Tool
              </button>
            </Link>
          </div>

          {listedToolsCount === 0 ? (
            <p className="text-gray-400 text-center py-8">Your listed tools will appear here</p>
          ) : (
            <div className="flex flex-col gap-4">
              {vendorListings?.map(listing => (
                <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                  <div>
                    <div className="font-semibold text-white text-lg">{listing.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        listing.approval_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        listing.approval_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {listing.approval_status === 'approved' ? 'Live' : 
                         listing.approval_status === 'rejected' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Total Clicks</div>
                    <div className="font-bold text-white text-lg">{clicksPerAgent[listing.id] || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
