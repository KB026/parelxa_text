/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, Users, Eye, Bookmark, TrendingUp, TrendingDown, FileText } from 'lucide-react';
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
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
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
    // Fetch all interactions (clicks and leads) for the vendor's agents
    const { data: interactions } = await supabase
      .from('agent_interactions')
      .select('agent_id, created_at, action_type')
      .in('action_type', ['cta_click', 'lead_capture'])
      .in('agent_id', agentIds);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    if (interactions) {
      interactions.forEach(interaction => {
        if (interaction.action_type === 'cta_click') {
          totalClicks++;
          clicksPerAgent[interaction.agent_id] = (clicksPerAgent[interaction.agent_id] || 0) + 1;
        } else if (interaction.action_type === 'lead_capture') {
          if (!interaction.created_at) return;
          
          const date = new Date(interaction.created_at);
          if (date >= thirtyDaysAgo) {
            leadsThisMonth++;
          } else if (date >= sixtyDaysAgo && date < thirtyDaysAgo) {
            leadsLastMonth++;
          }
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
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-3 tracking-tight">
          Vendor Dashboard
        </h1>
        <p className="text-slate-400 text-lg font-medium">Manage your tools and track leads in real-time.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 shadow-lg hover:shadow-blue-500/10">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{listedToolsCount}</div>
            <div className="text-sm font-medium text-slate-400">Listed Tools</div>
          </div>
        </div>

        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              <Eye className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalClicks}</div>
            <div className="text-sm font-medium text-slate-400">Total Clicks</div>
          </div>
        </div>

        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{leadsThisMonth}</div>
            <div className="text-sm font-medium text-slate-400">Leads (30d)</div>
          </div>
          <div className="mt-4 text-sm font-semibold flex items-center relative z-10">
            {growthPercentage > 0 ? (
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg flex items-center gap-1.5"><TrendingUp size={14} /> +{growthPercentage}%</span>
            ) : growthPercentage < 0 ? (
              <span className="text-rose-400 bg-rose-400/10 px-2 py-1 rounded-lg flex items-center gap-1.5"><TrendingDown size={14} /> {growthPercentage}%</span>
            ) : (
              <span className="text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">No change</span>
            )}
          </div>
        </div>

        <div className="bg-[#0b1120]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-500 shadow-lg hover:shadow-sky-500/10">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform duration-500">
              <Bookmark className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{savedToolsCount}</div>
            <div className="text-sm font-medium text-slate-400">Saved Tools</div>
          </div>
        </div>
      </div>

      {/* My Listings */}
      <div className="bg-[#0b1120]/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">My Listings</h2>
            <p className="text-slate-400 text-sm">Manage and track performance of your AI tools</p>
          </div>
          <Link href="/dashboard/vendor/listings/new">
            <button className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Add Tool
            </button>
          </Link>
        </div>

        {listedToolsCount === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tools listed yet</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">Publish your first AI tool to our directory and start reaching enterprise clients today.</p>
            <Link href="/dashboard/vendor/listings/new">
              <button className="px-5 py-2.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 border border-blue-500/30 rounded-xl font-semibold transition-all">
                Publish a Tool
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {vendorListings?.map(listing => (
              <Link href={`/dashboard/vendor/listings/${listing.id}/edit`} key={listing.id} className="block group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300">
                  <div className="mb-4 sm:mb-0">
                    <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors mb-2">{listing.name}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        listing.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        listing.approval_status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          listing.approval_status === 'approved' ? 'bg-emerald-400' :
                          listing.approval_status === 'rejected' ? 'bg-rose-400' :
                          'bg-amber-400'
                        }`}></span>
                        {listing.approval_status === 'approved' ? 'Active' : 
                         listing.approval_status === 'rejected' ? 'Action Required' : 'In Review'}
                      </span>

                      {(listing as any).vendor_plan && (listing as any).vendor_plan !== 'free' && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {(listing as any).vendor_plan === 'pro' ? 'Scale (₹899/mo)' : 'Growth (₹499/mo)'}
                        </span>
                      )}

                      {listing.category && (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {listing.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Clicks</div>
                      <div className="font-bold text-white text-xl">{clicksPerAgent[listing.id] || 0}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</div>
                      <div className="font-semibold text-slate-300 text-sm">Published</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
