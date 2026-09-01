'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Building2, Store, ClipboardList, Sparkles, TrendingUp, 
    TrendingDown, Clock, CheckCircle2, X, ArrowRight, ShieldCheck,
    Users, MapPin, Database, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  totalVenues: number;
  totalVendors: number;
  pendingApplications: number;
  newThisWeek: number;
  recentActivity: any[];
}

export default function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (tab: string) => {
    router.push(`/admin?tab=${tab}`);
  };

  const cards = [
    { 
      label: 'Total Venues', 
      value: stats?.totalVenues || 0, 
      icon: <Building2 size={24} />, 
      color: 'bg-blue-500', 
      trend: 'Live Directory',
      tab: 'listings'
    },
    { 
      label: 'Total Vendors', 
      value: stats?.totalVendors || 0, 
      icon: <Store size={24} />, 
      color: 'bg-purple-500', 
      trend: 'Live Directory',
      tab: 'listings'
    },
    { 
      label: 'Pending Apps', 
      value: stats?.pendingApplications || 0, 
      icon: <ClipboardList size={24} />, 
      color: 'bg-amber-500', 
      trend: (stats?.pendingApplications || 0) > 0 ? `${stats?.pendingApplications} Needs Review` : 'All Clear',
      tab: 'applications'
    },
    { 
      label: 'New This Week', 
      value: stats?.newThisWeek || 0, 
      icon: <Sparkles size={24} />, 
      color: 'bg-emerald-500', 
      trend: 'Recent Growth',
      tab: 'applications'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">System Overview</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">Real-time statistics across listings, applications and users.</p>
          </div>
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            size="sm"
            className="rounded-xl text-xs font-bold gap-1.5"
          >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
      </div>

      {/* 1. Stat Cards (All Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigateTo(card.tab)}
            className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
             <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                    {card.icon}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    card.trend.includes('Review') ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-500'
                }`}>
                    {card.trend}
                </span>
             </div>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{card.label}</p>
             <div className="flex items-baseline justify-between">
                 <h3 className="text-3xl sm:text-4xl font-display font-black text-slate-900">
                     {loading ? '...' : card.value}
                 </h3>
                 <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                     View <ArrowRight size={12} />
                 </span>
             </div>
             
             {/* Decorative Background Icon */}
             <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity scale-150 rotate-12">
                {card.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 2. Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" /> Recent Applications & Submissions
                  </h3>
                  <Button 
                    onClick={() => navigateTo('applications')} 
                    variant="ghost" 
                    className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl"
                  >
                    View All Queue →
                  </Button>
              </div>
              
              <div className="space-y-4">
                  {stats?.recentActivity?.map((act) => (
                      <div 
                        key={act.id} 
                        onClick={() => navigateTo('applications')}
                        className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100"
                      >
                          <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  act.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                                  act.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                  'bg-amber-50 text-amber-600'
                              }`}>
                                  {act.status === 'approved' ? <CheckCircle2 size={18} /> : 
                                   act.status === 'rejected' ? <X size={18} /> : 
                                   <Clock size={18} />}
                              </div>
                              <div>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                                      <span className="text-slate-400 font-medium">[{act.venue_type || 'Listing'}]</span> {act.business_name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-medium">
                                      Status: <strong className="uppercase text-slate-600">{act.status}</strong> • {new Date(act.created_at).toLocaleDateString()}
                                  </p>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Inspect →
                          </span>
                      </div>
                  ))}
                  {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                      <div className="text-center py-12 text-slate-400 font-medium italic">
                          No recent applications recorded.
                      </div>
                  )}
              </div>
          </div>

          {/* 3. Quick Actions (Fixed Routing) */}
          <div className="bg-slate-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <h3 className="text-lg sm:text-xl font-display font-bold mb-6">Quick Navigation</h3>
                <div className="space-y-3.5">
                    <Button 
                        className="w-full h-13 rounded-xl sm:rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold transition-all justify-between px-5 group" 
                        onClick={() => navigateTo('applications')}
                    >
                        <span>Review Pending ({stats?.pendingApplications || 0})</span> 
                        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-xs">→</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full h-13 rounded-xl sm:rounded-2xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold justify-between px-5" 
                        onClick={() => navigateTo('listings')}
                    >
                        <span>Manage Live Directory</span>
                        <span className="opacity-40 text-xs">→</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full h-13 rounded-xl sm:rounded-2xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold justify-between px-5" 
                        onClick={() => navigateTo('users')}
                    >
                        <span>Audit User Accounts</span>
                        <span className="opacity-40 text-xs">→</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full h-13 rounded-xl sm:rounded-2xl border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold justify-between px-5" 
                        onClick={() => navigateTo('cities')}
                    >
                        <span>Manage Locations & Cities</span>
                        <span className="opacity-40 text-xs">→</span>
                    </Button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>VenueConnect Admin v2.0</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> System Online
                  </span>
              </div>
          </div>
      </div>

    </div>
  );
}
