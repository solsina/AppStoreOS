import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, Code2, PieChart as PieChartIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface Business {
  id: string;
  name: string;
  revenue: string;
  category: string;
  techStack: string[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export default function StatsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/src/data/starter-story-db.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!data.length) return null;

    // Process Tech Stack
    const techCounts: Record<string, number> = {};
    data.forEach(b => {
      b.techStack.forEach(tech => {
        techCounts[tech] = (techCounts[tech] || 0) + 1;
      });
    });
    const topTech = Object.entries(techCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Process Revenue by Category
    const catRevenue: Record<string, { total: number, count: number }> = {};
    data.forEach(b => {
      const rev = parseInt(b.revenue.replace(/[^0-9]/g, '')) || 0;
      if (!catRevenue[b.category]) catRevenue[b.category] = { total: 0, count: 0 };
      catRevenue[b.category].total += rev;
      catRevenue[b.category].count += 1;
    });
    const categoryStats = Object.entries(catRevenue)
      .map(([name, { total, count }]) => ({ 
        name, 
        avgRevenue: Math.round(total / count),
        count 
      }))
      .sort((a, b) => b.avgRevenue - a.avgRevenue);

    return { topTech, categoryStats };
  }, [data]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Analyse des données...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/explore')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} /> Retour à l'exploration
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">L'Indie Market Insights 📊</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Analyse en temps réel de 47 business modèles rentables. Découvrez ce qui fonctionne vraiment sur le terrain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Tech Stack Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Code2 className="text-indigo-400" /> Top Tech Stacks
              </h3>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Outils les plus utilisés</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topTech}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="text-emerald-400" /> Revenu Moyen par Niche
              </h3>
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Rentabilité par secteur</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categoryStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}/mois`}
                    contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="avgRevenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h4 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Total Business Analysés</h4>
            <p className="text-4xl font-black text-white">{data.length}</p>
          </div>
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h4 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Revenu Moyen Global</h4>
            <p className="text-4xl font-black text-emerald-400">
              ${Math.round(data.reduce((acc, b) => acc + (parseInt(b.revenue.replace(/[^0-9]/g, '')) || 0), 0) / data.length).toLocaleString()}
            </p>
          </div>
          <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
            <h4 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Niche la plus active</h4>
            <p className="text-4xl font-black text-indigo-400">
              {stats?.categoryStats.sort((a, b) => b.count - a.count)[0].name}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
