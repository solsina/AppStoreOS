import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Rocket, Megaphone, Share2, TrendingUp, CheckCircle2, Copy, ExternalLink, Loader2, Twitter, MessageCircle, Users, Search, Instagram, Video } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MobileProject } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AntigravityPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<MobileProject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'content' | 'communities' | 'influencers'
  const [activeTab, setActiveTab] = useState('content');

  // Content Generator State
  const [generatingChannel, setGeneratingChannel] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});

  // Community Finder State
  const [communityKeyword, setCommunityKeyword] = useState('');
  const [isSearchingCommunities, setIsSearchingCommunities] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);

  // Influencer Scout State
  const [influencerNiche, setInfluencerNiche] = useState('');
  const [isScouting, setIsScouting] = useState(false);
  const [influencers, setInfluencers] = useState<any[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !projectId) return;
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as MobileProject;
          setProject({ id: docSnap.id, ...data });
          if (data.niche) {
            setCommunityKeyword(data.niche);
            setInfluencerNiche(data.niche);
          }
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [user, projectId]);

  const generateContent = async (channel: 'reddit' | 'productHunt' | 'twitter' | 'tiktok') => {
    if (!project) return;
    setGeneratingChannel(channel);

    try {
      let prompt = "";
      if (channel === 'reddit') {
        prompt = `Rédige un post Reddit authentique (storytelling) pour lancer l'app "${project.name}" (${project.niche}). 
        Ne fais pas de pub directe. Raconte une histoire sur le problème résolu.
        Titre accrocheur + Corps du texte.`;
      } else if (channel === 'productHunt') {
        prompt = `Rédige le texte de lancement Product Hunt pour "${project.name}".
        Inclut: Tagline, Problème, Solution, et un "Maker's Comment" engageant.`;
      } else if (channel === 'twitter') {
        prompt = `Rédige un Thread Twitter viral (5 tweets) pour annoncer "${project.name}".
        Utilise des emojis, des stats chocs, et un ton "Build in Public".`;
      } else if (channel === 'tiktok') {
        prompt = `Récris un script TikTok/Reels de 30s pour "${project.name}".
        Structure: Hook visuel (0-3s), Problème (3-10s), Solution App (10-25s), CTA (25-30s).`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setGeneratedContent(prev => ({
        ...prev,
        [channel]: response.text || "Erreur de génération."
      }));

      // Update Firestore
      const docRef = doc(db, 'projects', project.id);
      await updateDoc(docRef, {
        antigravity: {
          status: 'launched',
          lastAction: new Date().toISOString(),
          channels: { ...project.antigravity?.channels, [channel]: true }
        }
      });

    } catch (error) {
      console.error("Generation Error:", error);
      alert("Erreur lors de la génération.");
    } finally {
      setGeneratingChannel(null);
    }
  };

  const findCommunities = async () => {
    if (!communityKeyword.trim()) return;
    setIsSearchingCommunities(true);
    try {
      const res = await fetch(`https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(communityKeyword)}&limit=10`);
      const data = await res.json();
      if (data.data && data.data.children) {
        const subs = data.data.children.map((child: any) => ({
          name: child.data.display_name_prefixed,
          subscribers: child.data.subscribers,
          description: child.data.public_description,
          url: `https://reddit.com${child.data.url}`,
          icon: child.data.icon_img || child.data.community_icon
        }));
        setCommunities(subs);
      }
    } catch (error) {
      console.error("Reddit API Error:", error);
      alert("Erreur lors de la recherche de communautés.");
    } finally {
      setIsSearchingCommunities(false);
    }
  };

  const scoutInfluencers = async () => {
    if (!influencerNiche.trim()) return;
    setIsScouting(true);
    try {
      // Using Gemini with Google Search Grounding to find real influencers
      const prompt = `
        Trouve 5 influenceurs (Instagram, TikTok ou YouTube) pertinents pour la niche "${influencerNiche}".
        Pour chaque influenceur, donne :
        1. Nom
        2. Plateforme principale
        3. Pourquoi ils sont pertinents
        4. Une idée d'approche pour un partenariat (angle marketing).
        
        Renvoie la réponse au format JSON :
        [
          { "name": "...", "platform": "...", "relevance": "...", "angle": "..." }
        ]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "[]");
      setInfluencers(data);

    } catch (error) {
      console.error("Scout Error:", error);
      alert("Erreur lors de la recherche d'influenceurs.");
    } finally {
      setIsScouting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-[10px] font-bold text-purple-400 uppercase tracking-widest border border-purple-500/20">
                Growth Phase
              </span>
              <span className="text-gray-500 text-sm">/</span>
              <span className="text-gray-400 text-sm font-medium">{project.name}</span>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="text-purple-500" /> Antigravity Launchpad
            </h1>
            <p className="text-gray-400 mt-2">Propulsez votre application vers ses premiers utilisateurs.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
              activeTab === 'content' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Megaphone size={16} className="inline mr-2" />
            Générateur de Contenu
            {activeTab === 'content' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
              activeTab === 'communities' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Communautés Cibles
            {activeTab === 'communities' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
          <button
            onClick={() => setActiveTab('influencers')}
            className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
              activeTab === 'influencers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Search size={16} className="inline mr-2" />
            Chasseur d'Influenceurs
            {activeTab === 'influencers' && <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          
          {/* CONTENT GENERATOR TAB */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Canaux de Lancement</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'reddit', label: 'Reddit Story', icon: <MessageCircle size={20} />, color: 'bg-orange-500' },
                      { id: 'productHunt', label: 'Product Hunt', icon: <Rocket size={20} />, color: 'bg-orange-600' },
                      { id: 'twitter', label: 'Twitter Thread', icon: <Twitter size={20} />, color: 'bg-blue-400' },
                      { id: 'tiktok', label: 'TikTok Script', icon: <Video size={20} />, color: 'bg-pink-500' },
                    ].map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => generateContent(channel.id as any)}
                        disabled={generatingChannel === channel.id}
                        className="relative overflow-hidden group p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-all"
                      >
                        <div className={`w-10 h-10 rounded-full ${channel.color} flex items-center justify-center text-white mb-3`}>
                          {generatingChannel === channel.id ? <Loader2 className="animate-spin" size={20} /> : channel.icon}
                        </div>
                        <p className="font-bold text-sm">{channel.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(generatedContent).map(([channel, content]) => (
                  <motion.div 
                    key={channel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#141418] border border-white/5 rounded-2xl p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold capitalize flex items-center gap-2">
                        {channel === 'reddit' && <MessageCircle size={16} className="text-orange-500" />}
                        {channel === 'twitter' && <Twitter size={16} className="text-blue-400" />}
                        {channel} Content
                      </h3>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(content);
                          alert("Copié !");
                        }}
                        className="text-gray-500 hover:text-white"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="bg-[#0A0A0C] p-4 rounded-xl border border-white/5 max-h-60 overflow-y-auto">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{content}</p>
                    </div>
                  </motion.div>
                ))}
                {Object.keys(generatedContent).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-white/10 rounded-2xl p-8">
                    <Megaphone size={48} className="mb-4 opacity-20" />
                    <p>Sélectionnez un canal pour générer du contenu viral.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMMUNITIES TAB */}
          {activeTab === 'communities' && (
            <div className="space-y-6">
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={communityKeyword}
                    onChange={(e) => setCommunityKeyword(e.target.value)}
                    placeholder="Entrez votre niche (ex: fitness, productivity...)"
                    className="flex-1 bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={findCommunities}
                    disabled={isSearchingCommunities}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    {isSearchingCommunities ? <Loader2 className="animate-spin" /> : <Search />}
                    Rechercher
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.map((sub) => (
                    <motion.div
                      key={sub.url}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {sub.icon && sub.icon !== "" && (
                            <img src={sub.icon} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                          )}
                          <div>
                            <h3 className="font-bold text-white">{sub.name}</h3>
                            <p className="text-xs text-purple-400">{sub.subscribers.toLocaleString()} membres</p>
                          </div>
                        </div>
                        <a 
                          href={sub.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{sub.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                {!isSearchingCommunities && communities.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Trouvez où se cachent vos futurs utilisateurs.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INFLUENCERS TAB */}
          {activeTab === 'influencers' && (
            <div className="space-y-6">
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={influencerNiche}
                    onChange={(e) => setInfluencerNiche(e.target.value)}
                    placeholder="Quelle est votre niche ?"
                    className="flex-1 bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={scoutInfluencers}
                    disabled={isScouting}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    {isScouting ? <Loader2 className="animate-spin" /> : <Search />}
                    Scanner
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {influencers.map((inf, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row gap-6"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{inf.name}</h3>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg border border-purple-500/30">
                            {inf.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{inf.relevance}</p>
                        <div className="bg-[#0A0A0C] p-4 rounded-lg border border-white/5">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Angle d'approche</p>
                          <p className="text-sm text-gray-300 italic">"{inf.angle}"</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {!isScouting && influencers.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>L'IA va scanner le web pour trouver vos meilleurs partenaires.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
