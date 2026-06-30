'use client';
import { useUserRole } from '@/lib/auth/useUserRole';
import { BarChart3, Users, Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboard() {
  const { role, loading } = useUserRole();

  if (loading) return <div className="p-8">Loading...</div>;
  if (role !== 'vendor' && role !== 'admin') return <div className="p-8">Access denied</div>;

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
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-sm text-gray-400">Listed Tools</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <Eye className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-sm text-gray-400">Total Clicks</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <Users className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">89</div>
            <div className="text-sm text-gray-400">Leads This Month</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <div className="text-2xl font-bold text-white">+23%</div>
            <div className="text-sm text-gray-400">Growth</div>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Listings</h2>
            <Link href="/vendor/listings/new">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                + Add Tool
              </button>
            </Link>
          </div>

          <p className="text-gray-400 text-center py-8">Your listed tools will appear here</p>
        </div>

      </div>
    </div>
  );
}
