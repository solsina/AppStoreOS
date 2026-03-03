import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  ArrowRight, 
  Star, 
  Zap,
  TrendingUp,
  Smartphone,
  CreditCard,
  Type,
  CheckCircle2,
  Circle,
  Users,
  Activity,
  DollarSign,
  Search,
  Trophy,
  MessageSquare,
  Code,
  Copy,
  Crosshair,
  Megaphone,
  Github,
  GitFork,
  Bell,
  Trash2,
  ChevronDown,
  Eye,
  Languages,
  Rocket,
  MonitorSmartphone,
  Video,
  ImageIcon,
  AlertCircle,
  MessageSquareWarning,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import Header from '../components/Header';
import { MobileProject } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drafts' | 'live'>('drafts');
  const [guestProjects, setGuestProjects] = useState<MobileProject[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncGuestProjects = async () => {
    if (!user || guestProjects.length === 0) return;
    setIsSyncing(true);
    try {
      for (const gp of guestProjects) {
        const { id, ...projectData } = gp;
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      localStorage.removeItem('guest_projects');
      setGuestProjects([]);
      // Refresh projects
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileProject));
      setProjects(fetchedProjects);
      alert("Synchronisation réussie ! Vos projets sont maintenant sur votre compte.");
    } catch (error) {
      console.error("Sync error:", error);
      alert("Erreur lors de la synchronisation.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('guest_projects') || '[]');
    setGuestProjects(local);
  }, []);

  // ASO Rank Tracker State
  const [asoAppId, setAsoAppId] = useState('');
  const [asoKeyword, setAsoKeyword] = useState('');
  const [asoRank, setAsoRank] = useState<number | 'not_found' | null>(null);
  const [isSearchingRank, setIsSearchingRank] = useState(false);
  const [trackedAppDetails, setTrackedAppDetails] = useState<any>(null);

  // Boilerplate State
  const [generatingBoilerplateId, setGeneratingBoilerplateId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [expandedWarRoom, setExpandedWarRoom] = useState<string | null>(null);
  const [isGeneratingQuick, setIsGeneratingQuick] = useState<Record<string, string | null>>({}); // { projectId: 'icon' | 'aso' | 'paywall' | 'profit' | 'global' | 'trends' }
  const [nicheTrends, setNicheTrends] = useState<Record<string, any[]>>({});

  const calculateReadinessScore = (project: MobileProject) => {
    let score = 0;
    if (project.assets?.icon) score += 20;
    if (project.assets?.aso) score += 20;
    if (project.assets?.paywall) score += 20;
    if (project.assets?.design?.heroImage) score += 20;
    if (project.assets?.technical?.boilerplate) score += 20;
    return score;
  };

  const generateGlobalASO = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'global' }));
    try {
      const prompt = `Adapte (ne traduis pas littéralement) l'ASO de l'application "${project.name}" (${project.niche}) pour les marchés suivants : US (Anglais), JP (Japonais), DE (Allemand). Pour chaque langue, donne un Titre (30 car.), un Sous-titre (30 car.) et des mots-clés. Réponds en JSON: {"US": {"title": "", "subtitle": "", "keywords": ""}, "JP": {...}, "DE": {...}}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        'assets.localization.aso': data
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, localization: { ...p.assets?.localization, aso: data } } } : p));
    } catch (error) {
      console.error("Error globalizing ASO:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const fetchNicheTrends = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'trends' }));
    try {
      const prompt = `Quelles sont les 3 micro-tendances actuelles (recherches en hausse, nouveaux besoins) dans la niche "${project.niche}" pour les applications mobiles ? Utilise tes outils de recherche. Réponds en JSON: [{"trend": "Nom de la tendance", "description": "Pourquoi ça monte", "opportunity": "Idée de feature"}]`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json" 
        }
      });
      const data = JSON.parse(response.text || "[]");
      setNicheTrends(prev => ({ ...prev, [project.id]: data }));
    } catch (error) {
      console.error("Error fetching trends:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const generateQuickIcon = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'icon' }));
    try {
      const prompt = `Génère une icône d'application mobile moderne, minimaliste et percutante pour une application nommée "${project.name}" dans la niche "${project.niche}". Style : Apple Premium, dégradés subtils, symbole central clair.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: prompt }] },
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, {
          'assets.icon': imageUrl
        });
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, icon: imageUrl } } : p));
      }
    } catch (error) {
      console.error("Error generating icon:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const generateQuickASO = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'aso' }));
    try {
      const prompt = `Génère un Titre (30 car.), un Sous-titre (30 car.) et des mots-clés stratégiques pour l'App Store pour l'application "${project.name}" (${project.niche}). Réponds en JSON: {"title": "", "subtitle": "", "keywords": ""}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        'assets.aso': data
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, aso: data } } : p));
    } catch (error) {
      console.error("Error generating ASO:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const generateQuickPaywall = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'paywall' }));
    try {
      const prompt = `Rédige une stratégie de paywall courte et persuasive pour l'application "${project.name}". Inclus un "Hook" (accroche) et 3 bénéfices clés. Réponds en JSON: {"hook": "", "benefits": []}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = response.text;
      
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        'assets.paywall': data
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, paywall: data } } : p));
    } catch (error) {
      console.error("Error generating paywall:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const estimateProjectProfit = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'profit' }));
    try {
      const prompt = `Estime le revenu mensuel potentiel (MRR) pour une application mobile dans la niche "${project.niche}" nommée "${project.name}". Base-toi sur les standards du marché. Donne une fourchette (ex: "$1,500 - $3,000") et une courte explication. Réponds en JSON: {"range": "", "explanation": ""}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        'assets.intelligence.nicheAnalysis': data
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, intelligence: { ...p.assets?.intelligence, nicheAnalysis: data } } } : p));
    } catch (error) {
      console.error("Error estimating profit:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const generateQuickVisuals = async (project: MobileProject) => {
    setIsGeneratingQuick(prev => ({ ...prev, [project.id]: 'visuals' }));
    try {
      // Hero Image
      const heroPrompt = `Génère une image de présentation (Hero Image) pour l'App Store pour une application nommée "${project.name}" (${project.niche}). Style : Moderne, épuré, montrant un smartphone avec une interface élégante, couleurs vibrantes, qualité Apple.`;
      const heroRes = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: heroPrompt }] },
      });
      let heroImage = '';
      for (const part of heroRes.candidates[0].content.parts) {
        if (part.inlineData) {
          heroImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      // Screenshots Storyboard
      const ssPrompt = `Planifie 5 captures d'écran (Screenshots) pour l'App Store pour l'application "${project.name}". Pour chaque écran, donne un titre percutant et une description du visuel. Réponds en JSON: [{"title": "Titre court", "description": "Description du visuel"}]`;
      const ssRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: ssPrompt,
        config: { responseMimeType: "application/json" }
      });
      const screenshots = JSON.parse(ssRes.text || "[]");

      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        'assets.design.heroImage': heroImage,
        'assets.design.screenshots': screenshots
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, assets: { ...p.assets, design: { ...p.assets?.design, heroImage, screenshots } } } : p));
    } catch (error) {
      console.error("Error generating visuals:", error);
    } finally {
      setIsGeneratingQuick(prev => ({ ...prev, [project.id]: null }));
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    setDeletingProjectId(projectId);
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Erreur lors de la suppression.");
    } finally {
      setDeletingProjectId(null);
    }
  };
  const [boilerplates, setBoilerplates] = useState<Record<string, string>>({});

  // Repo Hunter State
  const [huntingRepoId, setHuntingRepoId] = useState<string | null>(null);
  const [repoResults, setRepoResults] = useState<Record<string, any[]>>({});

  // Review Defender State
  const [reviewAppId, setReviewAppId] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetchingReviews, setIsFetchingReviews] = useState(false);
  const [generatingResponseId, setGeneratingResponseId] = useState<string | null>(null);
  const [reviewResponses, setReviewResponses] = useState<Record<string, string>>({});

  // Competitor Watch State
  const [competitorAppId, setCompetitorAppId] = useState('');
  const [competitorData, setCompetitorData] = useState<any>(null);
  const [isFetchingCompetitor, setIsFetchingCompetitor] = useState(false);
  const [threatAnalysis, setThreatAnalysis] = useState<string | null>(null);
  const [isAnalyzingThreat, setIsAnalyzingThreat] = useState(false);

  // Brand Mention Monitor State
  const [brandKeyword, setBrandKeyword] = useState('');
  const [brandMentions, setBrandMentions] = useState<any[]>([]);
  const [isFetchingMentions, setIsFetchingMentions] = useState(false);

  // Mock data for RevenueCat chart
  const revenueData = [
    { date: '1 Mar', mrr: 120 },
    { date: '5 Mar', mrr: 250 },
    { date: '10 Mar', mrr: 380 },
    { date: '15 Mar', mrr: 510 },
    { date: '20 Mar', mrr: 890 },
    { date: '25 Mar', mrr: 1250 },
    { date: '30 Mar', mrr: 1840 },
  ];

  const toggleTask = async (projectId: string, taskIndex: number) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const project = projects[projectIndex];
    const updatedTasks = [...project.tasks];
    updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;

    const completedCount = updatedTasks.filter(t => t.done).length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);

    // Optimistic update
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = {
      ...project,
      tasks: updatedTasks,
      progress: newProgress
    };
    setProjects(updatedProjects);

    // Update Firestore
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        tasks: updatedTasks,
        progress: newProgress
      });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert on error (optional, keeping it simple for now)
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'projects'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const fetchedProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileProject));
          setProjects(fetchedProjects);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const trackKeywordRank = async () => {
    if (!asoAppId.trim() || !asoKeyword.trim()) return;
    setIsSearchingRank(true);
    setAsoRank(null);
    setTrackedAppDetails(null);

    try {
      // 1. Fetch app details to show icon/name
      const appRes = await fetch(`https://itunes.apple.com/lookup?id=${asoAppId}`);
      const appData = await appRes.json();
      if (appData.results && appData.results.length > 0) {
        setTrackedAppDetails(appData.results[0]);
      }

      // 2. Search keyword and find rank (limit 200 is the max for iTunes API)
      const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(asoKeyword)}&entity=software&limit=200`);
      const searchData = await searchRes.json();
      
      const apps = searchData.results || [];
      const index = apps.findIndex((app: any) => app.trackId.toString() === asoAppId.trim());
      
      if (index !== -1) {
        setAsoRank(index + 1);
      } else {
        setAsoRank('not_found');
      }
    } catch (error) {
      console.error("Error tracking rank:", error);
      alert("Erreur lors de la recherche du classement.");
    } finally {
      setIsSearchingRank(false);
    }
  };

  const generateBoilerplate = async (project: MobileProject) => {
    setGeneratingBoilerplateId(project.id);
    try {
      const prompt = `Génère le code de base (Boilerplate) en React Native (Expo) pour une application nommée "${project.name}" dans la niche "${project.niche}".
      Inclus :
      1. Les imports nécessaires (react, react-native).
      2. Une structure de navigation basique.
      3. Un écran d'accueil propre avec un design moderne.
      Renvoie UNIQUEMENT le code, sans markdown autour si possible, ou juste le bloc de code.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      let code = response.text || '';
      code = code.replace(/```(tsx|jsx|javascript|typescript)?/ig, '').replace(/```/g, '').trim();
      
      setBoilerplates(prev => ({...prev, [project.id]: code}));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération du code.");
    } finally {
      setGeneratingBoilerplateId(null);
    }
  };

  const huntRepos = async (project: MobileProject) => {
    setHuntingRepoId(project.id);
    try {
      // Search GitHub for open source projects in this niche
      const query = encodeURIComponent(`${project.niche} app`);
      const res = await fetch(`https://api.github.com/search/repositories?q=${query}+topic:react-native+OR+topic:swiftui+OR+topic:flutter&sort=stars&order=desc&per_page=3`);
      const data = await res.json();
      
      if (data.items) {
        setRepoResults(prev => ({...prev, [project.id]: data.items}));
      } else {
        alert("Aucun repo trouvé ou limite d'API GitHub atteinte.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la recherche GitHub.");
    } finally {
      setHuntingRepoId(null);
    }
  };

  const fetchReviews = async () => {
    if (!reviewAppId.trim()) return;
    setIsFetchingReviews(true);
    try {
      // Apple RSS Feed for Customer Reviews
      const res = await fetch(`https://itunes.apple.com/fr/rss/customerreviews/id=${reviewAppId}/sortBy=mostRecent/json`);
      const data = await res.json();
      const entries = data.feed.entry || [];
      
      const parsedReviews = entries
        .filter((e:any) => e.author) // Skip the first entry which is app metadata
        .map((e: any) => ({
          id: e.id.label,
          author: e.author.name.label,
          rating: parseInt(e['im:rating'].label),
          title: e.title.label,
          content: e.content.label
        }))
        .filter((r: any) => r.rating <= 3) // Only bad reviews
        .slice(0, 5); // Max 5
        
      setReviews(parsedReviews);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la récupération des avis. Vérifiez l'ID de l'application.");
    } finally {
      setIsFetchingReviews(false);
    }
  };

  const generateReviewResponse = async (review: any) => {
    setGeneratingResponseId(review.id);
    try {
      const prompt = `Agis comme le développeur d'une application. Un utilisateur a laissé cet avis de ${review.rating}/5 étoiles :
      Titre : ${review.title}
      Avis : ${review.content}
      
      Rédige une réponse courte, empathique et professionnelle (en français) pour le rassurer, lui dire que le problème est pris en compte, et l'inciter subtilement à revoir sa note une fois le souci réglé.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setReviewResponses(prev => ({...prev, [review.id]: response.text || ''}));
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingResponseId(null);
    }
  };

  const fetchCompetitor = async () => {
    if (!competitorAppId.trim()) return;
    setIsFetchingCompetitor(true);
    setThreatAnalysis(null);
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${competitorAppId}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setCompetitorData(data.results[0]);
      } else {
        alert("Application introuvable.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la recherche du concurrent.");
    } finally {
      setIsFetchingCompetitor(false);
    }
  };

  const analyzeThreat = async () => {
    if (!competitorData) return;
    setIsAnalyzingThreat(true);
    try {
      const prompt = `Tu es un stratège en business mobile. Voici la dernière mise à jour de mon concurrent principal :
      App : ${competitorData.trackName}
      Version : ${competitorData.version}
      Notes de mise à jour (Release Notes) : "${competitorData.releaseNotes}"
      
      Analyse cette mise à jour. Est-ce une menace ? Que cherchent-ils à accomplir ? Donne-moi 2 actions concrètes que je dois faire dans ma propre application pour contrer cette mise à jour.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setThreatAnalysis(response.text || "Analyse impossible.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingThreat(false);
    }
  };

  const fetchBrandMentions = async () => {
    if (!brandKeyword.trim()) return;
    setIsFetchingMentions(true);
    try {
      const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(brandKeyword)}&sort=new&limit=5`);
      const data = await res.json();
      
      if (data.data && data.data.children) {
        const mentions = data.data.children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          subreddit: child.data.subreddit_name_prefixed,
          url: `https://reddit.com${child.data.permalink}`,
          date: new Date(child.data.created_utc * 1000).toLocaleDateString(),
          author: child.data.author
        }));
        setBrandMentions(mentions);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la recherche sur Reddit.");
    } finally {
      setIsFetchingMentions(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Header />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Studio de {user?.displayName?.split(' ')[0] || 'Développement'} 🛠️</h1>
            <p className="text-gray-400">Gérez vos applications mobiles, de l'idée jusqu'au premier million.</p>
          </div>
          <button 
            onClick={() => navigate('/radar')}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20"
          >
            <PlusCircle size={20} /> Nouveau Projet
          </button>
        </div>

        {/* Sync Banner for Guest Projects */}
        {user && guestProjects.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-indigo-600 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-500/20 border border-indigo-400/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Projets non synchronisés détectés</p>
                <p className="text-xs text-indigo-100">Vous avez {guestProjects.length} projet(s) sauvegardé(s) localement. Voulez-vous les lier à votre compte ?</p>
              </div>
            </div>
            <button 
              onClick={syncGuestProjects}
              disabled={isSyncing}
              className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" /> : <Rocket size={18} />}
              Synchroniser maintenant
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === 'drafts' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Brouillons & Dev ({projects.length})
          </button>
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Apps en Ligne <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>

        {activeTab === 'drafts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats */}
            <div className="space-y-6">
              {!user && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Mode Invité
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Vous n'êtes pas connecté. Vos projets sont stockés localement et seront perdus si vous videz le cache de votre navigateur.
                  </p>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Se connecter pour sauvegarder
                  </button>
                </div>
              )}
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={16} /> Pipeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-xs text-gray-500 mt-1">En cours</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-gray-500 mt-1">Lancées</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Projects */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="py-20 text-center text-gray-500">Chargement du studio...</div>
              ) : [...guestProjects, ...projects.filter(p => p.status === 'draft' || !p.status)].length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {[...guestProjects, ...projects.filter(p => p.status === 'draft' || !p.status)].map((project) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#141418] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-[10px] font-bold text-rose-400 uppercase tracking-widest border border-rose-500/20 mb-2 inline-block">
                            {project.niche}
                          </span>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Smartphone size={20} className="text-gray-400" /> {project.name}
                            {project.id.toString().startsWith('guest_') && (
                              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-black uppercase rounded border border-rose-500/30 animate-pulse">
                                Guest
                              </span>
                            )}
                          </h3>
                        </div>
                        <button 
                          onClick={() => {
                            if (project.id.startsWith('guest_')) {
                              const local = JSON.parse(localStorage.getItem('guest_projects') || '[]');
                              const filtered = local.filter((p: any) => p.id !== project.id);
                              localStorage.setItem('guest_projects', JSON.stringify(filtered));
                              setGuestProjects(filtered);
                            } else {
                              deleteProject(project.id);
                            }
                          }}
                          disabled={deletingProjectId === project.id}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Supprimer le projet"
                        >
                          {deletingProjectId === project.id ? <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>

                      {/* 3-Phase Pipeline Visualization */}
                      <div className="grid grid-cols-3 gap-4 mb-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>

                        {/* Phase 1: AppStoreOS */}
                        <div className="relative z-10 bg-[#141418] border border-indigo-500/30 rounded-xl p-4 flex flex-col items-center text-center hover:bg-[#1A1A20] transition-colors cursor-pointer" onClick={() => navigate('/tools')}>
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                            <Layers size={20} />
                          </div>
                          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Conception</p>
                          <p className="text-[10px] text-gray-500 mt-1">AppStoreOS</p>
                        </div>

                        {/* Phase 2: Stitch */}
                        <div 
                          className={`relative z-10 bg-[#141418] border rounded-xl p-4 flex flex-col items-center text-center transition-colors cursor-pointer ${project.stitch?.status === 'completed' ? 'border-blue-500/30 hover:bg-[#1A1A20]' : 'border-white/5 hover:border-blue-500/30'}`}
                          onClick={() => navigate(`/stitch/${project.id}`)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${project.stitch?.status === 'completed' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                            <Cpu size={20} />
                          </div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${project.stitch?.status === 'completed' ? 'text-blue-400' : 'text-gray-500'}`}>Build</p>
                          <p className="text-[10px] text-gray-500 mt-1">Stitch</p>
                        </div>

                        {/* Phase 3: Antigravity */}
                        <div 
                          className={`relative z-10 bg-[#141418] border rounded-xl p-4 flex flex-col items-center text-center transition-colors cursor-pointer ${project.antigravity?.status === 'launched' ? 'border-purple-500/30 hover:bg-[#1A1A20]' : 'border-white/5 hover:border-purple-500/30'}`}
                          onClick={() => navigate(`/antigravity/${project.id}`)}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${project.antigravity?.status === 'launched' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                            <Rocket size={20} />
                          </div>
                          <p className={`text-xs font-bold uppercase tracking-wider ${project.antigravity?.status === 'launched' ? 'text-purple-400' : 'text-gray-500'}`}>Growth</p>
                          <p className="text-[10px] text-gray-500 mt-1">Antigravity</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-xs text-gray-500">Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => navigate(`/stitch/${project.id}`)} className="text-sm text-white font-bold hover:text-indigo-400 transition-colors flex items-center gap-1">
                          Gérer le projet <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#141418] border border-dashed border-white/10 rounded-3xl py-20 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                    <Smartphone size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Aucun projet en cours</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8">
                    Utilisez le Radar pour trouver une faille sur l'App Store et commencez à construire.
                  </p>
                  <button 
                    onClick={() => navigate('/radar')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                  >
                    Ouvrir le Radar
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Live Apps Tab (RevenueCat Integration Placeholder) */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <DollarSign size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">MRR</h3>
                </div>
                <p className="text-3xl font-bold text-white">$1,840</p>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +15% ce mois</p>
              </div>

              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Abonnés Actifs</h3>
                </div>
                <p className="text-3xl font-bold text-white">245</p>
                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1"><TrendingUp size={12} /> +32 cette semaine</p>
              </div>

              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Essais Actifs</h3>
                </div>
                <p className="text-3xl font-bold text-white">48</p>
                <p className="text-xs text-gray-500 mt-2">Conversion: 38%</p>
              </div>

              <div className="bg-[#141418] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                    <TrendingUp size={16} className="rotate-180" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Churn</h3>
                </div>
                <p className="text-3xl font-bold text-white">4.2%</p>
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">Attention requise</p>
              </div>
            </div>

            <div className="bg-[#141418] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white">Croissance du MRR</h2>
                  <p className="text-sm text-gray-400">30 derniers jours</p>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/10">
                  Connecter RevenueCat
                </button>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141418', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ASO Rank Tracker */}
            <div className="bg-[#141418] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ASO Rank Tracker (Live)</h2>
                  <p className="text-gray-400 text-sm">Vérifiez la position exacte de votre application sur un mot-clé donné.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">App ID (Apple)</label>
                    <input 
                      type="text" 
                      value={asoAppId}
                      onChange={(e) => setAsoAppId(e.target.value)}
                      placeholder="ex: 123456789 (trouvable dans l'URL de l'app)"
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Mot-clé cible</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={asoKeyword}
                        onChange={(e) => setAsoKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && trackKeywordRank()}
                        placeholder="ex: habit tracker"
                        className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={trackKeywordRank}
                    disabled={isSearchingRank || !asoAppId.trim() || !asoKeyword.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isSearchingRank ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recherche dans le Top 200...</>
                    ) : (
                      <><Search size={18} /> Vérifier le Classement</>
                    )}
                  </button>
                </div>

                <div className="flex-1">
                  {isSearchingRank ? (
                    <div className="h-full flex items-center justify-center border border-white/5 border-dashed rounded-2xl p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Scan de l'App Store en cours...</p>
                      </div>
                    </div>
                  ) : asoRank !== null ? (
                    <div className="h-full bg-gradient-to-br from-[#0A0A0C] to-blue-900/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {trackedAppDetails && (
                        <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5">
                          <img src={trackedAppDetails.artworkUrl60} alt="App Icon" className="w-12 h-12 rounded-lg" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white line-clamp-1">{trackedAppDetails.trackName}</p>
                            <p className="text-xs text-gray-400">{trackedAppDetails.primaryGenreName}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Classement pour "{asoKeyword}"</p>
                      
                      {asoRank === 'not_found' ? (
                        <div>
                          <p className="text-4xl font-black text-red-400 mb-2">&gt; 200</p>
                          <p className="text-sm text-gray-400">L'application n'est pas dans le Top 200 pour ce mot-clé.</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1 mb-2">
                            <span className="text-2xl font-bold text-blue-400">#</span>
                            <span className="text-6xl font-black text-white">{asoRank}</span>
                          </div>
                          <p className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Indexé avec succès
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
                        <Trophy size={32} />
                      </div>
                      <p className="text-gray-400">Entrez l'ID de votre application et un mot-clé pour voir votre position exacte dans les résultats de recherche Apple.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Review Defender */}
            <div className="bg-[#141418] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Review Defender (Gestion des Avis)</h2>
                  <p className="text-gray-400 text-sm">Récupérez vos mauvais avis et générez des réponses parfaites pour sauver votre note.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={reviewAppId}
                    onChange={(e) => setReviewAppId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
                    placeholder="App ID (ex: 1062324249 pour Duolingo)"
                    className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={fetchReviews}
                  disabled={isFetchingReviews || !reviewAppId.trim()}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  {isFetchingReviews ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recherche...</>
                  ) : (
                    <><MessageSquare size={18} /> Scanner les avis</>
                  )}
                </button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-1 text-yellow-500 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-600" : ""} />
                            ))}
                          </div>
                          <h4 className="font-bold text-white">{review.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500">{review.author}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">"{review.content}"</p>
                      
                      {reviewResponses[review.id] ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 relative group">
                          <button 
                            onClick={() => navigator.clipboard.writeText(reviewResponses[review.id])}
                            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copier la réponse"
                          >
                            <Copy size={14} />
                          </button>
                          <p className="text-xs font-bold text-rose-400 mb-2">Réponse générée par l'IA :</p>
                          <p className="text-sm text-gray-300">{reviewResponses[review.id]}</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => generateReviewResponse(review)}
                          disabled={generatingResponseId === review.id}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                        >
                          {generatingResponseId === review.id ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Zap size={14} className="text-rose-400" />
                          )}
                          Générer une réponse de sauvetage
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-white/5 border-dashed rounded-2xl">
                  <MessageSquare size={32} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Entrez un App ID pour scanner les derniers avis négatifs (1 à 3 étoiles).</p>
                </div>
              )}
            </div>

            {/* Competitor Watch (Release Radar) */}
            <div className="bg-[#141418] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Crosshair size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Competitor Watch (Radar de Mises à jour)</h2>
                  <p className="text-gray-400 text-sm">Surveillez les dernières fonctionnalités de vos concurrents via l'API Apple.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={competitorAppId}
                    onChange={(e) => setCompetitorAppId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCompetitor()}
                    placeholder="App ID du concurrent (ex: 1062324249)"
                    className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={fetchCompetitor}
                  disabled={isFetchingCompetitor || !competitorAppId.trim()}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isFetchingCompetitor ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scan...</>
                  ) : (
                    <><Crosshair size={18} /> Espionner</>
                  )}
                </button>
              </div>

              {competitorData && (
                <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={competitorData.artworkUrl60} alt="Icon" className="w-16 h-16 rounded-xl border border-white/10" />
                    <div>
                      <h3 className="font-bold text-xl text-white">{competitorData.trackName}</h3>
                      <p className="text-sm text-gray-400">Version {competitorData.version} • Mise à jour le {new Date(competitorData.currentVersionReleaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notes de mise à jour (Release Notes)</h4>
                    <p className="text-sm text-gray-300 bg-white/5 p-4 rounded-xl whitespace-pre-wrap">
                      {competitorData.releaseNotes || "Aucune note de mise à jour fournie."}
                    </p>
                  </div>

                  {!threatAnalysis ? (
                    <button 
                      onClick={analyzeThreat}
                      disabled={isAnalyzingThreat || !competitorData.releaseNotes}
                      className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzingThreat ? (
                        <><span className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" /> Analyse stratégique en cours...</>
                      ) : (
                        <><Zap size={18} /> Analyser la menace avec l'IA</>
                      )}
                    </button>
                  ) : (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
                      <h4 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                        <Zap size={16} /> Analyse Stratégique
                      </h4>
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                        {threatAnalysis.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Brand Mention Monitor */}
            <div className="bg-[#141418] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Bell size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Brand Mention Monitor (Social Listening)</h2>
                  <p className="text-gray-400 text-sm">Surveillez Reddit en temps réel pour savoir quand on parle de votre app (ou d'un concurrent).</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={brandKeyword}
                    onChange={(e) => setBrandKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBrandMentions()}
                    placeholder="Mot-clé (ex: nom de votre app, concurrent, problème)"
                    className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={fetchBrandMentions}
                  disabled={isFetchingMentions || !brandKeyword.trim()}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  {isFetchingMentions ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Écoute...</>
                  ) : (
                    <><Bell size={18} /> Écouter le web</>
                  )}
                </button>
              </div>

              {brandMentions.length > 0 ? (
                <div className="space-y-4">
                  {brandMentions.map((mention) => (
                    <a 
                      key={mention.id}
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[#0A0A0C] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">{mention.title}</h4>
                        <ArrowRight size={16} className="text-gray-600 group-hover:text-purple-400 shrink-0 ml-4" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="bg-white/5 px-2 py-1 rounded-md text-gray-300">{mention.subreddit}</span>
                        <span>Posté par u/{mention.author}</span>
                        <span>•</span>
                        <span>{mention.date}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-white/5 border-dashed rounded-2xl">
                  <Bell size={32} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Entrez un mot-clé pour voir les dernières discussions Reddit associées.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
