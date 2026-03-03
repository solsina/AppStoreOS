import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Rocket, Search, Code2, Target, AlertCircle, CheckCircle2, Github, Smartphone, MessageSquareWarning, Save, Zap, DollarSign } from 'lucide-react';
import Header from '../components/Header';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ExtractedIdea {
  name: string;
  pitch: string;
  target: string;
  keywords: string[];
}

export default function WarRoom() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Bienvenue dans la War Room. Je suis ton co-fondateur IA. Quel problème as-tu remarqué récemment ou quelle niche t'intéresse ?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [currentIdea, setCurrentIdea] = useState<ExtractedIdea | null>(null);
  const initializedRef = useRef(false);
  
  // Mission States
  const [redditValidation, setRedditValidation] = useState<string | null>(null);
  const [isRedditLoading, setIsRedditLoading] = useState(false);
  
  const [appStoreResults, setAppStoreResults] = useState<any[]>([]);
  const [isAppStoreLoading, setIsAppStoreLoading] = useState(false);
  
  const [githubResults, setGithubResults] = useState<any[]>([]);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  
  const [competitorFaults, setCompetitorFaults] = useState<string | null>(null);
  const [isFaultsLoading, setIsFaultsLoading] = useState(false);

  const [profitPrediction, setProfitPrediction] = useState<any>(null);
  const [isProfitLoading, setIsProfitLoading] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationStep, setAutomationStep] = useState<string>('');

  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
          Tu es un co-fondateur technique et stratégique expert en Applications Mobiles (iOS/Android) et App Store Optimization (ASO).
          Ton but est d'aider l'utilisateur à trouver, affiner et valider une idée d'application mobile.
          Pose des questions courtes et incisives pour creuser le problème. Ne sois pas trop bavard.
          
          Dès que l'idée d'app est claire (problème défini, cible claire, solution mobile esquissée), tu DOIS inclure à la fin de ta réponse un bloc JSON exact formaté comme ceci :
          \`\`\`json
          {
            "type": "IDEA_UPDATE",
            "name": "Nom de code de l'app",
            "pitch": "Pitch en 1 phrase",
            "target": "Cible principale",
            "keywords": ["mot-clé ASO 1", "mot-clé ASO 2"]
          }
          \`\`\`
          Ce JSON permettra au système de lancer les missions de validation automatiques (Reddit, App Store, GitHub).
        `
      }
    });

    // Handle incoming idea from Radar
    if (location.state?.radarIdea && !initializedRef.current) {
      initializedRef.current = true;
      const radarIdea = location.state.radarIdea;
      const autoStart = location.state.autoStart;

      if (autoStart) {
        // Direct automation path
        const idea: ExtractedIdea = {
          name: radarIdea.appIdea.split(' ').slice(0, 2).join(' '),
          pitch: radarIdea.appIdea,
          target: radarIdea.niche,
          keywords: radarIdea.asoKeywords || []
        };
        setCurrentIdea(idea);
        triggerMissions(idea);
        setMessages(prev => [...prev, { role: 'model', text: `J'ai lancé l'analyse automatique pour "${idea.name}". Tu peux superviser les résultats à droite et lancer l'automatisation complète quand tu es prêt.` }]);
      } else {
        const initialPrompt = `J'ai trouvé cette opportunité sur le Radar App Store :\nNiche : ${radarIdea.niche}\nProblème actuel : ${radarIdea.painPoint}\nMon idée : ${radarIdea.appIdea}\n\nQu'en penses-tu ? Aide-moi à affiner ça pour qu'on valide l'idée.`;
        
        // Simulate user sending this message
        setMessages(prev => [...prev, { role: 'user', text: initialPrompt }]);
        setIsTyping(true);
        
        chatRef.current.sendMessage({ message: initialPrompt })
          .then((response: any) => {
            const text = response.text || "Erreur de communication.";
            handleAIResponse(text);
          })
          .catch((error: any) => {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Désolé, j'ai rencontré une erreur lors de l'analyse de l'idée du Radar." }]);
            setIsTyping(false);
          });
      }
    }
  }, [location.state]);

  const handleAIResponse = (text: string) => {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let cleanText = text;
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.type === 'IDEA_UPDATE') {
          setCurrentIdea(parsed);
          cleanText = text.replace(jsonMatch[0], '').trim();
          triggerMissions(parsed);
        }
      } catch (e) {
        console.error("Failed to parse JSON from AI", e);
      }
    }

    setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      handleAIResponse(response.text || "Erreur de communication.");
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Désolé, j'ai rencontré une erreur. Peux-tu répéter ?" }]);
      setIsTyping(false);
    }
  };

  const triggerMissions = async (idea: ExtractedIdea) => {
    // 1. Reddit Validation
    setIsRedditLoading(true);
    try {
      const prompt = `Cherche sur Reddit des discussions récentes concernant les problèmes rencontrés par : "${idea.target}" ou autour du sujet "${idea.keywords.join(', ')}". Résume les 3 plus gros problèmes dont ils se plaignent.`;
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      setRedditValidation(res.text || "Aucun résultat pertinent trouvé.");
    } catch (e) {
      setRedditValidation("Erreur lors de la recherche Reddit.");
    } finally {
      setIsRedditLoading(false);
    }

    // 2. App Store Search
    setIsAppStoreLoading(true);
    try {
      const keyword = idea.keywords[0] || idea.name;
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=software&limit=3`);
      const data = await res.json();
      setAppStoreResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAppStoreLoading(false);
    }

    // 3. GitHub Boilerplates (Mobile focused)
    setIsGithubLoading(true);
    try {
      const q = encodeURIComponent(`react native expo boilerplate OR swiftui boilerplate`);
      const res = await fetch(`https://api.github.com/search/repositories?q=${q}&sort=stars&per_page=3`);
      const data = await res.json();
      setGithubResults(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGithubLoading(false);
    }

    // 4. Competitor Faults Analysis (The "Gaps")
    setIsFaultsLoading(true);
    try {
      const prompt = `
        Analyse les applications suivantes sur l'App Store : ${appStoreResults.map(a => a.trackName).join(', ')}.
        Quelles sont les failles récurrentes de ces applications ? (ex: trop cher, interface complexe, manque de telle fonctionnalité).
        Base-toi sur ce que les utilisateurs disent généralement de ce genre d'apps.
        Donne 3 points précis où une nouvelle app pourrait faire mieux.
      `;
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setCompetitorFaults(res.text || "Aucune faille majeure détectée.");
    } catch (e) {
      setCompetitorFaults("Erreur lors de l'analyse des failles.");
    } finally {
      setIsFaultsLoading(false);
    }

    // 5. Profit Prediction
    setIsProfitLoading(true);
    try {
      const prompt = `Estime le revenu mensuel potentiel (MRR) pour une application mobile dans la niche "${idea.target}" nommée "${idea.name}". Réponds en JSON: {"range": "$X,XXX - $Y,YYY", "explanation": "courte explication"}`;
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      setProfitPrediction(JSON.parse(res.text || "{}"));
    } catch (e) {
      console.error(e);
    } finally {
      setIsProfitLoading(false);
    }
  };

  const automateProject = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour lancer l'automatisation et sauvegarder votre projet.");
      login();
      return;
    }
    if (!currentIdea) return;
    setIsAutomating(true);
    setAutomationStep('Génération de l\'ASO...');
    try {
      // 1. Generate ASO
      const asoPrompt = `Génère un Titre App Store (30 car.), un Sous-titre (30 car.) et 5 mots-clés pour une app nommée "${currentIdea.name}" qui fait : ${currentIdea.pitch}. Réponds en JSON: {"title": "", "subtitle": "", "keywords": []}`;
      const asoRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: asoPrompt,
        config: { responseMimeType: "application/json" }
      });
      const asoData = JSON.parse(asoRes.text || "{}");

      // 2. Generate Icon
      setAutomationStep('Création de l\'icône premium...');
      let iconUrl = '';
      try {
        const iconPrompt = `Génère une icône d'application mobile moderne, minimaliste et percutante pour une application nommée "${currentIdea.name}" dans la niche "${currentIdea.target}". Style : Apple Premium, dégradés subtils, symbole central clair.`;
        const iconRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts: [{ text: iconPrompt }] },
        });
        for (const part of iconRes.candidates[0].content.parts) {
          if (part.inlineData) {
            iconUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (e) {
        console.error("Icon generation failed during automation:", e);
      }

      // 3. Generate Paywall Strategy
      setAutomationStep('Planification de la monétisation...');
      const paywallPrompt = `Génère une stratégie de paywall pour "${currentIdea.name}". Réponds en JSON: {"hook": "Phrase d'accroche", "features": ["feature 1", "feature 2"], "plans": [{"name": "Hebdo", "price": "4.99"}]}`;
      const paywallRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: paywallPrompt,
        config: { responseMimeType: "application/json" }
      });
      const paywallData = paywallRes.text;

      // 4. Generate Marketing Hooks
      setAutomationStep('Écriture des scripts viraux...');
      let marketingHooks: any[] = [];
      try {
        const hooksPrompt = `Génère 3 scripts de vidéos virales (TikTok/Reels) pour promouvoir "${currentIdea.name}". Réponds en JSON: [{"hook": "Accroche", "script": "Corps du script"}]`;
        const hooksRes = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: hooksPrompt,
          config: { responseMimeType: "application/json" }
        });
        marketingHooks = JSON.parse(hooksRes.text || "[]");
      } catch (e) {
        console.error("Marketing hooks failed:", e);
      }

      // 5. Generate Boilerplate Structure
      setAutomationStep('Génération de l\'architecture technique...');
      let boilerplateCode = '';
      try {
        const bpPrompt = `Génère une structure de base React Native (Expo) pour l'application "${currentIdea.name}" (${currentIdea.target}). Inclus les imports essentiels et un composant principal stylisé avec Tailwind (NativeWind). Code uniquement.`;
        const bpRes = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: bpPrompt
        });
        boilerplateCode = bpRes.text.replace(/```(tsx|jsx|javascript|typescript)?/ig, '').replace(/```/g, '').trim();
      } catch (e) {
        console.error("Boilerplate generation failed:", e);
      }

      // 6. Hunt for GitHub Repos
      setAutomationStep('Recherche de ressources Open Source...');
      let githubRepos: any[] = [];
      try {
        const query = encodeURIComponent(`${currentIdea.target} app`);
        const res = await fetch(`https://api.github.com/search/repositories?q=${query}+topic:react-native+OR+topic:swiftui+OR+topic:flutter&sort=stars&order=desc&per_page=3`);
        const data = await res.json();
        githubRepos = data.items || [];
      } catch (e) {
        console.error("GitHub hunt failed:", e);
      }

      // 7. Generate Store Listing Visuals (Screenshots Storyboard & Hero Image)
      setAutomationStep('Conception des visuels App Store...');
      let heroImage = '';
      let screenshots: { title: string; description: string }[] = [];
      try {
        // Hero Image
        const heroPrompt = `Génère une image de présentation (Hero Image) pour l'App Store pour une application nommée "${currentIdea.name}" (${currentIdea.target}). Style : Moderne, épuré, montrant un smartphone avec une interface élégante, couleurs vibrantes, qualité Apple.`;
        const heroRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts: [{ text: heroPrompt }] },
        });
        for (const part of heroRes.candidates[0].content.parts) {
          if (part.inlineData) {
            heroImage = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        // Screenshots Storyboard
        const ssPrompt = `Planifie 5 captures d'écran (Screenshots) pour l'App Store pour l'application "${currentIdea.name}". Pour chaque écran, donne un titre percutant et une description du visuel. Réponds en JSON: [{"title": "Titre court", "description": "Description du visuel"}]`;
        const ssRes = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: ssPrompt,
          config: { responseMimeType: "application/json" }
        });
        screenshots = JSON.parse(ssRes.text || "[]");
      } catch (e) {
        console.error("Store visuals failed:", e);
      }

      // 8. Final Readiness Check
      let readinessScore = 0;
      if (iconUrl) readinessScore += 20;
      if (asoData.title) readinessScore += 20;
      if (paywallData) readinessScore += 20;
      if (heroImage) readinessScore += 20;
      if (boilerplateCode) readinessScore += 20;

      // 9. Save Project with All Assets
      setAutomationStep('Finalisation du projet...');
      const projectRef = await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        name: currentIdea.name,
        niche: currentIdea.target,
        status: 'draft',
        progress: 80,
        readinessScore: readinessScore,
        assets: {
          icon: iconUrl,
          aso: {
            title: asoData.title,
            subtitle: asoData.subtitle,
            keywords: asoData.keywords.join(', ')
          },
          paywall: paywallData,
          marketing: {
            hooks: marketingHooks
          },
          design: {
            heroImage: heroImage,
            screenshots: screenshots
          },
          intelligence: {
            visionSpy: competitorFaults || "Analyse automatique effectuée.",
            nicheAnalysis: profitPrediction
          },
          technical: {
            boilerplate: boilerplateCode,
            repos: githubRepos
          }
        },
        tasks: [
          { name: 'Valider le copywriting ASO', done: true },
          { name: 'Valider la stratégie de prix', done: true },
          { name: 'Générer l\'icône de l\'app', done: !!iconUrl },
          { name: 'Valider les visuels App Store', done: !!heroImage },
          { name: 'Valider les scripts marketing', done: marketingHooks.length > 0 },
          { name: 'Analyser l\'architecture technique', done: !!boilerplateCode },
          { name: 'Développer le MVP', done: false }
        ],
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Automation error:", error);
      alert("Erreur lors de l'automatisation.");
    } finally {
      setIsAutomating(false);
    }
  };

  const saveProject = async () => {
    if (!currentIdea) return;
    
    if (!user) {
      // LocalStorage Fallback for Guests
      const guestProjects = JSON.parse(localStorage.getItem('guest_projects') || '[]');
      const newProject = {
        id: 'guest_' + Date.now(),
        name: currentIdea.name,
        niche: currentIdea.target,
        status: 'draft',
        progress: 30,
        createdAt: new Date().toISOString(),
        assets: {
          aso: { title: '', subtitle: '', keywords: currentIdea.keywords.join(', ') }
        }
      };
      localStorage.setItem('guest_projects', JSON.stringify([newProject, ...guestProjects]));
      alert("Projet sauvegardé localement ! Connectez-vous pour le synchroniser sur votre compte.");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        name: currentIdea.name,
        niche: currentIdea.target,
        status: 'draft',
        progress: 10,
        tasks: [
          { name: 'Générer ASO (Titre, Sous-titre, Mots-clés)', done: false },
          { name: 'Créer la structure du Paywall', done: false },
          { name: 'Développer le MVP', done: false }
        ],
        createdAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <Header />

      <main className="flex-1 pt-16 flex flex-col md:flex-row h-screen overflow-hidden">
        
        {/* Left Panel: Chat (Ideation) */}
        <div className="w-full md:w-1/2 lg:w-2/5 border-r border-white/5 flex flex-col bg-[#0A0A0C] relative z-10">
          <div className="p-4 border-b border-white/5 bg-[#141418] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Co-Fondateur IA</h2>
              <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> En ligne</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-white/10'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#141418] border border-white/5 text-gray-300 rounded-tl-none'}`}>
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">{msg.text}</div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Bot size={14} /></div>
                <div className="bg-[#141418] border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/5 bg-[#141418]">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Décris ton idée ou un problème..."
                className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Dashboard (Missions) */}
        <div className="w-full md:w-1/2 lg:w-3/5 bg-[#050505] p-6 overflow-y-auto custom-scrollbar relative">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Rocket className="text-indigo-400" /> War Room
              </h1>
              <p className="text-gray-400">Le tableau de bord de votre future startup.</p>
            </div>

            {!currentIdea ? (
              <div className="h-64 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <Target size={48} className="text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">En attente d'une idée...</h3>
                <p className="text-gray-400">Discutez avec l'IA à gauche. Dès qu'une idée claire émerge, ce tableau de bord s'animera automatiquement avec des données du marché.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Idea Card */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-3xl p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-500/30">
                      Projet Actif
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={saveProject}
                        disabled={isSaving || isAutomating}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        Brouillon
                      </button>
                      <button 
                        onClick={automateProject}
                        disabled={isSaving || isAutomating}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                      >
                        {isAutomating ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-[10px] animate-pulse">{automationStep}</span>
                          </div>
                        ) : (
                          <><Zap size={16} /> Lancer l'Automatisation</>
                        )}
                      </button>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentIdea.name}</h2>
                  <p className="text-xl text-indigo-200 mb-4">{currentIdea.pitch}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Target size={16} /> Cible : <span className="text-white font-medium">{currentIdea.target}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Reddit Validation */}
                  <div className="bg-[#141418] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MessageSquareWarning className="text-emerald-400" size={20} /> Validation Reddit
                    </h3>
                    {isRedditLoading ? (
                      <div className="flex items-center gap-3 text-gray-400"><span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> Analyse des forums...</div>
                    ) : redditValidation ? (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{redditValidation}</div>
                    ) : (
                      <p className="text-gray-500 italic">En attente de validation...</p>
                    )}
                  </div>

                  {/* App Store Competitors */}
                  <div className="bg-[#141418] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Smartphone className="text-blue-400" size={20} /> Concurrence App Store
                    </h3>
                    {isAppStoreLoading ? (
                      <div className="flex items-center gap-3 text-gray-400"><span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /> Recherche d'apps...</div>
                    ) : appStoreResults.length > 0 ? (
                      <div className="space-y-4">
                        {appStoreResults.map(app => (
                          <div key={app.trackId} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <img src={app.artworkUrl60} alt={app.trackName} className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-white truncate">{app.trackName}</p>
                              <p className="text-xs text-gray-400 truncate">{app.primaryGenreName}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-400">{app.formattedPrice || 'Free'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucun concurrent direct trouvé sur l'App Store.</p>
                    )}
                  </div>

                  {/* GitHub Tech Stack */}
                  <div className="bg-[#141418] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Github className="text-purple-400" size={20} /> Accélérateurs Mobiles
                    </h3>
                    {isGithubLoading ? (
                      <div className="flex items-center gap-3 text-gray-400"><span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /> Recherche...</div>
                    ) : githubResults.length > 0 ? (
                      <div className="space-y-3">
                        {githubResults.map(repo => (
                          <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-colors">
                            <p className="font-bold text-xs text-white truncate">{repo.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>{repo.language}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucun boilerplate trouvé.</p>
                    )}
                  </div>

                  {/* Competitor Faults Analysis */}
                  <div className="bg-[#141418] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="text-red-400" size={20} /> Failles des Concurrents
                    </h3>
                    {isFaultsLoading ? (
                      <div className="flex items-center gap-3 text-gray-400"><span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> Analyse des points faibles...</div>
                    ) : competitorFaults ? (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{competitorFaults}</div>
                    ) : (
                      <p className="text-gray-500 italic">En attente de l'analyse des concurrents...</p>
                    )}
                  </div>

                  {/* Profit Prediction */}
                  <div className="bg-[#141418] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="text-emerald-400" size={20} /> Potentiel de Revenus
                    </h3>
                    {isProfitLoading ? (
                      <div className="flex items-center gap-3 text-gray-400"><span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /> Estimation du MRR...</div>
                    ) : profitPrediction ? (
                      <div className="space-y-3">
                        <div className="text-3xl font-black text-white">{profitPrediction.range}</div>
                        <p className="text-sm text-gray-400 leading-relaxed">{profitPrediction.explanation}</p>
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center">
                          Estimation basée sur les benchmarks du marché
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">En attente de l'estimation financière...</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
