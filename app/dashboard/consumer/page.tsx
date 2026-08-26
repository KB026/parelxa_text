/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bookmark, Star, ArrowRightLeft, User, Sparkles, ArrowRight, ExternalLink, Bot, Compass } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ConsumerDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch consumer counts & recent saved tools
  const [savedCountRes, reviewsCountRes, recentSavedRes] = await Promise.all([
    supabase.from('saved_tools' as any).select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    (supabase as any).from('saved_tools').select('id, created_at, agents(id, name, slug, logo_url, rating, summary, category)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4)
  ]);

  const savedToolsCount = savedCountRes.count || 0;
  const reviewsCount = reviewsCountRes.count || 0;
  const recentSaved = (recentSavedRes.data || []).map((item: any) => item.agents).filter(Boolean);

  return (
    <div className="w-full animate-in fade-in duration-500 max-w-full">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 tracking-tight">
              User Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Workspace
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Manage your AI tool shortlist, browse evaluations, and discover enterprise models.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link 
            href="/ai-finder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-sky-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Finder</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium border border-white/[0.08] transition-colors"
          >
            <span>Explore All</span>
            <Compass className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/dashboard/consumer/saved-tools" className="block group">
          <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden group-hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Shortlist</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{savedToolsCount}</span>
              <span className="text-[11px] text-sky-400 font-medium">Tools saved &rarr;</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/consumer/reviews" className="block group">
          <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden group-hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Reviews</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{reviewsCount}</span>
              <span className="text-[11px] text-amber-400 font-medium">Feedback submitted &rarr;</span>
            </div>
          </div>
        </Link>

        <Link href="/compare" className="block group">
          <div className="bg-[#0b1120]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden group-hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compare Matrix</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active</span>
              <span className="text-[11px] text-teal-400 font-medium">Side-by-side &rarr;</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Saved Shortlist Preview & Quick Compare */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Saved Shortlist Panel */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-sky-400" />
                  <span>Recent Saved Tools</span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Quick access to bookmarked enterprise AI models</p>
              </div>
              <Link 
                href="/dashboard/consumer/saved-tools"
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All ({savedToolsCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentSaved.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-900/30 rounded-xl border border-slate-800/60 border-dashed">
                <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-1">Your shortlist is empty</h3>
                <p className="text-slate-400 text-xs mb-3 max-w-xs mx-auto">
                  Click the bookmark icon on any AI tool card to save it here for fast evaluation.
                </p>
                <Link href="/products">
                  <button className="px-3.5 py-1.5 bg-sky-600 text-white hover:bg-sky-500 rounded-lg text-xs font-semibold transition-all">
                    Browse AI Directory
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentSaved.map((agent: any) => (
                  <div key={agent.id} className="p-3.5 bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {agent.category || 'AI Tool'}
                        </span>
                        {agent.rating > 0 && (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            ★ {Number(agent.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm group-hover:text-sky-400 transition-colors mb-1 truncate">
                        {agent.name}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                        {agent.summary || 'Enterprise AI solution ready for integration.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs">
                      <Link 
                        href={`/products/${agent.slug || agent.id}`}
                        className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Stack Recommendation Section */}
          <div className="bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block mb-1">
                  Intelligent Matching
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  Find the exact AI stack for your business
                </h3>
                <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                  Answer 3 quick questions about your workflow to receive an instant verified recommendation tailored for enterprise scale.
                </p>
              </div>
              <Link 
                href="/ai-finder"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shrink-0 transition-all shadow-md shadow-sky-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch AI Finder</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Navigation & Hub */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Hub Panel */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Workspace Hub</h3>
            <div className="flex flex-col gap-1.5">
              <Link 
                href="/dashboard/consumer/saved-tools" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-sky-400" />
                  <span>Organized Folders</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link 
                href="/compare" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                  <span>Compare Agents</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/consumer/reviews" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>My Reviews</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>

              <Link 
                href="/dashboard/consumer/settings" 
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Profile Preferences</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Become a Vendor Card */}
          <div className="bg-[#0b1120]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">Building an AI Agent?</h3>
            <p className="text-slate-400 text-xs mb-3.5 leading-relaxed">
              List your product on Parlexa to reach enterprise decision-makers and generate verified inbound leads.
            </p>
            <Link 
              href="/dashboard/vendor/listings/new"
              className="w-full block text-center py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.08] transition-colors"
            >
              List Your Tool &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
