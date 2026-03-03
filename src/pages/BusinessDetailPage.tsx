import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Code2, DollarSign, Target, Lightbulb, Copy, CheckCircle2, Globe, Search, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [pivotNiche, setPivotNiche] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<string | null>(null);

  // Domain Checker State
  const [domainToCheck, setDomainToCheck] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  
  // Market Validation State
  const [isValidatingMarket, setIsValidatingMarket] = useState(false);
  const [marketValidation, setMarketValidation] = useState<string | null>(null);

  const checkDomain = async () => {
    if (!domainToCheck) return;
    setDomainStatus('checking');
    try {
      const cleanDomain = domainToCheck.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      // Use Cloudflare DNS over HTTPS to check if A record exists
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=A`, {
        headers: { 'accept': 'application/dns-json' }
      });
      const data = await response.json();
      
      // Status 3 is NXDOMAIN (Non-Existent Domain) -> likely available
      if (data.Status === 3) {
        setDomainStatus('available');
      } else if (data.Status === 0) {
        setDomainStatus('taken');
      } else {
        setDomainStatus('error');
      }
    } catch (error) {
      setDomainStatus('error');
    }
  };

  const validateMarket = async () => {
    if (!business) return;
    setIsValidatingMarket(true);
    try {
      const prompt = `
        Cherche sur Reddit, Quora et d'autres forums des discussions récentes concernant les problèmes dans la niche : "${business.category}" ou autour de la solution "${business.name}".
        Résume les 3 plus gros problèmes dont les gens se plaignent et qui pourraient être résolus par un nouveau Micro-SaaS.
        Inclus des liens vers les discussions si tu en trouves.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      setMarketValidation(response.text || "Erreur d'analyse.");
    } catch (error) {
      setMarketValidation("Erreur lors de la validation du marché.");
    } finally {
      setIsValidatingMarket(false);
    }
  };

  useEffect(() => {
    fetch('/src/data/starter-story-db.json')
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: Business) => b.id === id);
        setBusiness(found || null);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading business:", err);
        setLoading(false);
      });
  }, [id]);

  const handleGeneratePivot = async () => {
    if (!business || !pivotNiche) return;
    setIsGenerating(true);
    setGeneratedIdea(null);

    try {
      const prompt = `
        Act as an expert Product Strategist.
        
        SOURCE BUSINESS MODEL:
        Name: ${business.name}
        Category: ${business.category}
        Description: ${business.description}
        Why it works: ${business.whyItWorks}
        Revenue: ${business.revenue}

        TARGET NICHE: ${pivotNiche}

        TASK:
        Generate a detailed Micro-SaaS idea that applies the successful mechanics of ${business.name} to the ${pivotNiche} niche.
        
        OUTPUT FORMAT (Markdown):
        # [Name of the new idea]
        
        ### The Concept
        [One sentence pitch]
        
        ### Why it will work
        [Explain how it leverages the proven model of ${business.name} but solves a specific pain in ${pivotNiche}]
        
        ### MVP Features
        - [Feature 1]
        - [Feature 2]
        - [Feature 3]
        
        ### Monetization
        [How to charge for it]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setGeneratedIdea(response.text || "Erreur de génération.");
    } catch (error) {
      console.error(error);
      setGeneratedIdea("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Chargement...</div>;
  if (!business) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Business introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} /> Retour à l'exploration
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                  {business.category}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  <DollarSign size={12} /> {business.revenue}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{business.name}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {business.description}
              </p>
            </div>

            <div className="bg-[#141418] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" /> Pourquoi ça marche ?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {business.whyItWorks}
              </p>
            </div>

            <div className="bg-[#141418] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Copy className="text-indigo-400" /> Le "Success Replicator"
              </h3>
              <p className="text-gray-400 mb-6">
                Utilisez ce modèle éprouvé pour générer une idée unique dans une nouvelle niche.
              </p>
              
              <div className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  placeholder="Entrez une niche (ex: Avocats, Profs de Yoga, BTP...)" 
                  value={pivotNiche}
                  onChange={(e) => setPivotNiche(e.target.value)}
                  className="flex-1 bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                  onClick={handleGeneratePivot}
                  disabled={!pivotNiche || isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? 'Génération...' : 'Générer'}
                </button>
              </div>

              {generatedIdea && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0A0C] rounded-xl p-6 border border-indigo-500/20 prose prose-invert max-w-none"
                >
                  <div className="whitespace-pre-wrap">{generatedIdea}</div>
                </motion.div>
              )}
            </div>

            {/* Market Validation & Domain Checker */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Domain Checker */}
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="text-blue-400" size={20} /> Disponibilité Domaine
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="ex: monapp.com" 
                    value={domainToCheck}
                    onChange={(e) => {
                      setDomainToCheck(e.target.value);
                      setDomainStatus('idle');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && checkDomain()}
                    className="flex-1 bg-[#0A0A0C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={checkDomain}
                    disabled={!domainToCheck || domainStatus === 'checking'}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {domainStatus === 'checking' ? '...' : 'Vérifier'}
                  </button>
                </div>
                {domainStatus === 'available' && (
                  <p className="text-emerald-400 text-sm flex items-center gap-1"><CheckCircle2 size={14} /> Probablement disponible !</p>
                )}
                {domainStatus === 'taken' && (
                  <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} /> Déjà pris.</p>
                )}
                {domainStatus === 'error' && (
                  <p className="text-yellow-400 text-sm flex items-center gap-1"><AlertCircle size={14} /> Erreur de vérification.</p>
                )}
              </div>

              {/* Market Validation */}
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Search className="text-emerald-400" size={20} /> Validation Reddit
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Cherche les plaintes réelles des utilisateurs dans cette niche.
                </p>
                <button 
                  onClick={validateMarket}
                  disabled={isValidatingMarket}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isValidatingMarket ? 'Recherche en cours...' : 'Lancer la recherche'}
                </button>
              </div>
            </div>

            {marketValidation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141418] border border-emerald-500/20 rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Search size={24} /> Résultats de la recherche
                </h3>
                <div className="prose prose-invert max-w-none text-gray-300">
                  <div className="whitespace-pre-wrap">{marketValidation}</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Fondateur</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {business.founder.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold">{business.founder}</p>
                  <p className="text-xs text-gray-500">Solo Founder</p>
                </div>
              </div>
            </div>

            <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {business.techStack.map((tech, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 border border-white/5">
                    <Code2 size={14} className="text-indigo-400" /> {tech}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Source</h4>
              <p className="text-sm text-gray-400 mb-4">
                Cette analyse est basée sur une interview réelle ou une étude de cas publique.
              </p>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                Voir la source <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
