import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, DollarSign, Code2, Globe, Smartphone, TrendingUp, Zap } from 'lucide-react';
import Header from '../components/Header';
import { GoogleGenAI } from "@google/genai";

interface Business {
  id: string;
  name: string;
  founder: string;
  revenue: string;
  category: string;
  description: string;
  whyItWorks: string;
  techStack: string[];
  source: string;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<string | null>(null);
  
  const [trends, setTrends] = useState<string | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);

  useEffect(() => {
    // Load data from local JSON file
    fetch('/src/data/starter-story-db.json')
      .then(res => res.json())
      .then(data => {
        setBusinesses(data);
        setFilteredBusinesses(data);
      })
      .catch(err => console.error("Error loading database:", err));
  }, []);

  useEffect(() => {
    let result = businesses;

    if (searchTerm) {
      result = result.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.founder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(b => b.category === selectedCategory);
    }

    if (selectedRevenue) {
      // Simple revenue filter logic (can be improved)
      if (selectedRevenue === 'high') {
        result = result.filter(b => b.revenue.includes('M') || b.revenue.includes('100k'));
      } else if (selectedRevenue === 'medium') {
        result = result.filter(b => !b.revenue.includes('M') && (b.revenue.includes('k') || b.revenue.includes('K')));
      }
    }

    setFilteredBusinesses(result);
  }, [searchTerm, selectedCategory, selectedRevenue, businesses]);

  const categories = Array.from(new Set(businesses.map(b => b.category)));

  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Quelles sont les 3 plus grandes tendances actuelles pour les Micro-SaaS et les applications indépendantes (Indie Hacking) cette semaine ?
        Cherche des lancements récents ou des discussions sur Twitter/Reddit.
        Fais un résumé très court (3 bullet points).
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      setTrends(response.text || "Impossible de charger les tendances.");
    } catch (error) {
      setTrends("Erreur lors du chargement des tendances.");
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Copiez ce qui marche.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Explorez 47 business modèles validés, générant plus de $150M+ de revenus cumulés. Ne réinventez pas la roue, améliorez-la.
          </motion.p>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-4">
          {/* Trends Section */}
          <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-indigo-400" /> Tendances du Marché
              </h2>
              <button 
                onClick={fetchTrends}
                disabled={loadingTrends}
                className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {loadingTrends ? 'Chargement...' : <><Zap size={14} className="text-yellow-400" /> Actualiser</>}
              </button>
            </div>
            
            {trends ? (
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <div className="whitespace-pre-wrap">{trends}</div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Cliquez sur Actualiser pour découvrir les tendances SaaS de la semaine via l'IA.</p>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un business, une stack, un fondateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141418] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-[#141418] border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={selectedRevenue || ''} 
              onChange={(e) => setSelectedRevenue(e.target.value || null)}
              className="bg-[#141418] border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Tous les revenus</option>
              <option value="high">$1M+ / an</option>
              <option value="medium">$10k - $100k / mois</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/business/${business.id}`)}
              className="bg-[#141418] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-[#1A1A20] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-gray-400 border border-white/5">
                  {business.category}
                </span>
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <DollarSign size={14} /> {business.revenue}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {business.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                {business.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {business.techStack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                    <Code2 size={10} /> {tech}
                  </span>
                ))}
                {business.techStack.length > 3 && (
                  <span className="text-xs text-gray-500 px-1 py-1">+{business.techStack.length - 3}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">Par {business.founder}</span>
                <span className="text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Analyser <ArrowRight size={16} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
