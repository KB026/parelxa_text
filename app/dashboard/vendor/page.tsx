/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  BarChart3, Users, Eye, Bookmark, TrendingUp, TrendingDown, 
  FileText, Plus, ShieldCheck, Zap, ArrowUpRight, 
  CheckCircle2, Clock, AlertCircle, Sparkles, MessageSquare, ExternalLink, Settings
} from 'lucide-react';
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

  // 1. Fetch vendor profile & verification request
  const [profileRes, verifRes] = await Promise.all([
    supabase.from('profiles').select('role, created_at').eq('id', user.id).maybeSingle(),
    supabase.from('verification_requests').select('status, company_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  ]);

  const verificationReq = verifRes.data;

  // 2. Fetch vendor's listings
  const { data: vendorListings } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  const agentIds = vendorListings?.map(a => a.id) || [];
  const listedToolsCount = agentIds.length;
  const activeToolsCount = vendorListings?.filter(a => a.approval_status === 'approved').length || 0;

  // 3. Compute stats across all owned listings
  let totalClicks = 0;
  let leadsThisMonth = 0;
  let leadsLastMonth = 0;
  let savedToolsCount = 0;
  const clicksPerAgent: Record<number, number> = {};

  if (agentIds.length > 0) {
    // Fetch interactions
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

    // Fetch how many times tools were saved
    const { count: savedCount } = await supabase
      .from('saved_tools' as any)
      .select('*', { count: 'exact', head: true })
      .in('agent_id', agentIds);
    savedToolsCount = savedCount || 0;
  }

  // 4. Fetch recent inbound leads
  let recentLeads: any[] = [];
  try {
    const { data: leadsData } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    recentLeads = leadsData || [];
  } catch {
    recentLeads = [];
  }

  // Growth percentage calculation
  let growthPercentage = 0;
  if (leadsLastMonth === 0 && leadsThisMonth > 0) {
    growthPercentage = 100;
  } else if (leadsLastMonth > 0) {
    growthPercentage = Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100);
  }

  // Find top performing tool
  let topTool: any = null;
  let maxClicks = -1;
  if (vendorListings && vendorListings.length > 0) {
    vendorListings.forEach(agent => {
      const clicks = clicksPerAgent[agent.id] || 0;
      if (clicks > maxClicks) {
        maxClicks = clicks;
        topTool = agent;
      }
    });
  }

  // Current vendor plan
  const activePlan = ((vendorListings?.find(a => (a as any).vendor_plan) as any)?.vendor_plan) || 'Free';

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-full">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">
              Vendor Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Hub
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Monitor real-time buyer engagement, active listings, and inbound leads.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/dashboard/vendor/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool</span>
          </Link>
          <Link
            href="/dashboard/vendor/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-white/[0.08] transition-colors"
          >
            <span>Deep Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Top Compact KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Metric 1: Listed Tools */}
        <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listed Tools</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{listedToolsCount}</span>
            <span className="text-[11px] text-emerald-400 font-medium">({activeToolsCount} Active)</span>
          </div>
        </div>

        {/* Metric 2: Total Clicks */}
        <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{totalClicks}</span>
            <span className="text-[11px] text-slate-400 font-medium">Buyer visits</span>
          </div>
        </div>

        {/* Metric 3: Leads 30d */}
        <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads (30d)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{leadsThisMonth}</span>
            {growthPercentage > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +{growthPercentage}%
              </span>
            ) : growthPercentage < 0 ? (
              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> {growthPercentage}%
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Stable</span>
            )}
          </div>
        </div>

        {/* Metric 4: Saved Shortlist */}
        <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyer Saves</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{savedToolsCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">In wishlists</span>
          </div>
        </div>
      </div>

      {/* Main Side-by-Side 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Listings + Recent Inbound Activity */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: My Listings List */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">My AI Tool Listings</h2>
                <p className="text-slate-400 text-xs mt-0.5">Active directory listings and click performance</p>
              </div>
              <Link 
                href="/dashboard/vendor/listings"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All ({listedToolsCount})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {listedToolsCount === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-900/30 rounded-xl border border-slate-800/60 border-dashed">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">No AI tools published yet</h3>
                <p className="text-slate-400 text-xs mb-4 max-w-sm mx-auto">
                  List your first enterprise tool or autonomous agent to start acquiring inbound leads.
                </p>
                <Link href="/dashboard/vendor/listings/new">
                  <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-semibold transition-all">
                    + Publish a Tool
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                {vendorListings?.slice(0, 5).map(listing => (
                  <div 
                    key={listing.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5">
                        {listing.logo_url ? (
                          <img src={listing.logo_url} alt={listing.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          listing.name?.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link 
                            href={`/dashboard/vendor/listings/${listing.id}/edit`}
                            className="font-semibold text-white text-sm hover:text-blue-400 transition-colors truncate"
                          >
                            {listing.name}
                          </Link>
                          {listing.category && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {listing.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            listing.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            listing.approval_status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              listing.approval_status === 'approved' ? 'bg-emerald-400' :
                              listing.approval_status === 'rejected' ? 'bg-rose-400' :
                              'bg-amber-400'
                            }`}></span>
                            {listing.approval_status === 'approved' ? 'Active' : 
                             listing.approval_status === 'rejected' ? 'Needs Fix' : 'In Review'}
                          </span>

                          {(listing as any).vendor_plan && (listing as any).vendor_plan !== 'free' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {(listing as any).vendor_plan === 'pro' ? 'Scale' : 'Growth'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Clicks</div>
                        <div className="text-sm font-bold text-white">{clicksPerAgent[listing.id] || 0}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/products/${listing.slug || listing.id}`}
                          target="_blank"
                          title="View live public page"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link 
                          href={`/dashboard/vendor/listings/${listing.id}/edit`}
                          className="px-2.5 py-1 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Recent Inbound Leads / Inquiries */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Recent Inbound Leads</span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">High-intent buyer inquiries captured through your tool listings</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">{recentLeads.length} Recent</span>
            </div>

            {recentLeads.length === 0 ? (
              <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="text-slate-300 font-semibold mb-0.5">Automated Lead Matching Active</p>
                  <p className="text-slate-500">
                    Buyers browsing your tools can request direct demos or contact inquiries, which will appear here instantly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentLeads.map((lead, idx) => (
                  <div key={lead.id || idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{lead.customer_name || 'Anonymous Buyer'}</span>
                        <span className="text-slate-500 text-[11px] font-normal">&bull; {lead.customer_email}</span>
                      </div>
                      {lead.message && (
                        <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1 italic">
                          &ldquo;{lead.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-slate-500 text-[10px] shrink-0">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Plan Status, Verification & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Card 1: Active Plan & Monetization */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]/60 border border-indigo-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Current Plan</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                {activePlan} Tier
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {activePlan === 'Scale' || activePlan === 'pro' ? 'Scale Growth Plan' : 
               activePlan === 'Growth' ? 'Growth Plan' : 'Free Listing Tier'}
            </h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              {activePlan === 'Scale' || activePlan === 'pro' 
                ? 'Maximum priority placement in AI search and directory categories.' 
                : 'Upgrade to Growth or Scale to unlock verified maker badge and boosted search rank.'}
            </p>

            <Link 
              href="/dashboard/vendor/billing"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Manage Plan & Billing</span>
            </Link>
          </div>

          {/* Card 2: Maker Verification */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Maker Verification</h3>
            </div>

            <p className="text-slate-400 text-xs mb-3.5 leading-relaxed">
              {verificationReq?.status === 'approved' 
                ? 'Your maker profile is verified! Verified badges are active on your published listings.'
                : verificationReq?.status === 'submitted'
                ? 'Your verification request is currently under review by our audit team.'
                : 'Boost buyer confidence by verifying your business domain and maker identity.'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className={`font-bold capitalize ${
                verificationReq?.status === 'approved' ? 'text-emerald-400' :
                verificationReq?.status === 'submitted' ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {verificationReq?.status || 'Unverified'}
              </span>
            </div>

            {verificationReq?.status !== 'approved' && (
              <Link 
                href="/dashboard/vendor/verification"
                className="mt-3.5 w-full block text-center py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.08] transition-colors"
              >
                {verificationReq?.status === 'submitted' ? 'Check Status' : 'Request Verification'}
              </Link>
            )}
          </div>

          {/* Card 3: Quick Navigation Shortcuts */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Management Shortcuts</h3>
            <div className="flex flex-col gap-1.5">
              <Link 
                href="/dashboard/vendor/reviews" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400">⭐</span>
                  <span>Customer Reviews</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/vendor/resolution" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Resolution Center</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/vendor/settings" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
