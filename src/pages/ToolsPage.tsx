import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Target, Zap, Search, Star, ExternalLink, MessageSquareWarning, Download, DollarSign, Type, CreditCard, Image as ImageIcon, Globe, Video, Eye, Upload, Megaphone, Languages, Key, LineChart, Users, MonitorSmartphone, FileText, MessageCircle, LayoutGrid, Code, Save, Copy } from 'lucide-react';
import Header from '../components/Header';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { MobileProject } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { user } = useAuth();
  const [projects, setProjects] = useState<MobileProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedProjects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MobileProject));
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          setSelectedProjectId(fetchedProjects[0].id);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [user]);

  const saveToProject = async (assetKey: string, data: any) => {
    if (!selectedProjectId) return;
    setIsSaving(assetKey);
    try {
      const projectRef = doc(db, 'projects', selectedProjectId);
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project) return;
      
      const currentAssets = project.assets || {};
      const updatedAssets = { ...currentAssets };
      
      // Handle nested keys like 'aso.title'
      const keys = assetKey.split('.');
      if (keys.length === 1) {
        updatedAssets[keys[0]] = data;
      } else if (keys.length === 2) {
        updatedAssets[keys[0]] = { ...(updatedAssets[keys[0]] || {}), [keys[1]]: data };
      }

      await updateDoc(projectRef, { assets: updatedAssets });
      
      // Update local state
      setProjects(projects.map(p => p.id === selectedProjectId ? { ...p, assets: updatedAssets } : p));
      
      alert("Sauvegardé avec succès dans le projet !");
    } catch (error) {
      console.error("Error saving to project:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(null);
    }
  };

  const [downloads, setDownloads] = useState(5000);
  const [conversionRate, setConversionRate] = useState(3);
  const [subscriptionPrice, setSubscriptionPrice] = useState(29);

  const monthlySubscribers = Math.floor(downloads * (conversionRate / 100));
  const monthlyRevenue = monthlySubscribers * subscriptionPrice;
  const appleCut = monthlyRevenue * 0.15; // 15% Small Business Program
  const netRevenue = monthlyRevenue - appleCut;

  // Niche Validator State
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [appResults, setAppResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);
  const [appAnalysis, setAppAnalysis] = useState<Record<string, string>>({});

  // ASO Studio State
  const [asoIdea, setAsoIdea] = useState('');
  const [isGeneratingAso, setIsGeneratingAso] = useState(false);
  const [asoResult, setAsoResult] = useState<{title: string, subtitle: string, keywords: string} | null>(null);
  
  // ASO Localizer State
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [localizedResults, setLocalizedResults] = useState<Record<string, {title: string, subtitle: string, keywords: string}> | null>(null);

  // Icon Studio State
  const [iconIdea, setIconIdea] = useState('');
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [iconResult, setIconResult] = useState<string | null>(null);

  // Viral Hooks State
  const [hookIdea, setHookIdea] = useState('');
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [hookResults, setHookResults] = useState<any[]>([]);

  // Vision Spy State
  const [spyImage, setSpyImage] = useState<string | null>(null);
  const [isSpying, setIsSpying] = useState(false);
  const [spyResult, setSpyResult] = useState<string | null>(null);

  // Launch Strategist State
  const [launchIdea, setLaunchIdea] = useState('');
  const [launchPlatform, setLaunchPlatform] = useState('reddit');
  const [isGeneratingLaunch, setIsGeneratingLaunch] = useState(false);
  const [launchResult, setLaunchResult] = useState<string | null>(null);

  // String Localizer State
  const [localizerInput, setLocalizerInput] = useState('');
  const [isLocalizingCode, setIsLocalizingCode] = useState(false);
  const [localizerResult, setLocalizerResult] = useState<string | null>(null);

  // ASO Keyword Extractor State
  const [extractorKeyword, setExtractorKeyword] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);

  // Global Pricing Optimizer State
  const [basePrice, setBasePrice] = useState('4.99');
  const [isOptimizingPrice, setIsOptimizingPrice] = useState(false);
  const [pricingResult, setPricingResult] = useState<any[]>([]);

  // Audience Locator State
  const [audienceNiche, setAudienceNiche] = useState('');
  const [isFetchingAudience, setIsFetchingAudience] = useState(false);
  const [audienceResults, setAudienceResults] = useState<any[]>([]);

  // Screenshot Storyboarder State
  const [screenshotIdea, setScreenshotIdea] = useState('');
  const [isGeneratingScreenshots, setIsGeneratingScreenshots] = useState(false);
  const [screenshotResults, setScreenshotResults] = useState<any[]>([]);

  // SEO Blog Post Generator State
  const [blogTopic, setBlogTopic] = useState('');
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [blogResult, setBlogResult] = useState<string | null>(null);

  // App Store Review Summarizer State
  const [reviewAppId, setReviewAppId] = useState('');
  const [isSummarizingReviews, setIsSummarizingReviews] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<string | null>(null);

  // Paywall Architect State
  const [paywallIdea, setPaywallIdea] = useState('');
  const [isGeneratingPaywall, setIsGeneratingPaywall] = useState(false);
  const [paywallResult, setPaywallResult] = useState<{
    model: string, 
    prices: string, 
    trial: string, 
    hook: string, 
    features: string[]
  } | null>(null);

  const generateIcon = async () => {
    if (!iconIdea.trim()) return;
    setIsGeneratingIcon(true);
    setIconResult(null);
    try {
      const prompt = `A highly professional, minimalist iOS app icon for an app about: ${iconIdea}. Flat design, vibrant colors, solid background, vector style, Apple Human Interface Guidelines, no text, no words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });

      let base64Image = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (base64Image) {
        setIconResult(base64Image);
      } else {
        alert("L'image n'a pas pu être générée.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de l'icône.");
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  const localizeASO = async () => {
    if (!asoResult) return;
    setIsLocalizing(true);
    try {
      const prompt = `
        Tu es un expert ASO international.
        Voici mes métadonnées ASO en français :
        Titre : ${asoResult.title}
        Sous-titre : ${asoResult.subtitle}
        Mots-clés : ${asoResult.keywords}

        Traduis et adapte ces métadonnées pour les 3 marchés les plus rentables (États-Unis, Japon, Brésil).
        Règles strictes :
        - Titre : max 30 caractères.
        - Sous-titre : max 30 caractères.
        - Mots-clés : max 100 caractères, séparés par des virgules, SANS espaces.
        - Adapte les mots-clés aux vraies recherches locales (ne fais pas que traduire mot à mot).

        Format JSON attendu :
        {
          "US": { "title": "...", "subtitle": "...", "keywords": "..." },
          "JP": { "title": "...", "subtitle": "...", "keywords": "..." },
          "BR": { "title": "...", "subtitle": "...", "keywords": "..." }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "{}");
      setLocalizedResults(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la localisation.");
    } finally {
      setIsLocalizing(false);
    }
  };

  const generateHooks = async () => {
    if (!hookIdea.trim()) return;
    setIsGeneratingHooks(true);
    try {
      const prompt = `Tu es un expert en marketing viral sur TikTok et Instagram Reels.
      Voici mon application : "${hookIdea}".
      Génère 3 scripts de vidéos courtes (15-30 secondes) conçus pour devenir viraux et obtenir des téléchargements.
      
      Format JSON attendu :
      [
        {
          "title": "Titre du concept",
          "hook": "La phrase d'accroche (les 3 premières secondes)",
          "body": "Le déroulé visuel et audio",
          "cta": "L'appel à l'action final"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setHookResults(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération des hooks.");
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSpyImage(reader.result as string);
      setSpyResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeUI = async () => {
    if (!spyImage) return;
    setIsSpying(true);
    try {
      const base64Data = spyImage.split(',')[1];
      const mimeType = spyImage.split(';')[0].split(':')[1];

      const prompt = `Tu es un expert mondial en UX/UI et en psychologie comportementale (façon Duolingo ou Tinder).
      Analyse cette capture d'écran d'une application mobile.
      1. Décortique l'interface (ce qui est bien fait).
      2. Identifie les biais cognitifs utilisés (FOMO, ancrage, rareté, preuve sociale...).
      3. Donne 3 conseils actionnables pour reproduire ce succès dans ma propre app.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      });

      setSpyResult(response.text || "Analyse impossible.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse de l'image.");
    } finally {
      setIsSpying(false);
    }
  };

  const generateLaunchStrategy = async () => {
    if (!launchIdea.trim()) return;
    setIsGeneratingLaunch(true);
    try {
      const platformRules = launchPlatform === 'reddit' 
        ? "Tu dois écrire un post Reddit qui ne ressemble PAS à une publicité. Il doit raconter une histoire (storytelling), apporter de la valeur immédiate, et mentionner l'app subtilement à la fin pour éviter d'être banni par les modérateurs."
        : "Tu dois écrire un post de lancement Product Hunt. Il doit être percutant, lister les problèmes résolus, utiliser des emojis, et se terminer par une question ouverte pour générer des commentaires.";

      const prompt = `Tu es un expert en Growth Hacking.
      Voici mon application : "${launchIdea}".
      Rédige le post de lancement parfait pour ${launchPlatform === 'reddit' ? 'Reddit' : 'Product Hunt'}.
      
      Règles :
      ${platformRules}
      
      Renvoie uniquement le texte du post prêt à être copié-collé.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setLaunchResult(response.text || "Erreur de génération.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de la stratégie.");
    } finally {
      setIsGeneratingLaunch(false);
    }
  };

  const localizeCode = async () => {
    if (!localizerInput.trim()) return;
    setIsLocalizingCode(true);
    try {
      const prompt = `Tu es un développeur mobile expert en internationalisation (i18n).
      Voici un fichier de traduction (ça peut être du JSON, du Localizable.strings pour iOS, ou du strings.xml pour Android) :
      
      ${localizerInput}
      
      Traduis toutes les VALEURS (garde les clés et la syntaxe exactes) en 3 langues : Espagnol (ES), Allemand (DE) et Japonais (JP).
      Renvoie le résultat clairement séparé par langue, dans le même format que l'original.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setLocalizerResult(response.text || "Erreur de traduction.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la traduction du code.");
    } finally {
      setIsLocalizingCode(false);
    }
  };

  const extractKeywords = async () => {
    if (!extractorKeyword.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(extractorKeyword)}&entity=software&limit=30`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const appData = data.results.map((app: any) => ({
          title: app.trackName,
          subtitle: app.subtitle || ''
        }));

        const prompt = `Tu es un expert en ASO (App Store Optimization).
        Voici les titres et sous-titres des 30 meilleures applications pour la recherche "${extractorKeyword}".
        
        ${JSON.stringify(appData)}
        
        Analyse la fréquence des mots. Extrais les 10 mots-clés les plus utilisés par ces concurrents (exclus les mots de liaison comme "le", "et", "pour", etc.).
        Renvoie UNIQUEMENT un tableau JSON de strings.
        Exemple: ["tracker", "habitude", "routine", "quotidien"]`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        setExtractedKeywords(JSON.parse(response.text || "[]"));
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'extraction des mots-clés.");
    } finally {
      setIsExtracting(false);
    }
  };

  const optimizePricing = async () => {
    if (!basePrice.trim()) return;
    setIsOptimizingPrice(true);
    try {
      const prompt = `Tu es un expert en monétisation mondiale et en Parité de Pouvoir d'Achat (PPP).
      Mon application coûte ${basePrice}$ USD aux États-Unis.
      Calcule le prix optimal (psychologique, ex: se terminant par .99 ou .49) pour ces 5 marchés, en ajustant selon leur pouvoir d'achat local pour maximiser les ventes.
      
      Format JSON attendu :
      [
        { "country": "Inde", "currency": "INR", "price": "199", "reason": "Pouvoir d'achat plus faible..." },
        { "country": "Brésil", "currency": "BRL", "price": "14.90", "reason": "..." },
        { "country": "Royaume-Uni", "currency": "GBP", "price": "...", "reason": "..." },
        { "country": "Japon", "currency": "JPY", "price": "...", "reason": "..." },
        { "country": "Mexique", "currency": "MXN", "price": "...", "reason": "..." }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setPricingResult(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'optimisation des prix.");
    } finally {
      setIsOptimizingPrice(false);
    }
  };

  const findAudience = async () => {
    if (!audienceNiche.trim()) return;
    setIsFetchingAudience(true);
    try {
      const res = await fetch(`https://www.reddit.com/subreddits/search.json?q=${encodeURIComponent(audienceNiche)}&limit=8`);
      const data = await res.json();
      if (data.data && data.data.children) {
        const subs = data.data.children.map((child: any) => ({
          name: child.data.display_name_prefixed,
          subscribers: child.data.subscribers,
          description: child.data.public_description,
          url: `https://reddit.com${child.data.url}`
        }));
        setAudienceResults(subs);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la recherche d'audience.");
    } finally {
      setIsFetchingAudience(false);
    }
  };

  const generateScreenshots = async () => {
    if (!screenshotIdea.trim()) return;
    setIsGeneratingScreenshots(true);
    try {
      const prompt = `Tu es un expert en conversion App Store. Mon app : "${screenshotIdea}".
      Génère le texte (copywriting) pour mes 5 captures d'écran (Screenshots) sur l'App Store.
      La première doit être le "Hook" principal. Les autres doivent montrer les fonctionnalités clés avec des preuves sociales ou des bénéfices.
      
      Format JSON attendu :
      [
        { "screen": 1, "title": "Titre accrocheur (max 5 mots)", "subtitle": "Sous-titre explicatif (max 10 mots)", "visual": "Ce qu'on doit voir sur l'image" }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setScreenshotResults(JSON.parse(response.text || "[]"));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération des screenshots.");
    } finally {
      setIsGeneratingScreenshots(false);
    }
  };

  const generateBlogPost = async () => {
    if (!blogTopic.trim()) return;
    setIsGeneratingBlog(true);
    try {
      const prompt = `Tu es un expert en SEO (Search Engine Optimization) et en Content Marketing.
      Rédige un article de blog optimisé pour le référencement sur le sujet suivant : "${blogTopic}".
      L'objectif est d'attirer du trafic organique vers une application mobile liée à ce sujet.
      
      Structure attendue :
      1. Un titre H1 accrocheur (optimisé SEO).
      2. Une introduction engageante (avec le mot-clé principal dans les 100 premiers mots).
      3. 3 à 4 paragraphes (H2) avec des conseils pratiques ou des informations utiles.
      4. Une conclusion qui intègre un "Call to Action" (CTA) subtil pour télécharger l'application.
      
      Utilise le format Markdown pour la mise en page.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setBlogResult(response.text || "Erreur de génération.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération de l'article.");
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  const summarizeReviews = async () => {
    if (!reviewAppId.trim()) return;
    setIsSummarizingReviews(true);
    try {
      // Fetch reviews from Apple RSS Feed
      const res = await fetch(`https://itunes.apple.com/fr/rss/customerreviews/id=${reviewAppId}/sortBy=mostRecent/json`);
      const data = await res.json();
      const entries = data.feed.entry || [];
      
      const parsedReviews = entries
        .filter((e:any) => e.author) // Skip the first entry which is app metadata
        .map((e: any) => `Note: ${e['im:rating'].label}/5 - "${e.content.label}"`)
        .slice(0, 20); // Take the 20 most recent reviews

      if (parsedReviews.length === 0) {
        setReviewSummary("Aucun avis trouvé pour cette application.");
        return;
      }

      const prompt = `Tu es un Product Manager expert en analyse de feedback utilisateur.
      Voici les 20 derniers avis laissés sur l'App Store pour une application concurrente :
      
      ${parsedReviews.join('\n')}
      
      Fais une synthèse claire et concise de ces avis.
      Structure ta réponse en 3 points :
      1. **Ce que les utilisateurs adorent (Les forces)**
      2. **Ce qui frustre les utilisateurs (Les faiblesses/bugs)**
      3. **Les fonctionnalités les plus demandées (Les opportunités pour mon app)**`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      setReviewSummary(response.text || "Erreur lors de l'analyse.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la récupération ou de l'analyse des avis.");
    } finally {
      setIsSummarizingReviews(false);
    }
  };

  const generatePaywall = async () => {
    if (!paywallIdea.trim()) return;
    setIsGeneratingPaywall(true);
    try {
      const prompt = `
        Tu es un expert en monétisation d'applications mobiles et en psychologie des Paywalls (façon RevenueCat, Blinkist, Duolingo).
        Voici mon application : "${paywallIdea}".
        Propose-moi la structure de Paywall idéale pour maximiser le taux de conversion (LTV).
        
        Format JSON attendu :
        {
          "model": "Le modèle recommandé (ex: Freemium, Hard Paywall, Paymium...)",
          "prices": "Les prix recommandés (ex: 39.99$/an avec 7 jours d'essai + option 6.99$/mois)",
          "trial": "Stratégie d'essai gratuit (ex: 7 jours avec rappel de notification au jour 5)",
          "hook": "La phrase d'accroche psychologique principale tout en haut du paywall",
          "features": ["Avantage premium 1", "Avantage premium 2", "Avantage premium 3"]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setPaywallResult(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération du Paywall.");
    } finally {
      setIsGeneratingPaywall(false);
    }
  };

  const generateASO = async () => {
    if (!asoIdea.trim()) return;
    setIsGeneratingAso(true);
    try {
      const prompt = `
        Tu es un expert en App Store Optimization (ASO) pour iOS.
        Voici mon idée d'application : "${asoIdea}".
        Génère les métadonnées ASO parfaites en français.
        Règles strictes d'Apple :
        - Titre : maximum 30 caractères. Doit contenir le nom de l'app (invente-en un) et un mot-clé principal.
        - Sous-titre : maximum 30 caractères. Doit expliquer la valeur et contenir des mots-clés.
        - Mots-clés : maximum 100 caractères au total. Séparés par des virgules, SANS espaces après les virgules. Pas de mots pluriels si le singulier est là. Pas le mot "app" ou "gratuit".
        
        Format JSON attendu :
        {
          "title": "Titre (max 30 chars)",
          "subtitle": "Sous-titre (max 30 chars)",
          "keywords": "motcle1,motcle2,motcle3..."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || "{}");
      setAsoResult(data);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la génération ASO.");
    } finally {
      setIsGeneratingAso(false);
    }
  };

  const analyzeReviews = async (appId: string, appName: string) => {
    setAnalyzingAppId(appId);
    try {
      const response = await fetch(`https://itunes.apple.com/fr/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`);
      const data = await response.json();
      
      const entries = data.feed?.entry;
      if (!entries || entries.length === 0) {
        setAppAnalysis(prev => ({ ...prev, [appId]: "Pas assez d'avis récents pour analyser." }));
        return;
      }

      // Extract 1, 2, and 3 star reviews
      const negativeReviews = entries
        .filter((entry: any) => parseInt(entry['im:rating'].label) <= 3)
        .map((entry: any) => entry.content.label)
        .slice(0, 30)
        .join("\n---\n");

      if (!negativeReviews) {
        setAppAnalysis(prev => ({ ...prev, [appId]: "Super nouvelle : peu d'avis négatifs récents trouvés !" }));
        return;
      }

      const prompt = `
        Voici des avis négatifs récents d'utilisateurs pour l'application "${appName}".
        Résume les 3 plus grandes frustrations ou problèmes rencontrés par ces utilisateurs.
        C'est pour m'aider à créer un concurrent meilleur.
        Sois concis, utilise des bullet points.
        
        Avis :
        ${negativeReviews}
      `;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAppAnalysis(prev => ({ ...prev, [appId]: aiResponse.text || "Erreur d'analyse." }));
    } catch (error) {
      console.error(error);
      setAppAnalysis(prev => ({ ...prev, [appId]: "Erreur lors de la récupération des avis." }));
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const searchAppStore = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=software&limit=4`);
      const data = await response.json();
      setAppResults(data.results || []);
    } catch (error) {
      console.error("Error searching App Store:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="relative z-10 py-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Outils Gratuits pour Fondateurs 🛠️</h1>
          <p className="text-xl text-gray-400 mb-8">Des outils simples pour valider vos chiffres et vos idées.</p>
          
          {projects.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-[#141418] border border-white/10 rounded-2xl p-2 pl-4 shadow-xl">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Projet Actif</span>
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[#0A0A0C] border border-white/5 rounded-xl py-2 px-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'Tous les outils', icon: <LayoutGrid size={16} /> },
            { id: 'aso', label: 'ASO & Mots-clés', icon: <Search size={16} /> },
            { id: 'design', label: 'Design & UI', icon: <ImageIcon size={16} /> },
            { id: 'monetization', label: 'Monétisation', icon: <DollarSign size={16} /> },
            { id: 'marketing', label: 'Marketing & Lancement', icon: <Megaphone size={16} /> },
            { id: 'intelligence', label: 'Veille Concurrentielle', icon: <Eye size={16} /> },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* App Revenue Calculator */}
          {['all', 'monetization'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Calculator size={24} />
              </div>
              <h2 className="text-2xl font-bold">Calculateur de Revenus App Store</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Téléchargements / Mois</label>
                <input 
                  type="range" min="100" max="50000" step="100" value={downloads} 
                  onChange={(e) => setDownloads(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-2 text-xl font-bold text-white">
                  <span>100</span>
                  <span className="text-blue-400">{downloads.toLocaleString()}</span>
                  <span>50k</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Taux de Conversion (Paywall)</label>
                <input 
                  type="range" min="0.5" max="15" step="0.5" value={conversionRate} 
                  onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between mt-2 text-xl font-bold text-white">
                  <span>0.5%</span>
                  <span className="text-purple-400">{conversionRate}%</span>
                  <span>15%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Abonnement Annuel ($)</label>
                <input 
                  type="range" min="5" max="150" value={subscriptionPrice} 
                  onChange={(e) => setSubscriptionPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2 text-xl font-bold text-white">
                  <span>$5</span>
                  <span className="text-emerald-400">${subscriptionPrice}</span>
                  <span>$150</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Nouveaux Abonnés</p>
                  <p className="text-2xl font-black text-white">+{monthlySubscribers}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-500 font-bold uppercase mb-1">Revenu Net (Après Apple 15%)</p>
                  <p className="text-2xl font-black text-emerald-400">${Math.floor(netRevenue).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Niche Validator Tool */}
          {['all', 'intelligence'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-bold">Validateur de Niche (App Store)</h2>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchAppStore()}
                    placeholder="Ex: habit tracker, fasting..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button 
                  onClick={searchAppStore}
                  disabled={isSearching || !keyword.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  {isSearching ? '...' : <Zap size={18} />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative">
                {!hasSearched ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl">
                    <p className="text-gray-400 italic">Entrez un mot-clé pour analyser la concurrence sur l'App Store.</p>
                  </div>
                ) : isSearching ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : appResults.length > 0 ? (
                  <>
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('intelligence.nicheAnalysis', { keyword, results: appResults })}
                        disabled={isSaving === 'intelligence.nicheAnalysis'}
                        className="sticky top-0 right-0 z-10 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold float-right mb-2"
                      >
                        {isSaving === 'intelligence.nicheAnalysis' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <div className="clear-both"></div>
                    {appResults.map((app) => (
                      <div key={app.trackId} className="bg-white/5 rounded-xl p-4 flex flex-col gap-4 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex gap-4 items-start">
                          <img src={app.artworkUrl60} alt={app.trackName} className="w-12 h-12 rounded-lg shadow-md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{app.trackName}</h3>
                            <p className="text-xs text-gray-400 truncate">{app.primaryGenreName}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star size={12} fill="currentColor" />
                                <span>{app.averageUserRating ? app.averageUserRating.toFixed(1) : 'N/A'}</span>
                                <span className="text-gray-500">({app.userRatingCount || 0})</span>
                              </div>
                              <span className="text-emerald-400 font-medium">{app.formattedPrice || 'Free'}</span>
                            </div>
                          </div>
                          <a href={app.trackViewUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                            <ExternalLink size={16} />
                          </a>
                        </div>
                        
                        <div className="pt-3 border-t border-white/5">
                          <button 
                            onClick={() => analyzeReviews(app.trackId, app.trackName)}
                            disabled={analyzingAppId === app.trackId}
                            className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {analyzingAppId === app.trackId ? 'Analyse en cours...' : <><MessageSquareWarning size={14} /> Analyser les frustrations (IA)</>}
                          </button>
                          
                          {appAnalysis[app.trackId] && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 prose prose-invert prose-sm max-w-none">
                              <div className="whitespace-pre-wrap">{appAnalysis[app.trackId]}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl">
                    <p className="text-gray-400">Aucun résultat trouvé pour "{keyword}".</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* ASO Studio Tool */}
          {['all', 'aso'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Type size={24} />
              </div>
              <h2 className="text-2xl font-bold">ASO Studio (Générateur de Fiche)</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Votre idée d'application</label>
                  <textarea
                    value={asoIdea}
                    onChange={(e) => setAsoIdea(e.target.value)}
                    placeholder="Ex: Une application pour aider les freelances à relancer leurs factures impayées automatiquement..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={generateASO}
                  disabled={isGeneratingAso || !asoIdea.trim()}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingAso ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération ASO en cours...</>
                  ) : (
                    <><Zap size={18} /> Générer les Métadonnées Parfaites</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {asoResult ? (
                  <div className="space-y-6 bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('aso', asoResult)}
                        disabled={isSaving === 'aso'}
                        className="absolute top-4 right-4 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                        {isSaving === 'aso' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Titre App Store</label>
                        <span className={`text-xs font-bold ${asoResult.title.length > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {asoResult.title.length}/30
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium">
                        {asoResult.title}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sous-titre</label>
                        <span className={`text-xs font-bold ${asoResult.subtitle.length > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {asoResult.subtitle.length}/30
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium">
                        {asoResult.subtitle}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Champ Mots-clés (Caché)</label>
                        <span className={`text-xs font-bold ${asoResult.keywords.length > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {asoResult.keywords.length}/100
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-rose-300 font-mono text-sm break-all">
                        {asoResult.keywords}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Copiez-collez ces mots-clés directement dans App Store Connect. Ils sont optimisés sans espaces après les virgules pour gagner de la place.
                      </p>
                    </div>

                    <button 
                      onClick={localizeASO}
                      disabled={isLocalizing}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 border border-white/10 mt-4"
                    >
                      {isLocalizing ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Localisation en cours...</>
                      ) : (
                        <><Globe size={16} /> Traduire pour le monde (US, JP, BR)</>
                      )}
                    </button>

                    {localizedResults && (
                      <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <Globe size={16} className="text-rose-400" /> Marchés Internationaux
                        </h3>
                        {Object.entries(localizedResults).map(([country, data]: [string, any]) => (
                          <div key={country} className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">{country === 'US' ? '🇺🇸' : country === 'JP' ? '🇯🇵' : '🇧🇷'}</span>
                              <span className="font-bold text-white">{country}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-gray-500">Titre:</span> <span className="text-white">{data.title}</span></p>
                              <p><span className="text-gray-500">Sous-titre:</span> <span className="text-white">{data.subtitle}</span></p>
                              <p><span className="text-gray-500">Mots-clés:</span> <span className="text-rose-300 font-mono text-xs">{data.keywords}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-400">
                      <Type size={32} />
                    </div>
                    <p className="text-gray-400">Décrivez votre app pour générer un Titre, Sous-titre et des Mots-clés optimisés pour l'algorithme d'Apple.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Paywall Architect Tool */}
          {['all', 'monetization'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CreditCard size={24} />
              </div>
              <h2 className="text-2xl font-bold">Paywall Architect</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Concept de l'app</label>
                  <textarea
                    value={paywallIdea}
                    onChange={(e) => setPaywallIdea(e.target.value)}
                    placeholder="Ex: Une app de méditation pour les personnes souffrant de TDAH..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={generatePaywall}
                  disabled={isGeneratingPaywall || !paywallIdea.trim()}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingPaywall ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse des prix...</>
                  ) : (
                    <><Zap size={18} /> Générer la Stratégie de Prix</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {paywallResult ? (
                  <div className="space-y-4 bg-[#0A0A0C] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('paywall', JSON.stringify(paywallResult))}
                        disabled={isSaving === 'paywall'}
                        className="absolute top-4 right-14 z-10 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                        {isSaving === 'paywall' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(paywallResult, null, 2));
                        alert('Copié !');
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                      title="Copier le JSON"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="text-center mb-6">
                      <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
                        {paywallResult.model}
                      </span>
                      <h3 className="text-xl font-black text-white leading-tight">"{paywallResult.hook}"</h3>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Structure de Prix</p>
                      <p className="text-white font-medium">{paywallResult.prices}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Stratégie d'Essai (Trial)</p>
                      <p className="text-white font-medium">{paywallResult.trial}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 mt-4">Arguments Premium</p>
                      <ul className="space-y-2">
                        {paywallResult.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Star size={16} className="text-purple-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-400">
                      <CreditCard size={32} />
                    </div>
                    <p className="text-gray-400">Découvrez la stratégie de monétisation exacte (prix, essai gratuit, arguments) pour maximiser vos revenus.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Icon Studio Tool */}
          {['all', 'design'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ImageIcon size={24} />
              </div>
              <h2 className="text-2xl font-bold">Icon Studio (Générateur d'Icônes)</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Concept de l'icône</label>
                  <textarea
                    value={iconIdea}
                    onChange={(e) => setIconIdea(e.target.value)}
                    placeholder="Ex: Un renard minimaliste en origami, fond orange vibrant, style iOS..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={generateIcon}
                  disabled={isGeneratingIcon || !iconIdea.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingIcon ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Création de l'icône...</>
                  ) : (
                    <><Zap size={18} /> Générer l'Icône Parfaite</>
                  )}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                {iconResult ? (
                  <div className="space-y-4 text-center relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('icon', iconResult)}
                        disabled={isSaving === 'icon'}
                        className="absolute -top-12 right-0 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                        {isSaving === 'icon' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <div className="relative group">
                      <img 
                        src={iconResult} 
                        alt="Generated App Icon" 
                        className="w-48 h-48 rounded-[22.5%] shadow-2xl mx-auto border border-white/10 object-cover"
                        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[22.5%] flex items-center justify-center backdrop-blur-sm">
                        <a href={iconResult} download="app-icon.png" className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                          <Download size={20} />
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Format iOS (1024x1024) prêt pour l'App Store.</p>
                  </div>
                ) : (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-[22.5%] bg-white/5">
                    <ImageIcon size={32} className="text-gray-600 mb-2" />
                    <p className="text-xs text-gray-500">Votre icône apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Viral Hook Generator */}
          {['all', 'marketing'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <Video size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Viral Hook Generator (TikTok / Reels)</h2>
                <p className="text-gray-400 text-sm">Générez des scripts vidéos viraux pour acquérir des utilisateurs gratuitement.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Décrivez votre App</label>
                  <textarea
                    value={hookIdea}
                    onChange={(e) => setHookIdea(e.target.value)}
                    placeholder="Ex: Une app qui bloque TikTok pendant que je révise..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500 transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={generateHooks}
                  disabled={isGeneratingHooks || !hookIdea.trim()}
                  className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingHooks ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Écriture des scripts...</>
                  ) : (
                    <><Zap size={18} /> Générer 3 Scripts Viraux</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {hookResults.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('marketing.hooks', hookResults)}
                        disabled={isSaving === 'marketing.hooks'}
                        className="sticky top-0 right-14 z-10 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold float-right mb-2"
                      >
                        {isSaving === 'marketing.hooks' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(hookResults.map((h: any) => `${h.hook}\n${h.script}`).join('\n\n'));
                        alert('Copié !');
                      }}
                      className="sticky top-0 right-0 z-10 p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors float-right mb-2"
                      title="Copier tous les scripts"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="clear-both"></div>
                    {hookResults.map((hook, idx) => (
                      <div key={idx} className="bg-[#0A0A0C] border border-white/5 rounded-xl p-5">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-xs">{idx + 1}</span>
                          {hook.title}
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-3 rounded-lg">
                            <span className="text-xs font-bold text-fuchsia-400 uppercase block mb-1">Hook (0-3 sec)</span>
                            <p className="text-white font-medium">"{hook.hook}"</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Visuel & Audio</span>
                            <p className="text-gray-300">{hook.body}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Call to Action</span>
                            <p className="text-emerald-400 font-bold">{hook.cta}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Video size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Vos scripts TikTok apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* UI/UX Vision Spy */}
          {['all', 'design'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">UI/UX Vision Spy</h2>
                <p className="text-gray-400 text-sm">Uploadez la capture d'écran d'un concurrent. L'IA décrypte ses biais cognitifs.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-colors rounded-2xl p-8 text-center bg-[#0A0A0C] relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={32} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-white font-bold mb-1">Cliquez ou glissez une capture d'écran</p>
                  <p className="text-xs text-gray-500">PNG, JPG (ex: un paywall, un onboarding)</p>
                </div>

                {spyImage && (
                  <button 
                    onClick={analyzeUI}
                    disabled={isSpying}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    {isSpying ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse visuelle en cours...</>
                    ) : (
                      <><Eye size={18} /> Décrypter l'Interface</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1">
                {spyImage ? (
                  <div className="space-y-4">
                    <img src={spyImage} alt="Spy target" className="w-full max-h-48 object-contain rounded-xl border border-white/10 bg-black/50" />
                    
                    {spyResult && (
                      <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-5 relative">
                        {selectedProjectId && (
                          <button 
                            onClick={() => saveToProject('intelligence.visionSpy', spyResult)}
                            disabled={isSaving === 'intelligence.visionSpy'}
                            className="absolute top-4 right-14 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                          >
                            {isSaving === 'intelligence.visionSpy' ? '...' : <Save size={14} />}
                            Sauvegarder
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(spyResult);
                            alert('Copié !');
                          }}
                          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
                          title="Copier l'analyse"
                        >
                          <Copy size={16} />
                        </button>
                        <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                          <Zap size={16} /> Rapport d'Espionnage
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                          {spyResult.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Eye size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">L'analyse UX apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Launch Strategist */}
          {['all', 'marketing'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Megaphone size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Launch Strategist (Reddit / Product Hunt)</h2>
                <p className="text-gray-400 text-sm">Générez des posts de lancement "furtifs" pour éviter d'être banni par les modérateurs.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Décrivez votre App</label>
                  <textarea
                    value={launchIdea}
                    onChange={(e) => setLaunchIdea(e.target.value)}
                    placeholder="Ex: Une app pour tracker ses habitudes de lecture..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Plateforme cible</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setLaunchPlatform('reddit')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-colors border ${launchPlatform === 'reddit' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#0A0A0C] border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                      Reddit (Storytelling)
                    </button>
                    <button 
                      onClick={() => setLaunchPlatform('producthunt')}
                      className={`flex-1 py-3 rounded-xl font-bold transition-colors border ${launchPlatform === 'producthunt' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-[#0A0A0C] border-white/10 text-gray-400 hover:bg-white/5'}`}
                    >
                      Product Hunt (Direct)
                    </button>
                  </div>
                </div>

                <button 
                  onClick={generateLaunchStrategy}
                  disabled={isGeneratingLaunch || !launchIdea.trim()}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingLaunch ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rédaction en cours...</>
                  ) : (
                    <><Megaphone size={18} /> Générer le Post Parfait</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {launchResult ? (
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 h-full relative group">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('marketing.launchPlan', launchResult)}
                        disabled={isSaving === 'marketing.launchPlan'}
                        className="absolute top-4 right-14 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100"
                      >
                        {isSaving === 'marketing.launchPlan' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => navigator.clipboard.writeText(launchResult)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier le post"
                    >
                      <Copy size={16} />
                    </button>
                    <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> Post Prêt à Publier
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                      {launchResult}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Megaphone size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Votre stratégie de lancement apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* String Localizer */}
          {['all', 'aso'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Languages size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Code String Localizer</h2>
                <p className="text-gray-400 text-sm">Traduisez vos fichiers Localizable.strings, strings.xml ou JSON en gardant la syntaxe intacte.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Collez votre code (JSON, XML, Strings)</label>
                  <textarea
                    value={localizerInput}
                    onChange={(e) => setLocalizerInput(e.target.value)}
                    placeholder={`"welcome_message" = "Bienvenue sur l'application";\n"login_button" = "Se connecter";`}
                    className="w-full h-48 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                  />
                </div>
                
                <button 
                  onClick={localizeCode}
                  disabled={isLocalizingCode || !localizerInput.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isLocalizingCode ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traduction en cours...</>
                  ) : (
                    <><Languages size={18} /> Traduire en ES, DE, JP</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {localizerResult ? (
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 h-full relative group">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('localization.strings', localizerResult)}
                        disabled={isSaving === 'localization.strings'}
                        className="absolute top-4 right-14 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100"
                      >
                        {isSaving === 'localization.strings' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => navigator.clipboard.writeText(localizerResult)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier le code"
                    >
                      <Copy size={16} />
                    </button>
                    <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> Fichiers Traduits
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap font-mono text-xs overflow-y-auto max-h-64 custom-scrollbar pr-2">
                      {localizerResult}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Code size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Le code traduit apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* ASO Keyword Extractor */}
          {['all', 'aso'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">ASO Competitor Extractor</h2>
                <p className="text-gray-400 text-sm">Scannez les 30 meilleures apps d'une niche et volez leurs mots-clés les plus utilisés.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Mot-clé principal</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={extractorKeyword}
                      onChange={(e) => setExtractorKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && extractKeywords()}
                      placeholder="Ex: habit tracker, fasting, meditation..."
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={extractKeywords}
                  disabled={isExtracting || !extractorKeyword.trim()}
                  className="w-full py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse de 30 apps en cours...</>
                  ) : (
                    <><Key size={18} /> Extraire les Mots-Clés Cachés</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {extractedKeywords.length > 0 ? (
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 h-full relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('aso.keywords', extractedKeywords.join(', '))}
                        disabled={isSaving === 'aso.keywords'}
                        className="absolute top-4 right-4 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                        {isSaving === 'aso.keywords' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <h3 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> Top 10 Mots-Clés des Concurrents
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedKeywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm font-medium text-yellow-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Key size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Les mots-clés extraits apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Global Pricing Optimizer */}
          {['all', 'monetization'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Global Pricing Optimizer (PPP)</h2>
                <p className="text-gray-400 text-sm">Ajustez vos prix pour l'Inde, le Brésil ou le Japon selon la Parité de Pouvoir d'Achat.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Prix de base (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="number" 
                      step="0.01"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors text-xl font-bold"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={optimizePricing}
                  disabled={isOptimizingPrice || !basePrice.trim()}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isOptimizingPrice ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calcul économique...</>
                  ) : (
                    <><LineChart size={18} /> Optimiser pour le Monde</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {pricingResult.length > 0 ? (
                  <div className="space-y-3 relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('monetization.pricing', pricingResult)}
                        disabled={isSaving === 'monetization.pricing'}
                        className="absolute -top-12 right-0 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                      >
                        {isSaving === 'monetization.pricing' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    {pricingResult.map((item: any, idx) => (
                      <div key={idx} className="bg-[#0A0A0C] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white">{item.country}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-400">{item.price} {item.currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Globe size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Les prix locaux optimisés apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Audience Locator */}
          {['all', 'marketing'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Audience Locator (Reddit)</h2>
                <p className="text-gray-400 text-sm">Trouvez exactement où vos futurs utilisateurs se cachent pour promouvoir votre app.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Sujet ou Niche</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={audienceNiche}
                      onChange={(e) => setAudienceNiche(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && findAudience()}
                      placeholder="Ex: adhd, personal finance, dog training..."
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={findAudience}
                  disabled={isFetchingAudience || !audienceNiche.trim()}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {isFetchingAudience ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Recherche des communautés...</>
                  ) : (
                    <><Users size={18} /> Trouver mon Audience</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {audienceResults.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('marketing.audiences', audienceResults)}
                        disabled={isSaving === 'marketing.audiences'}
                        className="sticky top-0 right-0 z-10 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold float-right mb-2"
                      >
                        {isSaving === 'marketing.audiences' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <div className="clear-both"></div>
                    {audienceResults.map((sub: any, idx) => (
                      <a 
                        key={idx} 
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[#0A0A0C] border border-white/5 hover:border-orange-500/30 rounded-xl p-4 transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{sub.name}</h4>
                          <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                            {(sub.subscribers / 1000).toFixed(1)}k membres
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{sub.description || "Pas de description."}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <Users size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Les subreddits cibles apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Screenshot Storyboarder */}
          {['all', 'design'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MonitorSmartphone size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Screenshot Storyboarder</h2>
                <p className="text-gray-400 text-sm">Générez le copywriting parfait pour les 5 captures d'écran de votre fiche App Store.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Décrivez votre App</label>
                  <textarea
                    value={screenshotIdea}
                    onChange={(e) => setScreenshotIdea(e.target.value)}
                    placeholder="Ex: Une app de méditation pour les gens pressés..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
                
                <button 
                  onClick={generateScreenshots}
                  disabled={isGeneratingScreenshots || !screenshotIdea.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingScreenshots ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Création du storyboard...</>
                  ) : (
                    <><MonitorSmartphone size={18} /> Générer les 5 Écrans</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {screenshotResults.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('design.screenshots', screenshotResults)}
                        disabled={isSaving === 'design.screenshots'}
                        className="sticky top-0 right-0 z-10 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold float-right mb-2"
                      >
                        {isSaving === 'design.screenshots' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <div className="clear-both"></div>
                    {screenshotResults.map((screen: any, idx) => (
                      <div key={idx} className="bg-[#0A0A0C] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                            {screen.screen}
                          </span>
                          <h3 className="font-bold text-white text-lg">{screen.title}</h3>
                        </div>
                        <div className="space-y-2 pl-11">
                          <p className="text-indigo-300 font-medium text-sm">"{screen.subtitle}"</p>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Visuel suggéré :</span>
                            <p className="text-xs text-gray-400">{screen.visual}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <MonitorSmartphone size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Votre storyboard apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* SEO Blog Post Generator */}
          {['all', 'marketing'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">SEO Blog Post Generator</h2>
                <p className="text-gray-400 text-sm">Générez des articles de blog optimisés pour le SEO afin d'attirer du trafic organique vers votre app.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Sujet de l'article</label>
                  <textarea
                    value={blogTopic}
                    onChange={(e) => setBlogTopic(e.target.value)}
                    placeholder="Ex: Les 5 meilleures techniques pour arrêter de procrastiner (pour mon app de productivité)..."
                    className="w-full h-32 bg-[#0A0A0C] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>
                
                <button 
                  onClick={generateBlogPost}
                  disabled={isGeneratingBlog || !blogTopic.trim()}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  {isGeneratingBlog ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rédaction en cours...</>
                  ) : (
                    <><FileText size={18} /> Générer l'Article SEO</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {blogResult ? (
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 h-full relative group">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('marketing.blogPost', blogResult)}
                        disabled={isSaving === 'marketing.blogPost'}
                        className="absolute top-4 right-14 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100"
                      >
                        {isSaving === 'marketing.blogPost' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => navigator.clipboard.writeText(blogResult)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier l'article"
                    >
                      <Copy size={16} />
                    </button>
                    <h3 className="font-bold text-teal-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> Article Prêt à Publier
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                      {blogResult}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <FileText size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Votre article de blog apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* App Store Review Summarizer */}
          {['all', 'intelligence'].includes(activeCategory) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141418] border border-white/5 rounded-3xl p-8 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <MessageCircle size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Review Summarizer (Analyse Concurrentielle)</h2>
                <p className="text-gray-400 text-sm">Analysez les 20 derniers avis d'un concurrent pour découvrir ce que les utilisateurs veulent vraiment.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">App ID du concurrent</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={reviewAppId}
                      onChange={(e) => setReviewAppId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && summarizeReviews()}
                      placeholder="Ex: 1062324249 (Duolingo)"
                      className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={summarizeReviews}
                  disabled={isSummarizingReviews || !reviewAppId.trim()}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                >
                  {isSummarizingReviews ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse des avis en cours...</>
                  ) : (
                    <><MessageCircle size={18} /> Synthétiser les Avis</>
                  )}
                </button>
              </div>

              <div className="flex-1">
                {reviewSummary ? (
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-xl p-6 h-full relative group">
                    {selectedProjectId && (
                      <button 
                        onClick={() => saveToProject('intelligence.competitorReviews', [reviewSummary])}
                        disabled={isSaving === 'intelligence.competitorReviews'}
                        className="absolute top-4 right-14 p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100"
                      >
                        {isSaving === 'intelligence.competitorReviews' ? '...' : <Save size={14} />}
                        Sauvegarder
                      </button>
                    )}
                    <button 
                      onClick={() => navigator.clipboard.writeText(reviewSummary)}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier la synthèse"
                    >
                      <Copy size={16} />
                    </button>
                    <h3 className="font-bold text-rose-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> Synthèse des Utilisateurs
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                      {reviewSummary}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-2xl bg-white/5">
                    <MessageCircle size={32} className="text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">La synthèse des avis apparaîtra ici</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
