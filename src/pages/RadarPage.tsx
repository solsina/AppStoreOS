import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radar, Smartphone, TrendingUp, AlertCircle, Search, Zap, Star, ArrowRight, MessageSquareWarning, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Opportunity {
  id: string;
  niche: string;
  painPoint: string;
  appIdea: string;
  competitors: any[];
  asoKeywords: string[];
}

export default function RadarPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('productivity');
  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<'radar' | 'trends'>('radar');
  const [trends, setTrends] = useState<any[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);

  const APP_STORE_CATEGORIES = [
    'Productivity', 'Fitness', 'Finance', 'Education', 'Lifestyle', 
    'Health', 'Utilities', 'Business', 'Social Networking', 'Travel',
    'Food & Drink', 'Photo & Video', 'Music', 'Entertainment', 'Medical',
    'Sports', 'Navigation', 'News', 'Reference', 'Weather', 'AI Tools',
    'Widgets', 'Habit Tracker', 'Mental Health', 'Sustainability'
  ];

  const handleRandomCategory = async () => {
    if (isGeneratingRandom) return;
    setIsGeneratingRandom(true);
    
    // Start "Slot Machine" animation effect
    let iterations = 0;
    const interval = setInterval(() => {
      const random = APP_STORE_CATEGORIES[Math.floor(Math.random() * APP_STORE_CATEGORIES.length)];
      setCategory(random);
      iterations++;
      if (iterations > 15) clearInterval(interval);
    }, 80);

    try {
      const prompt = `
        Trouve une niche d'application mobile spécifique, rentable et actuellement sous-exploitée ou en forte croissance.
        Recherche des signaux sur les réseaux sociaux ou les tendances de recherche actuelles.
        Réponds UNIQUEMENT avec le nom de la niche en 2 ou 3 mots maximum.
        Exemples : "ADHD Journaling", "AI Interior Design", "Solo Travel Safety", "Micro-SaaS for Shopify".
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const smartNiche = response.text?.trim().replace(/"/g, '') || APP_STORE_CATEGORIES[Math.floor(Math.random() * APP_STORE_CATEGORIES.length)];
      
      // Wait for animation to finish if it's too fast
      setTimeout(() => {
        clearInterval(interval);
        setCategory(smartNiche);
        setIsGeneratingRandom(false);
      }, 1500);

    } catch (error) {
      console.error("Error generating smart niche:", error);
      setIsGeneratingRandom(false);
      clearInterval(interval);
    }
  };

  const fetchTrends = async () => {
    setIsFetchingTrends(true);
    try {
      const prompt = `
        Tu es un analyste de tendances sur Reddit et Twitter. 
        Cherche les plaintes récentes (moins de 3 mois) de personnes qui disent "J'aimerais qu'il y ait une app pour..." ou "Je déteste comment cette app fait...".
        Concentre-toi sur des problèmes monétisables.
        
        Renvoie un JSON strict avec 3 tendances :
        [
          {
            "problem": "Le problème exact dont les gens se plaignent",
            "source": "Reddit (r/SomebodyMakeThis) ou Twitter",
            "potentialApp": "L'idée d'app pour résoudre ça",
            "hypeScore": 85
          }
        ]
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
      setTrends(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trends' && trends.length === 0) {
      fetchTrends();
    }
  }, [activeTab]);

  const scanAppStore = async () => {
    setIsScanning(true);
    try {
      // 1. Fetch top apps in the category
      const response = await fetch(`https://itunes.apple.com/search?term=${category}&entity=software&limit=15`);
      const data = await response.json();
      const apps = data.results || [];

      // 2. Send to Gemini to find the "Gaps" (Opportunities)
      const prompt = `
        Voici une liste d'applications populaires sur l'App Store dans la catégorie "${category}".
        Analyse ces applications et identifie 3 "Gaps" (trous dans le marché). 
        Trouve des sous-niches spécifiques qui sont mal desservies ou des problèmes que ces grosses apps gèrent mal.
        
        Apps actuelles : ${apps.map((a: any) => a.trackName).join(', ')}
        
        Génère 3 opportunités d'applications mobiles hyper-spécifiques.
        Format JSON exact attendu :
        [
          {
            "id": "unique_id",
            "niche": "Nom de la sous-niche",
            "painPoint": "Le problème exact non résolu par les grosses apps",
            "appIdea": "Ton idée d'app mobile pour résoudre ça",
            "asoKeywords": ["mot clé 1", "mot clé 2", "mot clé 3"]
          }
        ]
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      let parsed = JSON.parse(aiResponse.text || "[]");
      
      // Attach some real competitor data to each opportunity for UI purposes
      parsed = parsed.map((opp: any) => ({
        ...opp,
        competitors: apps.sort(() => 0.5 - Math.random()).slice(0, 2) // Randomly assign 2 apps as "Goliaths" to beat
      }));

      setOpportunities(parsed);
    } catch (error) {
      console.error("Error scanning radar:", error);
      alert("Erreur lors du scan du marché.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-400">
            <Radar size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Le Radar App Store</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Détectez les failles des grosses applications et trouvez des niches rentables avant tout le monde.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveTab('radar')}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'radar' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Radar size={18} /> Radar App Store
          </button>
          <button 
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === 'trends' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            <MessageSquareWarning size={18} /> Signaux Faibles (Réseaux)
          </button>
        </div>

        {activeTab === 'radar' ? (
          <div className="max-w-4xl mx-auto">
            {/* Scanner Control */}
            <div className="bg-[#141418] border border-white/5 rounded-3xl p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest">Catégorie à scanner</label>
                  <button 
                    onClick={handleRandomCategory}
                    disabled={isGeneratingRandom}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-lg transition-colors border border-rose-500/20 disabled:opacity-50"
                  >
                    {isGeneratingRandom ? (
                      <span className="w-3 h-3 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {isGeneratingRandom ? 'Analyse...' : 'Smart Hasard'}
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="ex: fitness, adhd, fasting, widgets..."
                    className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
              <button 
                onClick={scanAppStore}
                disabled={isScanning || !category.trim()}
                className="w-full md:w-auto mt-6 md:mt-0 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                {isScanning ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scan en cours...</>
                ) : (
                  <><Zap size={18} /> Lancer le Radar</>
                )}
              </button>
            </div>

            {/* Results */}
            {opportunities.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <TrendingUp className="text-rose-400" /> Opportunités Détectées
                </h2>
                
                <div className="grid gap-6">
                  {opportunities.map((opp, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#141418] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8"
                    >
                      <div className="flex-1 space-y-4">
                        <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest rounded-full">
                          Niche : {opp.niche}
                        </div>
                        <h3 className="text-2xl font-bold text-white">{opp.appIdea}</h3>
                        
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-2">
                            <AlertCircle size={16} /> Le problème actuel
                          </h4>
                          <p className="text-gray-300 text-sm">{opp.painPoint}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mots-clés ASO (App Store)</h4>
                          <div className="flex flex-wrap gap-2">
                            {opp.asoKeywords.map((kw, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-64 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Goliaths à abattre</h4>
                        {opp.competitors.map((comp: any) => (
                          <div key={comp.trackId} className="flex items-center gap-3 bg-[#0A0A0C] p-3 rounded-xl border border-white/5">
                            <img src={comp.artworkUrl60} alt={comp.trackName} className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{comp.trackName}</p>
                              <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <Star size={10} fill="currentColor" /> {comp.averageUserRating?.toFixed(1) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => navigate('/war-room', { state: { radarIdea: opp } })}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            Go War Room <ArrowRight size={16} />
                          </button>
                          <button 
                            onClick={() => navigate('/war-room', { state: { radarIdea: opp, autoStart: true } })}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                          >
                            <Zap size={16} /> Automatiser
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {isFetchingTrends ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Écoute des réseaux sociaux...</h3>
                <p className="text-gray-400">L'IA analyse Reddit et Twitter pour trouver les plaintes des utilisateurs.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquareWarning className="text-indigo-400" /> Plaintes Récentes (Signaux Faibles)
                  </h3>
                  <button onClick={fetchTrends} className="text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                    <Zap size={14} /> Rafraîchir
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {trends.map((trend, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[#141418] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                        <span className="text-2xl font-black text-indigo-400">{trend.hypeScore}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Source : {trend.source}</span>
                        <p className="text-lg font-medium text-white mb-2">"{trend.problem}"</p>
                        <p className="text-sm text-indigo-300 flex items-center gap-2">
                          <ArrowRight size={14} /> Idée d'app : {trend.potentialApp}
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate('/war-room', { state: { radarIdea: { niche: 'Tendance', painPoint: trend.problem, appIdea: trend.potentialApp, asoKeywords: [] } } })}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
                      >
                        Explorer l'idée
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
